renderNav("saved");
if (!requireAuth()) { /* redirected */ }

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
        <div class="card-meta"><span>${conditionLabel(listing.condition)}</span></div>
        <div class="card-loc">${escapeHtml(listing.location || "")}</div>
      </div>
    </a>
  `;
}

async function loadSaved() {
  const host = document.getElementById("saved-grid");
  try {
    const saved = await API.saved.list();
    if (!saved.length) {
      host.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Saqlangan e'lonlar yo'q</h3><p>Yoqqan e'lonni ochib, "Saqlash" tugmasini bosing.</p></div>`;
      return;
    }
    // API doesn't expand the related listing on /saved/list, so fetch each one.
    const listings = await Promise.all(
      saved.map(s => API.listings.get(s.listing_id).catch(() => null))
    );
    const valid = listings.filter(Boolean);
    host.innerHTML = valid.length
      ? valid.map(cardHtml).join("")
      : `<div class="empty-state" style="grid-column:1/-1;"><h3>Yuklab bo'lmadi</h3></div>`;
  } catch (err) {
    host.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Yuklab bo'lmadi</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

loadSaved();
