/* TAJ LEATHERS — shared store logic (cart, promos, wishlist, reviews, orders) */
const BRAND = "TAJ LEATHERS";
const WA_NUMBER = "923148253657"; // Moiz's real WhatsApp number (2026-10-19)
const RELAY_URL = ""; // e.g. "https://taj-order-relay.onrender.com" — leave "" to disable auto-forward
const ORDER_API_URL = ""; // disabled 2026-10-19: VPS tunnel dead; WhatsApp is the order channel. Re-enable with a stable API URL when the backend is live.
const SHIP_FLAT = 200;

/* ---------- promos ---------- */
const PROMOS = {
  WELCOME10: { type: "pct",  value: 10,  desc: "10% off your order" },
  FLAT500:   { type: "flat", value: 500, min: 5000, desc: "Rs 500 off on orders over Rs 5,000" },
};
function getPromo() {
  try { return JSON.parse(localStorage.getItem("taj_promo") || "null"); }
  catch { return null; }
}
function setPromo(code) {
  code = (code || "").trim().toUpperCase();
  const cfg = PROMOS[code];
  if (!cfg) return { ok: false, msg: "Invalid promo code. Try WELCOME10." };
  const sub = cartTotal();
  if (cfg.min && sub < cfg.min)
    return { ok: false, msg: code + " needs a minimum order of " + fmt(cfg.min) + "." };
  localStorage.setItem("taj_promo", JSON.stringify({ code }));
  return { ok: true, msg: code + " applied — " + cfg.desc + "." };
}
function clearPromo() { localStorage.removeItem("taj_promo"); }
function promoDiscount(sub) {
  const pr = getPromo();
  if (!pr) return 0;
  const cfg = PROMOS[pr.code];
  if (!cfg) { clearPromo(); return 0; }
  if (cfg.min && sub < cfg.min) return 0;
  if (cfg.type === "pct") return Math.round(sub * cfg.value / 100);
  return Math.min(cfg.value, sub);
}
function shipCost(sub) { return sub >= FREE_SHIP_THRESHOLD || sub === 0 ? 0 : SHIP_FLAT; }
function orderTotals() {
  const sub = cartTotal();
  const discount = promoDiscount(sub);
  const ship = shipCost(sub); // free-ship promise evaluated on pre-discount subtotal
  return { sub, discount, ship, total: sub - discount + ship, promo: getPromo() };
}

/* ---------- cart ---------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem("taj_cart") || "[]"); }
  catch { return []; }
}
function saveCart(c) { localStorage.setItem("taj_cart", JSON.stringify(c)); }
function cartCount() { return getCart().reduce((n, i) => n + i.qty, 0); }
function cartTotal() {
  return getCart().reduce((s, i) => {
    const p = PRODUCTS.find(p => p.id === i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
}
function addToCart(id, qty = 1, color = null, size = null) {
  const cart = getCart();
  const key = id + "|" + (color || "") + "|" + (size || "");
  const found = cart.find(i => i.key === key);
  if (found) found.qty += qty;
  else cart.push({ key, id, qty, color, size });
  saveCart(cart); updateCartBadge();
  if (typeof renderDrawer === "function") renderDrawer();
}
function setQty(key, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter(i => i.key !== key);
  else { const f = cart.find(i => i.key === key); if (f) f.qty = qty; }
  saveCart(cart); updateCartBadge();
  if (typeof renderDrawer === "function") renderDrawer();
}
function clearCart() { saveCart([]); updateCartBadge(); }
function updateCartBadge() {
  document.querySelectorAll(".cart-count").forEach(el => {
    const n = cartCount();
    el.textContent = n; el.style.display = n > 0 ? "flex" : "none";
  });
}
const fmt = n => "Rs " + n.toLocaleString("en-PK");

/* ---------- wishlist ---------- */
function getWish() {
  try { return JSON.parse(localStorage.getItem("taj_wish") || "[]"); }
  catch { return []; }
}
function isWished(id) { return getWish().includes(id); }
function toggleWish(id) {
  const w = getWish();
  const on = !w.includes(id);
  localStorage.setItem("taj_wish", JSON.stringify(on ? [...w, id] : w.filter(x => x !== id)));
  updateWishBadge();
  document.querySelectorAll('[data-wish="' + id + '"]').forEach(b => {
    b.classList.toggle("wished", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const p = PRODUCTS.find(p => p.id === id);
  toast(on ? (p.name + " saved to wishlist") : (p.name + " removed from wishlist"));
}
function updateWishBadge() {
  document.querySelectorAll(".wish-count").forEach(el => {
    const n = getWish().length;
    el.textContent = n; el.style.display = n > 0 ? "flex" : "none";
  });
}

/* ---------- reviews ---------- */
function getReviews(id) {
  try { return (JSON.parse(localStorage.getItem("taj_reviews") || "{}"))[id] || []; }
  catch { return []; }
}
function addReview(id, name, stars, text) {
  let all = {};
  try { all = JSON.parse(localStorage.getItem("taj_reviews") || "{}"); } catch { all = {}; }
  (all[id] = all[id] || []).unshift({ name, stars, text, date: Date.now() });
  localStorage.setItem("taj_reviews", JSON.stringify(all));
}
function avgRating(id) {
  const r = getReviews(id);
  if (!r.length) return { avg: 0, count: 0 };
  return { avg: r.reduce((s, x) => s + x.stars, 0) / r.length, count: r.length };
}
function starsHTML(avg, count) {
  const pct = Math.max(0, Math.min(100, (avg / 5) * 100));
  return `<span class="relative inline-block leading-none whitespace-nowrap align-middle">
      <span class="text-[#d4d4d4]">★★★★★</span>
      <span class="absolute inset-0 overflow-hidden text-[#D4AF37] whitespace-nowrap" style="width:${pct}%">★★★★★</span>
    </span>` + (count ? `<span class="text-xs text-[#737373] ml-1.5 align-middle">(${count})</span>` : "");
}

/* ---------- recently viewed ---------- */
function pushRecent(id) {
  let r = [];
  try { r = JSON.parse(localStorage.getItem("taj_recent") || "[]"); } catch { r = []; }
  r = [id, ...r.filter(x => x !== id)].slice(0, 8);
  localStorage.setItem("taj_recent", JSON.stringify(r));
}
function getRecent() {
  try { return JSON.parse(localStorage.getItem("taj_recent") || "[]"); }
  catch { return []; }
}

/* ---------- orders ---------- */
function getOrders() {
  try { return JSON.parse(localStorage.getItem("taj_orders") || "[]"); }
  catch { return []; }
}
function saveOrder(o) {
  const a = getOrders();
  a.unshift(o);
  localStorage.setItem("taj_orders", JSON.stringify(a));
}
function findOrder(num) {
  const n = String(num || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!n) return null;
  return getOrders().find(o => String(o.num).toUpperCase().replace(/[^A-Z0-9]/g, "") === n) || null;
}

/* ---------- product card ---------- */
function productCard(p) {
  const r = avgRating(p.id);
  const wished = isWished(p.id);
  return `
  <div class="product-card group bg-[#fafafa] rounded-2xl overflow-hidden border border-black/5 hover:border-[#D4AF37]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(249,115,22,0.12)]">
    <div class="block relative overflow-hidden aspect-square">
      <a href="product.html?section=${p.section}&id=${p.id}" class="absolute inset-0" aria-label="${p.name}">
        <img src="assets/img/${p.img}" alt="${p.name}" loading="lazy"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
      </a>
      <span class="absolute top-3 left-3 bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none">${p.badge}</span>
      <div class="absolute top-3 right-3 flex flex-col gap-2">
        <button data-wish="${p.id}" onclick="event.preventDefault();toggleWish('${p.id}')" aria-pressed="${wished}" aria-label="Wishlist"
          class="wish-btn ${wished ? "wished" : ""} w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition">
          <svg class="w-[18px] h-[18px]" fill="${wished ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/></svg>
        </button>
        <button onclick="event.preventDefault();openQuickView('${p.id}')" aria-label="Quick view"
          class="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition text-[#262626] hover:text-[#D4AF37]">
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.1 12.1a1 1 0 010-.2 14.4 14.4 0 0119.8 0 1 1 0 010 .2 14.4 14.4 0 01-19.8 0z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <button onclick="event.preventDefault();quickAdd('${p.id}')"
            class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-sm font-semibold px-5 py-2 rounded-full whitespace-nowrap hover:bg-[#B8860B] transition shadow-lg">Quick Add +</button>
    </div>
    <div class="p-5">
      <p class="text-xs uppercase tracking-widest text-[#D4AF37] mb-1">${CATS[p.cat].name}</p>
      <a href="product.html?section=${p.section}&id=${p.id}"><h3 class="font-serif text-lg text-[#000000] hover:text-[#D4AF37] transition">${p.name}</h3></a>
      <div class="mt-1.5">${starsHTML(r.avg, r.count)}</div>
      <div class="mt-2 flex items-center gap-2">
        <span class="text-[#D4AF37] font-bold text-lg">${fmt(p.price)}</span>
        <span class="text-[#737373] line-through text-sm">${fmt(p.oldPrice)}</span>
      </div>
    </div>
  </div>`;
}
function quickAdd(id) {
  const p = PRODUCTS.find(p => p.id === id);
  addToCart(id, 1, p.colors[0], p.sizes[0]);
  toast(`${p.name} added to cart`);
}

/* ---------- toast ---------- */
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#000000] text-white font-semibold px-6 py-3 rounded-full shadow-2xl z-[100] transition-all duration-300 opacity-0 translate-y-4 text-sm";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove("opacity-0", "translate-y-4");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.add("opacity-0", "translate-y-4"), 2200);
}

/* ---------- shared chrome ---------- */
function renderChrome(active = "") {
  const nav = (href, label, key) =>
    `<a href="${href}" class="hover:text-[#D4AF37] transition ${active === key ? "text-[#D4AF37]" : "text-[#262626]"}">${label}</a>`;
  const searchIcon = `<button onclick="openSearch()" aria-label="Search" class="text-[#262626] hover:text-[#D4AF37] transition">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"/></svg></button>`;
  const wishIcon = `<a href="wishlist.html" aria-label="Wishlist" class="relative text-[#262626] hover:text-[#D4AF37] transition">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/></svg>
      <span class="wish-count absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] font-bold w-5 h-5 rounded-full items-center justify-center" style="display:none">0</span></a>`;
  const cartBtn = `<button onclick="openDrawer()" aria-label="Cart" class="relative text-[#262626] hover:text-[#D4AF37] transition">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H19M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
      <span class="cart-count absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] font-bold w-5 h-5 rounded-full items-center justify-center" style="display:none">0</span></button>`;

  document.getElementById("site-header").innerHTML = `
    <div class="bg-[#D4AF37] text-black text-center text-xs sm:text-sm font-semibold py-2 px-4">
      Free delivery on orders over ${fmt(FREE_SHIP_THRESHOLD)} &nbsp;·&nbsp; Use <span class="underline underline-offset-2 font-bold">WELCOME10</span> for 10% off
    </div>
    <nav class="bg-[#ffffff]/95 backdrop-blur border-b border-black/10 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="index.html" class="font-serif text-2xl tracking-wide text-[#000000]">TAJ <span class="gold-shine-text">LEATHERS</span></a>
        <div class="hidden md:flex items-center gap-8 text-sm font-medium">
          ${nav("index.html", "Home", "gateway")}
          ${nav("leathers.html", "Shop All", "leathers-home")}
          ${nav("category.html?section=leathers&cat=wallets", "Wallets", "wallets")}
          ${nav("category.html?section=leathers&cat=belts", "Belts", "belts")}
          ${nav("track.html", "Track Order", "track")}
        </div>
        <div class="flex items-center gap-4">
          ${searchIcon}${wishIcon}${cartBtn}
          <button id="menu-btn" class="md:hidden text-[#262626]" aria-label="Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <div id="mobile-menu" class="md:hidden hidden border-t border-black/10 px-4 py-3 flex flex-col gap-3 text-sm">
        ${nav("index.html", "Home", "gateway")}
        ${nav("leathers.html", "Shop All", "leathers-home")}
        ${nav("category.html?section=leathers&cat=wallets", "Wallets", "wallets")}
        ${nav("category.html?section=leathers&cat=belts", "Belts", "belts")}
        ${nav("wishlist.html", "Wishlist", "wishlist")}
        ${nav("track.html", "Track Order", "track")}
      </div>
    </nav>`;
  document.getElementById("menu-btn").addEventListener("click", () =>
    document.getElementById("mobile-menu").classList.toggle("hidden"));

  document.getElementById("site-footer").innerHTML = `
    <footer class="bg-[#fafafa] border-t border-black/10 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
        <div class="col-span-2 md:col-span-3 lg:col-span-1">
          <p class="font-serif text-2xl text-[#000000] mb-4">TAJ <span class="gold-shine-text">LEATHERS</span></p>
          <p class="text-[#525252] text-sm leading-relaxed mb-5">Premium handcrafted leather goods from Pakistan. Honest prices, honest quality.</p>
          <form class="foot-news flex gap-2" onsubmit="return footNews(event)">
            <input type="email" required placeholder="Email for 10% off" class="flex-1 min-w-0 bg-white border border-black/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]">
            <button class="bg-[#D4AF37] text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#B8860B] transition whitespace-nowrap">Join</button>
          </form>
          <p class="foot-news-ok hidden text-[#D4AF37] text-xs mt-2 font-medium">Welcome! Use code <strong>WELCOME10</strong> at checkout.</p>
        </div>
        <div>
          <p class="text-[#000000] font-semibold mb-4 text-sm uppercase tracking-widest">Shop</p>
          <div class="flex flex-col gap-2 text-sm text-[#525252]">
            <a href="leathers.html" class="hover:text-[#D4AF37]">Shop All</a>
            <a href="category.html?section=leathers&cat=belts" class="hover:text-[#D4AF37]">Belts</a>
            <a href="category.html?section=leathers&cat=wallets" class="hover:text-[#D4AF37]">Wallets</a>
          </div>
        </div>
        
        <div>
          <p class="text-[#000000] font-semibold mb-4 text-sm uppercase tracking-widest">Help</p>
          <div class="flex flex-col gap-2 text-sm text-[#525252]">
            <a href="track.html" class="hover:text-[#D4AF37]">Track Your Order</a>
            <a href="cart.html" class="hover:text-[#D4AF37]">Your Cart</a>
            <a href="wishlist.html" class="hover:text-[#D4AF37]">Wishlist</a>
            <a href="about.html" class="hover:text-[#D4AF37]">About Us</a>
            <a href="contact.html" class="hover:text-[#D4AF37]">Contact Us</a>
          </div>
        </div>
        <div>
          <p class="text-[#000000] font-semibold mb-4 text-sm uppercase tracking-widest">Policies</p>
          <div class="flex flex-col gap-2 text-sm text-[#525252]">
            <a href="shipping.html" class="hover:text-[#D4AF37]">Shipping & Delivery</a>
            <a href="returns.html" class="hover:text-[#D4AF37]">Returns & Exchange</a>
            <a href="privacy.html" class="hover:text-[#D4AF37]">Privacy Policy</a>
            <a href="terms.html" class="hover:text-[#D4AF37]">Terms & Conditions</a>
          </div>
        </div>
        <div>
          <p class="text-[#000000] font-semibold mb-4 text-sm uppercase tracking-widest">Contact</p>
          <div class="flex flex-col gap-2 text-sm text-[#525252]">
            <a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener" class="hover:text-[#D4AF37]">WhatsApp: +92 314 8253657</a>
            <span>Karachi, Pakistan</span>
          </div>
        </div>
      </div>
      <div class="border-t border-black/10 py-6 text-center text-xs text-[#737373] px-4">
        © 2026 TAJ LEATHERS. All rights reserved. Crafted with pride in Pakistan.
      </div>
    </footer>
    <a href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Assalam-o-Alaikum! I have a question about TAJ LEATHERS products.")}"
       target="_blank" rel="noopener" aria-label="Chat on WhatsApp"
       class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
      <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 019.88 9.89c0 5.45-4.44 9.88-9.89 9.88M20.5 3.49A11.8 11.8 0 0012.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.44-8.41"/></svg>
    </a>`;
  updateCartBadge();
  updateWishBadge();
  if (!document.getElementById("taj-ios-fix")) {
    const st = document.createElement("style");
    st.id = "taj-ios-fix";
    st.textContent = "@media (max-width: 640px){ input, textarea, select { font-size: 16px !important; } }";
    document.head.appendChild(st);
  }
}
function footNews(e) {
  e.preventDefault();
  const form = e.target;
  form.classList.add("hidden");
  form.parentElement.querySelector(".foot-news-ok").classList.remove("hidden");
  toast("Welcome! Use code WELCOME10 for 10% off.");
  return false;
}
document.addEventListener("DOMContentLoaded", () => { updateCartBadge(); updateWishBadge(); });

/* ---------- per-product "Order on WhatsApp" ---------- */
let _waCtx = null;
function openWhatsAppOrder(id, color, size, qty) {
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return;
  _waCtx = { p, color: color || p.colors[0], size: size || p.sizes[0], qty: Math.max(1, qty || 1) };
  let m = document.getElementById("wa-order-modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "wa-order-modal";
    document.body.appendChild(m);
  }
  const c = _waCtx;
  m.innerHTML = `
    <div class="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4" onclick="if(event.target===this)closeWhatsAppOrder()">
      <div class="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl max-h-[92dvh] overflow-auto">
        <div class="flex items-start justify-between mb-1">
          <h3 class="font-serif text-2xl text-[#000000]">Order on WhatsApp</h3>
          <button onclick="closeWhatsAppOrder()" class="text-[#737373] hover:text-[#D4AF37] text-2xl leading-none">×</button>
        </div>
        <p class="text-sm text-[#525252] mb-4">Fill this in — WhatsApp will open with your order ready to send.</p>
        <div class="flex gap-3 items-center bg-[#fafafa] rounded-2xl p-3 mb-5">
          <img src="assets/img/${c.p.img}" alt="" class="w-14 h-14 object-cover rounded-xl">
          <div class="min-w-0">
            <p class="font-semibold text-sm text-[#000000] truncate">${c.p.name}</p>
            <p class="text-xs text-[#525252]">${SECTIONS[c.p.section].name} · ${c.color} / ${c.size} · Qty <span id="wa-qty-show">${c.qty}</span></p>
            <p class="text-sm text-[#D4AF37] font-bold" id="wa-total-show">${fmt(c.p.price * c.qty)}</p>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-semibold text-[#262626] uppercase tracking-wider">Your name *</label>
            <input id="wa-f-name" type="text" placeholder="e.g. Ahmed Raza" class="mt-1 w-full border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#25D366]">
          </div>
          <div>
            <label class="text-xs font-semibold text-[#262626] uppercase tracking-wider">Phone *</label>
            <input id="wa-f-phone" type="tel" placeholder="03XXXXXXXXX" class="mt-1 w-full border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#25D366]">
          </div>
          <div>
            <label class="text-xs font-semibold text-[#262626] uppercase tracking-wider">City / Area *</label>
            <input id="wa-f-city" type="text" placeholder="e.g. DHA Phase 5, Lahore" class="mt-1 w-full border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#25D366]">
          </div>
          <div>
            <label class="text-xs font-semibold text-[#262626] uppercase tracking-wider">Full address *</label>
            <input id="wa-f-addr" type="text" placeholder="House / street" class="mt-1 w-full border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#25D366]">
          </div>
          <div>
            <label class="text-xs font-semibold text-[#262626] uppercase tracking-wider">Nearest landmark <span class="text-[#737373] font-normal">(optional)</span></label>
            <input id="wa-f-landmark" type="text" placeholder="e.g. Near Dolmen Mall" class="mt-1 w-full border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#25D366]">
          </div>
          <div>
            <label class="text-xs font-semibold text-[#262626] uppercase tracking-wider">Promo code <span class="text-[#737373] font-normal">(optional)</span></label>
            <div class="mt-1 flex gap-2">
              <input id="wa-f-promo" type="text" placeholder="e.g. WELCOME10" class="flex-1 min-w-0 border border-black/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#25D366]">
              <button onclick="waApplyPromo()" class="bg-[#000000] text-black text-sm font-semibold px-5 rounded-xl hover:bg-[#D4AF37] transition whitespace-nowrap">Apply</button>
            </div>
            <p id="wa-promo-ok" class="hidden text-xs text-green-600 mt-1.5 font-medium">Code noted — mention it in chat and we will apply your discount manually.</p>
            <p id="wa-promo-bad" class="hidden text-xs text-red-600 mt-1.5">That code is not valid.</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-[#262626] uppercase tracking-wider">Quantity</label>
            <div class="mt-1 flex items-center border border-black/15 rounded-xl w-32">
              <button onclick="waChQty(-1)" class="w-10 h-10 text-lg text-[#262626]">−</button>
              <span id="wa-f-qty" class="flex-1 text-center font-semibold">${c.qty}</span>
              <button onclick="waChQty(1)" class="w-10 h-10 text-lg text-[#262626]">+</button>
            </div>
          </div>
          <p id="wa-f-err" class="hidden text-xs text-red-600">Please fill name, a valid phone number (10–12 digits), city/area and full address.</p>
          <button onclick="submitWhatsAppOrder()" class="w-full bg-[#25D366] hover:bg-[#1fb857] text-white font-bold py-3.5 rounded-full transition flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 019.88 9.89c0 5.45-4.44 9.88-9.89 9.88M20.5 3.49A11.8 11.8 0 0012.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.44-8.41"/></svg>
            Send Order via WhatsApp
          </button>
        </div>
      </div>
    </div>`;
  m.style.display = "block";
  document.body.style.overflow = "hidden";
}
function closeWhatsAppOrder() {
  const m = document.getElementById("wa-order-modal");
  if (m) m.style.display = "none";
  document.body.style.overflow = "";
  _waCtx = null;
}
function waChQty(d) {
  if (!_waCtx) return;
  _waCtx.qty = Math.max(1, Math.min(9, _waCtx.qty + d));
  document.getElementById("wa-f-qty").textContent = _waCtx.qty;
  document.getElementById("wa-qty-show").textContent = _waCtx.qty;
  document.getElementById("wa-total-show").textContent = fmt(_waCtx.p.price * _waCtx.qty);
}
function waApplyPromo() {
  const el = document.getElementById("wa-f-promo");
  const v = (el.value || "").trim().toUpperCase();
  const ok = v === "WELCOME10";
  document.getElementById("wa-promo-ok").classList.toggle("hidden", !ok);
  document.getElementById("wa-promo-bad").classList.toggle("hidden", ok || !v);
  if (_waCtx) _waCtx.promo = ok ? v : "";
}
function submitWhatsAppOrder() {
  if (!_waCtx) return;
  const name = document.getElementById("wa-f-name").value.trim();
  const phone = document.getElementById("wa-f-phone").value.trim();
  const city = document.getElementById("wa-f-city").value.trim();
  const addr = document.getElementById("wa-f-addr").value.trim();
  const landmark = document.getElementById("wa-f-landmark").value.trim();
  const digits = phone.replace(/\D/g, "");
  const bad = !(name.length >= 2 && digits.length >= 10 && digits.length <= 12 && city.length >= 2 && addr.length >= 3);
  document.getElementById("wa-f-err").classList.toggle("hidden", !bad);
  if (bad) return;
  const c = _waCtx;
  const lines = [
    "NEW ORDER — TAJ LEATHERS",
    "Product: " + c.p.name + " (" + SECTIONS[c.p.section].name + ")",
    "Variant: " + c.color + " / " + c.size,
    "Qty: " + c.qty + " — Price: " + fmt(c.p.price * c.qty),
    "----",
    "Name: " + name,
    "Phone: " + phone,
    "Location: " + city,
    "Address: " + addr,
    "Landmark: " + (landmark || "—"),
    "Promo: ",
  ];
  window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
  closeWhatsAppOrder();
  toast("Opening WhatsApp — just tap Send!");
}

/* ---------- order API auto-forward (fire-and-forget) ---------- */
function forwardOrderToApi(order) {
  if (!ORDER_API_URL) return;
  try {
    fetch(ORDER_API_URL.replace(/\/$/, "") + "/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: order.num,
        name: order.name, phone: order.phone, email: order.email || "",
        city: order.city, address: order.addr, notes: order.notes || "",
        items: order.items.map(it => ({ name: it.name, variant: it.variant, qty: it.qty, price: it.price })),
        subtotal: order.sub, discount: order.discount, total: order.total,
        payment_method: "COD", source: "taj-leathers-checkout",
      }),
    }).catch(() => {});
  } catch (e) {}
}

/* ---------- remote product catalog (admin-managed, baked-in fallback) ---------- */
(function syncRemoteCatalog() {
  if (!ORDER_API_URL || typeof PRODUCTS === "undefined") return;
  fetch(ORDER_API_URL.replace(/\/$/, "") + "/api/products")
    .then(r => (r.ok ? r.json() : null))
    .then(d => {
      if (!d || !d.ok || !Array.isArray(d.products) || !d.products.length) return;
      const mapped = d.products.map(p => ({
        id: p.id, name: p.name, price: p.price, oldPrice: p.old_price,
        cat: p.category, section: p.section,
        img: String(p.image || "").replace(/^assets\/img\//, ""),
        desc: p.description, badge: p.badge,
        colors: (p.colors && p.colors.length) ? p.colors : ["Standard"],
        sizes: (p.sizes && p.sizes.length) ? p.sizes : ["Standard"],
      }));
      PRODUCTS.length = 0;
      mapped.forEach(p => PRODUCTS.push(p));
      document.dispatchEvent(new Event("taj:catalog-updated"));
    })
    .catch(() => {}); // offline/API down → baked-in catalog stays
})();
function forwardOrderToRelay(order) {
  if (!RELAY_URL) return;
  try {
    fetch(RELAY_URL.replace(/\/$/, "") + "/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: order.num,
        items: order.items.map(it => ({ name: it.name, variant: it.variant, qty: it.qty, price: it.price })),
        subtotal: order.sub, discount: order.discount, shipping: order.ship, total: order.total,
        customer: { name: order.name, phone: order.phone, address: order.addr, city: order.city },
        source: "taj-leathers-checkout",
      }),
    }).catch(() => {});
  } catch (e) {}
}
