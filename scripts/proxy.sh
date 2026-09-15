#!/usr/bin/env bash
# Прокси H.264 CRF 18 с впечённым грейдом — из оригинала в public/episodes/<фича>/.
#   ./scripts/proxy.sh <фича> ["<vf-цепочка грейда>"]
# Пример:
#   ./scripts/proxy.sh kafka "selectivecolor=reds=0.32 -0.13 0 0,colortemperature=temperature=7300:pl=1"
# Без второго аргумента — без грейда. Цепочка дописывается в notes.md фичи,
# если раздела «Грейд» там ещё нет. Оригинал только читается.
set -euo pipefail
cd "$(dirname "$0")/.."

FEAT="${1:?укажи фичу: ./scripts/proxy.sh kafka \"<vf>\"}"
VF="${2:-}"
DIR="src/features/$FEAT"
[ -d "$DIR" ] || { echo "нет фичи $DIR" >&2; exit 1; }

SRC=$(ls "$DIR"/source/*.{mp4,mov,MOV,MP4} 2>/dev/null | head -1 || true)
[ -n "$SRC" ] || { echo "в $DIR/source/ нет видео" >&2; exit 1; }

BASE=$(basename "${SRC%.*}")
OUTDIR="public/episodes/$FEAT"
OUT="$OUTDIR/${BASE}_h264.mp4"
mkdir -p "$OUTDIR"

VFARGS=()
[ -n "$VF" ] && VFARGS=(-vf "$VF")

echo "оригинал : $SRC"
echo "прокси   : $OUT"
[ -n "$VF" ] && echo "грейд    : $VF"

ffmpeg -y -v error -stats -i "$SRC" "${VFARGS[@]}" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"

FRAMES=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$OUT")
echo
echo "кадров в прокси: $FRAMES  -> durationInFrames = $((FRAMES - 1))"
echo "videoSrc: 'episodes/$FEAT/${BASE}_h264.mp4'"

NOTES="$DIR/notes.md"
if [ -n "$VF" ] && { [ ! -f "$NOTES" ] || ! grep -q "## Грейд" "$NOTES"; }; then
  {
    echo
    echo "## Грейд"
    echo
    echo '`'"$VF"'`'
    echo
    echo '```bash'
    echo "./scripts/proxy.sh $FEAT \"$VF\""
    echo '```'
  } >> "$NOTES"
  echo "грейд записан в $NOTES"
fi
