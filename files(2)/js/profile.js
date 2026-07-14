renderNav("profile");
if (!requireAuth()) { /* redirected */ }

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.add("show");
}
function hideError(id) {
  document.getElementById(id).classList.remove("show");
}

async function loadProfile() {
  try {
    const user = await API.user.profile();
    document.getElementById("p-email").value = user.email;
    document.getElementById("p-first").value = user.first_name || "";
    document.getElementById("p-last").value = user.last_name || "";
    document.getElementById("p-phone").value = user.phone || "";
  } catch (err) {
    toast(err.message, "error");
    if (err.status === 401) logout();
  }
}

function myListingCard(listing) {
  const cover = (listing.media || []).find(m => m.is_cover) || (listing.media || [])[0];
  const img = cover ? `<img src="${mediaUrl(cover.url)}" alt="${escapeHtml(listing.title)}">` : `<div class="no-photo">RASM YO'Q</div>`;
  const isSold = listing.status === 'sold' || listing.status === 'sotildi';
  
  return `
    <div class="card" ${isSold ? 'style="opacity:0.75"' : ''}>
      <a href="listing.html?id=${listing.id}">
        <div class="card-media">
          ${img}
          <div class="spec-plate">${formatPrice(listing.price)}</div>
          <div class="card-status ${listing.status}">${statusLabel(listing.status)}</div>
        </div>
      </a>
      <div class="card-body">
        <h3>${escapeHtml(listing.title || "Nomsiz e'lon")}</h3>
        <div class="card-meta"><span>${conditionLabel(listing.condition)}</span></div>
        <div class="row" style="margin-top:8px; gap:8px;">
          <a class="btn btn--ghost btn--block" href="edit.html?id=${listing.id}" style="text-align:center;">Tahrirlash</a>
          <button class="btn btn--ghost btn--block" data-del="${listing.id}" style="color:var(--danger-color); border-color:var(--danger-color);">O'chirish</button>
        </div>
        ${!isSold ? `<button class="btn btn--ghost btn--block" data-sold="${listing.id}" style="margin-top:8px; border-color:var(--accent-color); color:var(--accent-color);">Sotildi</button>` : ''}
      </div>
    </div>
  `;
}

async function loadMyListings() {
  const host = document.getElementById("my-listings");
  try {
    const listings = await API.listings.mine();
    if (!listings.length) {
      host.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Hali e'lon joylamagansiz</h3><p>Birinchi e'loningizni qo'shing.</p></div>`;
      return;
    }
    host.innerHTML = listings.map(myListingCard).join("");
    host.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("E'lonni o'chirmoqchimisiz?")) return;
        try {
          await API.listings.remove(btn.dataset.del);
          toast("E'lon o'chirildi", "success");
          loadMyListings();
        } catch (err) {
          toast(err.message, "error");
        }
      });
    });
    host.querySelectorAll("[data-sold]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("E'lon sotildimi? U faolsiz holatga o'tadi.")) return;
        try {
          await API.listings.update(btn.dataset.sold, { status: "sold" });
          toast("E'lon 'Sotildi' deb belgilandi", "success");
          loadMyListings();
        } catch (err) {
          toast(err.message, "error");
        }
      });
    });
  } catch (err) {
    host.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Yuklab bo'lmadi</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("profile-error");
  const payload = {
    first_name: document.getElementById("p-first").value.trim() || null,
    last_name: document.getElementById("p-last").value.trim() || null,
    phone: document.getElementById("p-phone").value.trim() || null,
  };
  try {
    await API.user.updateProfile(payload);
    toast("Profil yangilandi", "success");
  } catch (err) {
    showError("profile-error", err.message);
  }
});

document.getElementById("password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("password-error");
  const password = document.getElementById("p-new-password").value;
  try {
    await API.user.changePassword(password);
    toast("Parol yangilandi", "success");
    e.target.reset();
  } catch (err) {
    showError("password-error", err.message);
  }
});

loadProfile();
loadMyListings();
