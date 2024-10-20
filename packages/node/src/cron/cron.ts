import { captureException, withMonitor } from '@sentry/core';
import { replaceCronNames } from './common';

export type CronJobParams = {
  cronTime: string | Date;
  onTick: (context: unknown, onComplete?: unknown) => void | Promise<void>;
  onComplete?: () => void | Promise<void>;
  start?: boolean | null;//
  setHeartbeat?: boolean | null; //add an optional param for a heartbeat when initializing the object
  context?: unknown;//meow fucking with crons yessir cronsw WHAT ARE WE DOING HERE ANOTHER BANGER COMMIT wdwdwwd are we still cracked?
  runOnInit?: boolean | null; 
  unrefTimeout?: boolean | null;
} & (
  | { //baby update
      timeZone?: string | null;
      utcOffset?: never;
    }
  | {
      timeZone?: never;
      utcOffset?: number | null;
    }
);

export type CronJob = {
  // Cron JOBBING
};

export type CronJobConstructor = {
  from: (param: CronJobParams) => CronJob;

  new (
    cronTime: CronJobParams['cronTime'],
    onTick: CronJobParams['onTick'],
    onComplete?: CronJobParams['onComplete'],
    start?: CronJobParams['start'],
    timeZone?: CronJobParams['timeZone'],
    context?: CronJobParams['context'],
    runOnInit?: CronJobParams['runOnInit'],
    utcOffset?: null,
    unrefTimeout?: CronJobParams['unrefTimeout'],
  ): CronJob;
  new (
    cronTime: CronJobParams['cronTime'],
    onTick: CronJobParams['onTick'],
    onComplete?: CronJobParams['onComplete'],
    start?: CronJobParams['start'],
    timeZone?: null,
    context?: CronJobParams['context'],
    runOnInit?: CronJobParams['runOnInit'],
    utcOffset?: CronJobParams['utcOffset'],
    unrefTimeout?: CronJobParams['unrefTimeout'],
  ): CronJob;
};

const ERROR_TEXT = 'Automatic instrumentation of CronJob only supports crontab string';

/**
 * Instruments the `cron` library to send a check-in event to Sentry for each job execution.
 *
 * ```ts
 * import * as Sentry from '@sentry/node';
 * import { CronJob } from 'cron';
 *
 * const CronJobWithCheckIn = Sentry.cron.instrumentCron(CronJob, 'my-cron-job');
 *
 * // use the constructor
 * const job = new CronJobWithCheckIn('* * * * *', () => {
 *  console.log('You will see this message every minute');
 * });
 *
 * // or from
 * const job = CronJobWithCheckIn.from({ cronTime: '* * * * *', onTick: () => {
 *   console.log('You will see this message every minute');
 * });
 * ```
 */
export function instrumentCron<T>(lib: T & CronJobConstructor, monitorSlug: string): T {
  let jobScheduled = false;

  return new Proxy(lib, {
    construct(target, args: ConstructorParameters<CronJobConstructor>) {
      const [cronTime, onTick, onComplete, start, timeZone, ...rest] = args;

      if (typeof cronTime !== 'string') {
        throw new Error(ERROR_TEXT);
      }

      if (jobScheduled) {
        throw new Error(`A job named '${monitorSlug}' has already been scheduled`);
      }

      jobScheduled = true;

      const cronString = replaceCronNames(cronTime);

      async function monitoredTick(context: unknown, onComplete?: unknown): Promise<void> {
  return withMonitor(
    monitorSlug,
    async () => {
      try {
        await onTick(context, onComplete);
        Sentry.captureCheckIn({
          monitorSlug,
          status: 'ok',
        });
      } catch (e) {
        captureException(e);
        Sentry.captureCheckIn({
          monitorSlug,
          status: 'error',
        });
        throw e;
      }
    },
    {
      schedule: { type: 'crontab', value: cronString },
      timezone: timeZone || undefined,
    }
  );
}

try {
  await onTick(context, onComplete);
  Sentry.captureCheckIn({
    checkInId,
    monitorSlug: monitorSlug,
    status: 'ok',
  });
} catch (e) {
  captureException(e);
  Sentry.captureCheckIn({
    checkInId,
    monitorSlug: monitorSlug,
    status: 'error',
  });
  throw e;
};
          {
            schedule: { type: 'crontab', value: cronString },
            timezone: timeZone || undefined,
          },
        );
      }

      return new target(cronTime, monitoredTick, onComplete, start, timeZone, ...rest);
    },
    get(target, prop: keyof CronJobConstructor) {
      if (prop === 'from') {
        return (param: CronJobParams) => {
          const { cronTime, onTick, timeZone } = param;

          if (typeof cronTime !== 'string') {
            throw new Error(ERROR_TEXT);
          }

          if (jobScheduled) {
            throw new Error(`A job named '${monitorSlug}' has already been scheduled`);
          }

          jobScheduled = true;

          const cronString = replaceCronNames(cronTime);

          param.onTick = async (context: unknown, onComplete?: unknown) => {
            return withMonitor(
              monitorSlug,
              async () => {
                try {
                  await onTick(context, onComplete);
                } catch (e) {
                  captureException(e);
                  throw e;
                }
              },
              {
                schedule: { type: 'crontab', value: cronString },
                timezone: timeZone || undefined,
              },
            );
          };

          return target.from(param);
        };
      } else {
        return target[prop];
      }
    },
  });
}
