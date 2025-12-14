document.addEventListener("DOMContentLoaded", () => {
 
  // JSONBIN CONFIGURATION
  const BIN_ID = "693aa845ae596e708f9272f5";
  const API_KEY = "$2a$10$nZqTnuy0EUn/bn2HI8fFp.8yTp/o6ynINyV0znInPbP0Q33rlZpd6";
  const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  // ---- DISPLAY DATE & TIME BASED ON USER TIMEZONE ----
function updateDateTime() {
  const now = new Date();
  
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formatted = now.toLocaleString(undefined, options);

  const display = document.getElementById("dateTimeDisplay");
  if (display) display.textContent = formatted;
}

// Update every second
setInterval(updateDateTime, 1000);
updateDateTime();

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

  
   // UTILITIES
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
    if (status === "Completed") {
      return `<span class="badge badge-completed"><i class='bx bx-check-circle'></i> Completed</span>`;
    }
    if (status === "Due Today") {
      return `<span class="badge badge-today"><i class='bx bx-calendar-exclamation'></i> Due Today</span>`;
    }
    return `<span class="badge badge-pending"><i class='bx bx-time-five'></i> Pending</span>`;
  }

  function getTodosByStatus(status) {
    return todos.filter((t) => getStatus(t) === status);
  }

  function countItems(array) {
    return array.length;
  }

  
   // JSONBIN API METHODS (GET + PUT)
 
  async function loadTodosFromAPI() {
    try {
      const response = await fetch(JSONBIN_URL, {
        headers: { "X-Master-Key": API_KEY },
      });

      const data = await response.json();
      todos = data.record.todos || [];

      const maxId = todos.reduce((max, t) => (t.id > max ? t.id : max), 0);
      nextID = maxId + 1;

      renderTodos();
      updateStats();
    } catch (error) {
      console.error("Error loading todos:", error);
      renderTodos();
      updateStats();
    }
  }

  async function saveTodosToAPI() {
    try {
      await fetch(JSONBIN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify({ todos }),
      });
    } catch (error) {
      console.error("Error saving todos:", error);
    }
  }

  
// CRUD FUNCTIONS
   
  async function addTodo() {
    const text = todoInput.value.trim();
    const date = todoDate.value;

    if (!text) return;

    const todo = {
      id: nextID++,
      text,
      completed: false,
      date: date || "No date",
    };

    todos.push(todo);

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
    const input = document.querySelector(`input[data-id="${id}"]`);
    const newText = input.value.trim();
    const newDate = document.querySelector(`#edit-date-${id}`).value;

    if (!newText) return;

    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.text = newText;
      todo.date = newDate || "No date";
    }

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

    renderTodos();
    updateStats();
    await saveTodosToAPI();

    deleteModal.classList.remove("show");
    deleteID = null;
  }

 
   // RENDER ENGINE (DESKTOP + MOBILE)
   
  function renderTodos() {
    todoTableBody.innerHTML = "";
    mobileList.innerHTML = "";

    if (todos.length === 0) {
      todoTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:20px;">
            No tasks yet. Add one above!
          </td>
        </tr>`;
      return;
    }

    let filtered = todos.map((t) => ({
      ...t,
      status: getStatus(t),
    }));

    if (currentFilter !== "All") {
      filtered = filtered.filter((t) => t.status === currentFilter);
    }

    const order = { "Due Today": 1, Pending: 2, Completed: 3 };
    filtered.sort((a, b) => order[a.status] - order[b.status]);

    const isMobile = window.innerWidth <= 768;

    filtered.forEach((todo) => {
      const strikeClass = todo.completed ? "strike" : "";

      // DESKTOP TABLE 
      if (!isMobile) {
        const tr = document.createElement("tr");

        if (editingID === todo.id) {
          tr.innerHTML = `
            <td><input type="text" class="form-input" data-id="${todo.id}" value="${escapeHtml(todo.text)}"></td>
            <td><input type="date" id="edit-date-${todo.id}" value="${todo.date !== "No date" ? todo.date : ""}"></td>
            <td>${getStatusBadge(todo.status)}</td>
            <td><i class='bx bx-save' data-action='save' data-id="${todo.id}"></i></td>
            <td><i class='bx bx-x' data-action='cancel'></i></td>
          `;
        } else {
          tr.innerHTML = `
            <td class="${strikeClass}">
              <input type="checkbox" data-action="toggle" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
              ${escapeHtml(todo.text)}
            </td>
            <td class="${strikeClass}">${todo.date}</td>
            <td>${getStatusBadge(todo.status)}</td>
            <td><i class='bx bx-edit' data-action='edit' data-id="${todo.id}"></i></td>
            <td><i class='bx bx-trash-alt' data-action='delete' data-id="${todo.id}"></i></td>
          `;
        }

        todoTableBody.appendChild(tr);
      }

      // MOBILE CARDS 
      else {
        const card = document.createElement("div");
        card.className = "todo-card";

        if (editingID === todo.id) {
          card.innerHTML = `
            <input type="text" class="card-edit-input" data-id="${todo.id}" value="${escapeHtml(todo.text)}">
            <input type="date" class="card-date-input" id="edit-date-${todo.id}" value="${todo.date !== "No date" ? todo.date : ""}">
            <div class="todo-card-actions">
              <i class='bx bx-save' data-action='save' data-id="${todo.id}"></i>
              <i class='bx bx-x' data-action='cancel'></i>
            </div>
          `;
        } else {
          card.innerHTML = `
            <div class="todo-card-header ${strikeClass}">${escapeHtml(todo.text)}</div>
            <div class="todo-card-date ${strikeClass}">Due: ${todo.date}</div>
            <div class="todo-card-status">${getStatusBadge(todo.status)}</div>
            <div class="custom-checkbox">
              <input type="checkbox" data-action="toggle" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
              <label>Completed</label>
            </div>
            <div class="todo-card-actions">
              <i class='bx bx-edit' data-action='edit' data-id="${todo.id}"></i>
              <i class='bx bx-trash-alt' data-action='delete' data-id="${todo.id}"></i>
            </div>
          `;
        }

        mobileList.appendChild(card);
      }
    });
  }

  
   //STATS
   
  function updateStats() {
    const total = todos.length;
    const completed = countItems(getTodosByStatus("Completed"));

    totalTasksSpan.textContent = `${total} task${total !== 1 ? "s" : ""}`;
    completedTasksSpan.textContent = `${completed} completed`;
  }

  
   // EVENT HANDLERS
  // ---- EXPORT TO EXCEL ----
function exportToExcel() {
  if (todos.length === 0) {
    alert("No tasks available to export!");
    return;
  }

  // Prepare data rows for Excel
  const excelData = todos.map(t => ({
    "Task": t.text,
    "Due Date": t.date,
    "Status": getStatus(t),
    "Completed": t.completed ? "Yes" : "No"
  }));

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "To-Do List");

  // Download as Excel file
  XLSX.writeFile(workbook, "My_Todo_List.xlsx");
}

// Attach to button
document.getElementById("exportExcelBtn").addEventListener("click", exportToExcel);
   
  addBtn.addEventListener("click", addTodo);

  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  calendarBtn.addEventListener("click", () => {
    todoDate.showPicker?.();
  });

  document.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const id = Number(e.target.dataset.id);

    if (!action) return;

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

  cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.remove("show");
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      currentFilter = e.target.dataset.filter;
      renderTodos();
    });
  });

  window.addEventListener("resize", renderTodos);

  //INITIAL LOAD
   
  loadTodosFromAPI();
});


