// for all cron jobs
import cron from "node-cron";
import { getPendingReminders, sendReminder } from "./services/reminderService.js";

// * Start the "Reminder" cron job
export const startReminderCron = () => {
    console.log("Starting reminder cron job");
    
    // Check for pending reminders every minute
    cron.schedule("* * * * *", async () => {
        const reminders = await getPendingReminders();
        // console.log(`Found ${reminders.length} pending reminders`); // ! this will eat up space unnecessarily
        
        for (const reminder of reminders) {
            await sendReminder(reminder);
        }
    });
};

export default { startReminderCron };