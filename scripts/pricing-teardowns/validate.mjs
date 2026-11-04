import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

export function fileText(buffer) {
  if (!buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return buffer.toString('utf8');
  const parts = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > buffer.length) throw new Error('Truncated PNG chunk');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'zTXt' || type === 'iTXt') {
      const keywordEnd = data.indexOf(0);
      if (keywordEnd < 1 || keywordEnd > 79) throw new Error('Invalid PNG text keyword');
      parts.push(data.subarray(0, keywordEnd).toString('utf8'));
      let textStart = keywordEnd + 2;
      let compressed = true;
      if (type === 'iTXt') {
        compressed = data[keywordEnd + 1] === 1;
        if (![0, 1].includes(data[keywordEnd + 1]) || data[keywordEnd + 2] !== 0) throw new Error('Invalid PNG text compression');
        textStart = keywordEnd + 3;
        for (let field = 0; field < 2; field++) {
          const fieldEnd = data.indexOf(0, textStart);
          if (fieldEnd < 0) throw new Error('Invalid PNG international text');
          parts.push(data.subarray(textStart, fieldEnd).toString('utf8'));
          textStart = fieldEnd + 1;
        }
      } else if (data[keywordEnd + 1] !== 0) throw new Error('Invalid PNG text compression');
      const text = data.subarray(textStart);
      parts.push((compressed ? inflateSync(text, { maxOutputLength: 1024 * 1024 }) : text).toString('utf8'));
    } else if (type !== 'IDAT') {
      parts.push(data.toString('utf8'));
    }
    offset = end;
    if (type === 'IEND') {
      if (length !== 0 || offset !== buffer.length) throw new Error('Invalid PNG end');
      return parts.join('\n');
    }
  }
  throw new Error('Missing PNG end');
}

export function inspectText(text, policy) {
  let normalized = text.normalize('NFKC');
  for (let i = 0; i < 3; i++) {
    normalized = normalized.replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => {
      const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
      return point <= 0x10ffff ? String.fromCodePoint(point) : '';
    }).replace(/&amp;/gi, '&').replace(/&period;/gi, '.');
    normalized = normalized.replace(/(?:%[\da-f]{2})+/gi, value => {
      try { return decodeURIComponent(value); } catch { return value; }
    });
  }
  normalized = normalized.replace(/\p{Cf}/gu, '').replace(/\s+/g, ' ');
  const words = normalized.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_+/g, ' ');
  return policy.deny_patterns.flatMap((pattern, index) =>
    new RegExp(pattern, 'iu').test(normalized) || new RegExp(pattern, 'iu').test(words) ? [`private policy rule ${index + 1} matched`] : []);
}

export function navigationPages(node) {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(navigationPages);
  if (node && typeof node === 'object') return Object.values(node).flatMap(navigationPages);
  return [];
}

export function validateArticle(content, page, navigation, today = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!frontmatter) return ['frontmatter is missing'];
  for (const key of ['title', 'sidebarTitle', 'description']) {
    if (!new RegExp(`^${key}:\\s*["'][^\\n"'].*["']\\s*$`, 'm').test(frontmatter[1])) {
      errors.push(`frontmatter ${key} must be a nonempty quoted string`);
    }
  }
  if (!/^title:\s*["']Can Flexprice Handle .+ Pricing\?["']\s*$/m.test(frontmatter[1])) {
    errors.push('title must follow the pricing teardown title pattern');
  }
  if (!/^## How .+ pricing maps to Flexprice\s*$/m.test(content)) errors.push('pricing mapping section is missing');
  if (!/^## (?:Set up|Configure|Recreate|Build)\b/m.test(content)) errors.push('concrete setup section is missing');
  const sources = content.match(/^## Pricing sources\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] ?? '';
  if (!/\]\(https:\/\/[^\s)]+\)/.test(sources)) errors.push('pricing sources must include an official HTTPS reference');
  const checked = content.match(/Pricing checked on (\d{4}-\d{2}-\d{2})\./)?.[1];
  const date = checked ? new Date(`${checked}T00:00:00Z`) : null;
  if (!date || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== checked || checked > today) {
    errors.push('pricing checked date must be a real, nonfuture YYYY-MM-DD date');
  }
  if (navigationPages(navigation).filter(value => value === page).length !== 1) errors.push('article must be registered exactly once in docs.json navigation');
  if (content.includes('\u2014')) errors.push('replace em dashes with ordinary punctuation');
  if (/^#{1}\s/m.test(content)) errors.push('use frontmatter for the page title, not an H1');
  return errors;
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

function paths(output) { return output.split('\0').filter(Boolean); }

function addedLines(diff) {
  return diff.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).join('\n');
}

export function run(args) {
  let base = 'HEAD';
  let policy;
  let publicText = '';
  for (let i = 0; i < args.length; i++) {
    if (!['--base', '--policy', '--public-text'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: validate.mjs [--base REF] [--policy PRIVATE_JSON] [--public-text FILE]');
    const option = args[i++];
    if (option === '--base') base = args[i];
    if (option === '--policy') {
      policy = JSON.parse(readFileSync(args[i], 'utf8'));
      if (!Array.isArray(policy.deny_patterns) || !policy.deny_patterns.length || policy.deny_patterns.some(p => typeof p !== 'string' || !p)) throw new Error('policy must define nonempty deny_patterns');
      if (policy.new_content_deny_patterns !== undefined && (!Array.isArray(policy.new_content_deny_patterns) || policy.new_content_deny_patterns.some(p => typeof p !== 'string' || !p))) throw new Error('new_content_deny_patterns must be an array of nonempty strings');
      for (const pattern of [...policy.deny_patterns, ...(policy.new_content_deny_patterns ?? [])]) new RegExp(pattern, 'iu');
    }
    if (option === '--public-text') publicText += readFileSync(args[i], 'utf8');
  }
  base = git('rev-parse', '--verify', `${base}^{commit}`).trim();
  const untracked = paths(git('ls-files', '--others', '--exclude-standard', '-z'));
  const changed = [...new Set([...paths(git('diff', '--name-only', '-z', '--diff-filter=ACMR', base)), ...untracked])];
  const newContentPolicy = { deny_patterns: policy?.new_content_deny_patterns ?? [] };
  const metadataPolicy = { deny_patterns: [...(policy?.deny_patterns ?? []), ...newContentPolicy.deny_patterns] };
  const errors = [];
  const navigation = JSON.parse(readFileSync('docs.json', 'utf8')).navigation;
  for (const path of changed) {
    const content = fileText(readFileSync(path));
    if (/^cookbooks\/pricing-teardowns\/[^/]+\.mdx$/.test(path)) {
      errors.push(...validateArticle(content, path.slice(0, -4), navigation).map(e => `${path}: ${e}`));
    }
    if (policy) {
      errors.push(...inspectText(`${path}\n${content}`, policy).map(e => `${path}: ${e}`));
      if (untracked.includes(path) || /^(?:cookbooks|images)\/pricing-teardowns\//.test(path)) {
        errors.push(...inspectText(`${path}\n${content}`, newContentPolicy).map(e => `${path}: ${e}`));
      }
    }
  }
  if (policy) {
    const commits = git('rev-list', `${base}..HEAD`).trim().split('\n').filter(Boolean);
    for (const commit of commits) {
      errors.push(...inspectText(git('show', '-s', '--format=%B', commit), metadataPolicy));
      for (const path of paths(git('diff-tree', '-m', '--no-commit-id', '--name-only', '-z', '--diff-filter=ACMR', '-r', commit))) {
        const blob = execFileSync('git', ['show', `${commit}:${path}`], { maxBuffer: 32 * 1024 * 1024 });
        const content = `${path}\n${fileText(blob)}`;
        errors.push(...inspectText(content, policy));
        if (/^(?:cookbooks|images)\/pricing-teardowns\//.test(path)) errors.push(...inspectText(content, newContentPolicy));
      }
      errors.push(...inspectText(addedLines(git('show', '-m', '--format=', '--unified=0', '--no-color', '--no-ext-diff', commit)), newContentPolicy));
    }
    errors.push(...inspectText(git('diff', '--cached'), policy));
    for (const path of paths(git('diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'))) {
      const blob = execFileSync('git', ['show', `:${path}`], { maxBuffer: 32 * 1024 * 1024 });
      const content = `${path}\n${fileText(blob)}`;
      errors.push(...inspectText(content, policy));
      if (/^(?:cookbooks|images)\/pricing-teardowns\//.test(path)) errors.push(...inspectText(content, newContentPolicy));
    }
    errors.push(...inspectText(addedLines(git('diff', '--unified=0', '--no-color', '--no-ext-diff', base)), newContentPolicy));
    errors.push(...inspectText(addedLines(git('diff', '--cached', '--unified=0', '--no-color', '--no-ext-diff')), newContentPolicy));
    errors.push(...inspectText(`${git('branch', '--show-current')}\n${publicText}`, metadataPolicy));
  }
  for (const error of errors) console.error(error);
  if (!policy) console.log('Content checks only. The author must separately run the private disclosure policy before publication.');
  if (!errors.length) console.log(`Validated ${changed.length} changed files.`);
  return errors.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = run(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
