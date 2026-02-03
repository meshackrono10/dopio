import cron from 'node-cron';
import { TimeControlService } from './services/timeControlService';

export const initScheduler = () => {
    console.log('[Scheduler] Initializing automated tasks...');

    // Run auto-release check every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('[Scheduler] Running auto-release task...');
        await TimeControlService.processAutoReleases();
    });


    // Morning-of-day reschedule prompt (7 AM)
    cron.schedule('0 7 * * *', async () => {
        console.log('[Scheduler] Running morning reschedule prompt task...');
        await TimeControlService.sendMorningReschedulePrompts();
    });

    console.log('[Scheduler] All tasks scheduled.');
};
