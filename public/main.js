const JWT_KEY = "jwt";
const jwt = localStorage.getItem(JWT_KEY);
let toastError;
let toastSuccess;

function init() {
  if (!jwt) {
    login();
  } else {
    // TODO restore assignment hash & delete storage
    verifyToken();
  }
  window.addEventListener("hashchange", retrieveAssignment, false);
  toastError = document.getElementById("toast-error");
  toastSuccess = document.getElementById("toast-success");
  renderAssignment();
}

function login() {
  localStorage.removeItem(JWT_KEY);
  // TODO save assignment hash
  window.location =
    `https://marmix.ig.he-arc.ch/shibjwt/?reply_to=${location.origin}/api/login`;
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
  return false;
}

function submitForm() {
    toastSuccess.style.display = "none";
    toastError.style.display = "none";
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
    if (res.status === 403) {
        login();
    } else if (res.status === 500) {
        toastError.style.display = "block";
    } else {
        toastSuccess.style.display = "block";
    }
  });

  return false;
}

function retrieveAssignment() {
    console.log('get assignments', getAssignmentNameFromHash())
    renderAssignment();
}

function getAssignmentNameFromHash() {
    return window.location.hash.slice(1);
}

function renderUser(user) {
    let userLabel = `${user.firstname} ${user.lastname}`;
    if (user.isAdmin) {
        userLabel += ' 🌟';
        document.body.classList.add("admin")
    }
    document.getElementById("user").innerText = userLabel;
}

function renderAssignment() {
    document.getElementById("assignment").innerText = getAssignmentNameFromHash();
}

window.onload = init;
