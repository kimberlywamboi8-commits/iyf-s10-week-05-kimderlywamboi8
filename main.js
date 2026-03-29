const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const dateInput = document.getElementById("dueDate");
const list = document.getElementById("todoList");
const filters = document.querySelectorAll(".filters button");
const count = document.getElementById("taskCount");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// SAVE
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// RENDER
function renderTodos() {
  list.innerHTML = "";

  let filtered = todos.filter(todo => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  filtered.forEach((todo, index) => {
    const li = document.createElement("li");
    li.draggable = true;

    if (todo.completed) li.classList.add("completed");

    // TASK TEXT
    const span = document.createElement("span");
    span.textContent = todo.text;

    // ✏️ EDIT ON DOUBLE CLICK
    span.addEventListener("dblclick", () => {
      const newText = prompt("Edit task:", todo.text);
      if (newText) {
        todo.text = newText;
        saveTodos();
        renderTodos();
      }
    });

    // TOGGLE COMPLETE
    span.addEventListener("click", () => {
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    });

    // 📅 DATE
    const due = document.createElement("small");
    due.classList.add("due");
    if (todo.date) {
      due.textContent = "📅 " + todo.date;
    }

    // ❌ DELETE
    const del = document.createElement("button");
    del.textContent = "❌";

    del.addEventListener("click", () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    li.append(span, due, del);

    // 🔄 DRAG EVENTS
    li.addEventListener("dragstart", () => {
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      updateOrder();
    });

    list.appendChild(li);
  });

  updateCount();
}

// DRAG ORDER UPDATE
function updateOrder() {
  const items = document.querySelectorAll("#todoList li");
  const newTodos = [];

  items.forEach(item => {
    const text = item.querySelector("span").textContent;
    const found = todos.find(t => t.text === text);
    if (found) newTodos.push(found);
  });

  todos = newTodos;
  saveTodos();
}

// DRAG POSITION
list.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(e.clientY);

  if (afterElement == null) {
    list.appendChild(dragging);
  } else {
    list.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(y) {
  const elements = [...list.querySelectorAll("li:not(.dragging)")];

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ADD TASK
form.addEventListener("submit", e => {
  e.preventDefault();

  todos.push({
    text: input.value,
    completed: false,
    date: dateInput.value
  });

  input.value = "";
  dateInput.value = "";

  saveTodos();
  renderTodos();
});

// FILTERS
filters.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filters .active").classList.remove("active");
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// COUNT
function updateCount() {
  const active = todos.filter(t => !t.completed).length;
  count.textContent = `${active} active tasks`;
}

// 🔔 NOTIFICATIONS (check every 10 sec)
setInterval(() => {
  const today = new Date().toISOString().split("T")[0];

  todos.forEach(todo => {
    if (todo.date === today && !todo.completed) {
      alert("⏰ Task due today: " + todo.text);
    }
  });
}, 10000);

// INIT
renderTodos();