let todos = [];
let nextID = 1;
let editingID = null;

const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const totalTasksSpan = document.getElementById("totalTasks");
const completedTasksSpan = document.getElementById("completedTasks")

function addTodo() {
    const text = todoInput.value.trim();

    if(text === "") {
        todoInput.focus();
        return;
    }

    const todo = {
        id: nextID++,
        text: text,
        completed: false,
    };

    todos.push(todo);
    todoInput.value = "";
    renderTodos();
    updateStats();
}

// Add event listeners
addBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTodo();
    }
});

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function editTodo(id) {
    editingID = id;
    renderTodos();
}

function saveTodo(id) {
    const input = document.querySelector(`.form-input[data-id="${id}"]`);
    const newText = input.value.trim();

    if (newText === "") {
        input.focus();
        return;
    }

    const todo = todos.find((t) => t.id === id);
    if (todo) {
        todo.text = newText;
        editingID = null;
        renderTodos();
    }
}

function cancelEdit() {
    editingID = null;
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id );
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
        updateStats();
    }
}

function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    renderTodos();
    updateStats();
}

function renderTodos() {
    todoList.innerHTML = "";

    if (todos.length === 0) {
        todoList.innerHTML =
            '<div class="empty-state backdrop"> No Tasks yet. Please add one above!</div>';
        return;
    }

    todos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "backdrop";

        if (editingID === todo.id) {
            li.innerHTML = `
            <label class="custom-checkbox ${todo.completed ? "strike" : ""}">
                <input type="checkbox" ${todo.completed ? "checked" : ""
                } onchange="toggleTodo(${todo.id})" />
            </label>
            <input type="text" class="form-input" data-id="${todo.id
                }" placeholder = "Edit" value = "${escapeHtml(todo.text)}" 
                    onkeypress="if(event.key==='Enter') saveTodo(${todo.id
                }); if(event.key === 'Escape') cancelEdit()" />
            <div class="actions-icons">
                <i class="bx bx-save" onclick="saveTodo(${todo.id})"></i>
                <i class="bx bx-x" onclick="cancelEdit()"></i>
            </div>   
        `;
        } else {
            li.innerHTML = `
            <label class="custom-checkbox ${todo.completed ? "strike" : ""}">
                <input type = "checkbox" ${todo.completed ? "checked" : ""
                } onchange="toggleTodo(${todo.id})"/>
                ${escapeHtml(todo.text)}            
            </label>
            <div class="actions-icons">
                <i class="bx bx-edit" onclick="editTodo(${todo.id})"></i>
                <i class="bx bx-trash-alt" onclick="deleteTodo(${todo.id})"></i>    
            </div>
        `;
        }

        todoList.appendChild(li);
    });
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;

    totalTasksSpan.textContent = `${total} task${total !==1 ? "s" : ""}`;
    completedTasksSpan.textContent = `${completed} completed`;
}

// calling functions
renderTodos();
updateStats();