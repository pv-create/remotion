#!/usr/bin/env bash
# Замеры нового ролика одной командой.
#   ./scripts/measure.sh src/features/kafka/source/0905.mp4 [outdir]
# Если видео лежит в src/features/<фича>/source/, листы уходят в
# src/features/<фича>/measure/ — outdir можно не указывать.
# Три листа: кадры целиком, полоса субтитров и варианты
# цветокоррекции. Дальше их надо просто посмотреть глазами.
# Полоса субтитров у роликов гуляет: SUB_Y=1452 ./scripts/measure.sh ... задаёт
# верх кропа (по умолчанию 1270), SUB_H — высоту (210).
set -euo pipefail

SRC="${1:?укажи видео, напр. src/features/kafka/source/0905.mp4}"
if [ -n "${2:-}" ]; then
  OUT="$2"
elif [ "$(basename "$(dirname "$SRC")")" = "source" ]; then
  OUT="$(dirname "$(dirname "$SRC")")/measure"
else
  OUT="measure-out"
fi
mkdir -p "$OUT"
SUB_Y="${SUB_Y:-1270}"
SUB_H="${SUB_H:-210}"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
FRAMES=$(ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=nb_read_frames -of csv=p=0 "$SRC")
SECS=$(printf '%.0f' "$DUR")
COLS=8
ROWS=$(( (SECS + COLS) / COLS ))

echo "длительность : $DUR c"
echo "кадров       : $FRAMES  -> durationInFrames = $((FRAMES - 1))"

# 1. Кадры целиком, по одному в секунду. Отсюда видно крупность и где что лежит.
#    select по номеру кадра, а не fps=: ячейка i — ровно кадр 30*i, секунда i.
ffmpeg -y -v error -i "$SRC" \
  -vf "select='not(mod(n,30))',scale=130:-1,tile=${COLS}x${ROWS}:margin=3:padding=3:color=0x333333" \
  -fps_mode passthrough -frames:v 1 -q:v 3 "$OUT/frames.jpg"

# 2. Полоса субтитров — пословная карта, две ячейки в секунду (кадры 0,15,30,…).
#    Ячейка i -> кадр 15*i -> секунда i/2; 8 в ряд = 4 секунды на строку.
#    fps= тут нельзя: ffmpeg берёт ближайший кадр к своей сетке, и карта
#    уезжает на полсекунды. Полосу подобрать по frames.jpg: SUB_Y=<px>.
ffmpeg -y -v error -i "$SRC" \
  -vf "select='not(mod(n,15))',crop=1080:${SUB_H}:0:${SUB_Y},scale=380:-1,tile=8x$(( (SECS * 2 + 8) / 8 )):margin=2:padding=2:color=black" \
  -fps_mode passthrough -frames:v 1 -q:v 3 "$OUT/subtitles.jpg"

# 3. Варианты цветокоррекции на среднем кадре. Числа под каждый ролик свои,
#    это только вилка для выбора.
MID=$(( FRAMES / 2 ))
CROP="crop=760:860:60:210,scale=260:-1"
i=0
for G in "" \
  "selectivecolor=reds=0.20 -0.08 0 0," \
  "selectivecolor=reds=0.32 -0.13 0 0," \
  "selectivecolor=reds=0.45 -0.18 0 0," \
  "selectivecolor=reds=0.32 -0.13 0 0,colortemperature=temperature=7300:pl=1," \
  "colorbalance=rs=-0.04:rm=-0.13:rh=-0.04:bs=0.02:bm=0.08:bh=0.02,"; do
  ffmpeg -y -v error -i "$SRC" \
    -vf "select='eq(n,$MID)',${G}${CROP}" -fps_mode passthrough -frames:v 1 -q:v 2 \
    "$OUT/.g$i.jpg"
  i=$((i + 1))
done
ffmpeg -y -v error -i "$OUT/.g0.jpg" -i "$OUT/.g1.jpg" -i "$OUT/.g2.jpg" \
  -i "$OUT/.g3.jpg" -i "$OUT/.g4.jpg" -i "$OUT/.g5.jpg" \
  -filter_complex "[0][1][2]hstack=inputs=3[t];[3][4][5]hstack=inputs=3[b];[t][b]vstack=inputs=2" \
  -frames:v 1 -q:v 2 "$OUT/grade.jpg"
rm -f "$OUT"/.g*.jpg

# 4. Дрейф цвета по ролику: заваленность постоянная или уезжает.
echo
echo "цвет по секундам (нейтраль U=V=128):"
ffmpeg -v error -i "$SRC" -vf "fps=1,signalstats,metadata=print:file=-" -f null /dev/null 2>&1 \
  | grep -E "YAVG|UAVG|VAVG" | awk -F'=' '{print $2}' | paste - - - \
  | awk 'BEGIN{printf "  %-4s %-6s %-6s %-6s\n","сек","Y","U","V"}
         (NR-1)%8==0 {printf "  %-4d %-6.1f %-6.1f %-6.1f\n", NR-1, $1, $2, $3}'

echo
echo "готово -> $OUT/{frames,subtitles,grade}.jpg"
echo "subtitles.jpg: полоса y=${SUB_Y} h=${SUB_H}, 8 ячеек в ряд = 4 с, ячейка = полсекунды"
echo "верх grade.jpg: оригинал | reds.20 | reds.32"
echo "низ:            reds.45  | reds.32+temp | colorbalance"
