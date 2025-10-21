const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const supabase = require("./bd"); 
const cron = require("node-cron");

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

// ===================
// Routes
// ===================
app.use("/categories", categoriesRouter);
app.use("/tasks", tasksRoutes);
app.use("/users", usersRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/messages", messagesRouter);
app.use("/notifications", notificationsRouter);
app.use("/reminders", remindersRouter);

// ===================
// Test Supabase connection
// ===================
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("user_id", 1);
    if (error) console.error("❌ Supabase error:", error.message);
    else console.log("✅ Supabase connected. Sample user:", data);
  } catch (err) {
    console.error("❌ Unexpected Supabase error:", err.message);
  }
}

// ===================
// Health check
// ===================
app.get("/", (req, res) => {
  res.send("✅ Todo Backend is running.");
});

// ===================
// Cron job: check reminders every minute
// ===================
cron.schedule("* * * * *", async () => {
  try {
    const url = `${process.env.API_URL || `http://localhost:${PORT}`}/reminders/send-reminders`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(`⏰ Cron job ran: ${data.count || 0} reminders processed.`);
  } catch (err) {
    console.error("Cron job error:", err.message);
  }
});

// ===================
// Start server
// ===================
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await testSupabaseConnection();
});
