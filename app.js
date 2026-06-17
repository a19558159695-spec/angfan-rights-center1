
const SITE_NAME = "ANGFAN ANGFAN BRAND SHOP";
const RIGHTS_OWNER = "LUWANJUN";
const RIGHTS_EMAIL = "ANGFANBRAND163@163.COM";
const CSV_URL = "/products.csv";

document.addEventListener("contextmenu", e => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
document.addEventListener("dragstart", e => {
  if (e.target.tagName === "IMG") e.preventDefault();
});

function escapeAttr(s){ return String(s || '').replace(/'/g, "&#39;").replace(/"/g, '&quot;'); }

function escapeHtml(s){
  return String(s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function parseCSV(text){
  const rows=[]; let row=[], cell="", q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c === '"' && q && n === '"'){ cell += '"'; i++; }
    else if(c === '"') q = !q;
    else if(c === "," && !q){ row.push(cell); cell=""; }
    else if((c === "\n" || c === "\r") && !q){
      if(cell.length || row.length){ row.push(cell); rows.push(row); row=[]; cell=""; }
      if(c === "\r" && n === "\n") i++;
    } else cell += c;
  }
  if(cell.length || row.length){ row.push(cell); rows.push(row); }
  const headers = rows.shift().map(h=>h.trim());
  return rows.filter(r=>r.join("").trim()).map(r=>{
    const obj={}; headers.forEach((h,i)=>obj[h]=(r[i]||"").trim()); return obj;
  });
}

async function loadProducts(){
  const res = await fetch(CSV_URL, {cache:"no-store"});
  const text = await res.text();
  return parseCSV(text).filter(p => (p.status || "published").toLowerCase() === "published");
}

function productUrl(p){ return `/product.html?slug=${encodeURIComponent(p.slug)}`; }

function productCard(p){
  return `<a class="product-card" href="${productUrl(p)}">
    <img src="${escapeHtml(p.main_image || '/main.svg')}" alt="${escapeHtml(p.title)}">
    <div class="product-card-body">
      <div style="color:#777;font-size:13px">${escapeHtml(p.category)} · SKU ${escapeHtml(p.sku)}</div>
      <h3>${escapeHtml(p.title)}</h3>
      <div class="price">${escapeHtml(p.price || '')}</div>
      <span class="tag">Product Display</span>
    </div>
  </a>`;
}

async function renderHome(){
  const el = document.querySelector("#home-products");
  if(!el) return;
  const products = await loadProducts();
  el.innerHTML = products.slice(0,8).map(productCard).join("") || "<p>No products yet.</p>";
}

async function renderProducts(){
  const grid = document.querySelector("#product-grid");
  if(!grid) return;
  let products = await loadProducts();
  const params = new URLSearchParams(location.search);
  const q = (params.get("q") || "").toLowerCase();
  const cat = params.get("category") || "";
  if(cat) products = products.filter(p => p.category === cat);
  if(q) products = products.filter(p => (p.title+" "+p.brand+" "+p.sku+" "+p.asin+" "+p.description).toLowerCase().includes(q));
  grid.innerHTML = products.map(productCard).join("") || "<p>No products found.</p>";
}

async function renderProduct(){
  const root = document.querySelector("#product-detail");
  if(!root) return;
  const slug = new URLSearchParams(location.search).get("slug");
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug) || products[0];
  if(!p){ root.innerHTML = "<p>Product not found.</p>"; return; }
  document.title = `${p.title} - ${SITE_NAME}`;
  const imgs = (p.gallery_images || p.main_image || "/main.svg").split("|").map(x=>x.trim()).filter(Boolean);
  root.innerHTML = `
    <div class="breadcrumb">Home / ${escapeHtml(p.category)} / ${escapeHtml(p.title)}</div>
    <div class="product-layout">
      <div>
        <div class="gallery-main"><img id="mainPhoto" src="${escapeHtml(imgs[0])}" alt="${escapeHtml(p.title)}"></div>
        <div class="thumbs">${imgs.map(src => `<img src="${escapeHtml(src)}" onclick="document.getElementById('mainPhoto').src=this.src">`).join("")}</div>
      </div>
      <div class="product-info">
        <h1>${escapeHtml(p.title)}</h1>
        <div class="rating">★★★★★ <span style="color:#777">Product Details</span></div>
        <div class="info-line"><b>Brand</b><span>${escapeHtml(p.brand || SITE_NAME)}</span></div>
        <div class="info-line"><b>SKU</b><span>${escapeHtml(p.sku)}</span></div>
        <div class="info-line"><b>ASIN</b><span>${escapeHtml(p.asin)}</span></div>
        <div class="info-line"><b>Launch Time</b><span>${escapeHtml(p.first_release_time)}</span></div>
        <div class="info-line"><b>Copyright Information</b><span>Copyright belongs to ${RIGHTS_OWNER}</span></div>
        <div class="description">${escapeHtml(p.description)}</div>
        <div class="qty-row">
          <b>Qty</b>
          <div class="qty-box"><button onclick="let q=document.getElementById('qty');q.value=Math.max(1,+q.value-1)">-</button><input id="qty" value="1"><button onclick="let q=document.getElementById('qty');q.value=+q.value+1">+</button></div>
        </div>
        <div class="actions">
          <button class="btn" onclick="addToCart(\`${p.slug}\`)">🛒 Add To Cart</button>
          <button class="btn icon" id="wishlistBtn" onclick="toggleWishlist(`${p.slug}`)">♡</button>
          <button class="btn icon" id="compareBtn" onclick="toggleCompare(`${p.slug}`)">⇄</button>
        </div>
        <div class="options">
          <h2>Available Options</h2>
          <div class="option-field">
            <label><span style="color:#dc2626">*</span> Product launch time:</label>
            <input value="${escapeHtml(p.first_release_time)}" readonly>
          </div>
        </div>
      </div>
    </div>
    <div class="tabs">
      <div class="tab-head"><div>Description</div><div>Product Information</div></div>
      <div class="tab-body">
        <p>${escapeHtml(p.description)}</p>
        <p><b>Customer Service:</b> ${RIGHTS_EMAIL}</p>
        <p>For more product information, please contact customer service.</p>
      </div>
    </div>`;
}


function getCart(){
  try { return JSON.parse(localStorage.getItem("brandShopCart") || "[]"); }
  catch(e) { return []; }
}

function saveCart(cart){
  localStorage.setItem("brandShopCart", JSON.stringify(cart));
}

async function addToCart(slug){
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug);
  if(!p) return;
  const qtyInput = document.getElementById("qty");
  const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : "1", 10) || 1);
  const cart = getCart();
  const existing = cart.find(item => item.slug === slug);
  if(existing) existing.qty += qty;
  else cart.push({
    slug: p.slug,
    title: p.title,
    sku: p.sku,
    asin: p.asin,
    price: p.price,
    image: p.main_image || "/main.svg",
    qty
  });
  saveCart(cart);
  showToast("Added to cart");
  setTimeout(() => { window.location.href = "/cart.html"; }, 450);
}

function removeCartItem(slug){
  const cart = getCart().filter(item => item.slug !== slug);
  saveCart(cart);
  renderCartPage();
}

function clearCart(){
  saveCart([]);
  renderCartPage();
}

function showToast(message){
  const old = document.querySelector(".toast");
  if(old) old.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function renderCartPage(){
  const root = document.querySelector("#cart-page");
  if(!root) return;
  const cart = getCart();
  if(!cart.length){
    root.innerHTML = `<div class="cart-empty">Your cart is empty. <a href="/products.html" style="color:#2563eb">View products</a></div>`;
    return;
  }
  const rows = cart.map(item => `
    <tr>
      <td><img src="${escapeHtml(item.image)}" alt=""></td>
      <td><b>${escapeHtml(item.title)}</b><br><span style="color:#666">SKU: ${escapeHtml(item.sku)} | ASIN: ${escapeHtml(item.asin)}</span></td>
      <td>${escapeHtml(item.price || "")}</td>
      <td>${item.qty}</td>
      <td><button class="btn icon" onclick="removeCartItem('${escapeAttr(item.slug)}')">×</button></td>
    </tr>`).join("");
  const inquiry = cart.map(item => `${item.title} | SKU: ${item.sku} | ASIN: ${item.asin} | Qty: ${item.qty}`).join("%0A");
  root.innerHTML = `
    <table class="cart-table">
      <thead><tr><th>Image</th><th>Product</th><th>Price</th><th>Qty</th><th>Remove</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="cart-actions">
      <a class="btn" href="mailto:ANGFANBRAND163@163.COM?subject=Product Inquiry - ANGFAN BRAND SHOP&body=${inquiry}">Send Inquiry</a>
      <a class="btn icon" href="/products.html" title="Continue shopping">+</a>
      <button class="btn icon" onclick="clearCart()" title="Clear cart">🗑</button>
    </div>`;
}



function getWishlist(){
  try { return JSON.parse(localStorage.getItem("brandShopWishlist") || "[]"); }
  catch(e){ return []; }
}
function saveWishlist(items){ localStorage.setItem("brandShopWishlist", JSON.stringify(items)); }
function getCompare(){
  try { return JSON.parse(localStorage.getItem("brandShopCompare") || "[]"); }
  catch(e){ return []; }
}
function saveCompare(items){ localStorage.setItem("brandShopCompare", JSON.stringify(items)); }

async function toggleWishlist(slug){
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug);
  if(!p) return;
  let items = getWishlist();
  const exists = items.find(x => x.slug === slug);
  if(exists){
    items = items.filter(x => x.slug !== slug);
    saveWishlist(items);
    updateActionButtonStates(slug);
    showToast("Removed from wishlist");
    setTimeout(() => { window.location.href = "/wishlist.html"; }, 450);
  }else{
    items.push({slug:p.slug,title:p.title});
    saveWishlist(items);
    updateActionButtonStates(slug);
    showToast("Added to wishlist");
    setTimeout(() => { window.location.href = "/wishlist.html"; }, 450);
  }
}

async function toggleCompare(slug){
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug);
  if(!p) return;
  let items = getCompare();
  const exists = items.find(x => x.slug === slug);
  if(exists){
    items = items.filter(x => x.slug !== slug);
    saveCompare(items);
    updateActionButtonStates(slug);
    showToast("Removed from compare");
    setTimeout(() => { window.location.href = "/compare.html"; }, 450);
  }else{
    items.push({slug:p.slug,title:p.title});
    saveCompare(items);
    updateActionButtonStates(slug);
    showToast("Added to compare");
    setTimeout(() => { window.location.href = "/compare.html"; }, 450);
  }
}

function updateActionButtonStates(slug){
  const wish = getWishlist().some(x => x.slug === slug);
  const compare = getCompare().some(x => x.slug === slug);
  const wb = document.getElementById("wishlistBtn");
  const cb = document.getElementById("compareBtn");
  if(wb) wb.classList.toggle("active-heart", wish);
  if(cb) cb.classList.toggle("active-compare", compare);
}



async function renderWishlistPage(){
  const root = document.querySelector("#wishlist-page");
  if(!root) return;
  const items = getWishlist();
  if(!items.length){
    root.innerHTML = `<div class="cart-empty">Your wishlist is empty. <a href="/products.html" style="color:#2563eb">View products</a></div>`;
    return;
  }
  const products = await loadProducts();
  const rows = items.map(item => {
    const p = products.find(x => x.slug === item.slug) || item;
    return `<tr>
      <td><img src="${escapeHtml(p.main_image || '/main.svg')}" alt=""></td>
      <td><b>${escapeHtml(p.title)}</b><br><span style="color:#666">SKU: ${escapeHtml(p.sku || '')} | ASIN: ${escapeHtml(p.asin || '')}</span></td>
      <td><a class="btn" href="/product.html?slug=${encodeURIComponent(p.slug)}">View Product</a></td>
      <td><button class="btn icon" onclick="removeWishlistItem('${escapeAttr(p.slug)}')">×</button></td>
    </tr>`;
  }).join("");
  root.innerHTML = `<table class="cart-table">
    <thead><tr><th>Image</th><th>Product</th><th>Action</th><th>Remove</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function removeWishlistItem(slug){
  saveWishlist(getWishlist().filter(item => item.slug !== slug));
  renderWishlistPage();
}

async function renderComparePage(){
  const root = document.querySelector("#compare-page");
  if(!root) return;
  const items = getCompare();
  if(!items.length){
    root.innerHTML = `<div class="cart-empty">No products selected for comparison. <a href="/products.html" style="color:#2563eb">View products</a></div>`;
    return;
  }
  const products = await loadProducts();
  const rows = items.map(item => {
    const p = products.find(x => x.slug === item.slug) || item;
    return `<tr>
      <td><img src="${escapeHtml(p.main_image || '/main.svg')}" alt=""></td>
      <td><b>${escapeHtml(p.title)}</b><br><span style="color:#666">Category: ${escapeHtml(p.category || '')}</span></td>
      <td>SKU: ${escapeHtml(p.sku || '')}<br>ASIN: ${escapeHtml(p.asin || '')}</td>
      <td><a class="btn" href="/product.html?slug=${encodeURIComponent(p.slug)}">View Product</a></td>
      <td><button class="btn icon" onclick="removeCompareItem('${escapeAttr(p.slug)}')">×</button></td>
    </tr>`;
  }).join("");
  root.innerHTML = `<table class="cart-table">
    <thead><tr><th>Image</th><th>Product</th><th>Info</th><th>Action</th><th>Remove</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function removeCompareItem(slug){
  saveCompare(getCompare().filter(item => item.slug !== slug));
  renderComparePage();
}


document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderProducts();
  renderProduct();
  setTimeout(() => { const slug = new URLSearchParams(location.search).get('slug'); if (slug) updateActionButtonStates(slug); }, 50);
  renderCartPage();
  renderWishlistPage();
  renderComparePage();
});
