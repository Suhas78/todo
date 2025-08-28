const API_URL = "/api/tasks";
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const datetimeInput = document.getElementById('task-datetime');

// Always fetch tasks on load
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
});

function fetchTasks() {
  fetch(API_URL)
    .then(resp => resp.json())
    .then(tasks => {
      taskList.innerHTML = '';
      tasks.forEach(task => addTaskToDOM(task));
    })
    .catch(err => alert("Failed to load tasks"));
}

function addTaskToDOM(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = task.id;

  li.innerHTML = `
    <span><strong>${task.title}</strong>: ${task.description}</span>
    <span class="task-actions">
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </span>
  `;
  // Edit button logic
  li.querySelector('.edit-btn').onclick = function() {
    const newTitle = prompt("Edit title:", task.title);
    const newDesc = prompt("Edit description:", task.description);
    if(newTitle && newDesc){
      fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({title: newTitle, description: newDesc})
      })
      .then(() => fetchTasks());
    }
  };
  // Delete button logic
  li.querySelector('.delete-btn').onclick = function() {
    fetch(`${API_URL}/${task.id}`, {method: 'DELETE'})
      .then(() => fetchTasks());
  };

  taskList.appendChild(li);
}

// Add new task
taskForm.onsubmit = function(e){
  e.preventDefault();
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const datetime = datetimeInput.value;

  if(!title || !desc) return;
  fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({title, description: desc})
  })
  .then(() => {
    titleInput.value = '';
    descInput.value = '';
    datetimeInput.value = '';
    fetchTasks();
    // Schedule popup reminder if time set
    if(datetime) {
      scheduleNotification(title, datetime);
    }
  });
};

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function scheduleNotification(taskTitle, datetimeStr) {
  const notificationTime = new Date(datetimeStr).getTime();
  const now = Date.now();
  const delay = notificationTime - now;

  if (delay > 0) {
    setTimeout(() => {
      showToast(`Reminder: ${taskTitle}`);
    }, delay);
  } else {
    showToast("Time should be in the future!");
  }
}

