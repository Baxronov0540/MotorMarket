renderNav(null);

const SPEC_FIELDS = [
  ["brand", "Marka"],
  ["model", "Model"],
  ["year", "Yili"],
  ["mileage", "Probeg (km)"],
  ["color", "Rangi"],
  ["engine_volume", "Dvigatel hajmi (l)"],
  ["fuel_type", "Yoqilg'i turi"],
  ["transmission", "Uzatma qutisi"],
  ["drive_type", "Privod"],
  ["body_type", "Kuzov turi"],
  ["battery_capacity", "Batareya sig'imi"],
  ["power_reserve", "Yurish zaxirasi (km)"],
  ["motor_power", "Motor quvvati (W)"],
  ["frame_size", "Rama o'lchami"],
  ["wheel_size", "G'ildirak o'lchami"],
  ["speed_count", "Tezliklar soni"],
];

async function loadListing() {
  const id = qs("id");
  const root = document.getElementById("detail-root");
  if (!id) {
    root.innerHTML = `<div class="empty-state"><h3>E'lon topilmadi</h3></div>`;
    return;
  }

  try {
    const listing = await API.listings.get(id);
    document.title = `${listing.title || "E'lon"} — MotorMarket`;

    const media = listing.media || [];
    const mainImg = media[0] ? mediaUrl(media[0].url) : null;

    const specsHtml = SPEC_FIELDS
      .filter(([key]) => listing[key] !== undefined && listing[key] !== null && listing[key] !== "")
      .map(([key, label]) => `
        <div class="spec-item">
          <div class="k">${label}</div>
          <div class="v">${escapeHtml(String(listing[key]))}</div>
        </div>
      `).join("");

    root.innerHTML = `
      <div class="detail-grid">
        <div>
          <div class="gallery-main" id="gallery-main">
            ${mainImg ? `<img src="${mainImg}" alt="${escapeHtml(listing.title)}">` : `<div class="no-photo" style="height:100%;display:flex;align-items:center;justify-content:center;">RASM YO'Q</div>`}
          </div>
          ${media.length > 1 ? `
            <div class="gallery-thumbs">
              ${media.map((m, i) => `<img src="${mediaUrl(m.url)}" data-full="${mediaUrl(m.url)}" class="${i === 0 ? "is-active" : ""}">`).join("")}
            </div>` : ""}

          <div class="desc-block">${escapeHtml(listing.description || "Tavsif kiritilmagan.")}</div>
        </div>

        <div class="spec-plate-panel">
          <span class="spec-plate spec-plate--lg">${formatPrice(listing.price)}</span>
          <h1 class="detail-title" style="margin-top:16px;">${escapeHtml(listing.title || "Nomsiz e'lon")}</h1>
          <div class="detail-sub">
            ${conditionLabel(listing.condition)} · ${statusLabel(listing.status)} · ${escapeHtml(listing.location || "Hudud noma'lum")}
          </div>

          <div class="spec-list">${specsHtml || `<div class="spec-item"><div class="v">Qo'shimcha texnik ma'lumot yo'q.</div></div>`}</div>

          <div class="stack">
            ${(!getAuthUser() || getAuthUser().id !== listing.user_id) ? `<button class="btn btn--primary btn--block" id="chat-btn">✉ Sotuvchiga yozish</button>` : ''}
            <button class="btn btn--accent btn--block" id="save-btn">☆ Saqlash</button>
            <a class="btn btn--ghost btn--block" href="index.html">← Ortga</a>
          </div>
        </div>
      </div>
    `;

    const thumbs = root.querySelectorAll(".gallery-thumbs img");
    const mainWrap = document.getElementById("gallery-main");
    thumbs.forEach(t => t.addEventListener("click", () => {
      thumbs.forEach(x => x.classList.remove("is-active"));
      t.classList.add("is-active");
      mainWrap.innerHTML = `<img src="${t.dataset.full}" alt="">`;
    }));

    const chatBtn = document.getElementById("chat-btn");
    if (chatBtn) {
      chatBtn.addEventListener("click", async () => {
        if (!Auth.isLoggedIn()) {
          window.location.href = `auth.html?next=listing.html?id=${id}`;
          return;
        }
        try {
          chatBtn.textContent = "Kuting...";
          chatBtn.disabled = true;
          const conv = await API.chat.create({ listing_id: Number(id), seller_id: listing.user_id });
          window.location.href = `chat.html?id=${conv.id}`;
        } catch (err) {
          toast(err.message, "error");
          chatBtn.textContent = "✉ Sotuvchiga yozish";
          chatBtn.disabled = false;
        }
      });
    }

    document.getElementById("save-btn").addEventListener("click", async () => {
      if (!Auth.isLoggedIn()) {
        window.location.href = `auth.html?next=listing.html?id=${id}`;
        return;
      }
      try {
        await API.saved.create(Number(id));
        toast("E'lon saqlangan e'lonlarga qo'shildi", "success");
      } catch (err) {
        toast(err.message, "error");
      }
    });

  } catch (err) {
    root.innerHTML = `<div class="empty-state"><h3>Yuklab bo'lmadi</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

loadListing();
