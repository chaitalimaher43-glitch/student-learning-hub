
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("category");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const submitBtn = document.getElementById("submitBtn");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = [];
let editingId = null;

try {
  const savedTasks = JSON.parse(localStorage.getItem("studyHubTasks") || "[]");
  tasks = Array.isArray(savedTasks) ? savedTasks.filter(
    task => task && typeof task.id === "number" &&
    typeof task.name === "string" &&
    typeof task.completed === "boolean"
  ) : [];
} catch {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem("studyHubTasks", JSON.stringify(tasks));
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;
  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent = tasks.length - completed;
  document.getElementById("progress").textContent =
    (tasks.length ? Math.round(completed / tasks.length * 100) : 0) + "%";
}

function renderTasks() {
  taskList.replaceChildren();

  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  const visibleTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query);
    const matchesFilter = filter === "all" ||
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);

    return matchesSearch && matchesFilter;
  });

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? "No tasks yet. Add your first study task!"
    : "No matching tasks found.";

  visibleTasks.forEach(task => {
    const item = document.createElement("article");
    item.className = "task-item" + (task.completed ? " done" : "");

    const info = document.createElement("div");
    info.className = "task-info";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task completed");
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const details = document.createElement("div");
    const name = document.createElement("div");
    name.className = "task-name";
    name.textContent = task.name;

    const category = document.createElement("div");
    category.className = "task-category";
    category.textContent = task.category;

    details.append(name, category);
    info.append(checkbox, details);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "action-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      taskInput.value = task.name;
      categoryInput.value = task.category;
      editingId = task.id;
      submitBtn.textContent = "Update Task";
      taskInput.focus();
      document.getElementById("tasks").scrollIntoView({ behavior: "smooth" });
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      if (editingId === task.id) resetForm();
      saveTasks();
      renderTasks();
    });

    actions.append(editBtn, deleteBtn);
    item.append(info, actions);
    taskList.append(item);
  });

  updateStats();
}

function resetForm() {
  taskForm.reset();
  editingId = null;
  submitBtn.textContent = "+ Add Task";
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = taskInput.value.trim();

  if (!name) {
    alert("Please enter a task name.");
    return;
  }

  if (editingId !== null) {
    const task = tasks.find(item => item.id === editingId);
    if (task) {
      task.name = name;
      task.category = categoryInput.value;
    }
  } else {
    tasks.push({
      id: Date.now(),
      name: name,
      category: categoryInput.value,
      completed: false
    });
  }

  saveTasks();
  resetForm();
  renderTasks();
});

searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);

renderTasks();
