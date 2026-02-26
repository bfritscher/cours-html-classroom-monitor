const JWT_KEY = "jwt";
const jwt = localStorage.getItem(JWT_KEY);

function login() {
  localStorage.removeItem(JWT_KEY);
  window.location = `https://marmix.ig.he-arc.ch/shibjwt/?reply_to=${location.origin}/api/login`;
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
      renderUser(user);
      getScores(user);
    });
}

function getScores(user) {
  fetch("/api/scores", {
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
    .then(scores => {
      if (!scores) {
        return;
      }
      if (user.isAdmin) {
        renderAdminScores(scores);
      } else {
        renderUserScores(scores);
      }
    });
}

function renderUser(user) {
  let userLabel = `${user.firstname} ${user.lastname}`;
  if (user.isAdmin) {
    userLabel += " 🌟";
    document.body.classList.add("admin");
  }
  document.getElementById("user").innerText = userLabel;
}

function createTable(headers) {
  const table = document.createElement("table");
  table.className = "table table-striped table-hover";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach(header => {
    const th = document.createElement("th");
    th.innerText = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  table.appendChild(thead);
  table.appendChild(tbody);

  return { table, tbody };
}

function renderUserScores(scores) {
  const container = document.getElementById("scores");
  container.innerHTML = "";

  const filtered = scores
    .filter(score => score.check_status !== null)
    .sort((a, b) => a.assignment.localeCompare(b.assignment));

  const { table, tbody } = createTable(["Assignment", "Score", "Updated"]);

  filtered.forEach(score => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${score.assignment}</td><td>${score.check_status}%</td><td>${new Date(
      score.check_date
    ).toLocaleString()}</td>`;
    tbody.appendChild(row);
  });

  if (filtered.length === 0) {
    container.innerText = "No scores available yet.";
  } else {
    container.appendChild(table);
  }
}

function renderAdminScores(scores) {
  const container = document.getElementById("scores");
  container.innerHTML = "";

  const assignments = [];
  const seenAssignments = new Set();
  scores.forEach(score => {
    if (!seenAssignments.has(score.assignment)) {
      seenAssignments.add(score.assignment);
      assignments.push(score.assignment);
    }
  });
  const students = Array.from(new Set(scores.map(score => score.email))).sort();
  const values = {};

  scores.forEach(score => {
    values[`${score.email}::${score.assignment}`] = score.check_status;
  });

  const { table, tbody } = createTable(["Student"].concat(assignments));

  students.forEach(student => {
    const row = document.createElement("tr");
    const firstCell = document.createElement("td");
    firstCell.innerText = student.split("@")[0].split(".").map(s => s[0].toUpperCase() + s.slice(1)).join(" ");
    row.appendChild(firstCell);

    assignments.forEach(assignment => {
      const cell = document.createElement("td");
      const value = values[`${student}::${assignment}`];
      cell.innerText = value === undefined || value === null ? "-" : `${value}%`;
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  const tfoot = document.createElement("tfoot");
  const totalRow = document.createElement("tr");
  totalRow.className = "table-secondary fw-bold";
  const totalLabelCell = document.createElement("td");
  totalLabelCell.innerText = `Total (${students.length})`;
  totalRow.appendChild(totalLabelCell);

  assignments.forEach(assignment => {
    const totalCell = document.createElement("td");
    const countWithHundred = students.filter(student => Number(values[`${student}::${assignment}`]) === 100).length;
    totalCell.innerText = `${countWithHundred}`;
    totalRow.appendChild(totalCell);
  });

  tfoot.appendChild(totalRow);
  table.appendChild(tfoot);

  if (students.length === 0 || assignments.length === 0) {
    container.innerText = "No scores available yet.";
  } else {
    container.appendChild(table);
  }
}

function init() {
  if (!jwt) {
    login();
    return;
  }
  verifyToken();
}

window.onload = init;
