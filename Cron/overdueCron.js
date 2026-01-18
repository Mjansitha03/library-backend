import cron from "node-cron";
import { runOverdueCheck } from "../Controllers/overdueController.js";

// Overdue cron job
cron.schedule("* * * * *", async () => {
  console.log("Running overdue check...");
  await runOverdueCheck();
});
