renderNav("create");
if (!requireAuth()) { /* redirected */ }

const params = new URLSearchParams(location.search);
const editListingId = params.get("id");
if (!editListingId) window.location.href = "profile.html";

let selectedFiles = [];

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.add("show");
}
function hideError(id) {
  document.getElementById(id).classList.remove("show");
}

document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("create-error");
  const btn = document.getElementById("create-submit");
  btn.disabled = true;

  const payload = {
    subcategory_id: Number(document.getElementById("c-subcategory").value),
    title: document.getElementById("c-title").value.trim(),
    price: Number(document.getElementById("c-price").value),
    condition: document.getElementById("c-condition").value,
    status: document.getElementById("c-status").value,
    location: document.getElementById("c-location").value.trim(),
    description: document.getElementById("c-description").value.trim() || null,
  };

  // Add dynamic fields if they are visible
  document.querySelectorAll(".dyn-field").forEach(el => {
    if (el.style.display !== "none") {
      el.querySelectorAll("input, select").forEach(inp => {
        if (inp.value.trim() !== "") {
          let val = inp.value.trim();
          if (inp.type === "number") val = Number(val);
          payload[inp.id.replace("c-", "")] = val;
        }
      });
    }
  });

  try {
    btn.textContent = "Iltimos kuting...";
    await API.listings.update(editListingId, payload);
    
    if (selectedFiles.length > 0) {
      btn.textContent = "Rasmlar yuklanmoqda...";
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          await API.listings.uploadMedia(file, {
            listingId: editListingId,
            sortOrder: 100 + i, // Just put them at the end for now
            isCover: false,
          });
        } catch (err) {
          toast(`Rasm yuklanmadi: ${err.message}`, "error");
        }
      }
    }

    toast("E'lon tahrirlandi ✓", "success");
    window.location.href = `listing.html?id=${editListingId}`;
  } catch (err) {
    showError("create-error", err.message);
    btn.disabled = false;
    btn.textContent = "Saqlash";
  }
});

document.getElementById("media-input").addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  selectedFiles = selectedFiles.concat(files);
  const strip = document.getElementById("thumb-strip");
  strip.innerHTML = "";
  
  selectedFiles.forEach((file, i) => {
    const localUrl = URL.createObjectURL(file);
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.innerHTML = `<img src="${localUrl}">`;
    strip.appendChild(thumb);
  });
});

let allCategories = [];

async function loadCategories() {
  const catSelect = document.getElementById("c-category");
  try {
    allCategories = await API.categories.list();
    if (!allCategories.length) {
      catSelect.innerHTML = '<option value="" disabled selected>Kategoriyalar topilmadi</option>';
      return;
    }
    
    let html = '<option value="" disabled selected>Kategoriyani tanlang</option>';
    allCategories.forEach(cat => {
      html += `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`;
    });
    catSelect.innerHTML = html;
  } catch (err) {
    catSelect.innerHTML = '<option value="" disabled selected>Xatolik yuz berdi</option>';
  }
}

document.getElementById("c-category").addEventListener("change", (e) => {
  const catId = Number(e.target.value);
  const subSelect = document.getElementById("c-subcategory");
  const dynFields = document.getElementById("dynamic-fields");
  
  const selectedCat = allCategories.find(c => c.id === catId);
  if (!selectedCat || !selectedCat.subcategories || !selectedCat.subcategories.length) {
    subSelect.innerHTML = '<option value="" disabled selected>Subkategoriya topilmadi</option>';
    subSelect.disabled = true;
    dynFields.style.display = "none";
    return;
  }
  
  let html = '<option value="" disabled selected>Subkategoriyani tanlang</option>';
  selectedCat.subcategories.forEach(sub => {
    html += `<option value="${sub.id}">${escapeHtml(sub.name)}</option>`;
  });
  subSelect.innerHTML = html;
  subSelect.disabled = false;
  
  // Show dynamic fields based on category
  const catName = (selectedCat.name || "").toLowerCase();
  let group = "avto";
  if (catName.includes("elektr") || catName.includes("electro")) group = "electro";
  else if (catName.includes("moto")) group = "moto";
  else if (catName.includes("velo") || catName.includes("bayk")) group = "velo";
  else if (catName.includes("avto") || catName.includes("yengil") || catName.includes("mashina")) group = "avto";

  dynFields.style.display = "block";
  document.querySelectorAll(".dyn-field").forEach(el => {
    const groups = el.getAttribute("data-groups").split(",");
    if (groups.includes(group)) {
      el.style.display = "";
    } else {
      el.style.display = "none";
      el.querySelectorAll("input, select").forEach(inp => inp.value = "");
    }
  });
});

async function initEdit() {
  await loadCategories();
  
  try {
    const listing = await API.listings.get(editListingId);
    
    // Fill text inputs
    document.getElementById("c-title").value = listing.title || "";
    document.getElementById("c-price").value = listing.price || "";
    document.getElementById("c-condition").value = listing.condition || "used";
    document.getElementById("c-status").value = listing.status || "active";
    document.getElementById("c-location").value = listing.location || "";
    document.getElementById("c-description").value = listing.description || "";
    
    // Fill category/subcategory
    const catSelect = document.getElementById("c-category");
    const subSelect = document.getElementById("c-subcategory");
    let foundCat = null;
    for (const cat of allCategories) {
      if (cat.subcategories && cat.subcategories.find(s => s.id === listing.subcategory_id)) {
        foundCat = cat;
        break;
      }
    }
    if (foundCat) {
      catSelect.value = foundCat.id;
      catSelect.dispatchEvent(new Event("change"));
      subSelect.value = listing.subcategory_id;
    }
    
    // Fill dyn fields
    document.querySelectorAll(".dyn-field input, .dyn-field select").forEach(inp => {
      const key = inp.id.replace("c-", "");
      if (listing[key] !== null && listing[key] !== undefined) {
        inp.value = listing[key];
      }
    });
    
    // Show existing media in thumb strip
    if (listing.media && listing.media.length > 0) {
      const strip = document.getElementById("thumb-strip");
      listing.media.forEach(m => {
        const thumb = document.createElement("div");
        thumb.className = "thumb";
        thumb.innerHTML = `<img src="${mediaUrl(m.url)}">`;
        strip.appendChild(thumb);
      });
    }
    
  } catch (err) {
    showError("create-error", "E'lonni yuklab bo'lmadi: " + err.message);
  }
}

initEdit();

