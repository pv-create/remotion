#!/usr/bin/env bash
# Заводит новый выпуск: папка фичи, оригинал в source/, замеры, заготовки
# episode.ts и notes.md, строка в реестре и скрипт render:<имя>.
#   ./scripts/new-episode.sh <имя> <путь/к/оригиналу.mp4>
# Имя — латиницей, как папка: kafka, tester_new. Оригинал копируется, не
# переносится. Прокси и грейд — следующий шаг, ./scripts/proxy.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

NAME="${1:?имя фичи латиницей, напр. kafka2}"
VIDEO="${2:?путь к оригиналу}"
[[ "$NAME" =~ ^[a-z][a-z0-9_]*$ ]] || { echo "имя — строчные латинские, цифры, _" >&2; exit 1; }
[ -f "$VIDEO" ] || { echo "нет файла $VIDEO" >&2; exit 1; }

DIR="src/features/$NAME"
[ -e "$DIR/episode.ts" ] && { echo "$DIR/episode.ts уже есть" >&2; exit 1; }
mkdir -p "$DIR/source"

BASE=$(basename "$VIDEO")
if [ ! -f "$DIR/source/$BASE" ]; then
  cp "$VIDEO" "$DIR/source/$BASE"
  echo "оригинал -> $DIR/source/$BASE"
fi

echo
./scripts/measure.sh "$DIR/source/$BASE"
FRAMES=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of csv=p=0 "$DIR/source/$BASE")
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$DIR/source/$BASE")

# Id композиции: kafka -> Kafka, tester_new -> TesterNew
ID=$(echo "$NAME" | awk -F_ '{for(i=1;i<=NF;i++) printf "%s%s", toupper(substr($i,1,1)), substr($i,2)}')
CAMEL=$(echo "$ID" | awk '{print tolower(substr($0,1,1)) substr($0,2)}')
PROXY="episodes/$NAME/${BASE%.*}_h264.mp4"

cat > "$DIR/notes.md" <<EOF
# $ID — «...», $(printf '%.1f' "$DUR") c

Оригинал \`source/$BASE\`, прокси \`public/$PROXY\`.

## Геометрия

Замерить по \`measure/frames.jpg\` (полный кадр) и заполнить — TODO.

| волосы сверху | глаза | подбородок | субтитры сверху | голова по ширине | свободно над головой |
|---|---|---|---|---|---|
| ? | ? | ? | ? | ?–? | ? |

EOF

cat > "$DIR/episode.ts" <<EOF
import type {Episode} from '../../shared/reel/types';

// TODO: геометрия по measure/frames.jpg, числа записать и в notes.md.
export const $CAMEL: Episode = {
  id: '$ID',
  videoSrc: '$PROXY',
  durationInFrames: $((FRAMES - 1)),
  geometry: {
    hairTop: 0,
    eyes: 0,
    chin: 0,
    subtitleTop: 0,
    headLeft: 0,
    headRight: 0,
  },
  overlays: [],
};
EOF

# реестр: импорт после последнего import, строка перед motion-выпусками или перед ];
node - "$NAME" "$CAMEL" <<'EOF'
const fs = require('fs');
const [name, camel] = process.argv.slice(2);
const f = 'src/features/index.ts';
let s = fs.readFileSync(f, 'utf8');
if (!s.includes(`'./${name}/episode'`)) {
  const imp = `import {${camel}} from './${name}/episode';\n`;
  const lastImport = s.lastIndexOf('\nimport ');
  const eol = s.indexOf('\n', lastImport + 1);
  s = s.slice(0, eol + 1) + imp + s.slice(eol + 1);
  const line = `  {kind: 'reel', episode: ${camel}},\n`;
  const motion = s.indexOf("  {kind: 'motion'");
  const close = s.lastIndexOf('];');
  const at = motion !== -1 ? motion : close;
  s = s.slice(0, at) + line + s.slice(at);
  fs.writeFileSync(f, s);
  console.log(`реестр: добавлен ${camel} в ${f}`);
}
const pkgF = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgF, 'utf8'));
const key = `render:${name}`;
if (!pkg.scripts[key]) {
  const id = camel[0].toUpperCase() + camel.slice(1);
  pkg.scripts[key] = `remotion render ${id} out/${name}.mp4 --codec=h264 --crf=18`;
  fs.writeFileSync(pkgF, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`package.json: добавлен ${key}`);
}
EOF

cat <<EOF

готово: $DIR/
дальше:
  1. посмотреть $DIR/measure/frames.jpg, замерить геометрию -> episode.ts и notes.md
  2. subtitles.jpg — пословная карта (полосу подобрать: SUB_Y=<px> ./scripts/measure.sh ...)
  3. выбрать грейд по grade.jpg и пережечь прокси:
     ./scripts/proxy.sh $NAME "<vf>"
  4. расставить оверлеи в $DIR/episode.ts (линт сработает сам)
  5. npm run render:$NAME — приёмка сработает сама, потом глазами по out/$NAME.check.jpg
EOF
