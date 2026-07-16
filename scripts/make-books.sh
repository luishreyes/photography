#!/usr/bin/env bash
# Regenera los fotolibros PDF (EN+ES) de todas las colecciones.
#   1. exporta el orden curado + statements del sitio -> books-manifest.json
#   2. renderiza cada libro desde los Portfolio/ del archivo -> PDF en su carpeta
# Correr después del sync de fotos para mantenerlos al día.
#   ./scripts/make-books.sh            # todos
#   ./scripts/make-books.sh elsewhere  # filtra por slug/título
set -e
cd "$(dirname "$0")/.."
node_modules/.bin/esbuild scripts/export-books-manifest.ts --bundle --format=esm --platform=node --outfile=scripts/_export-books.mjs >/dev/null
node scripts/_export-books.mjs
python3 scripts/make-photobooks.py "$@"
