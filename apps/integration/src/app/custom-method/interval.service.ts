import { untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, interval, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoggerFactory } from '../logger/logger.factory';

export class IntervalService {
  interval$ = new Subject<number>();

  constructor(
    loggerFactory: LoggerFactory,
    intervalServiceUnsubscribed$: BehaviorSubject<boolean>
  ) {
    const logger = loggerFactory.createLogger('IntervalService', '#7d00a5');

    intervalServiceUnsubscribed$.next(false);

    interval(1000)
      .pipe(
        untilDestroyed(this, 'destroy'),
        finalize(() => {
          intervalServiceUnsubscribed$.next(true);
          logger.log('interval has been unsubscribed');
        })
      )
      .subscribe(value => {
        logger.log(`interval emits value ${value}`);
        this.interval$.next(value);
      });
  }

  destroy(): void {}
}
