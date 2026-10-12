const { app } = require("@azure/functions");
const { markOverdueRentals } = require("../overdue");

app.timer("markOverdueRentals", {
  schedule: "0 */15 * * * *",
  handler: async (timer, context) => {
    const flagged = await markOverdueRentals();
    for (const r of flagged) {
      context.log(`Rental #${r.id} is overdue: ${r.item_name} (${r.renter_name}, ${r.renter_email}) was due ${r.due_date}`);
    }
    context.log(`Overdue check done: ${flagged.length} rental(s) newly flagged${timer.isPastDue ? " (late run)" : ""}`);
  },
});
