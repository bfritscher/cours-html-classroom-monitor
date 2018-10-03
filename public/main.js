const JWT_KEY = "jwt";
const jwt = localStorage.getItem(JWT_KEY);

function login() {
    localStorage.removeItem(JWT_KEY);
    window.location = "https://marmix.ig.he-arc.ch/shibjwt/?reply_to=http://localhost/api/login"
}

if (!jwt) {
    login();
} else {
    verifyToken();
}

let assignment = "test";

let user;

function verifyToken() {
    fetch("api/verify_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({jwt})
    })
    .then(res => {
        if( res.status === 403) {
            return login();
        }
        return res.json();
    }).then(u => {
        user = u;
    })
    return false;
  }

function sendOne() {
  fetch("api/submit_one", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ jwt, assignment, url: document.getElementById('url').value })
  })
  .then(res => {
      if( res.status === 403) {
        // TODO: handle error
      }
  })

  return false;
}
