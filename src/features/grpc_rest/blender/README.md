# Blender-перебивки для REST vs gRPC

**Отвергнуто 20 сентября 2026.** Автор посмотрел рендер с карточками и
сказал, что они выглядят тухло; первый блок выпуска собран перебивками
`docs` в 2D-системе (`src/shared/cuts/components/Docs.tsx`). Папка оставлена
как история, прокси карточек удалены.

3D-заготовки выпуска. Папка фичи заведена `./scripts/new-episode.sh`,
раскладка — `../episode.ts`; карточки стоят там как `broll` на весь кадр.

## Файлы

- `cards.py` — карточки-окна REST и gRPC по референсу автора (стиль «клей»:
  скруглённые плиты, мягкий свет, кремовый фон в сетку). Основной результат.
- `scene.py` — первый тест «две полосы» в Workbench. Автору не зашёл, лежит
  как история; удалять не стал, пока не решили, что из него брать.
- `cards_rest.blend`, `cards_grpc.blend`, `lanes.blend` — сохранённые сцены,
  открыть в Blender и покрутить.

Прокси рендеров — `public/broll/card-rest.mp4` (285 кадров) и
`public/broll/card-grpc.mp4` (200 кадров): выезд снизу за кадры 8–22 и
медленный доворот до конца клипа. Линт пускает подсъёмы только из
`public/broll/`. В `public/episodes/grpc_rest/` лежат первые 120-кадровые
версии и `lanes.mp4` (старый тест).

## Рендер

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P src/features/grpc_rest/blender/cards.py -- <папка> rest still 50
/Applications/Blender.app/Contents/MacOS/Blender -b -P src/features/grpc_rest/blender/cards.py -- <папка> grpc anim 100 200
```

`still` — кадр 40, `anim` — кадры 1..N. Четвёртый аргумент — проценты
разрешения, для подбора вида хватает 50; пятый — длина анимации кадрами
(по умолчанию 120): выезд 8–22 остаётся, доворот растягивается на весь клип,
так карточка держится ровно столько, сколько длится фраза. Eevee на этом Маке: ~2.7 с на
полный кадр 1080×1920, 120 кадров ≈ 5.5 мин. Кодирование в прокси:

```bash
ffmpeg -framerate 30 -i <папка>/rest_%04d.png -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart public/broll/card-rest.mp4
```

## Что важно знать

- Шрифты системные: Avenir Next Bold вместо Montserrat, Menlo под код.
  Montserrat в системе нет; если положить ttf, заменить путь в `FONT_HEAVY`.
- Цвета — токены `src/shared/motion/theme.ts` плюс три оттенка под сами
  карточки (`card`, `pill`, `dark`, `dark2`, `cream`), все в `HEX`.
- View transform `Standard`: фон в рендере выходит ровно `#F1EDE3`.
  Свет подобран под него (`KEY_W`, `FILL_W`, `WORLD_STR`), AgX не включать —
  уплывёт палитра.
- Blender 5: у `Action` нет `fcurves`, кривые в `layers/strips/channelbags`
  (см. `fcurves_of`). Workbench для этого стиля не годится: гасит бумажные
  грани до серого.
- Фон запечён в кадр. Если карточки пойдут поверх видео, а не перебивкой на
  весь экран, нужен рендер с альфой (`film_transparent`) и отдельный путь
  в Remotion — это новая задача.
