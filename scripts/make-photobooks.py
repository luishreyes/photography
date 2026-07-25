#!/usr/bin/env python3
"""Genera fotolibros PDF (EN + ES) por colección, guardados en la carpeta del
archivo maestro. Plantilla = Fotolibro Elsewhere (25x25 cm). Fuente de orden y
statements: catalog.json (vía catalog_lib). Fotos: files.portfolio de cada foto.

Uso:
  python3 scripts/make-photobooks.py            # todos los libros
  python3 scripts/make-photobooks.py elsewhere  # solo los que matcheen (slug/título)

Requiere Google Chrome (headless --print-to-pdf) y PIL.
"""
import os, sys, base64, subprocess, tempfile, io
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.path.abspath(os.path.join(REPO, '..', '..'))
FONT_DIR = os.path.join(REPO, 'node_modules', '@fontsource-variable')

import sys as _sys
_sys.path.insert(0, os.path.join(MASTER, '_scripts', 'catalog'))
import catalog_lib as _cl
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
MAXEDGE, Q = 2000, 88   # imagen embebida para impresión

CIT, INK, BONE, DARK = '#C9C41C', '#121212', '#E8E6E1', '#0A0A0A'

LABELS = {
    'work':  {'es': 'Obra',    'en': 'Work'},
    'study': {'es': 'Estudio', 'en': 'Study'},
    'loose': {'es': 'Sueltas', 'en': 'Loose'},
}
T = {
    'es': {'sub': 'Fotografía en blanco y negro', 'plates': 'placas', 'index': 'Índice de placas', 'loose': 'Sueltas', 'photog': 'Fotografía'},
    'en': {'sub': 'Black & white photography',     'plates': 'plates', 'index': 'Index of plates',   'loose': 'Loose',   'photog': 'Photography'},
}


def b64_font(family_dir, fname):
    p = os.path.join(FONT_DIR, family_dir, 'files', fname)
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode()


def font_css():
    bs = b64_font('big-shoulders-display', 'big-shoulders-display-latin-wght-normal.woff2')
    ar = b64_font('archivo', 'archivo-latin-wght-normal.woff2')
    return f"""
@font-face{{font-family:'Big Shoulders Display';font-weight:200 700;font-style:normal;font-display:block;src:url(data:font/woff2;base64,{bs}) format('woff2');}}
@font-face{{font-family:'Archivo';font-weight:400 700;font-style:normal;font-display:block;src:url(data:font/woff2;base64,{ar}) format('woff2');}}
"""


def img_data_uri(path):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    s = min(1.0, MAXEDGE / max(w, h))
    if s < 1.0:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=Q)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode(), im.size


def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def fmt_date(ymd):
    return f'{ymd[6:8]} · {ymd[4:6]} · {ymd[0:4]}' if ymd and len(ymd) == 8 else ''


def year_span(dates):
    ys = sorted({d[0:4] for d in dates if d})
    if not ys:
        return ''
    return ys[0] if ys[0] == ys[-1] else f'{ys[0]}–{ys[-1]}'


# ---------- páginas ----------

def page_cover(display_title, subline, brand_word):
    corner = lambda pos, bw: f'<div style="position:absolute;{pos};width:0.85cm;height:0.85cm;border-style:solid;border-width:{bw};border-color:{CIT};"></div>'
    return f"""<section class="pg" style="background:{DARK};padding:2.2cm;display:flex;flex-direction:column;justify-content:space-between;">
{corner('top:1.5cm;left:1.5cm', '2px 0 0 2px')}
{corner('top:1.5cm;right:1.5cm', '2px 2px 0 0')}
{corner('bottom:1.5cm;left:1.5cm', '0 0 2px 2px')}
{corner('bottom:1.5cm;right:1.5cm', '0 2px 2px 0')}
<div style="position:relative;font-family:'Archivo';font-weight:500;font-size:8.5pt;letter-spacing:0.28em;text-transform:uppercase;color:rgba(232,230,225,0.65);">Luis H. Reyes · {esc(brand_word)}</div>
<div style="position:relative;">
<h1 style="margin:0;font-family:'Big Shoulders Display';font-weight:300;font-size:96pt;line-height:0.95;letter-spacing:0.01em;text-transform:uppercase;color:{BONE};">{esc(display_title)}</h1>
<div style="margin-top:0.5cm;font-family:'Archivo';font-weight:400;font-size:9pt;letter-spacing:0.28em;text-transform:uppercase;color:rgba(232,230,225,0.55);">{esc(subline)}</div>
</div>
</section>"""


def page_title(kicker, display_title, statement, count_line, quote=None):
    qhtml = ''
    if quote:
        qhtml = ("<div style=\"margin-top:0.9cm;padding-left:0.5cm;border-left:2px solid %s;max-width:14cm;\">"
                 "<div style=\"font-family:'Archivo';font-style:italic;font-weight:400;font-size:10.5pt;line-height:1.5;color:rgba(18,18,18,0.6);\">&ldquo;%s&rdquo;</div>"
                 "<div style=\"margin-top:0.25cm;font-family:'Archivo';font-weight:600;font-size:8pt;letter-spacing:0.28em;text-transform:uppercase;color:%s;\">%s</div>"
                 "</div>") % (CIT, esc(quote['text']), CIT, esc(quote['author']))
    return f"""<section class="pg" style="background:{BONE};color:{INK};padding:2.2cm;display:flex;flex-direction:column;justify-content:center;">
<div style="font-family:'Archivo';font-weight:600;font-size:8.5pt;letter-spacing:0.28em;text-transform:uppercase;color:{CIT};">{esc(kicker)}</div>
<h2 style="margin:0.4cm 0 0 0;font-family:'Big Shoulders Display';font-weight:300;font-size:44pt;line-height:1;text-transform:uppercase;color:{INK};">{esc(display_title)}</h2>
<div style="width:2.4cm;height:1px;background:rgba(18,18,18,0.25);margin:0.9cm 0;"></div>
<p style="margin:0;max-width:15cm;font-family:'Archivo';font-weight:400;font-size:12pt;line-height:1.55;color:rgba(18,18,18,0.86);">{esc(statement)}</p>{qhtml}
<div style="margin-top:1.1cm;font-family:'Archivo';font-weight:400;font-size:11pt;color:{INK};">Luis H. Reyes</div>
<div style="margin-top:0.25cm;font-family:'Archivo';font-weight:400;font-size:9pt;letter-spacing:0.28em;text-transform:uppercase;color:rgba(18,18,18,0.55);">{esc(count_line)}</div>
</section>"""


# Regla de tamaños de placa: el lado LARGO es el mismo para vertical y horizontal.
# Las cuadradas (y casi cuadradas) se reducen para emparejar el área percibida:
# a proporción 1:1 el lado vale SQ_FACTOR*LONG (área pareja con una 2:3) y crece
# linealmente hasta proporción 1.3, donde ya rige el lado largo completo.
PLATE_LONG_CM = 20.6
SQ_FACTOR = 0.82


def plate_css(w, h):
    aspect = max(w, h) / min(w, h)
    f = 1.0 if aspect >= 1.3 else SQ_FACTOR + (1.0 - SQ_FACTOR) * (aspect - 1.0) / 0.3
    edge = PLATE_LONG_CM * f
    return f'width:{edge:.2f}cm;height:auto;' if w > h else f'height:{edge:.2f}cm;width:auto;'


def page_photo(num, title, date_str, uri, size):
    w, h = size
    dim = plate_css(w, h)
    return f"""<section class="pg" style="background:{BONE};color:{INK};display:flex;align-items:center;justify-content:center;">
<div style="display:flex;flex-direction:column;">
<img src="{uri}" alt="{esc(title)}" style="display:block;{dim}object-fit:contain;">
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:0.55cm;">
<div style="display:flex;align-items:baseline;gap:0.35cm;">
<span style="font-family:'Archivo';font-weight:600;font-size:8.5pt;font-variant-numeric:tabular-nums;color:{CIT};">{num:02d}</span>
<span style="font-family:'Archivo';font-weight:600;font-size:9.5pt;letter-spacing:0.28em;text-transform:uppercase;color:{INK};">{esc(title)}</span>
</div>
<span style="font-family:'Archivo';font-weight:400;font-size:9pt;font-variant-numeric:tabular-nums;color:rgba(18,18,18,0.55);">{date_str}</span>
</div>
</div>
</section>"""


ROWS_PER_PAGE = 14  # placas por página de colofón (evita que el índice largo se corte)


def page_colophon(heading, rows, footer_left):
    items = ''.join(
        f"""<div style="display:flex;justify-content:space-between;align-items:baseline;padding:0.4cm 0;border-bottom:1px solid rgba(232,230,225,0.16);">
<div style="display:flex;align-items:baseline;gap:0.5cm;">
<span style="font-family:'Archivo';font-weight:400;font-size:9pt;font-variant-numeric:tabular-nums;color:rgba(232,230,225,0.55);">{num:02d}</span>
<span style="font-family:'Archivo';font-weight:500;font-size:10pt;letter-spacing:0.18em;text-transform:uppercase;color:{BONE};">{esc(title)}</span>
</div>
<span style="font-family:'Archivo';font-weight:400;font-size:9pt;font-variant-numeric:tabular-nums;color:rgba(232,230,225,0.55);">{date_str}</span>
</div>""" for num, title, date_str in rows)
    footer = '' if footer_left is None else f"""<div style="margin-top:auto;display:flex;justify-content:space-between;align-items:baseline;">
<div style="font-family:'Archivo';font-weight:400;font-size:9pt;color:rgba(232,230,225,0.55);">{esc(footer_left)}</div>
<a href="https://photography.luishreyes.com" style="font-family:'Archivo';font-weight:400;font-size:9pt;color:{CIT};text-decoration:none;">photography.luishreyes.com</a>
</div>"""
    return f"""<section class="pg" style="background:{DARK};color:{BONE};padding:2.2cm;display:flex;flex-direction:column;">
<div style="font-family:'Archivo';font-weight:600;font-size:8.5pt;letter-spacing:0.28em;text-transform:uppercase;color:{CIT};">{esc(heading)}</div>
<div style="margin-top:1cm;display:flex;flex-direction:column;">{items}</div>
{footer}
</section>"""


def page_rights(lang, year):
    """Página final: símbolo del visor (Manual de identidad) + wordmark + derechos.
    Colores del manual: citrón #C9C41C, carbón #0A0A0A, hueso #E8E6E1."""
    legend = {
        'es': (f"© {year} Luis H. Reyes. Todos los derechos reservados. Ninguna parte de este libro "
               "puede reproducirse, almacenarse o transmitirse por ningún medio sin autorización "
               "escrita del autor."),
        'en': (f"© {year} Luis H. Reyes. All rights reserved. No part of this book may be reproduced, "
               "stored or transmitted in any form without written permission from the author."),
    }[lang]
    printed = {'es': f"Impreso en {year}", 'en': f"Printed in {year}"}[lang]
    photog = T[lang]['photog'].upper()
    # Símbolo: caja S con 4 esquinas de visor en hueso y la H citrón (mitad de la altura).
    S, arm, stroke = '3.2cm', '0.7cm', '0.055cm'
    corner = lambda pos: (f'<div style="position:absolute;{pos};width:{arm};height:{arm};'
                          f'border-style:solid;border-color:{BONE};border-width:0;{{bw}}"></div>')
    corners = (corner('left:0;top:0').format(bw=f'border-top-width:{stroke};border-left-width:{stroke};') +
               corner('right:0;top:0').format(bw=f'border-top-width:{stroke};border-right-width:{stroke};') +
               corner('left:0;bottom:0').format(bw=f'border-bottom-width:{stroke};border-left-width:{stroke};') +
               corner('right:0;bottom:0').format(bw=f'border-bottom-width:{stroke};border-right-width:{stroke};'))
    return f"""<section class="pg" style="background:{DARK};color:{BONE};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
<div style="position:relative;width:{S};height:{S};">
{corners}
<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Big Shoulders Display';font-weight:300;font-size:1.6cm;line-height:1;color:{CIT};">H</div>
</div>
<div style="margin-top:1.1cm;font-family:'Big Shoulders Display';font-weight:300;font-size:26pt;letter-spacing:0.06em;text-transform:uppercase;color:{CIT};">Luis H. Reyes</div>
<div style="margin-top:0.25cm;font-family:'Archivo';font-weight:600;font-size:9pt;letter-spacing:0.42em;text-transform:uppercase;color:{BONE};">{photog}</div>
<div style="margin-top:1.4cm;max-width:12.5cm;font-family:'Archivo';font-weight:400;font-size:8.5pt;line-height:1.7;color:rgba(232,230,225,0.62);">{esc(legend)}</div>
<div style="margin-top:0.9cm;display:flex;align-items:baseline;gap:0.5cm;font-family:'Archivo';font-weight:400;font-size:8.5pt;color:rgba(232,230,225,0.55);">
<span>{esc(printed)}</span><span style="color:{CIT};">·</span>
<a href="https://photography.luishreyes.com" style="color:rgba(232,230,225,0.55);text-decoration:none;">photography.luishreyes.com</a>
</div>
</section>"""


def build_html(book, lang, fonts):
    tr = T[lang]
    # El nombre de la colección se muestra en el idioma de la edición (names.es/names.en);
    # los tomos de Loose usan su nombre propio (Tomo I · span / Volume I · span).
    display_title = (book.get('names') or {}).get(lang, book['title'])
    folder_abs = os.path.join(MASTER, book['folder'])

    resolved = []  # (title, date, uri, size)
    missing = []
    for ph in book['photos']:
        port_abs = os.path.join(MASTER, ph['portfolio'])
        if not os.path.exists(port_abs):
            missing.append(ph['title'] + ' (FALTA portfolio)')
            continue
        uri, size = img_data_uri(port_abs)
        ymd = ph['date'].replace('-', '')  # 'YYYY-MM-DD' -> 'YYYYMMDD'
        resolved.append((ph['title'], ymd, uri, size))

    dates = [d for _, d, _, _ in resolved]
    span = year_span(dates) or book['yearLabel']
    n = len(resolved)

    subline = f"{tr['sub']} · {span}"
    kicker = LABELS[book['kind']][lang]
    count_line = f"{n} {tr['plates']} · {span}"
    footer_left = f"{display_title} — Luis H. Reyes · 25 × 25 cm"

    pages = [page_cover(display_title, subline, tr['photog']),
             page_title(kicker, display_title, book['statement'][lang], count_line, book.get('quote'))]
    rows = []
    for i, (title, ymd, uri, size) in enumerate(resolved, 1):
        ds = fmt_date(ymd)
        pages.append(page_photo(i, title, ds, uri, size))
        rows.append((i, title, ds))
    chunks = [rows[i:i + ROWS_PER_PAGE] for i in range(0, len(rows), ROWS_PER_PAGE)] or [[]]
    for ci, chunk in enumerate(chunks):
        last = ci == len(chunks) - 1
        pages.append(page_colophon(tr['index'], chunk, footer_left if last else None))
    import datetime
    pages.append(page_rights(lang, datetime.date.today().year))

    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{{size:25cm 25cm;margin:0;}}
*{{margin:0;padding:0;box-sizing:border-box;}}
{fonts}
html,body{{background:{DARK};}}
.pg{{width:25cm;height:25cm;overflow:hidden;position:relative;break-after:page;page-break-after:always;}}
.pg:last-child{{break-after:auto;page-break-after:auto;}}
</style></head><body>{''.join(pages)}</body></html>"""
    return html, missing, n


def render_pdf(html, out_pdf):
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        tmp = f.name
    try:
        subprocess.run([
            CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
            '--run-all-compositor-stages-before-draw', '--virtual-time-budget=20000',
            f'--print-to-pdf={out_pdf}', f'file://{tmp}',
        ], check=True, capture_output=True)
    finally:
        os.unlink(tmp)


BOOKS_DIR = os.path.join(MASTER, 'Fotolibros')  # todos los PDFs viven aquí


def main():
    flt = sys.argv[1].casefold() if len(sys.argv) > 1 else None
    books = _cl.books_from_catalog(_cl.load_catalog(os.path.join(MASTER, 'catalog.json')))
    os.makedirs(BOOKS_DIR, exist_ok=True)
    made = 0
    for book in books:
        if flt and flt not in book['slug'].casefold() and flt not in book['title'].casefold():
            continue
        for lang in ('es', 'en'):
            html, missing, n = build_html(book, lang, FONTS)
            base = f"Fotolibro {(book.get('names') or {}).get(lang, book['title'])}"
            out_pdf = os.path.join(BOOKS_DIR, f"{base} ({lang.upper()}).pdf")
            render_pdf(html, out_pdf)
            mb = os.path.getsize(out_pdf) / 1e6
            note = f"  ⚠ {', '.join(missing)}" if missing else ''
            print(f"  {os.path.relpath(out_pdf, MASTER)}  [{n} fotos, {mb:.1f} MB]{note}")
            made += 1
    print(f"listo: {made} PDFs")


FONTS = font_css()

if __name__ == '__main__':
    main()
