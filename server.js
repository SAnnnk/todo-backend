const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const supabase = require("./bd"); // الاتصال بـ Supabase

// تحميل متغيرات البيئة من .env
dotenv.config();

// استيراد المسارات
const tasksRoutes = require("./routes/tasks");
const usersRoutes = require("./routes/tasks/users");
const dashboardRoutes = require("./routes/tasks/Dashboard");
const categoriesRouter = require("./routes/tasks/categories");
const messagesRouter = require("./routes/tasks/messages");

const app = express();
const PORT = process.env.PORT || 5000;

// إعدادات عامة
app.use(cors());
app.use(express.json());

// 🧩 ربط المسارات
app.use("/categories", categoriesRouter);
app.use("/tasks", tasksRoutes);
app.use("/users", usersRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/messages", messagesRouter);

// ✅ اختبار الاتصال بـ Supabase
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    if (error) {
      console.error("❌ Supabase error:", error.message);
    } else {
      console.log("✅ Supabase connected. Sample user:", data);
    }
  } catch (err) {
    console.error("❌ Unexpected Supabase error:", err.message);
  }
}
app.get("/", (req, res) => {
  res.send("✅ Todo Backend is running.");
});

// 🚀 تشغيل الخادم
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  await testSupabaseConnection();
});
