import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Task from "./models/Task.js"; // ✅ Import Task model

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // or your frontend port
  credentials: true
}));

// ✅ Connect MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/taskmanager", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ----------------------------------------------------
// 🔹 CRUD ROUTES
// ----------------------------------------------------

// ✅ Create Task
app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get All Tasks (with search & filter)
app.get("/api/tasks", async (req, res) => {
  try {
    const { keyword, status } = req.query;

    let query = {};

    // 🔍 Search by title or description
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // 🗂️ Filter by status
    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 }); // newest first
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Single Task
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(404).json({ error: "Task not found" });
  }
});

// ✅ Update Task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated doc
      runValidators: true, // validate fields
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete Task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
