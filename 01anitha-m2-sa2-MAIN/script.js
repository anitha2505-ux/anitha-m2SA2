document.addEventListener("DOMContentLoaded", () => {
  // JSONBIN CONFIG
  const BIN_ID = "693aa845ae596e708f9272f5";
  const API_KEY = "$2a$10$nZqTnuy0EUn/bn2HI8fFp.8yTp/o6ynINyV0znInPbP0Q33rlZpd6";

  const api = axios.create({
    baseURL: `https://api.jsonbin.io/v3/b/${BIN_ID}`,
    headers: {
      "X-Master-Key": API_KEY,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  // APPLICATION STATE 
  let todos = [];
  let nextID = 1;
  let editingID = null;
  let deleteID = null;
  let currentFilter = "All";

  // DOM ELEMENTS
  const todoInput = document.querySelector("#todoInput");
  const todoDate = document.querySelector("#taskDate");
  const addBtn = document.querySelector("#addBtn");
  const calendarBtn = document.querySelector("#calendarBtn");

  const totalTasksSpan = document.querySelector("#totalTasks");
  const completedTasksSpan = document.querySelector("#completedTasks");

  const deleteModal = document.querySelector("#deleteModal");
  const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");
  const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");

  const todoTableBody = document.querySelector("#todoTableBody");
  const mobileList = document.querySelector("#mobileList");
  const tabButtons = document.querySelectorAll(".tab-btn");

  const dateTimeDisplay = document.querySelector("#dateTimeDisplay");
  const exportExcelBtn = document.querySelector("#exportExcelBtn");

  // UTIL FUNCTIONS
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getStatus(todo) {
    const today = new Date().toISOString().split("T")[0];
    if (todo.completed) return "Completed";
    if (todo.date === today) return "Due Today";
    return "Pending";
  }

  function getStatusBadge(status) {
    if (status === "Completed")
      return `<span class="badge badge-completed"><i class='bx bx-check-circle'></i> Completed</span>`;
    if (status === "Due Today")
      return `<span class="badge badge-today"><i class='bx bx-calendar-exclamation'></i> Due Today</span>`;
    return `<span class="badge badge-pending"><i class='bx bx-time-five'></i> Pending</span>`;
  }

  // DATE & TIME 
  function updateDateTime() {
    const now = new Date();
    dateTimeDisplay.textContent = now.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  // API CALLS (AXIOS)
  async function loadTodosFromAPI() {
    try {
      const { data } = await api.get();
      todos = data.record.todos || [];

      const maxId = todos.reduce((m, t) => (t.id > m ? t.id : m), 0);
      nextID = maxId + 1;

      renderTodos();
      updateStats();
    } catch (err) {
      console.error("Load error:", err.message);
    }
  }

  async function saveTodosToAPI() {
    try {
      await api.put("", { todos });
    } catch (err) {
      console.error("Save error:", err.message);
    }
  }

  // CRUD
  async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
      id: nextID++,
      text,
      completed: false,
      date: todoDate.value || "No date",
    });

    todoInput.value = "";
    todoDate.value = "";

    renderTodos();
    updateStats();
    await saveTodosToAPI();
  }

  async function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    renderTodos();
    updateStats();
    await saveTodosToAPI();
  }

  function startEdit(id) {
    editingID = id;
    renderTodos();
  }

  async function saveTodo(id) {
    const textInput = document.querySelector(`input[data-id="${id}"]`);
    const dateInput = document.querySelector(`#edit-date-${id}`);
    if (!textInput.value.trim()) return;

    const todo = todos.find((t) => t.id === id);
    todo.text = textInput.value.trim();
    todo.date = dateInput.value || "No date";

    editingID = null;
    renderTodos();
    await saveTodosToAPI();
  }

  function cancelEdit() {
    editingID = null;
    renderTodos();
  }

  async function confirmDelete() {
    todos = todos.filter((t) => t.id !== deleteID);
    deleteModal.classList.remove("show");
    deleteID = null;

    renderTodos();
    updateStats();
    await saveTodosToAPI();
  }
  /* ================= EXPORT TO EXCEL ================= */

  exportExcelBtn.addEventListener("click", () => {
    if (!todos.length) {
      alert("No tasks to export");
      return;
    }

    // Prepare data
    const exportData = todos.map(todo => ({
      Task: todo.text,
      "Due Date": todo.date,
      Status: getStatus(todo),
      Completed: todo.completed ? "Yes" : "No"
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    // Auto column width
    const colWidths = Object.keys(exportData[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...exportData.map(row => String(row[key]).length)
      ) + 2
    }));
    worksheet["!cols"] = colWidths;

    // Download file
    XLSX.writeFile(workbook, "TaskGlide_Tasks.xlsx");
  });
  
  // RENDER
  function renderTodos() {
    todoTableBody.innerHTML = "";
    mobileList.innerHTML = "";

    let filtered = todos.map(t => ({ ...t, status: getStatus(t) }));
    if (currentFilter !== "All") {
      filtered = filtered.filter(t => t.status === currentFilter);
    }

    const isMobile = window.innerWidth <= 768;

    filtered.forEach(todo => {
      const strike = todo.completed ? "strike" : "";

      /* ================= DESKTOP TABLE ================= */
      if (!isMobile) {
        const tr = document.createElement("tr");

        tr.innerHTML = editingID === todo.id
          ? `
          <td><input data-id="${todo.id}" value="${escapeHtml(todo.text)}"></td>
          <td><input type="date" id="edit-date-${todo.id}" value="${todo.date !== "No date" ? todo.date : ""}"></td>
          <td>${getStatusBadge(todo.status)}</td>
          <td><i class='bx bx-save' data-action='save' data-id="${todo.id}"></i></td>
          <td><i class='bx bx-x' data-action='cancel'></i></td>
        `
          : `
          <td class="${strike}">
            <input type="checkbox" data-action="toggle" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
            ${escapeHtml(todo.text)}
          </td>
          <td class="${strike}">${todo.date}</td>
          <td>${getStatusBadge(todo.status)}</td>
          <td><i class='bx bx-edit' data-action='edit' data-id="${todo.id}"></i></td>
          <td><i class='bx bx-trash' data-action='delete' data-id="${todo.id}"></i></td>
        `;
        todoTableBody.appendChild(tr);
      }

      /* ================= MOBILE CARDS ================= */
      else {
        const card = document.createElement("div");
        card.className = "todo-card";

        card.innerHTML = editingID === todo.id
          ? `
          <input class="card-edit-input" data-id="${todo.id}" value="${escapeHtml(todo.text)}">
          <input class="card-date-input" type="date" id="edit-date-${todo.id}" value="${todo.date !== "No date" ? todo.date : ""}">
          <div class="todo-card-actions">
            <i class='bx bx-save' data-action='save' data-id="${todo.id}"></i>
            <i class='bx bx-x' data-action='cancel'></i>
          </div>
        `
          : `
          <div class="todo-card-header ${strike}">
            <input type="checkbox" data-action="toggle" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
            ${escapeHtml(todo.text)}
          </div>
          <div class="todo-card-date">${todo.date}</div>
          <div class="todo-card-status">${getStatusBadge(todo.status)}</div>
          <div class="todo-card-actions">
            <i class='bx bx-edit' data-action='edit' data-id="${todo.id}"></i>
            <i class='bx bx-trash' data-action='delete' data-id="${todo.id}"></i>
          </div>
        `;

        mobileList.appendChild(card);
      }
    });
  }

  // STATS
  function updateStats() {
    totalTasksSpan.textContent = `${todos.length} tasks`;
    completedTasksSpan.textContent = `${todos.filter((t) => t.completed).length} completed`;
  }

  // EVENTS 
  addBtn.addEventListener("click", addTodo);
  todoInput.addEventListener("keypress", (e) => e.key === "Enter" && addTodo());
  calendarBtn.addEventListener("click", () => todoDate.showPicker?.());

  document.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const id = Number(e.target.dataset.id);

    if (action === "toggle") toggleTodo(id);
    if (action === "edit") startEdit(id);
    if (action === "save") saveTodo(id);
    if (action === "cancel") cancelEdit();
    if (action === "delete") {
      deleteID = id;
      deleteModal.classList.add("show");
    }
  });

  confirmDeleteBtn.addEventListener("click", confirmDelete);
  cancelDeleteBtn.addEventListener("click", () => deleteModal.classList.remove("show"));

  tabButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      currentFilter = e.target.dataset.filter;
      renderTodos();
    })
  );

  window.addEventListener("resize", renderTodos);

  // INIT
  loadTodosFromAPI();
});
