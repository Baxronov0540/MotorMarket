renderNav(null);

if (Auth.isLoggedIn()) {
  window.location.href = "profile.html";
}

const nextPage = qs("next") || "index.html";

const tabs = {
  login: document.getElementById("tab-login"),
  register: document.getElementById("tab-register"),
};
const forms = {
  login: document.getElementById("login-form"),
  register: document.getElementById("register-form"),
  confirm: document.getElementById("confirm-form"),
};

function showForm(name) {
  Object.values(forms).forEach(f => f.style.display = "none");
  forms[name].style.display = "block";
  tabs.login.classList.toggle("is-active", name === "login");
  tabs.register.classList.toggle("is-active", name === "register" || name === "confirm");
}

tabs.login.addEventListener("click", () => showForm("login"));
tabs.register.addEventListener("click", () => showForm("register"));

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.add("show");
}
function hideError(id) {
  document.getElementById(id).classList.remove("show");
}

// ---- Login ----
forms.login.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("login-error");
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const btn = e.target.querySelector("button");
  btn.disabled = true;
  try {
    await login(email, password);
    toast("Xush kelibsiz!", "success");
    window.location.href = nextPage;
  } catch (err) {
    showError("login-error", err.message);
  } finally {
    btn.disabled = false;
  }
});

// ---- Register step 1 ----
let pendingEmail = "";
forms.register.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("register-error");
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const btn = e.target.querySelector("button");
  btn.disabled = true;
  try {
    await API.user.register(email, password);
    pendingEmail = email;
    toast("Tasdiqlash kodi emailingizga yuborildi", "success");
    showForm("confirm");
  } catch (err) {
    showError("register-error", err.message);
  } finally {
    btn.disabled = false;
  }
});

// ---- Register step 2: confirm code ----
forms.confirm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("confirm-error");
  const code = document.getElementById("confirm-code").value.trim();
  const btn = e.target.querySelector("button");
  btn.disabled = true;
  try {
    await API.user.confirm(code);
    toast("Email tasdiqlandi! Endi tizimga kiring.", "success");
    showForm("login");
    document.getElementById("login-email").value = pendingEmail;
  } catch (err) {
    showError("confirm-error", err.message);
  } finally {
    btn.disabled = false;
  }
});
