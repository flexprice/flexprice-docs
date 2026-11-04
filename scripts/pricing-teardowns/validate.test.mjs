import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectText, navigationPages, validateArticle } from './validate.mjs';

const page = 'cookbooks/pricing-teardowns/example-pricing';
const nav = { tabs: [{ groups: [{ pages: [page] }] }] };
const article = `---
title: "Can Flexprice Handle Example's Pricing?"
sidebarTitle: "Example Pricing"
description: "Map Example pricing to usage meters and plans"
---

Example bills by usage.

## How Example's pricing maps to Flexprice

| Example | Flexprice |
| --- | --- |
| Requests | Metered feature |

## Set up Example pricing

Create a metered feature.

## Pricing sources

Pricing checked on 2026-01-02.

- [Official pricing](https://example.com/pricing)
`;

test('accepts a sourced, registered teardown', () => {
  assert.deepEqual(validateArticle(article, page, nav, '2026-01-02'), []);
});

for (const key of ['title', 'sidebarTitle', 'description']) {
  test(`requires ${key}`, () => {
    assert.ok(validateArticle(article.replace(new RegExp(`^${key}:.*\\n`, 'm'), ''), page, nav).some(e => e.includes(key)));
  });
}

test('requires exact navigation registration', () => {
  assert.ok(validateArticle(article, page, {}).some(e => e.includes('exactly once')));
  assert.ok(validateArticle(article, page, { pages: [page, page] }).some(e => e.includes('exactly once')));
  assert.deepEqual(navigationPages({ a: [null, 3, { pages: [page] }] }), [page]);
});

for (const bad of ['2026-02-30', '2099-01-01', 'missing']) {
  test(`rejects invalid checked date ${bad}`, () => {
    assert.ok(validateArticle(article.replace('2026-01-02', bad), page, nav).some(e => e.includes('date')));
  });
}

test('requires official HTTPS sources and concrete setup', () => {
  assert.ok(validateArticle(article.replace('https://example.com/pricing', 'http://example.com/pricing'), page, nav).some(e => e.includes('HTTPS')));
  assert.ok(validateArticle(article.replace('## Set up Example pricing', '## Background'), page, nav).some(e => e.includes('setup')));
});

test('enforces editorial structure', () => {
  assert.ok(validateArticle(article + '\nA\u2014B\n# Title\n', page, nav).length >= 2);
  assert.ok(validateArticle(article.replace('## How Example\'s pricing maps to Flexprice', '## Mapping'), page, nav).some(e => e.includes('mapping')));
});

const policy = { deny_patterns: ['private-source[.]example', '\\bconfidential-library\\b'] };
for (const value of ['PRIVATE-SOURCE.example', 'private-source%2Eexample', 'private-source%252Eexample', 'private-source&#46;example', 'private-source&period;example', 'confidential-library']) {
  test(`detects a generic disclosure: ${value}`, () => assert.equal(inspectText(value, policy).length, 1));
}
test('does not match unrelated public sources or substrings', () => {
  assert.deepEqual(inspectText('https://example.com/pricing not-confidential-library-addon', { deny_patterns: ['private-source[.]example'] }), []);
});
test('invalid policy patterns fail closed', () => assert.throws(() => inspectText('anything', { deny_patterns: ['['] })));

test('normalizes identifier word boundaries without matching unrelated substrings', () => {
  const identifierPolicy = { deny_patterns: ['\\bconfidential\\b'] };
  for (const value of ['confidential_value', 'confidentialOption', 'CONFIDENTIALOption']) {
    assert.equal(inspectText(value, identifierPolicy).length, 1);
  }
  assert.deepEqual(inspectText('nonconfidential', identifierPolicy), []);
});

test('removes invisible formatting characters', () => {
  assert.equal(inspectText('private-\u200bsource.example', policy).length, 1);
});

test('normalizes Unicode compatibility forms', () => {
  assert.equal(inspectText('ＰＲＩＶＡＴＥ-ＳＯＵＲＣＥ.example', policy).length, 1);
});

const cli = fileURLToPath(new URL('./validate.mjs', import.meta.url));

function fixture(t, policyOverrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'pricing-validator-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = join(root, 'repo');
  mkdirSync(repo);
  const git = (...args) => execFileSync('git', args, {
    cwd: repo,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Validation fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.test',
      GIT_COMMITTER_NAME: 'Validation fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.test',
    },
  });
  git('init');
  writeFileSync(join(repo, 'docs.json'), JSON.stringify({ legacyIntegration: 'second-vendor', navigation: {} }, null, 2));
  git('add', 'docs.json');
  git('commit', '-m', 'Initialize validation fixture');
  const base = git('rev-parse', 'HEAD').trim();
  const policyFile = join(root, 'policy.json');
  writeFileSync(policyFile, JSON.stringify({ ...policy, ...policyOverrides }));
  const check = (...args) => spawnSync(process.execPath, [cli, '--base', base, '--policy', policyFile, ...args], { cwd: repo, encoding: 'utf8' });
  return { root, repo, git, check };
}

test('CLI rejects untracked disclosures', t => {
  const f = fixture(t);
  writeFileSync(join(f.repo, 'candidate.txt'), 'private-source.example');
  const result = f.check();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /private policy rule/);
});

test('CLI scans the index even when working content is clean', t => {
  const f = fixture(t);
  const path = join(f.repo, 'candidate.txt');
  writeFileSync(path, 'private-source.example');
  f.git('add', 'candidate.txt');
  writeFileSync(path, 'Clean public material');
  assert.equal(f.check().status, 1);
});

test('CLI catches disclosures removed in a later commit', t => {
  const f = fixture(t);
  const path = join(f.repo, 'candidate.txt');
  writeFileSync(path, 'private-source.example');
  f.git('add', 'candidate.txt');
  f.git('commit', '-m', 'Add candidate');
  writeFileSync(path, 'Clean public material');
  f.git('add', 'candidate.txt');
  f.git('commit', '-m', 'Correct candidate');
  assert.equal(f.check().status, 1);
});

test('CLI checks proposed public metadata without publishing it', t => {
  const f = fixture(t);
  const metadata = join(f.root, 'proposed-pr.txt');
  writeFileSync(metadata, 'Reference to private-source.example');
  assert.equal(f.check('--public-text', metadata).status, 1);
});

test('CLI accepts a clean outgoing commit range', t => {
  const f = fixture(t);
  writeFileSync(join(f.repo, 'candidate.txt'), 'Only public company pricing facts');
  f.git('add', 'candidate.txt');
  f.git('commit', '-m', 'Add public example');
  const result = f.check();
  assert.equal(result.status, 0, result.stderr);
});

const newContentPolicy = { new_content_deny_patterns: ['second-vendor'] };

test('CLI preserves unchanged legacy navigation references', t => {
  const f = fixture(t, newContentPolicy);
  writeFileSync(join(f.repo, 'docs.json'), JSON.stringify({ legacyIntegration: 'second-vendor', navigation: {}, note: 'A new public page' }, null, 2));
  f.git('add', 'docs.json');
  f.git('commit', '-m', 'Register new page');
  const result = f.check();
  assert.equal(result.status, 0, result.stderr);
});

test('CLI rejects newly introduced restricted references', t => {
  const f = fixture(t, newContentPolicy);
  writeFileSync(join(f.repo, 'candidate.txt'), 'A second-vendor reference');
  assert.equal(f.check().status, 1);
  f.git('add', 'candidate.txt');
  writeFileSync(join(f.repo, 'candidate.txt'), 'Clean public content');
  assert.equal(f.check().status, 1);
});

test('CLI scans restricted references throughout outgoing history', t => {
  const f = fixture(t, newContentPolicy);
  const path = join(f.repo, 'candidate.txt');
  writeFileSync(path, 'second-vendor');
  f.git('add', 'candidate.txt');
  f.git('commit', '-m', 'Add candidate');
  writeFileSync(path, 'Clean public content');
  f.git('add', 'candidate.txt');
  f.git('commit', '-m', 'Correct candidate');
  assert.equal(f.check().status, 1);
});

test('CLI rejects restricted references in proposed PR text', t => {
  const f = fixture(t, newContentPolicy);
  const metadata = join(f.root, 'proposed-pr.txt');
  writeFileSync(metadata, 'second-vendor');
  assert.equal(f.check('--public-text', metadata).status, 1);
});
