#!/usr/bin/env bash
# Regenera los fotolibros PDF (EN+ES) desde catalog.json.
#   ./scripts/make-books.sh            # todos
#   ./scripts/make-books.sh elsewhere  # filtra por slug/título
set -e
cd "$(dirname "$0")/.."
python3 scripts/make-photobooks.py "$@"
