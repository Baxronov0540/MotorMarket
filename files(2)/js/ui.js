/**
 * MotorMarket — shared UI chrome (nav bar, toasts, formatters)
 * Included on every page after api.js.
 */

function formatPrice(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function toast(message, kind = "info") {
  let host = document.getElementById("mm-toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "mm-toast-host";
    host.className = "toast-host";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = `toast toast--${kind}`;
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("toast--in"));
  setTimeout(() => {
    el.classList.remove("toast--in");
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

function renderNav(active) {
  const host = document.getElementById("mm-nav");
  if (!host) return;
  const loggedIn = Auth.isLoggedIn();

  const links = [
    { href: "index.html", label: "E'lonlar", key: "home" },
    { href: "create.html", label: "E'lon joylash", key: "create" },
    { href: "saved.html", label: "Saqlanganlar", key: "saved" },
    { href: "chat.html", label: "Xabarlar", key: "chat" },
  ];

  host.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html">
        <span class="brand-mark">MM</span>
        <span class="brand-word">MOTOR<em>MARKET</em></span>
      </a>
      <nav class="nav-links">
        ${links.map(l => `<a href="${l.href}" class="${active === l.key ? "is-active" : ""}">${l.label}</a>`).join("")}
      </nav>
      <div class="nav-auth">
        ${loggedIn
          ? `<a href="profile.html" class="${active === "profile" ? "is-active" : ""}">Profil</a>
             <button class="btn btn--ghost" id="mm-logout-btn">Chiqish</button>`
          : `<a href="auth.html" class="btn btn--accent">Kirish</a>`
        }
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById("mm-logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

function requireAuth() {
  if (!Auth.isLoggedIn()) {
    window.location.href = `auth.html?next=${encodeURIComponent(window.location.pathname.split("/").pop())}`;
    return false;
  }
  return true;
}

function conditionLabel(c) {
  return { new: "Yangi", used: "Ishlatilgan" }[c] || c;
}

function statusLabel(s) {
  return { active: "Faol", sold: "Sotilgan", inactive: "Nofaol" }[s] || s;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("mm-year");
  if (y) y.textContent = new Date().getFullYear();
});
