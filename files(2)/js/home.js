renderNav("home");

const state = { page: 1, size: 12, filters: {} };

function cardHtml(listing) {
  const cover = (listing.media || []).find(m => m.is_cover) || (listing.media || [])[0];
  const img = cover ? `<img src="${mediaUrl(cover.url)}" alt="${escapeHtml(listing.title)}">` : `<div class="no-photo">RASM YO'Q</div>`;
  return `
    <a class="card" href="listing.html?id=${listing.id}">
      <div class="card-media">
        ${img}
        <div class="spec-plate">${formatPrice(listing.price)}</div>
        <div class="card-status ${listing.status}">${statusLabel(listing.status)}</div>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(listing.title || "Nomsiz e'lon")}</h3>
        <div class="card-meta">
          <span>${conditionLabel(listing.condition)}</span>
          ${listing.subcategory_id ? `<span>Subkat #${listing.subcategory_id}</span>` : ""}
        </div>
        <div class="card-loc">${escapeHtml(listing.location || "Hudud ko'rsatilmagan")}</div>
      </div>
    </a>
  `;
}

async function loadListings() {
  const grid = document.getElementById("listing-grid");
  const countEl = document.getElementById("result-count");
  grid.innerHTML = Array.from({ length: 8 }).map(() => `<div class="skeleton" style="aspect-ratio:4/3;"></div>`).join("");

  try {
    const params = { ...state.filters, page: state.page, size: state.size };
    const listings = await API.listings.filter(params);
    if (!listings.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <h3>Hech narsa topilmadi</h3>
          <p>Filtrlarni o'zgartirib ko'ring yoki barcha e'lonlarni ko'ring.</p>
        </div>`;
      countEl.textContent = "";
    } else {
      grid.innerHTML = listings.map(cardHtml).join("");
      countEl.textContent = `${listings.length} ta e'lon · ${state.page}-bet`;
    }
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Yuklab bo'lmadi</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
  document.getElementById("page-badge").textContent = `${state.page}-bet`;
}

document.getElementById("filter-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.filters = Object.fromEntries(fd.entries());
  state.page = 1;
  loadListings();
});

document.getElementById("prev-page").addEventListener("click", () => {
  if (state.page > 1) { state.page--; loadListings(); }
});
document.getElementById("next-page").addEventListener("click", () => {
  state.page++; loadListings();
});

async function loadCategories() {
  const host = document.getElementById("category-strip");
  const subSelect = document.getElementById("f-sub");
  try {
    const categories = await API.categories.list();
    if (!categories.length) { host.remove(); return; }
    host.innerHTML = `<span class="badge" style="border-color:transparent; color:var(--text-dim);">Kategoriyalar:</span>` +
      categories.map(c => `<span class="badge">${escapeHtml(c.name)}</span>`).join("");
      
    let html = '<option value="">Barchasi</option>';
    categories.forEach(cat => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        html += `<optgroup label="${escapeHtml(cat.name)}">`;
        cat.subcategories.forEach(sub => {
          html += `<option value="${sub.id}">${escapeHtml(sub.name)}</option>`;
        });
        html += `</optgroup>`;
      }
    });
    if (subSelect) subSelect.innerHTML = html;
  } catch {
    host.remove();
  }
}

loadCategories();
loadListings();
