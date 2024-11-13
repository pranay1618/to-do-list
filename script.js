const taskList = document.getElementById("taskList");
const taskStats = document.getElementById("taskStats");

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(createTaskItem);
    updateStats();
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const dueDate = document.getElementById("dueDate");
    const alarmTime = document.getElementById("alarmTime");
    const priority = document.getElementById("priority").value;

    if (taskInput.value.trim() === "") return;

    const task = {
        text: taskInput.value,
        date: dueDate.value,
        alarm: alarmTime.value,
        priority: priority,
        id: Date.now(),
        completed: false
    };

    createTaskItem(task);
    saveTask(task);
    taskInput.value = "";
    dueDate.value = "";
    alarmTime.value = "";
    updateStats();
}

function createTaskItem(task) {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.priority}-priority`;
    taskItem.dataset.id = task.id;

    const taskContent = document.createElement("span");
    taskContent.textContent = `${task.text} - ${task.date} ${task.alarm ? ' at ' + task.alarm : ''}`;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.className = "complete-btn";
    completeBtn.onclick = () => toggleComplete(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);
    taskItem.appendChild(taskContent);
    taskItem.appendChild(actions);

    taskList.appendChild(taskItem);

    if (task.alarm) setAlarm(task);
}

function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    document.querySelector(`[data-id='${id}']`).remove();
    updateStats();
}

function toggleComplete(id) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        document.querySelector(`[data-id='${id}']`).classList.toggle("completed");
        updateStats();
    }
}

function updateStats() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const completedCount = tasks.filter(task => task.completed).length;
    taskStats.textContent = `${tasks.length} tasks, ${completedCount} completed`;
}

function setAlarm(task) {
    const alarmDate = new Date(`${task.date}T${task.alarm}`);
    const now = new Date();
    const timeout = alarmDate - now;
    if (timeout > 0) {
        setTimeout(() => {
            alert(`Alarm for task: ${task.text}`);
        }, timeout);
    }
}

function filterTasks() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const priorityFilter = document.getElementById("filterPriority").value;
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    taskList.innerHTML = "";

    tasks
        .filter(task =>
            (task.text.toLowerCase().includes(searchTerm)) &&
            (priorityFilter === "all" || task.priority === priorityFilter)
        )
        .forEach(createTaskItem);
}

document.addEventListener("DOMContentLoaded", loadTasks);
