#!/usr/bin/env python3
"""Turn a raw brand SVG into the framed 32px icon used on integrations/introduction.mdx.

Usage:
    python3 brand_icon.py <logo.svg> <slug> -o images/integrations/logos/<slug>.svg [--bg #F3F4F6] [--size 18] [--fill #RRGGBB]

    logo.svg  the vendor's SVG mark (download from the vendor site or Simple Icons)
    slug      short brand slug, used to namespace ids, e.g. "razorpay"
    -o        where to write the icon; the card then references it as
              icon="/images/integrations/logos/<slug>.svg". Without -o the SVG is printed.
    --bg      frame colour (default light grey; use the brand colour with a white mark
              when the vendor does that, e.g. Stripe, QuickBooks, Paddle)
    --size    mark size in px inside the 32px frame (default 18; 16 to 20 is the range)
    --fill    force every path to this colour (needed when the source uses CSS classes)

The output is a single-line <svg> with no XML header, style block, class, or
namespaced attribute, and every id is prefixed with the slug, so the same file can
also be pasted inline into MDX if that is ever needed.
"""
import argparse
import re
import sys

KEEP_STYLE_PROPS = ("fill", "opacity", "fill-opacity", "stop-color", "stop-opacity", "stroke", "stroke-width", "fill-rule")


def clean(svg, prefix):
    svg = re.sub(r"<\?xml.*?\?>", "", svg, flags=re.S)
    svg = re.sub(r"<!DOCTYPE.*?>", "", svg, flags=re.S)
    svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S)
    svg = re.sub(r"<metadata>.*?</metadata>", "", svg, flags=re.S)
    svg = re.sub(r"<title>.*?</title>", "", svg, flags=re.S)
    svg = re.sub(r"<style.*?</style>", "", svg, flags=re.S)
    svg = re.sub(r'\s(xml:space|xmlns:xlink|version|enable-background|data-name|role)="[^"]*"', "", svg)
    # x/y/width/height are only noise on the root <svg>; child shapes need theirs for position
    svg = re.sub(r"<svg[^>]*>", lambda m: re.sub(r'\s(x|y|width|height)="[^"]*"', "", m.group(0)), svg, count=1)

    def style_to_attrs(m):
        out = []
        for decl in m.group(1).split(";"):
            if ":" in decl:
                k, v = (p.strip() for p in decl.split(":", 1))
                if k in KEEP_STYLE_PROPS:
                    out.append(f'{k}="{v}"')
        return (" " + " ".join(out)) if out else ""

    svg = re.sub(r'\sstyle="([^"]*)"', style_to_attrs, svg)
    svg = re.sub(r'\sclass="[^"]*"', "", svg)
    svg = svg.replace("xlink:href", "href")
    svg = re.sub(r"url\(https?://[^#)]*#([^)]+)\)", r"url(#\1)", svg)
    for i in sorted(set(re.findall(r'\sid="([^"]+)"', svg)), key=len, reverse=True):
        svg = svg.replace(f'id="{i}"', f'id="{prefix}-{i}"')
        svg = svg.replace(f"url(#{i})", f"url(#{prefix}-{i})")
        svg = svg.replace(f'href="#{i}"', f'href="#{prefix}-{i}"')
    return svg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("logo")
    ap.add_argument("prefix", metavar="slug")
    ap.add_argument("-o", "--out", help="write the icon to this path instead of printing it")
    ap.add_argument("--bg", default="#F3F4F6")
    ap.add_argument("--size", type=float, default=18)
    ap.add_argument("--fill")
    a = ap.parse_args()

    svg = clean(open(a.logo).read(), a.prefix)
    vb = re.search(r'viewBox="([^"]+)"', svg)
    if not vb:
        sys.exit("source SVG has no viewBox; add one before running")
    x0, y0, w, h = (float(v) for v in vb.group(1).replace(",", " ").split())
    root = re.search(r"<svg[^>]*>", svg).group(0)
    body = re.sub(r"^.*?<svg[^>]*>", "", svg, count=1, flags=re.S)
    body = re.sub(r"</svg>\s*$", "", body, flags=re.S).strip()

    if a.fill:
        body = re.sub(r'fill="[^"]*"', f'fill="{a.fill}"', body)
        group_fill = a.fill
    else:
        rf = re.search(r'\sfill="([^"]+)"', root)
        group_fill = rf.group(1) if rf else "#000000"
    body = f'<g fill="{group_fill}">{body}</g>'

    s = a.size / max(w, h)
    tx = (32 - w * s) / 2 - x0 * s
    ty = (32 - h * s) / 2 - y0 * s
    body = re.sub(r"\s+", " ", body).replace("> <", "><")
    out = (
        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">'
        f'<rect width="32" height="32" rx="8" fill="{a.bg}" />'
        f'<g transform="translate({tx:.3f} {ty:.3f}) scale({s:.4f})">{body}</g>'
        "</svg>"
    )
    for bad in (r"\sclass=", r"\sstyle=", r"<style", r"<\?xml", r"xml:space", r"xmlns:xlink", r"url\(https?:"):
        if re.search(bad, out):
            sys.exit(f"output still contains {bad}; clean the source by hand")
    if a.out:
        open(a.out, "w").write(out + "\n")
        print(f"wrote {a.out} ({len(out)} bytes)")
    else:
        print(out)


if __name__ == "__main__":
    main()
