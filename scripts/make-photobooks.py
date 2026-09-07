#!/usr/bin/env python3
"""Genera fotolibros PDF (EN + ES) por colección, guardados en la carpeta del
archivo maestro. Plantilla = Fotolibro Elsewhere (25x25 cm). Fuente de orden y
statements: catalog.json (vía catalog_lib). Fotos: files.portfolio de cada foto.

Uso:
  python3 scripts/make-photobooks.py            # todos los libros
  python3 scripts/make-photobooks.py elsewhere  # solo los que matcheen (slug/título)

Requiere Google Chrome (headless --print-to-pdf) y PIL.
"""
import os, sys, base64, subprocess, tempfile, io, json
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.path.abspath(os.path.join(REPO, '..', '..'))
FONT_DIR = os.path.join(REPO, 'node_modules', '@fontsource-variable')

import sys as _sys
_sys.path.insert(0, os.path.join(MASTER, '_scripts', 'catalog'))
import catalog_lib as _cl
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
MAXEDGE, Q = 2000, 88   # imagen embebida para la edición de lectura

# --- edición de impresión ---------------------------------------------------
# Dos salidas del mismo libro. La de lectura embebe desde Portfolio a 2000 px,
# que en pantalla sobra y en imprenta da 214 dpi. La de impresión lee los HD,
# agrega sangrado y marcas de corte, y aplica la regla que fijó Luis el
# 2026-08-27: cuando una imagen no aguanta el tamaño de placa a 300 dpi, se
# imprime más pequeña en vez de imprimirse mal.
PRINT = False
DPI = 300
BLEED_CM = 0.3          # sangrado por lado, se lo lleva la guillotina
SLUG_CM = 0.5           # margen extra donde viven las marcas, fuera del sangrado
MARK_LEN_CM = 0.5       # largo de la marca de corte
MARK_GAP_CM = 0.15      # aire entre la marca y el corte
PRINT_Q = 95            # jpeg de mayor calidad para imprenta
PLATE_PRINT_CM = 23.7   # placa más grande posible; fija el tope de píxeles a embeber

CIT, INK, BONE, DARK = '#C9C41C', '#121212', '#E8E6E1', '#0A0A0A'

LABELS = {
    'work':  {'es': 'Obra',    'en': 'Work'},
    'study': {'es': 'Estudio', 'en': 'Study'},
    'loose': {'es': 'Sueltas', 'en': 'Loose'},
}
T = {
    'es': {'sub': 'Fotografía en blanco y negro', 'plates': 'placas', 'index': 'Índice de placas', 'loose': 'Sueltas', 'photog': 'Fotografía', 'edition': 'primera edición'},
    'en': {'sub': 'Black & white photography',     'plates': 'plates', 'index': 'Index of plates',   'loose': 'Loose',   'photog': 'Photography', 'edition': 'first edition'},
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


def img_data_uri(path, maxedge=None, quality=None):
    im = Image.open(path).convert('RGB')
    nat = im.size
    w, h = nat
    s = min(1.0, (maxedge or MAXEDGE) / max(w, h))
    if s < 1.0:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=quality or Q)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode(), nat


def cm_a_300dpi(px):
    """Cuántos cm de papel cubre ese número de píxeles a 300 dpi."""
    return px / DPI * 2.54


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

def page_cover(display_title, subline, brand_word, meta=None, cover_uri=None):
    """Portada de banda: metadatos en columnas arriba, titulo grande, foto a sangre.

    Adapta la estructura de las portadas tipo fanzine editorial (banda clara con
    tres columnas de datos, titulo abajo a la izquierda, imagen ocupando el resto)
    a la tipografia de la casa: Big Shoulders para el titulo, Archivo para los
    datos, y el amarillo de marca solo en el numero de edicion. Referencia traida
    por Luis el 2026-08-27. Sin foto disponible cae a la portada tipografica.
    """
    if not cover_uri:
        return page_cover_plain(display_title, subline, brand_word)
    m = meta or {}
    col = lambda a, b: (f'<div><div style="color:{INK};">{esc(a)}</div>'
                        f'<div style="color:rgba(18,18,18,0.55);">{esc(b)}</div></div>')
    return f"""<section class="pg" style="background:{BONE};display:flex;flex-direction:column;">
<div style="padding:1.5cm 1.5cm 1.1cm 1.5cm;">
<div style="display:flex;justify-content:space-between;font-family:'Archivo';font-weight:500;font-size:8pt;line-height:1.45;letter-spacing:0.02em;">
<div style="color:{INK};">Luis H. Reyes</div>
{col(m.get('edition',''), m.get('plates',''))}
<div style="text-align:right;"><div style="color:{CIT};font-weight:600;">{esc(m.get('number',''))}</div><div style="color:rgba(18,18,18,0.55);">{esc(m.get('span',''))}</div></div>
</div>
<h1 style="margin:0.9cm 0 0 0;font-family:'Big Shoulders Display';font-weight:300;font-size:66pt;line-height:0.92;letter-spacing:0.01em;text-transform:uppercase;color:{INK};">{esc(display_title)}</h1>
</div>
<div style="flex:1;overflow:hidden;background:{DARK};">
<img src="{cover_uri}" style="width:100%;height:100%;object-fit:cover;display:block;">
</div>
</section>"""


def page_cover_plain(display_title, subline, brand_word):
    """Portada tipografica original, fondo oscuro y esquinas. Se conserva como
    respaldo para los libros que no resuelvan imagen de portada."""
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
<div style="width:2.4cm;height:1px;background:rgba(18,18,18,0.25);margin:0.9cm 0;"></div>
<p style="margin:0;max-width:15cm;font-family:'Archivo';font-weight:400;font-size:12pt;line-height:1.55;color:rgba(18,18,18,0.86);">{esc(statement)}</p>{qhtml}
<div style="margin-top:1.1cm;font-family:'Archivo';font-weight:400;font-size:11pt;color:{INK};">Luis H. Reyes</div>
</section>"""


# Regla de tamaños de placa: el lado LARGO es el mismo para vertical y horizontal.
# Las cuadradas (y casi cuadradas) se reducen para emparejar el área percibida:
# a proporción 1:1 el lado vale SQ_FACTOR*LONG (área pareja con una 2:3) y crece
# linealmente hasta proporción 1.3, donde ya rige el lado largo completo.
PLATE_LONG_CM = 20.6
SQ_FACTOR = 0.82

# Geometría de página. La cuadrada de 25 cm es el formato histórico y se conserva
# para las colecciones mixtas. Cuando un libro es abrumadoramente vertical (caso
# Chicago, 62 de 62 en vertical porque el estudio se impuso esa restricción), la
# página cuadrada desperdicia los flancos y achica la placa: ahí se usa retrato.
# Decisión de Luis, 2026-08-27: "creelo portrait, como todas las fotos son así".
PAGE_SQUARE = (25.0, 25.0)
PAGE_PORTRAIT = (22.0, 29.7)
PORTRAIT_SHARE = 0.8   # fracción de verticales que dispara el formato retrato
PAGE_W, PAGE_H = PAGE_SQUARE


def page_geometry(sizes):
    """Devuelve (ancho, alto, lado_largo_de_placa) según la orientación dominante."""
    if not sizes:
        return (*PAGE_SQUARE, PLATE_LONG_CM)
    vert = sum(1 for w, h in sizes if h > w) / len(sizes)
    if vert >= PORTRAIT_SHARE:
        return (*PAGE_PORTRAIT, 23.7)
    return (*PAGE_SQUARE, PLATE_LONG_CM)


def plate_css(w, h, plate_long=None):
    plate_long = PLATE_LONG_CM if plate_long is None else plate_long
    if PRINT:
        # Regla de Luis: la placa nunca se estira más allá de lo que su propio
        # archivo sostiene a 300 dpi. La foto pobre sale chica, no sale sucia.
        plate_long = min(plate_long, cm_a_300dpi(max(w, h)))
    aspect = max(w, h) / min(w, h)
    f = 1.0 if aspect >= 1.3 else SQ_FACTOR + (1.0 - SQ_FACTOR) * (aspect - 1.0) / 0.3
    edge = plate_long * f
    if w > h:
        # una horizontal dentro de una página retrato se limita por el ancho útil
        edge = min(edge, PAGE_W - 2.4)
        return f'width:{edge:.2f}cm;height:auto;'
    # una vertical no puede pasarse del alto útil (placa + pie + márgenes)
    edge = min(edge, PAGE_H - 4.4)
    return f'height:{edge:.2f}cm;width:auto;'


def marcas_de_corte():
    """Ocho marcas de corte, dos por esquina, alineadas con la línea de corte.

    Van en el margen de guillotina y nunca dentro del sangrado: la marca arranca
    en el borde del papel y se detiene antes de que empiece la zona sangrada, que
    es la que la cuchilla se lleva. Cada esquina lleva su pareja, una que indica
    el corte vertical y otra el horizontal.
    """
    if not PRINT:
        return ''
    fuera = BLEED_CM + SLUG_CM       # distancia del borde del papel a la línea de corte
    largo = max(0.05, SLUG_CM - MARK_GAP_CM)
    linea = lambda st: f'<div style="position:absolute;background:#000;{st}"></div>'
    out = []
    for lx in ('left', 'right'):
        for ly in ('top', 'bottom'):
            out.append(linea(f'{ly}:{fuera}cm;{lx}:0;width:{largo:.2f}cm;height:0.4pt;'))
            out.append(linea(f'{lx}:{fuera}cm;{ly}:0;height:{largo:.2f}cm;width:0.4pt;'))
    return ''.join(out)


def caja(inner, bg):
    """Envuelve una página en su sangrado. Sin PRINT devuelve el interior tal cual."""
    if not PRINT:
        return inner
    b = BLEED_CM
    return (f'<section class="pg" style="background:{bg};padding:{b}cm;position:relative;">'
            f'{marcas_de_corte()}'
            f'<div class="trim" style="width:100%;height:100%;position:relative;overflow:hidden;">{inner}</div>'
            f'</section>')


def page_photo(num, title, date_str, uri, size, plate_long=None):
    w, h = size
    dim = plate_css(w, h, plate_long)
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
    chicas = []    # placas que la resolución obligó a encoger, se reportan
    for ph in book['photos']:
        port_abs = os.path.join(MASTER, ph['portfolio'])
        # La edición de impresión lee el master; la de lectura, la copia Portfolio.
        src = os.path.join(MASTER, ph.get('hd') or '') if PRINT else port_abs
        if PRINT and not (src and os.path.exists(src)):
            src = port_abs   # sin HD disponible se cae al Portfolio y se avisa
            if os.path.exists(port_abs):
                missing.append(ph['title'] + ' (sin HD, va en Portfolio)')
        if not os.path.exists(src):
            missing.append(ph['title'] + ' (FALTA archivo)')
            continue
        if PRINT:
            tope = round(PLATE_PRINT_CM / 2.54 * DPI)
            uri, size = img_data_uri(src, maxedge=tope, quality=PRINT_Q)
        else:
            uri, size = img_data_uri(src)
        ymd = ph['date'].replace('-', '')  # 'YYYY-MM-DD' -> 'YYYYMMDD'
        resolved.append((ph['title'], ymd, uri, size))

    global PAGE_W, PAGE_H
    page_w, page_h, plate_long = page_geometry([sz for _, _, _, sz in resolved])
    PAGE_W, PAGE_H = page_w, page_h

    dates = [d for _, d, _, _ in resolved]
    span = year_span(dates) or book['yearLabel']
    n = len(resolved)

    subline = f"{tr['sub']} · {span}"
    kicker = LABELS[book['kind']][lang]
    count_line = f"{n} {tr['plates']} · {span}"
    footer_left = f"{display_title} — Luis H. Reyes · {page_w:g} × {page_h:g} cm"

    cover_meta = {
        'edition': tr['edition'], 'plates': f"{n} {tr['plates']}",
        'number': book.get('book_number', ''), 'span': span,
    }
    cover_uri = resolved[0][2] if resolved else None
    pages = [page_cover(display_title, subline, tr['photog'], cover_meta, cover_uri),
             page_title(kicker, display_title, book['statement'][lang], count_line, book.get('quote'))]
    rows = []
    for i, (title, ymd, uri, size) in enumerate(resolved, 1):
        ds = fmt_date(ymd)
        pages.append(page_photo(i, title, ds, uri, size, plate_long))
        rows.append((i, title, ds))
    chunks = [rows[i:i + ROWS_PER_PAGE] for i in range(0, len(rows), ROWS_PER_PAGE)] or [[]]
    for ci, chunk in enumerate(chunks):
        last = ci == len(chunks) - 1
        pages.append(page_colophon(tr['index'], chunk, footer_left if last else None))
    import datetime
    pages.append(page_rights(lang, datetime.date.today().year))

    if PRINT:
        marcas = marcas_de_corte()
        # El borde transparente crea sangrado y margen de guillotina de una vez:
        # el fondo de la página se pinta por debajo y llega hasta el papel.
        fuera = BLEED_CM + SLUG_CM
        pages = [pg.replace('<section class="pg" style="',
                            f'<section class="pg" style="border:{fuera}cm solid transparent;', 1)
                   .replace('>', '>' + marcas, 1) for pg in pages]
        page_w += 2 * fuera
        page_h += 2 * fuera

    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{{size:{page_w}cm {page_h}cm;margin:0;}}
*{{margin:0;padding:0;box-sizing:border-box;}}
{fonts}
html,body{{background:{DARK};}}
.pg{{width:{page_w}cm;height:{page_h}cm;overflow:hidden;position:relative;break-after:page;page-break-after:always;}}
.pg:last-child{{break-after:auto;page-break-after:auto;}}
</style></head><body>{''.join(pages)}</body></html>"""
    if PRINT:
        for titulo, _, _, sz in resolved:
            techo = cm_a_300dpi(max(sz))
            if techo < plate_long - 0.05:
                chicas.append(f'{titulo} {techo:.1f}cm')
        if chicas:
            missing.append('placas reducidas por resolución: ' + ', '.join(chicas))
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
    global PRINT
    args = [a for a in sys.argv[1:]]
    # --print produce la edición de imprenta; sin bandera, la de lectura.
    PRINT = '--print' in args
    args = [a for a in args if not a.startswith('--')]
    flt = args[0].casefold() if args else None
    cat_full = _cl.load_catalog(os.path.join(MASTER, 'catalog.json'))
    cols_por_slug = {c['slug']: c for c in cat_full['collections']}
    books = _cl.books_from_catalog(cat_full)
    os.makedirs(BOOKS_DIR, exist_ok=True)
    made = 0
    for book in books:
        if flt and flt not in book['slug'].casefold() and flt not in book['title'].casefold():
            continue
        # Cada colección tiene su carpeta, nombrada por slug para que no dependa
        # del idioma ni de los acentos. Decisión de Luis, 2026-08-27.
        col_full = cols_por_slug[book['slug']]
        carpeta = os.path.join(BOOKS_DIR, book['slug'])
        os.makedirs(carpeta, exist_ok=True)
        for lang in ('es', 'en'):
            html, missing, n = build_html(book, lang, FONTS)
            nombre = (book.get('names') or {}).get(lang, book['title'])
            sufijo = ' [impresion]' if PRINT else ''
            out_pdf = os.path.join(carpeta, f"{nombre} ({lang.upper()}){sufijo}.pdf")
            render_pdf(html, out_pdf)
            mb = os.path.getsize(out_pdf) / 1e6
            note = f"  ⚠ {', '.join(missing)}" if missing else ''
            print(f"  {os.path.relpath(out_pdf, MASTER)}  [{n} fotos, {mb:.1f} MB]{note}")
            made += 1
        # Se anota la huella del contenido impreso para que el build pueda avisar
        # cuando el libro quede viejo. Ver catalog_lib.libros_desactualizados.
        sello = os.path.join(carpeta, '.libro.json')
        datos = {}
        if os.path.exists(sello):
            try:
                datos = json.load(open(sello, encoding='utf-8'))
            except Exception:
                datos = {}
        datos['huella'] = _cl.huella_libro(cat_full, col_full)
        json.dump(datos, open(sello, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"listo: {made} PDFs")


FONTS = font_css()

if __name__ == '__main__':
    main()
