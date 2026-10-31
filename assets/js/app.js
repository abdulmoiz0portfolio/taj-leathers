/* TAJ LEATHERS — UI layer: search overlay, cart drawer, quick view, reveal, back-to-top */
(function () {
  /* ---------- shared injected CSS ---------- */
  const css = `
  .reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
  .reveal.in{opacity:1;transform:none}
  @media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}}
  .wish-btn{color:#737373}
  .wish-btn.wished{color:#D4AF37}
  #search-overlay{position:fixed;inset:0;z-index:90;background:rgba(28,25,23,.55);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:flex-start;padding:8vh 1rem 1rem}
  #search-panel{width:100%;max-width:640px;background:#fff;border-radius:1.25rem;box-shadow:0 25px 60px rgba(0,0,0,.25);overflow:hidden;animation:pop .25s ease}
  @keyframes pop{from{transform:translateY(-12px);opacity:0}to{transform:none;opacity:1}}
  #cart-drawer-overlay,#qv-overlay{position:fixed;inset:0;z-index:90;background:rgba(28,25,23,.55);backdrop-filter:blur(4px)}
  #cart-drawer{position:fixed;top:0;right:0;height:100dvh;width:min(420px,92vw);z-index:95;background:#fff;box-shadow:-20px 0 60px rgba(0,0,0,.2);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .35s cubic-bezier(.32,.72,.28,1)}
  #cart-drawer.open{transform:none}
  #qv-modal{position:fixed;z-index:96;top:50%;left:50%;transform:translate(-50%,-50%);width:min(880px,94vw);max-height:92dvh;overflow:auto;background:#fff;border-radius:1.25rem;box-shadow:0 25px 60px rgba(0,0,0,.3);animation:pop .25s ease}
  #back-top{position:fixed;left:1.5rem;bottom:1.5rem;z-index:50;width:3rem;height:3rem;border-radius:9999px;background:#000000;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 25px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;transform:translateY(8px)}
  #back-top.show{opacity:1;pointer-events:auto;transform:none}
  #back-top:hover{background:#D4AF37}
  .promo-msg{font-size:.8rem;margin-top:.5rem;min-height:1.2rem}
  `;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- search overlay ---------- */
  const so = document.createElement("div");
  so.id = "search-overlay";
  so.style.display = "none";
  so.innerHTML = `
    <div id="search-panel">
      <div class="flex items-center gap-3 px-5 py-4 border-b border-black/10">
        <svg class="w-5 h-5 text-[#737373]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"/></svg>
        <input id="search-input" type="text" placeholder="Search belts, wallets…" autocomplete="off"
               class="flex-1 text-lg focus:outline-none placeholder-[#737373] text-[#000000]">
        <button onclick="closeSearch()" aria-label="Close search" class="text-[#737373] hover:text-[#D4AF37] text-2xl leading-none px-1">×</button>
      </div>
      <div id="search-results" class="max-h-[60vh] overflow-auto p-3"></div>
    </div>`;
  document.body.appendChild(so);
  so.addEventListener("click", e => { if (e.target === so) closeSearch(); });

  window.openSearch = function () {
    so.style.display = "flex";
    document.body.style.overflow = "hidden";
    const inp = document.getElementById("search-input");
    inp.value = "";
    renderSearch("");
    setTimeout(() => inp.focus(), 50);
  };
  window.closeSearch = function () {
    so.style.display = "none";
    document.body.style.overflow = "";
  };
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (so.style.display !== "none") closeSearch();
      closeQuickView();
    }
  });
  document.getElementById("search-input").addEventListener("input", e => renderSearch(e.target.value));

  function renderSearch(q) {
    q = (q || "").trim().toLowerCase();
    const box = document.getElementById("search-results");
    if (!q) {
      box.innerHTML = `<p class="text-sm text-[#737373] px-3 py-6 text-center">Type to search across ${PRODUCTS.length} products…</p>`;
      return;
    }
    const hits = PRODUCTS.filter(p => {
      const hay = (p.name + " " + p.cat + " " + p.section + " " + SECTIONS[p.section].name + " " + CATS[p.cat].name).toLowerCase();
      return q.split(/\s+/).every(w => hay.includes(w));
    }).slice(0, 8);
    box.innerHTML = hits.length ? hits.map(p => `
      <a href="product.html?section=${p.section}&id=${p.id}" class="flex items-center gap-4 p-3 rounded-xl hover:bg-[#fafafa] transition">
        <img src="assets/img/${p.img}" alt="" class="w-14 h-14 object-cover rounded-lg">
        <div class="flex-1 min-w-0">
          <p class="text-[#000000] font-medium truncate">${p.name}</p>
          <p class="text-xs text-[#737373]">${SECTIONS[p.section].name} · ${CATS[p.cat].name}</p>
        </div>
        <span class="text-[#D4AF37] font-bold text-sm whitespace-nowrap">${fmt(p.price)}</span>
      </a>`).join("")
      : `<p class="text-sm text-[#737373] px-3 py-6 text-center">No matches for “${q}”. Try “belt”, “cotton”, “wallet”…</p>`;
  }

  /* ---------- cart drawer ---------- */
  const dw = document.createElement("div");
  dw.innerHTML = `
    <div id="cart-drawer-overlay" style="display:none" onclick="closeDrawer()"></div>
    <aside id="cart-drawer" aria-label="Mini cart">
      <div class="flex items-center justify-between px-5 py-4 border-b border-black/10">
        <p class="font-serif text-xl text-[#000000]">Your Cart <span id="drawer-count" class="text-sm text-[#737373]"></span></p>
        <button onclick="closeDrawer()" aria-label="Close cart" class="text-[#737373] hover:text-[#D4AF37] text-2xl leading-none">×</button>
      </div>
      <div id="drawer-items" class="flex-1 overflow-auto px-5 py-4 space-y-4"></div>
      <div class="border-t border-black/10 px-5 py-4 space-y-3 bg-[#fafafa]">
        <div>
          <div class="flex gap-2">
            <input id="drawer-promo" type="text" placeholder="Promo code (try WELCOME10)" class="flex-1 min-w-0 bg-white border border-black/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] uppercase">
            <button onclick="applyDrawerPromo()" class="bg-[#000000] text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#D4AF37] transition">Apply</button>
          </div>
          <p id="drawer-promo-msg" class="promo-msg"></p>
        </div>
        <div id="drawer-totals" class="text-sm space-y-1.5"></div>
        <a href="cart.html" class="block text-center text-sm text-[#525252] hover:text-[#D4AF37]">View full cart →</a>
        <a href="checkout.html" class="block text-center bg-[#D4AF37] text-black font-bold py-3.5 rounded-full hover:bg-[#B8860B] transition">Checkout</a>
      </div>
    </aside>`;
  document.body.appendChild(dw);

  window.openDrawer = function () {
    renderDrawer();
    document.getElementById("cart-drawer-overlay").style.display = "block";
    document.getElementById("cart-drawer").classList.add("open");
    document.body.style.overflow = "hidden";
  };
  window.closeDrawer = function () {
    document.getElementById("cart-drawer-overlay").style.display = "none";
    document.getElementById("cart-drawer").classList.remove("open");
    document.body.style.overflow = "";
  };
  window.renderDrawer = function () {
    const cart = getCart();
    const t = orderTotals();
    document.getElementById("drawer-count").textContent = cart.length ? `(${cartCount()} items)` : "";
    const box = document.getElementById("drawer-items");
    box.innerHTML = cart.length ? cart.map(i => {
      const p = PRODUCTS.find(p => p.id === i.id);
      if (!p) return "";
      return `<div class="flex gap-3 items-center">
        <img src="assets/img/${p.img}" alt="" class="w-16 h-16 object-cover rounded-xl">
        <div class="flex-1 min-w-0">
          <p class="text-sm text-[#000000] font-medium truncate">${p.name}</p>
          <p class="text-xs text-[#737373]">${[i.color, i.size].filter(Boolean).join(" · ")}</p>
          <div class="flex items-center justify-between mt-1.5">
            <div class="flex items-center border border-black/15 rounded-full">
              <button onclick="setQty('${i.key}',${i.qty - 1})" class="w-7 h-7 text-[#262626] hover:text-[#D4AF37]">−</button>
              <span class="w-6 text-center text-xs font-semibold">${i.qty}</span>
              <button onclick="setQty('${i.key}',${i.qty + 1})" class="w-7 h-7 text-[#262626] hover:text-[#D4AF37]">+</button>
            </div>
            <span class="text-sm text-[#D4AF37] font-bold">${fmt(p.price * i.qty)}</span>
          </div>
        </div>
        <button onclick="setQty('${i.key}',0)" aria-label="Remove" class="text-[#737373] hover:text-red-500 text-lg px-1">×</button>
      </div>`;
    }).join("") : `<p class="text-center text-[#737373] text-sm py-10">Your cart is empty.<br>Good leather waits for no one.</p>`;

    const pr = t.promo;
    document.getElementById("drawer-totals").innerHTML = `
      <div class="flex justify-between text-[#525252]"><span>Subtotal</span><span class="text-[#000000]">${fmt(t.sub)}</span></div>
      ${t.discount ? `<div class="flex justify-between text-green-700"><span>Discount (${pr.code}) <button onclick="removePromo('drawer')" class="underline text-xs ml-1">remove</button></span><span>−${fmt(t.discount)}</span></div>` : ""}
      <div class="flex justify-between text-[#525252]"><span>Shipping</span><span class="text-[#000000]">${t.ship === 0 ? "FREE" : fmt(t.ship)}</span></div>
      <div class="flex justify-between font-bold text-[#000000] text-base border-t border-black/10 pt-2"><span>Total</span><span class="text-[#D4AF37]">${fmt(t.total)}</span></div>`;
    const inp = document.getElementById("drawer-promo");
    if (pr && document.activeElement !== inp) inp.value = pr.code;
    const msg = document.getElementById("drawer-promo-msg");
    if (pr && !msg.dataset.lock) { msg.textContent = pr.code + " applied."; msg.style.color = "#15803d"; }
  };
  window.applyDrawerPromo = function () {
    const v = document.getElementById("drawer-promo").value;
    const r = setPromo(v);
    const msg = document.getElementById("drawer-promo-msg");
    msg.dataset.lock = "1";
    msg.textContent = r.msg;
    msg.style.color = r.ok ? "#15803d" : "#dc2626";
    setTimeout(() => { delete msg.dataset.lock; }, 3000);
    renderDrawer();
    if (typeof render === "function") { try { render(); } catch (e) {} }
  };
  window.removePromo = function () {
    clearPromo();
    renderDrawer();
    if (typeof render === "function") { try { render(); } catch (e) {} }
    const msg = document.getElementById("drawer-promo-msg");
    if (msg) { msg.textContent = "Promo removed."; msg.style.color = "#525252"; }
  };

  /* ---------- quick view ---------- */
  const qv = document.createElement("div");
  qv.innerHTML = `<div id="qv-overlay" style="display:none" onclick="closeQuickView()"></div><div id="qv-modal" style="display:none"></div>`;
  document.body.appendChild(qv);
  let qvColor = null, qvSize = null, qvQty = 1, qvId = null;

  window.openQuickView = function (id) {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return;
    qvId = id; qvColor = p.colors[0]; qvSize = p.sizes[0]; qvQty = 1;
    const r = avgRating(id);
    document.getElementById("qv-modal").innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2">
        <div class="relative bg-[#fafafa] min-h-[280px]">
          <img src="assets/img/${p.img}" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover sm:rounded-l-[1.25rem]">
          <span class="absolute top-4 left-4 bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">${p.badge}</span>
        </div>
        <div class="p-6 sm:p-8">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-widest text-[#D4AF37] mb-1">${SECTIONS[p.section].name} · ${CATS[p.cat].name}</p>
              <h3 class="font-serif text-2xl text-[#000000]">${p.name}</h3>
              <div class="mt-1">${starsHTML(r.avg, r.count)}</div>
            </div>
            <button onclick="closeQuickView()" aria-label="Close" class="text-[#737373] hover:text-[#D4AF37] text-2xl leading-none">×</button>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <span class="text-[#D4AF37] font-bold text-2xl">${fmt(p.price)}</span>
            <span class="text-[#737373] line-through">${fmt(p.oldPrice)}</span>
          </div>
          <p class="text-sm text-[#525252] leading-relaxed mt-3">${p.desc}</p>
          ${p.colors.length > 1 ? `<div class="mt-4"><p class="text-xs text-[#525252] mb-2">Color</p>
            <div class="flex flex-wrap gap-2" id="qv-colors">${p.colors.map((c, i) =>
              `<button onclick="qvPick('c','${c}')" data-qv="c" data-v="${c}" class="px-4 py-2 rounded-full text-sm border transition ${i === 0 ? "bg-[#D4AF37] text-white border-[#D4AF37] font-semibold" : "border-black/20 text-[#262626] hover:border-[#D4AF37]"}">${c}</button>`).join("")}</div></div>` : ""}
          <div class="mt-3"><p class="text-xs text-[#525252] mb-2">${"Size"}</p>
            <div class="flex flex-wrap gap-2" id="qv-sizes">${p.sizes.map((s, i) =>
              `<button onclick="qvPick('s','${s}')" data-qv="s" data-v="${s}" class="px-4 py-2 rounded-full text-sm border transition ${i === 0 ? "bg-[#D4AF37] text-white border-[#D4AF37] font-semibold" : "border-black/20 text-[#262626] hover:border-[#D4AF37]"}">${s}</button>`).join("")}</div></div>
          <div class="flex items-center gap-3 mt-5">
            <div class="flex items-center border border-black/20 rounded-full">
              <button onclick="qvQtyCh(-1)" class="w-10 h-11 text-lg text-[#262626] hover:text-[#D4AF37]">−</button>
              <span id="qv-qty" class="w-7 text-center font-semibold">1</span>
              <button onclick="qvQtyCh(1)" class="w-10 h-11 text-lg text-[#262626] hover:text-[#D4AF37]">+</button>
            </div>
            <button onclick="qvAdd()" class="flex-1 bg-[#D4AF37] text-black font-bold py-3 rounded-full hover:bg-[#B8860B] transition">Add to Cart</button>
            <button onclick="openWhatsAppOrder(qvId, qvColor, qvSize, qvQty)" aria-label="Order on WhatsApp"
              class="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center hover:bg-[#1fb857] transition shrink-0">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 019.88 9.89c0 5.45-4.44 9.88-9.89 9.88M20.5 3.49A11.8 11.8 0 0012.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.44-8.41"/></svg>
            </button>
            <button data-wish="${p.id}" onclick="toggleWish('${p.id}')" aria-label="Wishlist"
              class="wish-btn ${isWished(p.id) ? "wished" : ""} w-11 h-11 rounded-full border border-black/15 flex items-center justify-center hover:border-[#D4AF37] transition shrink-0">
              <svg class="w-5 h-5" fill="${isWished(p.id) ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/></svg>
            </button>
          </div>
          <a href="product.html?section=${p.section}&id=${p.id}" class="block text-center text-sm text-[#D4AF37] font-semibold mt-4 hover:underline">View full details →</a>
        </div>
      </div>`;
    document.getElementById("qv-overlay").style.display = "block";
    document.getElementById("qv-modal").style.display = "block";
    document.body.style.overflow = "hidden";
  };
  window.closeQuickView = function () {
    const o = document.getElementById("qv-overlay"), m = document.getElementById("qv-modal");
    if (o) o.style.display = "none";
    if (m) m.style.display = "none";
    document.body.style.overflow = "";
  };
  window.qvPick = function (kind, v) {
    if (kind === "c") qvColor = v; else qvSize = v;
    document.querySelectorAll('[data-qv="' + kind + '"]').forEach(b => {
      const on = b.getAttribute("data-v") === v;
      b.className = "px-4 py-2 rounded-full text-sm border transition " +
        (on ? "bg-[#D4AF37] text-white border-[#D4AF37] font-semibold" : "border-black/20 text-[#262626] hover:border-[#D4AF37]");
    });
  };
  window.qvQtyCh = function (d) {
    qvQty = Math.max(1, Math.min(9, qvQty + d));
    document.getElementById("qv-qty").textContent = qvQty;
  };
  window.qvAdd = function () {
    addToCart(qvId, qvQty, qvColor, qvSize);
    const p = PRODUCTS.find(p => p.id === qvId);
    closeQuickView();
    toast(p.name + " added to cart");
  };

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll("main section, body > section, #site-footer footer").forEach(s => {
    if (!s.closest("#cart-drawer") && !s.closest("#qv-modal")) { s.classList.add("reveal"); io.observe(s); }
  });

  /* ---------- back to top ---------- */
  const bt = document.createElement("button");
  bt.id = "back-top";
  bt.setAttribute("aria-label", "Back to top");
  bt.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>`;
  bt.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  document.body.appendChild(bt);
  window.addEventListener("scroll", () => {
    bt.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });
})();
