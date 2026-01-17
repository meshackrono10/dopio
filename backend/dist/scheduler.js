"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const timeControlService_1 = require("./services/timeControlService");
const initScheduler = () => {
    console.log('[Scheduler] Initializing automated tasks...');
    // Run auto-release check every 10 minutes
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        console.log('[Scheduler] Running auto-release task...');
        await timeControlService_1.TimeControlService.processAutoReleases();
    });
    // Run daily checks at midnight (e.g., for expired search requests)
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('[Scheduler] Running daily expiration checks...');
        await timeControlService_1.TimeControlService.checkExpirations();
    });
    // Morning-of-day reschedule prompt (7 AM)
    node_cron_1.default.schedule('0 7 * * *', async () => {
        console.log('[Scheduler] Running morning reschedule prompt task...');
        await timeControlService_1.TimeControlService.sendMorningReschedulePrompts();
    });
    console.log('[Scheduler] All tasks scheduled.');
};
exports.initScheduler = initScheduler;
