import type {Episode as ReelEpisode} from '../shared/reel/types';
import type {Episode as MotionEpisode} from '../shared/motion/types';
import type {Carousel} from '../shared/carousel/types';
import {devops} from './devops/episode';
import {yandex} from './yandex/episode';
import {kafka} from './kafka/episode';
import {tester} from './tester/episode';
import {testerNew} from './tester_new/episode';
import autoscaling from './autoscaling/episode.json';
import {bcendVospitanie} from './bcend_vospitanie/episode';
import {bulkhead} from './bulkhead/episode';
import {resume} from './resume/episode';
import {got} from './got/episode';
import {news01} from './news_01/episode';
import {kafkaRabbit} from './kafka_rabbit/episode';
import {grpcRest} from './grpc_rest/episode';
import {got2} from './got2/episode';
import {requests} from './requests/episode';
import {idempotency} from './idempotency/episode';
import {itUnknown} from './it_unknown/episode';
import systemDesign from './system_design/carousel.json';
import {sqrs} from './sqrs/episode';
import {mokSobes} from './mok_sobes/episode';

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
    }
  | {
      /** карусель в ленту 1080×1350, кадр = слайд */
      kind: 'carousel';
      carousel: Carousel;
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
  {kind: 'reel', episode: resume},
  {kind: 'reel', episode: got},
  {kind: 'reel', episode: news01},
  {kind: 'reel', episode: kafkaRabbit},
  {kind: 'reel', episode: grpcRest},
  {kind: 'reel', episode: got2},
  {kind: 'reel', episode: requests},
  {kind: 'reel', episode: idempotency},
  {kind: 'reel', episode: itUnknown},
  {kind: 'reel', episode: sqrs},
  {kind: 'reel', episode: mokSobes},
  {kind: 'motion', id: 'Autoscaling', episode: autoscaling as MotionEpisode},
  {kind: 'carousel', carousel: systemDesign as Carousel},
];
