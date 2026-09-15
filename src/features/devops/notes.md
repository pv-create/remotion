# Devops — «как воспитать идеального девопса», 47.2 c

Оригинал `source/0904.mp4`, прокси `public/episodes/devops/0904_h264.mp4`.

## Геометрия

| волосы сверху | глаза | подбородок | субтитры сверху | голова по ширине | свободно над головой |
|---|---|---|---|---|---|
| 212 (срезаны рамкой) | 712 | 1090 | 1306 | 137–725 | нет |

Кадр тесный: карточки в правом верхнем углу, ширина не больше 420 px, нижняя
кромка выше бровей (y 600).

## Грейд

`selectivecolor=reds=0.32 -0.13 0 0,colortemperature=temperature=7300:pl=1`

```bash
ffmpeg -i src/features/devops/source/0904.mp4 -vf "selectivecolor=reds=0.32 -0.13 0 0,colortemperature=temperature=7300:pl=1" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k public/episodes/devops/0904_h264.mp4
```
