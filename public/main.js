const JWT_KEY = "jwt";
const ASSIGNMENT_KEY = "classroom_html_assignment";
const jwt = localStorage.getItem(JWT_KEY);
let toastError;
let toastSuccess;

function init() {
  if (!jwt) {
    login();
  } else {
    const assignment = localStorage.getItem(ASSIGNMENT_KEY);
    localStorage.removeItem(ASSIGNMENT_KEY);
    if (assignment && assignment !== getAssignmentNameFromHash()) {
      setAssignment(assignment);
    }
    verifyToken();
  }
  window.addEventListener("hashchange", assignmentChanged, false);
  toastError = document.getElementById("toast-error");
  toastSuccess = document.getElementById("toast-success");
  assignmentChanged();
}

function login() {
  localStorage.removeItem(JWT_KEY);
  localStorage.setItem(ASSIGNMENT_KEY, getAssignmentNameFromHash());
  window.location = `https://marmix.ig.he-arc.ch/shibjwt/?reply_to=${
    location.origin
  }/api/login`;
}

function setAssignment(assignment) {
  window.location.hash = assignment;
}

function verifyToken() {
  fetch("api/verify_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ jwt })
  })
    .then(res => {
      if (res.status === 403) {
        return login();
      }
      return res.json();
    })
    .then(renderUser);
}

function getSubmissions() {
  fetch("api/submissions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ jwt, assignment: getAssignmentNameFromHash() })
  })
    .then(res => {
      if (res.status === 403) {
        return login();
      }
      return res.json();
    })
    .then(renderSubmissions);
}

// eslint-disable-next-line
function submitForm() {
  const sendButton = document.getElementById("send");
  toastSuccess.style.display = "none";
  toastError.style.display = "none";
  renderSubmissions([]);
  sendButton.disabled = true;
  fetch("api/submit", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jwt,
      assignment: getAssignmentNameFromHash(),
      url: document.getElementById("url").value,
      batch: document.getElementById("batch").value
    })
  }).then(res => {
    sendButton.disabled = false;
    if (res.status === 403) {
      login();
    } else if (res.status === 500) {
      toastError.style.display = "block";
    } else {
      getSubmissions();
    }
  });

  return false;
}

function assignmentChanged() {
  getSubmissions();
  renderAssignment();
}

function getAssignmentNameFromHash() {
  return window.location.hash.slice(1);
}

function renderUser(user) {
  let userLabel = `${user.firstname} ${user.lastname}`;
  if (user.isAdmin) {
    userLabel += " 🌟";
    document.body.classList.add("admin");
  }
  const userDisplay = document.getElementById("user");
  userDisplay.innerText = userLabel;
  userDisplay.onclick = () => {
    document.body.classList.toggle("admin");
  };
}

function renderAssignment() {
  const assignment = getAssignmentNameFromHash();
  document.getElementById("assignment").innerText = assignment;
  document.body.classList.toggle("assignment", assignment !== "");
}

function renderSubmissions(submissions) {
  const submissionsContainer = document.getElementById("submissions");
  while (submissionsContainer.firstChild) {
    submissionsContainer.removeChild(submissionsContainer.firstChild);
  }
  const submissionTemplate = document.getElementById("submission-template");
  submissions.sort((a, b) => {
    let order;
    if (a.hasOwnProperty("check_status") && b.hasOwnProperty("check_status")) {
      order = parseInt(a.check_status) - parseInt(b.check_status);
      if (order === 0) {
        order = a.email.localeCompare(b.email);
      }
    } else {
      order = a.assignment.localeCompare(b.assignment);
    }
    return order;
  });
  submissions.forEach(s => {
    // prefill current url
    document.getElementById("url").value = s.url;
    const clone = document.importNode(submissionTemplate.content, true)
      .firstElementChild;
    clone.addEventListener(
      "click",
      () => {
        setAssignment(s.assignment);
      },
      false
    );
    if (s.nb) {
      if (!s.assignment.includes("exercice")) return;
      clone.querySelector(".title").innerHTML = `${s.assignment} (${s.nb})`;
    } else {
      clone.querySelector(".title").innerHTML = `${s.email} ${new Date(s.check_date).toLocaleString()}`;
      if (s.check_status) {
        clone.querySelector(".status").innerHTML = `${s.check_status}%`;
        clone.querySelector(".preview").src = `screenshots/${s.assignment}/${
          s.email
        }.png?${new Date().getTime()}`;
      }
    }

    if (s.check_content) {
      try {
        const r = JSON.parse(s.check_content);
        const testResults = clone.querySelector(".testResults");
        r.testResults[0].assertionResults.forEach(a => {
          const testResult = document.createElement("li");
          const errorMessage = a.failureMessages.pop() || "";
          testResult.innerHTML = `${a.title} <span title="${errorMessage}" class="${a.status}">${
            a.status
          }</span>`;
          testResults.appendChild(testResult);
          const regex = /public\/(screenshots.*?\.png)/gm;
          const match = regex.exec(errorMessage);
          if (match) {
            clone.querySelector(".preview").src = match[1];
          }
        });
        // eslint-disable-next-line
      } catch (e) {
      }
    }

    submissionsContainer.appendChild(clone);
  });
}

window.onload = init;
