renderNav("chat");
if (!requireAuth()) { /* redirected */ }

let currentConvId = new URLSearchParams(window.location.search).get("id") || null;
const user = getAuthUser();
let chatInterval = null;

const els = {
  layout: document.getElementById("chat-layout"),
  list: document.getElementById("chat-list"),
  main: document.getElementById("chat-main"),
  title: document.getElementById("chat-title"),
  msgs: document.getElementById("chat-messages"),
  form: document.getElementById("chat-form"),
  input: document.getElementById("msg-input"),
  back: document.getElementById("back-to-list")
};

els.back.addEventListener("click", () => {
  els.layout.classList.add("show-sidebar");
  currentConvId = null;
  history.pushState({}, "", "chat.html");
});

let isListFetching = false;
async function loadConversations() {
  if (isListFetching) return;
  isListFetching = true;
  try {
    const convs = await API.chat.list();
    if (!convs.length) {
      els.list.innerHTML = `<div class="empty-state" style="padding:20px;text-align:center;">Hozircha suhbatlar yo'q</div>`;
      return;
    }
    
    els.list.innerHTML = convs.map(c => {
      const isMeSeller = c.seller_id === user.id;
      const otherStr = isMeSeller ? `Xaridor #${c.buyer_id}` : `Sotuvchi #${c.seller_id}`;
      return `
        <div class="chat-item ${currentConvId == c.id ? 'active' : ''}" onclick="openChat(${c.id})">
          <div style="font-weight:600;">${otherStr}</div>
          <div style="font-size:12px; color:var(--text-dim); margin-top:4px;">E'lon #${c.listing_id || 'Topilmadi'} • ${new Date(c.last_message_at).toLocaleDateString()}</div>
        </div>
      `;
    }).join("");
  } catch (e) {
    console.error(e);
  } finally {
    isListFetching = false;
  }
}
setInterval(loadConversations, 4000);

window.openChat = async function(id) {
  currentConvId = id;
  history.pushState({}, "", `chat.html?id=${id}`);
  els.layout.classList.remove("show-sidebar");
  
  document.querySelectorAll(".chat-item").forEach(el => el.classList.remove("active"));
  loadConversations(); 
  
  els.msgs.innerHTML = `<div style="margin:auto; color:#999;">Yuklanmoqda...</div>`;
  els.form.style.display = "flex";
  
  await fetchMessages(id);
  
  if (chatInterval) clearInterval(chatInterval);
  chatInterval = setInterval(() => fetchMessages(currentConvId, true), 3000);
};

let isFetching = false;
async function fetchMessages(id, silent = false) {
  if (currentConvId != id || isFetching) return;
  isFetching = true;
  try {
    const details = await API.chat.getDetails(id);
    const isMeSeller = details.seller_id === user.id;
    els.title.innerHTML = `
      ${isMeSeller ? `Xaridor #${details.buyer_id}` : `Sotuvchi #${details.seller_id}`}
      ${details.listing_id ? `<a href="listing.html?id=${details.listing_id}" style="font-size:13px; font-weight:normal; margin-left:12px; color:var(--primary); text-decoration:underline;">E'lonni ko'rish (ID: ${details.listing_id})</a>` : ''}
    `;
    
    if (details.messages && details.messages.length > 0) {
      const isScrolledToBottom = els.msgs.scrollHeight - els.msgs.clientHeight <= els.msgs.scrollTop + 50;
      
      els.msgs.innerHTML = details.messages.map(m => {
        const isMe = m.sender_id === user.id;
        const time = new Date(m.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return `
          <div class="message ${isMe ? 'msg-me' : 'msg-other'}">
            <div>${escapeHtml(m.body)}</div>
            <span class="time-lbl">${time} ${isMe ? (m.is_read ? '✓✓' : '✓') : ''}</span>
          </div>
        `;
      }).join("");
      
      if (!silent || isScrolledToBottom) {
        els.msgs.scrollTop = els.msgs.scrollHeight;
      }
    } else {
      els.msgs.innerHTML = `<div style="margin:auto; color:#999;">Hozircha xabarlar yo'q. Birinchi bo'lib yozing!</div>`;
    }
  } catch (e) {
    if (!silent) toast(e.message, "error");
  } finally {
    isFetching = false;
  }
}

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const txt = els.input.value.trim();
  if (!txt || !currentConvId) return;
  
  els.input.disabled = true;
  try {
    await API.chat.sendMessage(currentConvId, { body: txt, type: "text" });
    els.input.value = "";
    await fetchMessages(currentConvId);
    els.msgs.scrollTop = els.msgs.scrollHeight;
    loadConversations();
  } catch (err) {
    toast("Xato: " + err.message, "error");
  } finally {
    els.input.disabled = false;
    els.input.focus();
  }
});

loadConversations();
if (currentConvId) {
  openChat(currentConvId);
}
