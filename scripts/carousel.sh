#!/usr/bin/env bash
# Карусель в PNG: кадр композиции = слайд.
#   ./scripts/carousel.sh <фича>
# Берёт id из src/features/<фича>/carousel.json, кладёт слайды в
# out/carousels/<фича>/slide-1.png … slide-N.png и лист всех слайдов разом
# в out/carousels/<фича>.jpg — смотреть глазами, не вылез ли текст.
set -euo pipefail
cd "$(dirname "$0")/.."

FEAT="${1:?укажи фичу: ./scripts/carousel.sh system_design}"
JSON="src/features/$FEAT/carousel.json"
[ -f "$JSON" ] || { echo "нет $JSON" >&2; exit 1; }

ID=$(node -p "require('./$JSON').id")
N=$(node -p "require('./$JSON').slides.length")
OUT="out/carousels/$FEAT"

# старые слайды убираем: если слайдов стало меньше, лишние остались бы в папке
rm -rf "$OUT"
npx remotion render "$ID" "$OUT" --sequence --image-format=png \
  --image-sequence-pattern='slide-[frame].[ext]'

# Remotion нумерует с нуля и с ведущими нулями; в Instagram грузят по порядку
# имён, поэтому переименовываем в slide-1 … slide-N
i=1
for f in $(ls "$OUT"/slide-*.png | sort); do
  mv "$f" "$OUT/tmp-$i.png"
  i=$((i + 1))
done
for f in "$OUT"/tmp-*.png; do
  mv "$f" "${f/tmp-/slide-}"
done

COLS=$(( N < 4 ? N : 4 ))
ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -loglevel error -y -start_number 1 -i "$OUT/slide-%d.png" \
  -vf "scale=360:-1,tile=${COLS}x${ROWS}:padding=8:color=white" \
  -frames:v 1 "out/carousels/$FEAT.jpg"

echo "слайды: $OUT/ ($N шт.), лист: out/carousels/$FEAT.jpg"
