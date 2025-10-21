const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const supabase = require("./bd"); 
const cron = require("node-cron");
const fetch = require("node-fetch"); 

dotenv.config();

const tasksRoutes = require("./routes/tasks");
const usersRoutes = require("./routes/tasks/users");
const dashboardRoutes = require("./routes/tasks/Dashboard");
const categoriesRouter = require("./routes/tasks/categories");
const messagesRouter = require("./routes/tasks/messages");
const notificationsRouter = require("./routes/tasks/notifications");
const remindersRouter = require("./routes/tasks/reminders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/categories", categoriesRouter);
app.use("/tasks", tasksRoutes);
app.use("/users", usersRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/messages", messagesRouter);
app.use("/notifications", notificationsRouter);
app.use("/reminders", remindersRouter);

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("user_id", 1);
    if (error) console.error("❌ Supabase error:", error.message);
    else console.log("✅ Supabase connected. Sample user:", data);
  } catch (err) {
    console.error("❌ Unexpected Supabase error:", err.message);
  }
}

app.get("/", (req, res) => {
  res.send("✅ Todo Backend is running.");
});

cron.schedule("* * * * *", async () => {
  try {
    await fetch(`${process.env.API_URL || `http://localhost:${PORT}`}/reminders/send-reminders`);
    console.log("⏰ Cron job ran: reminders checked.");
  } catch (err) {
    console.error("Cron job error:", err.message);
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await testSupabaseConnection();
});
