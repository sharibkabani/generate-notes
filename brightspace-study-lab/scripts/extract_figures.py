#!/usr/bin/env python3
"""Pull figures out of lecture slides (PDF or PPTX) as cropped WebP files.

Usage:
  python3 extract_figures.py SLIDES.pdf  --out img --prefix L02
  python3 extract_figures.py SLIDES.pptx --out img --prefix L03
  python3 extract_figures.py SLIDES.pdf  --out img --prefix L02 --pages 4,7,12-14 --whole

What it does
  * PDF: for each page, finds embedded raster images and vector-drawing clusters
    (graphs, diagrams), merges overlapping boxes, drops tiny ones (logos, bullets),
    and renders each region at high DPI, cropped, to <prefix>_F<page>[letter].webp.
    --whole renders whole pages instead (use for slides that are one big diagram).
  * PPTX: exports embedded pictures as-is (converted to WebP). For vector charts in
    PPTX, convert to PDF first:  soffice --headless --convert-to pdf SLIDES.pptx
  * Writes <out>/figures.json: [{file, page, w, h, text}] where text is the slide
    text near the figure, to help write captions and alt text.

Then look at every output (open the images) and delete junk: logos, headshots,
decorative art, figures that are only text. Keep what teaches.

Needs: pip install pymupdf pillow python-pptx
"""
import argparse, io, json, os, sys


def parse_pages(spec, n):
    if not spec:
        return list(range(n))
    out = []
    for part in spec.split(','):
        if '-' in part:
            a, b = part.split('-')
            out += list(range(int(a) - 1, int(b)))
        else:
            out.append(int(part) - 1)
    return [p for p in out if 0 <= p < n]


def merge_boxes(rects, pad):
    import pymupdf
    boxes = [pymupdf.Rect(r) + (-pad, -pad, pad, pad) for r in rects]
    changed = True
    while changed:
        changed = False
        out = []
        while boxes:
            b = boxes.pop()
            for i, o in enumerate(out):
                if b.intersects(o):
                    out[i] = o | b
                    changed = True
                    break
            else:
                out.append(b)
        boxes = out
    return boxes


def save_webp(pix_or_img, path, max_w=1400):
    from PIL import Image
    img = pix_or_img
    if not isinstance(img, Image.Image):
        img = Image.open(io.BytesIO(pix_or_img.tobytes('png')))
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGB')
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    img.save(path, 'WEBP', quality=82, method=6)
    return img.size


def do_pdf(path, out, prefix, pages, whole, dpi, min_frac):
    import pymupdf
    doc = pymupdf.open(path)
    meta = []
    for pno in parse_pages(pages, len(doc)):
        page = doc[pno]
        area = page.rect.width * page.rect.height
        text = ' '.join(page.get_text().split())[:300]
        if whole:
            regions = [page.rect]
        else:
            rects = [page.get_image_bbox(img) for img in page.get_images(full=True)]
            rects = [r for r in rects if r.is_valid and not r.is_empty]
            try:
                draw = [d['rect'] for d in page.get_drawings() if d['rect'].width * d['rect'].height > 4]
            except Exception:
                draw = []
            # vector clusters: merge drawing boxes, keep only the substantial ones
            rects += [b for b in merge_boxes(draw, 6) if b.width * b.height > area * min_frac]
            regions = [b & page.rect for b in merge_boxes(rects, 4)]
            regions = [r for r in regions if r.width * r.height > area * min_frac and r.width > 60 and r.height > 40]
            # a region that is (almost) the whole page is a background, not a figure
            regions = [r for r in regions if r.width * r.height < area * 0.92]
        regions.sort(key=lambda r: (round(r.y0 / 40), r.x0))
        for k, r in enumerate(regions):
            suffix = '' if len(regions) == 1 else chr(97 + k)
            name = f'{prefix}_F{pno + 1:02d}{suffix}.webp'
            pix = page.get_pixmap(clip=r, dpi=dpi, alpha=False)
            w, h = save_webp(pix, os.path.join(out, name))
            meta.append({'file': name, 'page': pno + 1, 'w': w, 'h': h, 'text': text})
    return meta


def do_pptx(path, out, prefix):
    from pptx import Presentation
    from PIL import Image
    prs = Presentation(path)
    meta = []
    for sno, slide in enumerate(prs.slides, 1):
        text = ' '.join(' '.join(sh.text_frame.text.split()) for sh in slide.shapes if sh.has_text_frame)[:300]
        k = 0
        for sh in slide.shapes:
            if sh.shape_type == 13 and hasattr(sh, 'image'):  # picture
                try:
                    img = Image.open(io.BytesIO(sh.image.blob))
                except Exception:
                    continue
                if img.width < 120 or img.height < 80:
                    continue
                name = f'{prefix}_F{sno:02d}{chr(97 + k)}.webp'
                w, h = save_webp(img, os.path.join(out, name))
                meta.append({'file': name, 'page': sno, 'w': w, 'h': h, 'text': text})
                k += 1
    return meta


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src')
    ap.add_argument('--out', default='img')
    ap.add_argument('--prefix', default=None, help='file prefix, e.g. L02 (default: source name)')
    ap.add_argument('--pages', default=None, help='e.g. 3,5,9-12 (1-based)')
    ap.add_argument('--whole', action='store_true', help='render whole pages')
    ap.add_argument('--dpi', type=int, default=200)
    ap.add_argument('--min', type=float, default=0.03, help='min figure area as fraction of page')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    prefix = a.prefix or os.path.splitext(os.path.basename(a.src))[0][:12].replace(' ', '_')
    ext = a.src.lower().rsplit('.', 1)[-1]
    if ext == 'pdf':
        meta = do_pdf(a.src, a.out, prefix, a.pages, a.whole, a.dpi, a.min)
    elif ext == 'pptx':
        meta = do_pptx(a.src, a.out, prefix)
    else:
        sys.exit('Only .pdf and .pptx are supported')
    mpath = os.path.join(a.out, 'figures.json')
    old = []
    if os.path.exists(mpath):
        try:
            old = [m for m in json.load(open(mpath)) if not m['file'].startswith(prefix + '_')]
        except Exception:
            old = []
    json.dump(old + meta, open(mpath, 'w'), indent=1)
    print(f'{len(meta)} figures → {a.out}/ (index in figures.json). Open them and delete the junk.')


if __name__ == '__main__':
    main()
