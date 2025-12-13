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

function loadTasks() {
    const stored = localStorage.getItem("tasks");
    if (stored) {
        tasks = JSON.parse(stored);
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
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
closeModal.addEventListener('click', () => {
    closeModalWindow();
})
cancelModal.addEventListener('click', () => {
    closeModalWindow();
})
window.addEventListener('click', (e) => {
    if (e.target == modal) closeModalWindow();
})

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
        createAt: now,
        updateAt: null,
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

function renderTask(task) {
    const li = document.createElement('li');
    li.classList.add('task-item');
    if (task.completed) li.classList.add('completed');
    li.innerHTML = `
    <div class="task-circle ${task.completed ? 'completed' : ''}"></div>
    <div class="task-info">
        <strong class="task-title">${task.title}</strong><br>
        <small class="task-desc">${task.desc}</small><br>
        <span class="task-date">Created: ${task.createAt}</span>
        ${task.updateAt ? `<span class="task-date"> • Updated: ${task.updateAt}</span>` : ''}
    </div>
    <div class = "task-actions">
       <button class = "action-btn edit" title = "Edit">
            <svg width = "18" height = "18" viewBox = "0 0 24 24" fill = "none" 
            xmlns = "http://www.w3.org/2000/svg">
                <path d = "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill = "currentColor" />
                <path d = "M20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill = "currentColor" />
           </svg>
        </button>
        <button class = "action-btn delete" title = "Delete">
            <svg width = "18" height = "18" viewBox = "0 0 24 24" fill = "none" xmlns = "http://www.w3.org/2000/svg">
                <path d = "M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z" fill = "currentColor" />
                <path d = "M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill = "currentColor" />
            </svg>
        </button> 
    </div>`
    taskList.appendChild(li);

    li.querySelector('.task-circle').addEventListener('click', () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasksByTab(activeTab);
    });

    li.querySelector('.delete').addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks();
        renderTasksByTab(activeTab);
    });

    const editBtn = li.querySelector('.edit');
    if (task.completed) {
        editBtn.classList.add('disabled');
        return;
    }
    editBtn.addEventListener('click', () => {

        modal.style.display = "block";
        title.value = task.title;
        desc.value = task.desc;

        addTaskBtn.onclick = () => {
            if (title.value.trim() === '') {
                title.classList.add('input-error');
                title.focus();
                return;
            }
            title.classList.remove('input-error');
            task.title = title.value;
            task.desc = desc.value;
            task.updateAt = new Date().toLocaleDateString();
            saveTasks();
            renderTasksByTab(activeTab);
            closeModalWindow();

        }
    })

}

function updateCounters() {
    totalEl.textContent = tasks.length;
    completedEl.textContent = tasks.filter(t => t.completed).length;
    pendingEl.textContent = tasks.filter(t => !t.completed).length;
}


function renderTasksByTab(tab) {
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (tab === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (tab === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }
    filteredTasks.forEach(task => renderTask(task));
    updateCounters();
}

const tabs = document.querySelectorAll('.todo-tabs button');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        activeTab = tab.dataset.tab;
        renderTasksByTab(activeTab);
    })
})

loadTasks();
renderTasksByTab(activeTab);