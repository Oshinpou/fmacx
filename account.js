const gun = Gun();
const users = gun.get("users");

// Timezone
function istTime() {
  return moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
}

function createAccount() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (!validator.isEmail(email) || password !== confirm || !validator.isMobilePhone(phone)) {
    Swal.fire("Error", "Invalid input or passwords don’t match", "error");
    return;
  }

  users.get(username).once(async data => {
    if (data) {
      Swal.fire("Error", "Username already exists", "error");
    } else {
      const pair = await SEA.pair();
      const createdAt = istTime();
      users.get(username).put({
        email, phone, password: await SEA.encrypt(password, pair), pub: pair.pub, createdAt
      });
      Swal.fire("Success", `Account created at ${createdAt}`, "success");
    }
  });
}

function loginAccount() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  users.get(user).once(async data => {
    if (!data) return Swal.fire("Error", "Account not found", "error");

    const decrypted = await SEA.decrypt(data.password, { epriv: data.epub, pub: data.pub });
    if (decrypted !== pass) return Swal.fire("Error", "Invalid credentials", "error");

    localStorage.setItem("fmacx_user", user);
    Swal.fire("Welcome", `Logged in at ${istTime()}`, "success").then(() => {
      window.location.href = "index.html";
    });
  });
}

function logoutAccount() {
  localStorage.removeItem("fmacx_user");
  Swal.fire("Logged out", "", "info").then(() => {
    window.location.reload();
  });
}

function autoLogin() {
  const user = localStorage.getItem("fmacx_user");
  if (user && document.getElementById("account-status")) {
    document.getElementById("account-status").innerText = `Logged in: ${user}`;
    document.getElementById("logoutBtn").classList.remove("hidden");
  }
}

function gotoLogin() {
  window.location.href = "login.html";
}

function toggleOptions() {
  const el = document.getElementById("account-options");
  el.classList.toggle("hidden");
}

function recoverPassword() {
  Swal.fire("Info", "Recover system not active in demo", "info");
}

// Auto-login if available
window.addEventListener("DOMContentLoaded", autoLogin);
