const openModalBtn = document.querySelector('.add-task-btn');
const modal = document.getElementById('taskModal');
const closeModal = document.querySelector('.close-modal');
const cancelModal = document.getElementById('cancel-task-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const title = document.getElementById('task-title');
const desc = document.getElementById('task-description');
const taskList = document.querySelector('.task-list ul');

const totalEl = document.querySelector('.total-amount');
const completedEl = document.querySelector('.completed-amount');
const pendingEl = document.querySelector('.pending-amount');

let tasks = [];
let activeTab = 'all';
let editingTask = null;

// Load & Save tasks
function loadTasks() {
    const stored = localStorage.getItem("tasks");
    if (stored) tasks = JSON.parse(stored);
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Modal open/close
openModalBtn.addEventListener('click', () => {
    modal.style.display = "block";
    title.value = '';
    desc.value = '';
    title.classList.remove('input-error');
    addTaskBtn.textContent = "Add Task";
    editingTask = null;
})

function closeModalWindow() {
    modal.style.display = "none";
    title.classList.remove('input-error');
    title.value = '';
    desc.value = '';
    editingTask = null;
}
closeModal.addEventListener('click', closeModalWindow);
cancelModal.addEventListener('click', closeModalWindow);
window.addEventListener('click', (e) => {
    if (e.target == modal) closeModalWindow();
})

// Task creation
function createTaskElement(task, isNew = false) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    // Status circle
    const circle = document.createElement('div');
    circle.className = 'task-circle';
    circle.setAttribute('role', 'button');
    circle.setAttribute('tabindex', '0');
    circle.addEventListener('click', () => {
        toggleCompleted(task.id);
    });
    circle.addEventListener('keydown', e => {
        if (e.key === 'Enter') circle.click();
    });

    // Task info
    const info = document.createElement('div');
    info.className = 'task-info';
    const titleEl = document.createElement('strong');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title;

    const descEl = document.createElement('small');
    descEl.className = 'task-desc';
    descEl.textContent = task.desc;

    const datesEl = document.createElement('div');
    datesEl.className = 'task-date';
     datesEl.textContent = `Created: ${task.createdAt}`;
     if (task.updatedAt) {
         datesEl.textContent += ` • Updated: ${task.updatedAt}`;
     }

    info.append(titleEl, document.createElement('br'), descEl, document.createElement('br'), datesEl);

    // Task actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = createActionBtn('edit', 'Edit task', [{
            d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z",
            fill: "currentColor"
        },
        {
            d: "M20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z",
            fill: "currentColor"
        }
    ]);

    const deleteBtn = createActionBtn('delete', 'Delete task', [{
            d: "M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z",
            fill: "currentColor"
        },
        {
            d: "M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
            fill: "currentColor"
        }
    ])


    editBtn.addEventListener('click', () => startEditTask(task))
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, deleteBtn);
    li.append(circle, info, actions);

    // New task animation
    if (isNew) {
        li.classList.add('task-new');
        requestAnimationFrame(() => li.classList.remove('task-new'));
    }

    updateTaskUI(task);
    return li;
}

// Create action button (Edit/Delete) with SVG paths
function createActionBtn(type, ariaLabel, paths) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('action-btn', type);
    btn.setAttribute('aria-label', ariaLabel);
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');

    paths.forEach(p => {
        const pathEl = document.createElementNS(svgNS, 'path');
        Object.keys(p).forEach(attr => pathEl.setAttribute(attr, p[attr]));
        svg.appendChild(pathEl);
    });
    btn.appendChild(svg);
    return btn;
}

/* UI Updates */
function updateTaskUI(task) {
    const li = taskList.querySelector(`li[data-id="${task.id}"]`);
    if (!li) return;

    li.querySelector('.task-title').textContent = task.title;
    li.querySelector('.task-desc').textContent = task.desc;
    const datesEl = li.querySelector('.task-date');
    datesEl.textContent = `Created: ${task.createdAt}`;
    if (task.updatedAt) datesEl.textContent += ` • Updated: ${task.updatedAt}`;

    li.classList.toggle('completed', task.completed);
    li.querySelector('.task-circle').classList.toggle('completed', task.completed);

    const editBtn = li.querySelector('.action-btn.edit');
    if (task.completed) {
        editBtn.classList.add('disabled');
        editBtn.disabled = true;
    } else {
        editBtn.classList.remove('disabled');
        editBtn.disabled = false;
    }
}

// Show empty message
function updateEmptyState() {
    const oldMsg = taskList.querySelector('.empty-msg');
    if (oldMsg) oldMsg.remove();

    const visibleTasks = Array.from(taskList.querySelectorAll('.task-item')).filter(li => li.style.display !== 'none');

    if (visibleTasks.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.textContent = "No tasks yet.";
        emptyMsg.classList.add('empty-msg');
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.color = "#aaa";
        emptyMsg.style.padding = "20px";
        taskList.appendChild(emptyMsg);
    }
}

// Task Action
function toggleCompleted(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks();
    updateTaskUI(task);
    updateCounters();
    if(activeTab !== 'all'){
        applyTabFilter();
    }
    else{
       updateEmptyState(); 
    }
}

function startEditTask(task) {
    modal.style.display = 'block';
    title.value = task.title;
    desc.value = task.desc;
    addTaskBtn.textContent = "Save Changes";
    editingTask = task;
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    const li = taskList.querySelector(`[data-id="${id}"]`);
    if (li) li.remove();
    saveTasks();
    updateCounters();
    updateEmptyState();
}

// Add/Edit new task
addTaskBtn.addEventListener('click', () => {

    if (title.value.trim() === '') {
        title.classList.add('input-error');
        title.focus();
        return;
    }
    title.classList.remove('input-error');

    const now = new Date().toLocaleDateString();
    if (editingTask) {
        editingTask.title = title.value;
        editingTask.desc = desc.value;
        editingTask.updatedAt = now;
        updateTaskUI(editingTask);
  } else {
        const newTask = {
            id: Date.now(),
            title: title.value,
            desc: desc.value,
            createdAt: now,
            updatedAt: null,
            completed: false
        }
        tasks.unshift(newTask);
        const li = createTaskElement(newTask, true);
        taskList.prepend(li);
    }

    saveTasks();
    updateCounters();
    applyTabFilter();
    closeModalWindow();
    updateEmptyState();
})

// Filtering
function applyTabFilter() {
    const items = taskList.querySelectorAll('.task-item');

    items.forEach(li => {
        const task = tasks.find(t => t.id == li.dataset.id);
        if (!task) return;

        if (activeTab === 'all') li.style.display = 'flex';
        if (activeTab === 'pending') li.style.display = task.completed ? 'none' : 'flex';
        if (activeTab === 'completed') li.style.display = task.completed ? 'flex' : 'none';

    });
    updateEmptyState();
}

// Update counters
function updateCounters() {
    totalEl.textContent = tasks.length;
    completedEl.textContent = tasks.filter(t => t.completed).length;
    pendingEl.textContent = tasks.filter(t => !t.completed).length;
}

// Tabs click handling
const tabs = document.querySelectorAll('.todo-tabs button');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        activeTab = tab.dataset.tab;
        applyTabFilter();
    })
})

// Initial load
loadTasks();
tasks.forEach(task => {
    taskList.append(createTaskElement(task));
});
updateCounters();
applyTabFilter();