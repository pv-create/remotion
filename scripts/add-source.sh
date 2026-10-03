#!/usr/bin/env bash
# Второй экспорт автора в уже заведённую фичу: копирует оригинал в source/
# под именем с суффиксом, сверяет копию побайтно и печатает кадры.
#   ./scripts/add-source.sh <фича> <путь/к/оригиналу.mp4> [суффикс]
# Суффикс по умолчанию b: 0918.mp4 -> source/0918b.mp4. Старый экспорт не
# удаляется — proxy.sh берёт самый свежий по mtime. Дальше: пересъёмка карты
# (./scripts/measure.sh source/<файл>) и прокси.
set -euo pipefail
cd "$(dirname "$0")/.."

NAME="${1:?имя фичи, напр. kafka_rabbit}"
VIDEO="${2:?путь к оригиналу}"
SUFFIX="${3:-b}"
DIR="src/features/$NAME"
[ -d "$DIR/source" ] || { echo "нет фичи $DIR (сначала new-episode.sh)" >&2; exit 1; }
[ -f "$VIDEO" ] || { echo "нет файла $VIDEO" >&2; exit 1; }

# имя без скобок и пробелов: «0918(2).mp4» -> 0918b.mp4
BASE=$(basename "$VIDEO")
STEM=$(echo "${BASE%.*}" | sed -E 's/[^A-Za-z0-9_-]//g; s/[0-9]+$//' )
DIGITS=$(echo "${BASE%.*}" | grep -oE '^[0-9]+' || true)
EXT="${BASE##*.}"
OUT="$DIR/source/${DIGITS:-$STEM}${SUFFIX}.${EXT}"
[ -e "$OUT" ] && { echo "$OUT уже есть" >&2; exit 1; }

cp "$VIDEO" "$OUT"
cmp "$VIDEO" "$OUT" && echo "оригинал -> $OUT (копия сверена побайтно)"
FRAMES=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$OUT")
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
echo "длительность : $DUR c"
echo "кадров       : $FRAMES  -> durationInFrames = $((FRAMES - 1)) (плюс хук, если клеится)"
echo "дальше: SUB_Y=<px> ./scripts/measure.sh $OUT ; прокси из этого файла"
