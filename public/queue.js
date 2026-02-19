const JWT_KEY = "jwt";
const jwt = localStorage.getItem(JWT_KEY);
let refreshTimer = null;

function login() {
  localStorage.removeItem(JWT_KEY);
  window.location = `https://marmix.ig.he-arc.ch/shibjwt/?reply_to=${location.origin}/api/login`;
}

function formatDuration(ms) {
  if (ms === null || ms === undefined || ms < 0) {
    return "-";
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
}

function setBodyRows(tableId, rows, colSpan) {
  const body = document.querySelector(`#${tableId} tbody`);
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  if (rows.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = colSpan;
    cell.innerText = "No task";
    row.appendChild(cell);
    body.appendChild(row);
    return;
  }

  rows.forEach(values => {
    const row = document.createElement("tr");
    values.forEach(value => {
      const cell = document.createElement("td");
      cell.innerText = value;
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
}

function renderQueue(data) {
  document.getElementById("queue-summary").innerText =
    `Queued: ${data.queuedCount} | Running: ${data.runningCount}`;

  setBodyRows(
    "queued-table",
    (data.queuedTasks || []).map(task => [
      String(task.queuePosition),
      task.email,
      task.assignment,
      formatDuration(task.waitingMs),
      formatDate(task.enqueuedAt)
    ]),
    5
  );

  setBodyRows(
    "running-table",
    (data.runningTasks || []).map(task => [
      task.email,
      task.assignment,
      formatDuration(task.waitMs),
      formatDuration(task.runningMs),
      formatDate(task.startedAt)
    ]),
    5
  );

  setBodyRows(
    "history-table",
    (data.history || []).map(task => [
      formatDate(task.finishedAt),
      task.email,
      task.assignment,
      task.status,
      String(task.exitCode),
      formatDuration(task.waitMs),
      formatDuration(task.runMs),
      formatDuration(task.totalMs)
    ]),
    8
  );
}

function getTaskQueue() {
  fetch("/api/tasks", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ jwt })
  })
    .then(res => {
      if (res.status === 403) {
        login();
        return null;
      }
      return res.json();
    })
    .then(data => {
      if (data) {
        renderQueue(data);
      }
    })
    .catch(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    });
}

function verifyToken() {
  fetch("/api/verify_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ jwt })
  })
    .then(res => {
      if (res.status === 403) {
        login();
        return null;
      }
      return res.json();
    })
    .then(user => {
      if (!user) {
        return;
      }
      if (!user.isAdmin) {
        login();
        return;
      }
      document.body.classList.add("admin");
      document.getElementById("user").innerText = `${user.firstname} ${user.lastname} 🌟`;
      getTaskQueue();
      refreshTimer = setInterval(getTaskQueue, 3000);
    });
}

function init() {
  if (!jwt) {
    login();
    return;
  }
  verifyToken();
}

window.onload = init;
