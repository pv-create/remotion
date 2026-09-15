import type {Episode as ReelEpisode} from '../shared/reel/types';
import type {Episode as MotionEpisode} from '../shared/motion/types';
import {devops} from './devops/episode';
import {yandex} from './yandex/episode';
import {kafka} from './kafka/episode';
import {tester} from './tester/episode';
import {testerNew} from './tester_new/episode';
import autoscaling from './autoscaling/episode.json';
import {bcendVospitanie} from './bcend_vospitanie/episode';
import {bulkhead} from './bulkhead/episode';

// Фича = один выпуск. Всё, что относится только к нему — раскладка, оригинал,
// сценарий, замеры, — лежит в src/features/<имя>/. Общее — в src/shared/.
export type Feature =
  | {
      /** мемы и перебивки поверх готового ролика (композиция Reel) */
      kind: 'reel';
      episode: ReelEpisode;
    }
  | {
      /** motion-обучалка «BACKEND ЗА 30 СЕКУНД», 900 кадров с нуля */
      kind: 'motion';
      id: string;
      episode: MotionEpisode;
    };

// Порядок здесь = порядок композиций в Studio. Новый выпуск — новая папка
// и одна строка тут.
export const features: Feature[] = [
  {kind: 'reel', episode: devops},
  {kind: 'reel', episode: yandex},
  {kind: 'reel', episode: kafka},
  {kind: 'reel', episode: tester},
  {kind: 'reel', episode: testerNew},
  {kind: 'reel', episode: bcendVospitanie},
  {kind: 'reel', episode: bulkhead},
  {kind: 'motion', id: 'Autoscaling', episode: autoscaling as MotionEpisode},
];
