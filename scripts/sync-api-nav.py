#!/usr/bin/env python3
"""Keep the API Reference sidebar in docs.json in sync with api-reference/openapi.json.

The API Reference tab lists every endpoint explicitly as "METHOD /path", because
Mintlify stops auto-generating endpoint pages once any explicit entry exists.
This script is incremental: it adds endpoints that are in the spec but missing
from docs.json, removes entries whose endpoint no longer exists in the spec, and
leaves everything else (ordering, labels, object pages) untouched.

Usage:
  python3 scripts/sync-api-nav.py          # update docs.json in place
  python3 scripts/sync-api-nav.py --check  # exit 1 if docs.json would change

Run automatically by .github/workflows/sync-api-nav.yml. Stdlib only.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, "api-reference", "openapi.json")
DOCS = os.path.join(ROOT, "docs.json")
TAB_NAME = "API Reference"
RESOURCES_GROUP = "Resources"
# All operation methods OpenAPI 3 allows on a path item.
METHODS = ("get", "post", "put", "patch", "delete", "head", "options", "trace")
ENTRY_RE = re.compile(r"^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE) (/\S+)$")

# Sidebar label for a tag when a new group has to be created.
LABELS = {
    "Addons": "Add-ons",
    "AlertSettings": "Alert Settings",
}


def norm(name):
    """Normalise a tag or group label for matching: 'Add-ons' == 'Addons'."""
    return re.sub(r"[^a-z0-9]", "", name.lower())


def rank(entry):
    """Sort key giving create, update, delete, retrieve, list, search, other."""
    method, path = entry.split(" ", 1)
    m = method.lower()
    is_search = path.rstrip("/").endswith("/search")
    has_param = "{" in path
    if m == "post" and not has_param and not is_search:
        return 0
    if m in ("put", "patch"):
        return 1
    if m == "delete":
        return 2
    if m == "get" and has_param:
        return 3
    if m == "get":
        return 4
    if is_search:
        return 5
    return 6


def spec_endpoints(spec):
    """Return {'METHOD /path': tag} for every operation in the spec."""
    out = {}
    for path, ops in spec["paths"].items():
        for method, op in ops.items():
            if method.lower() not in METHODS or op.get("x-hidden"):
                continue
            tags = op.get("tags") or ["Other"]
            out[f"{method.upper()} {path}"] = tags[0]
    return out


def walk_groups(pages, found):
    """Collect (group_dict, entry) for every endpoint entry under `pages`."""
    for page in pages:
        if isinstance(page, dict):
            for p in page.get("pages", []):
                if isinstance(p, str) and ENTRY_RE.match(p):
                    found.append((page, p))
            walk_groups(page.get("pages", []), found)


def insert_ranked(group, entry):
    """Insert `entry` after the last existing entry with a rank <= its own."""
    pages = group["pages"]
    r = rank(entry)
    pos = len(pages)
    for i in range(len(pages) - 1, -1, -1):
        p = pages[i]
        if isinstance(p, str) and ENTRY_RE.match(p) and rank(p) <= r:
            pos = i + 1
            break
    else:
        # No endpoint with lower-or-equal rank: go after any leading non-endpoint
        # pages (object pages, overviews) but before the first endpoint.
        pos = 0
        for i, p in enumerate(pages):
            if isinstance(p, str) and ENTRY_RE.match(p):
                pos = i
                break
            pos = i + 1
    pages.insert(pos, entry)


def find_group(resources, tag):
    for page in resources["pages"]:
        if isinstance(page, dict) and norm(page["group"]) == norm(tag):
            return page
    return None


def create_group(resources, tag):
    group = {"group": LABELS.get(tag, tag), "pages": []}
    label = norm(group["group"])
    pos = len(resources["pages"])
    for i, page in enumerate(resources["pages"]):
        if isinstance(page, dict) and norm(page["group"]) > label:
            pos = i
            break
    resources["pages"].insert(pos, group)
    return group


def prune_empty(pages):
    keep = []
    for page in pages:
        if isinstance(page, dict):
            page["pages"] = prune_empty(page.get("pages", []))
            if not page["pages"]:
                continue
        keep.append(page)
    return keep


def main():
    check = "--check" in sys.argv
    spec = json.load(open(SPEC))
    docs = json.load(open(DOCS))
    tab = next(t for t in docs["navigation"]["tabs"] if t["tab"] == TAB_NAME)

    resources = next((g for g in tab["groups"] if g.get("group") == RESOURCES_GROUP), None)
    if resources is None:
        resources = {"group": RESOURCES_GROUP, "pages": []}
        tab["groups"].append(resources)

    wanted = spec_endpoints(spec)
    found = []
    walk_groups(tab["groups"], found)
    present = {entry for _, entry in found}

    removed = []
    for group, entry in found:
        if entry not in wanted:
            group["pages"].remove(entry)
            removed.append(entry)
    tab["groups"] = prune_empty(tab["groups"])
    if resources not in tab["groups"]:
        tab["groups"].append(resources)

    added = []
    for entry in sorted(wanted, key=lambda e: (wanted[e].lower(), rank(e), e)):
        if entry in present:
            continue
        tag = wanted[entry]
        group = find_group(resources, tag) or create_group(resources, tag)
        insert_ranked(group, entry)
        added.append(f"{entry}  ({group['group']})")

    if not added and not removed:
        print("docs.json is in sync with openapi.json")
        return 0

    for e in added:
        print(f"+ {e}")
    for e in removed:
        print(f"- {e}")

    if check:
        print("\ndocs.json is out of date. Run: python3 scripts/sync-api-nav.py")
        return 1

    with open(DOCS, "w") as f:
        json.dump(docs, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"\nUpdated docs.json: {len(added)} added, {len(removed)} removed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
