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
    title.classList.remove('input-error');
    resetAddButton();
})

function closeModalWindow() {
    modal.style.display = "none";
    title.value = '';
    desc.value = '';
    title.classList.remove('input-error');
    resetAddButton();
}
closeModal.addEventListener('click', closeModalWindow);
cancelModal.addEventListener('click', closeModalWindow);
window.addEventListener('click', (e) => {
    if (e.target == modal) closeModalWindow();
})

// Add new task
function addNewTask() {
    if (title.value.trim() === '') {
        title.classList.add('input-error');
        title.focus();
        return;
    }
    title.classList.remove('input-error');

    const now = new Date().toLocaleDateString();
    const newTask = {
        id: Date.now(),
        title: title.value,
        desc: desc.value,
        createdAt: now,
        updatedAt: null,
        completed: false
    }
    tasks.push(newTask);
    saveTasks();
    renderTasksByTab(activeTab);
    closeModalWindow();
}
addTaskBtn.onclick = addNewTask;

function resetAddButton() {
    addTaskBtn.onclick = addNewTask;
}

// Handle task edit 
function handleEditTask(task) {
    if (title.value.trim() === '') {
        title.classList.add('input-error');
        title.focus();
        return;
    }
    title.classList.remove('input-error');

    task.title = title.value;
    task.desc = desc.value;
    task.updatedAt = new Date().toLocaleDateString();
    saveTasks();
    renderTasksByTab(activeTab);
    closeModalWindow();
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

// Render single task
function renderTask(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    // Status circle
    const circle = document.createElement('div');
    circle.className = 'task-circle' + (task.completed ? ' completed' : '');
    circle.setAttribute('role', 'button');
    circle.setAttribute('tabindex', '0');
    circle.addEventListener('click', () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasksByTab(activeTab);
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
    if (task.completed) titleEl.style.textDecoration = 'line-through';

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

    //Disable edit if completed   
    if (task.completed) editBtn.classList.add('disabled');
    else editBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        title.value = task.title;
        desc.value = task.desc;
        addTaskBtn.onclick = () => handleEditTask(task);
    })

    deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks();
        renderTasksByTab(activeTab);
    });

    actions.append(editBtn, deleteBtn);
    li.append(circle, info, actions);
    taskList.appendChild(li);
}

// Update counters
function updateCounters() {
    totalEl.textContent = tasks.length;
    completedEl.textContent = tasks.filter(t => t.completed).length;
    pendingEl.textContent = tasks.filter(t => !t.completed).length;
}

// Render tasks by tab
function renderTasksByTab(tab) {
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (tab === 'pending') filteredTasks = tasks.filter(t => !t.completed);
    else if (tab === 'completed') filteredTasks = tasks.filter(t => t.completed);

    filteredTasks.forEach(task => renderTask(task));
    updateCounters();
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
        renderTasksByTab(activeTab);
    })
})

// Initial load
loadTasks();
renderTasksByTab(activeTab);