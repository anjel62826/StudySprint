import { useState, useEffect } from "react";
import {
  BookOpen,
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  GraduationCap,
  Target,
  Flame,
} from "lucide-react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskAPI,
} from "./services/api";

import "./App.css";

function App() {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    date: "",
    priority: "Medium",
  });

  // ==========================================
  // 2. LOAD TASKS FROM MONGODB
  // ==========================================

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);

        const response = await getTasks();

        setTasks(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to load tasks:", err);

        setError(
          "Unable to load study tasks. Please check that your backend and MongoDB are running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  // ==========================================
  // 3. DASHBOARD STATISTICS
  // ==========================================

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  // Use local calendar date rather than UTC date.
  const today = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0"),
  ].join("-");

  const overdueCount = tasks.filter(
    (task) =>
      !task.completed &&
      task.date &&
      task.date < today
  ).length;

  // ==========================================
  // 4. SEARCH AND FILTER TASKS
  // ==========================================

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      task.subject.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" ||
      (filter === "Completed" && task.completed) ||
      (filter === "Pending" && !task.completed);

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // 5. OPEN THE ADD TASK FORM
  // ==========================================

  function openAddForm() {
    setEditingId(null);

    setForm({
      title: "",
      subject: "",
      date: "",
      priority: "Medium",
    });

    setShowForm(true);
  }

  // ==========================================
  // 6. OPEN THE EDIT TASK FORM
  // ==========================================

  function openEditForm(task) {
    setEditingId(task._id);

    setForm({
      title: task.title,
      subject: task.subject,
      date: task.date || "",
      priority: task.priority,
    });

    setShowForm(true);
  }

  // ==========================================
  // 7. ADD OR UPDATE A TASK IN MONGODB
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.subject.trim()) {
      alert("Please enter a task title and subject.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        // Update an existing MongoDB document.
        const response = await updateTask(editingId, form);

        setTasks((previous) =>
          previous.map((task) =>
            task._id === editingId ? response.data : task
          )
        );
      } else {
        // Create a new MongoDB document.
        const response = await createTask(form);

        setTasks((previous) => [
          ...previous,
          response.data,
        ]);
      }

      setShowForm(false);
      setEditingId(null);

      setForm({
        title: "",
        subject: "",
        date: "",
        priority: "Medium",
      });
    } catch (err) {
      console.error("Failed to save task:", err);

      alert(
        err.response?.data?.message ||
          "Unable to save the task. Please check your backend connection."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // 8. MARK A TASK COMPLETED OR PENDING
  // ==========================================

  async function toggleTask(id) {
    const task = tasks.find(
      (item) => item._id === id
    );

    if (!task) return;

    try {
      setError("");

      const response = await updateTask(id, {
        completed: !task.completed,
      });

      setTasks((previous) =>
        previous.map((item) =>
          item._id === id ? response.data : item
        )
      );
    } catch (err) {
      console.error("Failed to update task:", err);

      alert("Unable to update the task status.");
    }
  }

  // ==========================================
  // 9. DELETE A TASK FROM MONGODB
  // ==========================================

  async function deleteTask(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTaskAPI(id);

      setTasks((previous) =>
        previous.filter((task) => task._id !== id)
      );
    } catch (err) {
      console.error("Failed to delete task:", err);

      alert("Unable to delete the task.");
    }
  }

  // ==========================================
  // 10. DASHBOARD USER INTERFACE
  // ==========================================

  return (
    <div className="app-shell">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>

          <div>
            <h2>StudySprint</h2>
            <span>STUDENT PLANNER</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation">
          <a href="#dashboard" className="nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a href="#tasks" className="nav-item">
            <BookOpen size={19} />
            My Study Tasks
          </a>

          <a href="#tasks" className="nav-item">
            <CalendarDays size={19} />
            Deadlines
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="focus-card">
            <div className="focus-icon">
              <Target size={21} />
            </div>

            <h3>Stay focused!</h3>

            <p>
              Small steps every day lead to big achievements.
            </p>

            <div className="focus-line">
              <span />
            </div>
          </div>

          <div className="profile">
            <div className="avatar">S</div>

            <div>
              <strong>Student</strong>
              <p>Keep learning ✨</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD */}

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace / Dashboard
            </p>

            <h1>
              Good morning, Student! <span>☀️</span>
            </h1>

            <p className="subtitle">
              A fresh day to learn something amazing.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openAddForm}
          >
            <Plus size={19} />
            Add Study Task
          </button>
        </header>

        {/* WELCOME BANNER */}

        <section className="welcome-banner">
          <div className="banner-content">
            <span className="banner-tag">
              YOUR LEARNING JOURNEY
            </span>

            <h2>
              Plan your work. Achieve your goals.
            </h2>

            <p>
              Organize your studies, meet your deadlines,
              and celebrate every little win.
            </p>

            <a href="#tasks" className="banner-link">
              Explore your tasks →
            </a>
          </div>

          <div className="banner-illustration">
            <div className="book-circle">
              <BookOpen size={63} strokeWidth={1.5} />
            </div>

            <div className="floating-star">✦</div>

            <div className="floating-check">
              <CheckCircle2 size={25} />
            </div>
          </div>
        </section>

        {/* STATISTICS */}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Study Tasks</span>

              <div className="stat-icon purple">
                <BookOpen size={21} />
              </div>
            </div>

            <h2>{tasks.length}</h2>

            <p>All your planned tasks</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Pending Tasks</span>

              <div className="stat-icon orange">
                <Clock size={21} />
              </div>
            </div>

            <h2>{pendingCount}</h2>

            <p>Waiting to be completed</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Completed</span>

              <div className="stat-icon green">
                <CheckCircle2 size={21} />
              </div>
            </div>

            <h2>{completedCount}</h2>

            <p>Tasks you've finished</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Overdue Tasks</span>

              <div className="stat-icon red">
                <CalendarDays size={21} />
              </div>
            </div>

            <h2>{overdueCount}</h2>

            <p>Need your attention</p>
          </article>
        </section>

        {/* TASK MANAGEMENT */}

        <section className="tasks-section" id="tasks">
          <div className="section-heading">
            <div>
              <h2>My Study Tasks</h2>

              <p>
                Keep track of everything you need to study.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={openAddForm}
            >
              <Plus size={17} />
              New Task
            </button>
          </div>

          {/* LOADING MESSAGE */}

          {loading && (
            <p className="subtitle">
              Loading your study tasks...
            </p>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <p
              role="alert"
              style={{
                color: "#d9534f",
                marginBottom: "16px",
              }}
            >
              {error}
            </p>
          )}

          {/* SEARCH AND FILTER */}

          <div className="task-toolbar">
            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search tasks or subjects..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              aria-label="Filter tasks"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>

          {/* TASK LIST */}

          <div className="task-list">
            {!loading &&
              filteredTasks.map((task) => (
                <article
                  className={`task-row ${
                    task.completed ? "is-complete" : ""
                  }`}
                  key={task._id}
                >
                  <button
                    className={`task-checkbox ${
                      task.completed ? "checked" : ""
                    }`}
                    onClick={() => toggleTask(task._id)}
                    aria-label={
                      task.completed
                        ? "Mark task as pending"
                        : "Mark task as completed"
                    }
                  >
                    {task.completed && (
                      <CheckCircle2 size={19} />
                    )}
                  </button>

                  <div className="task-info">
                    <h3>{task.title}</h3>

                    <p>
                      <BookOpen size={14} />

                      {task.subject}

                      <span className="task-date">
                        <CalendarDays size={14} />

                        {task.date || "No deadline"}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`priority priority-${(
                      task.priority || "Medium"
                    ).toLowerCase()}`}
                  >
                    {task.priority || "Medium"}
                  </span>

                  <span
                    className={`status ${
                      task.completed
                        ? "status-done"
                        : "status-pending"
                    }`}
                  >
                    {task.completed
                      ? "Completed"
                      : "Pending"}
                  </span>

                  <div className="task-actions">
                    <button
                      onClick={() => openEditForm(task)}
                      aria-label="Edit task"
                      title="Edit task"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteTask(task._id)}
                      aria-label="Delete task"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}

            {/* EMPTY STATE */}

            {!loading && filteredTasks.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Flame size={28} />
                </div>

                <h3>No study tasks found</h3>

                <p>
                  Try another search or add a new study task.
                </p>

                <button
                  className="primary-button"
                  onClick={openAddForm}
                >
                  <Plus size={18} />
                  Add Your First Task
                </button>
              </div>
            )}
          </div>

          {/* TASK FOOTER */}

          <div className="task-footer">
            Showing {filteredTasks.length} of {tasks.length} study tasks
          </div>
        </section>

        <footer className="page-footer">
          Made for focused minds and brighter futures{" "}
          <span>♥</span>
        </footer>
      </main>

      {/* ADD / EDIT TASK MODAL */}

      {showForm && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!saving) setShowForm(false);
          }}
        >
          <div
            className="task-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2>
                  {editingId !== null
                    ? "Edit Study Task"
                    : "New Study Task"}
                </h2>

                <p>
                  Plan your next learning goal.
                </p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Task title

                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="e.g. Finish React assignment"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Subject

                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Web Development"
                  value={form.subject}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      subject: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Due date

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Priority

                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      priority: event.target.value,
                    })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;