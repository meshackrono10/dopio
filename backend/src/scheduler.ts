import cron from 'node-cron';
import { TimeControlService } from './services/timeControlService';

export const initScheduler = () => {
    console.log('[Scheduler] Initializing automated tasks...');

    // Run auto-release check every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('[Scheduler] Running auto-release task...');
        await TimeControlService.processAutoReleases();
    });

    // Run daily checks at midnight (e.g., for expired search requests)
    cron.schedule('0 0 * * *', async () => {
        console.log('[Scheduler] Running daily expiration checks...');
        await TimeControlService.checkExpirations();
    });

    // Morning-of-day reschedule prompt (7 AM)
    cron.schedule('0 7 * * *', async () => {
        console.log('[Scheduler] Running morning reschedule prompt task...');
        await TimeControlService.sendMorningReschedulePrompts();
    });

    console.log('[Scheduler] All tasks scheduled.');
};
