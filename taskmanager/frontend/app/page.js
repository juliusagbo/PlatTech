"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [statusForm, setStatusForm] = useState("pending");

  const API_URL = "http://localhost:5000/api/tasks";

  // ✅ Fetch tasks
  const fetchTasks = async () => {
    try {
      let params = {};
      if (search) params.keyword = search;
      if (filter) params.status = filter;

      const res = await axios.get(API_URL, { params });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, filter]);

  // ✅ Add task (always start with pending)
  const addTask = async () => {
    if (!title.trim()) return alert("Title is required");
    try {
      await axios.post(API_URL, { title, description, status: "pending" });
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Delete task
  const deleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Start editing status only
  const startEdit = (task) => {
    setEditTaskId(task._id);
    setStatusForm(task.status);
  };

  // ✅ Cancel edit
  const cancelEdit = () => {
    setEditTaskId(null);
    setStatusForm("pending");
  };

  // ✅ Update task status only
  const updateTaskStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: statusForm });
      setEditTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-orange-500";
      case "in-progress":
        return "text-yellow-500";
      case "completed":
        return "text-green-700";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">✅ Task Manager</h1>

      {/* Add Task Form */}
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 flex-1"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="" className="text-black">All</option>
          <option value="pending" className="text-black">Pending</option>
          <option value="in-progress" className="text-black">In Progress</option>
          <option value="completed" className="text-black">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <ul>
  {tasks.map((task) => (
    <li
      key={task._id}
      className={`border p-4 rounded mb-3 ${
        task.status === "completed"
          ? "bg-green-500 text-black" // ✅ Completed = green bg + black font
          : "bg-black text-white" // ✅ Pending/In-progress = black bg + white font
      }`}
    >
      {editTaskId === task._id ? (
        // ✏️ Edit Status Only
        <div className="flex flex-col gap-2">
          <select
            className="border p-2 text-white"
            value={statusForm}
            onChange={(e) => setStatusForm(e.target.value)}
          >
            <option value="pending" className="text-black">Pending</option>
            <option value="in-progress" className="text-black">In Progress</option>
            <option value="completed" className="text-black">Completed</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => updateTaskStatus(task._id)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // 📌 Task Display
        <div className="flex justify-between items-center">
          <div>
            <h2
              className={`font-semibold ${
                task.status === "completed" ? "line-through" : ""
              }`}
            >
              {task.title}
            </h2>
            <p
              className={`${
                task.status === "completed" ? "line-through" : ""
              }`}
            >
              {task.description}
            </p>
            {/* ✅ Status with color */}
            <span
              className={`text-sm font-bold ${
                task.status === "completed"
                  ? "text-black"
                  : "text-white"
              }`}
            >
              Status: {task.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => startEdit(task)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Edit Status
            </button>
            <button
              onClick={() => deleteTask(task._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  ))}
</ul>
    </div>
  );
}
