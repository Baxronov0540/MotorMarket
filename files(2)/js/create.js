renderNav("create");
if (!requireAuth()) { /* redirected */ }

let createdListingId = null;
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
    const listing = await API.listings.create(payload);
    createdListingId = listing.id;
    
    if (selectedFiles.length > 0) {
      btn.textContent = "Rasmlar yuklanmoqda...";
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          await API.listings.uploadMedia(file, {
            listingId: createdListingId,
            sortOrder: i,
            isCover: i === 0,
          });
        } catch (err) {
          toast(`Rasm yuklanmadi: ${err.message}`, "error");
        }
      }
    }

    toast("E'lon joylandi ✓", "success");
    window.location.href = `listing.html?id=${createdListingId}`;
  } catch (err) {
    showError("create-error", err.message);
    btn.disabled = false;
    btn.textContent = "E'lonni joylash";
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

loadCategories();

