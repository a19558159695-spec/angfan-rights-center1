
async function loadProducts(){
  if(window.__products) return window.__products;
  const res = await fetch('/products.csv');
  const text = await res.text();
  const lines = parseCSV(text);
  const headers = lines.shift();
  const items = lines.map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = row[i] || "");
    obj.gallery = (obj.gallery_images || obj.main_image || "").split("|").filter(Boolean);
    obj.published = (obj.status || "").toLowerCase() === "published";
    obj.bullets = extractBullets(obj);
    obj.titleCount = (obj.title || "").length;
    obj.bulletCounts = obj.bullets.map(x => x.length);
    return obj;
  });
  window.__products = items;
  return items;
}
function parseCSV(text){
  const rows = [];
  let row = [], cur = "", inQuotes = false;
  for(let i=0;i<text.length;i++){
    const ch = text[i], next = text[i+1];
    if(ch === '"'){
      if(inQuotes && next === '"'){ cur += '"'; i++; }
      else inQuotes = !inQuotes;
    }else if(ch === ',' && !inQuotes){
      row.push(cur); cur = "";
    }else if((ch === '\n' || ch === '\r') && !inQuotes){
      if(ch === '\r' && next === '\n') i++;
      row.push(cur);
      if(row.length > 1 || row[0] !== "") rows.push(row);
      row = []; cur = "";
    }else{
      cur += ch;
    }
  }
  if(cur.length || row.length){ row.push(cur); rows.push(row); }
  return rows;
}
function escapeHtml(s=""){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function extractBullets(p){
  const direct = [p.bullet1,p.bullet2,p.bullet3,p.bullet4,p.bullet5].filter(Boolean);
  if(direct.length) return direct.map(cleanBrandWords).slice(0,5);
  let source = p.description || "";
  let items = source.includes("||") ? source.split("||") : source.split(/\.\s+/);
  items = items.map(x => cleanBrandWords(x.trim().replace(/\.$/, ""))).filter(Boolean).slice(0,5);
  while(items.length < 5) items.push("Add product selling point here.");
  return items;
}
function cleanBrandWords(text){
  if(!text) return "";
  return text
    .replace(/\bOkoey\b/ig, "ANGFAN")
    .replace(/\bANGFAN BRAND SHOP\b/ig, "ANGFAN")
    .trim();
}
function getParam(name){ return new URLSearchParams(location.search).get(name) || ""; }
function formatPrice(v){ return v || "$0.00"; }
function showToast(msg){
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}
function getStore(key){
  try{ return JSON.parse(localStorage.getItem(key) || "[]"); }catch(e){ return []; }
}
function setStore(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function getCart(){ return getStore("brandShopCart"); }
function setCart(v){ setStore("brandShopCart", v); }
function getWishlist(){ return getStore("brandShopWishlist"); }
function setWishlist(v){ setStore("brandShopWishlist", v); }
function getCompare(){ return getStore("brandShopCompare"); }
function setCompare(v){ setStore("brandShopCompare", v); }

async function renderHomeProducts(){
  const root = document.querySelector("#home-products");
  if(!root) return;
  const products = (await loadProducts()).filter(p => p.published).slice(0,8);
  root.innerHTML = products.map(cardHTML).join("");
}
function cardHTML(p){
  return `<a class="product-card" href="/product.html?slug=${encodeURIComponent(p.slug)}">
    <div class="thumb"><img src="${escapeHtml(p.main_image || '/main.svg')}" alt="${escapeHtml(p.title)}"></div>
    <div class="body">
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">SKU: ${escapeHtml(p.sku)} | ASIN: ${escapeHtml(p.asin)}</div>
      <div class="price">${escapeHtml(formatPrice(p.price))}</div>
    </div>
  </a>`;
}
async function renderProductGrid(){
  const root = document.querySelector("#product-grid");
  if(!root) return;
  const products = (await loadProducts()).filter(p => p.published);
  const q = getParam("q").toLowerCase();
  const cat = getParam("category");
  let list = products;
  if(q) list = list.filter(p => [p.title,p.sku,p.asin,p.category].join(" ").toLowerCase().includes(q));
  if(cat) list = list.filter(p => p.category === cat);
  root.innerHTML = list.length ? list.map(cardHTML).join("") : `<div class="empty-box">No products found.</div>`;
}

function countBadge(count,max){ return `<span class="bullet-counter">${count}/${max} chars</span>`; }

async function renderProductDetail(){
  const root = document.querySelector("#product-detail");
  if(!root) return;
  const slug = getParam("slug");
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug) || products.find(x => x.published) || products[0];
  if(!p){ root.innerHTML = '<div class="empty-box">No product found.</div>'; return; }

  const summary = p.bullets[0] || "Product detail summary.";
  const gallery = (p.gallery && p.gallery.length ? p.gallery : [p.main_image || "/main.svg"]).slice(0,4);
  root.innerHTML = `
  <div class="product-detail-layout">
    <div class="gallery-panel">
      <div class="main-image-wrap">
        <img id="mainProductImage" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(p.title)}">
      </div>
      <div class="thumb-row">
        ${gallery.map((img,idx)=>`<button class="thumb-card ${idx===0?'active':''}" type="button" onclick="switchMainImage('${escapeJs(img)}', this)">
            <img src="${escapeHtml(img)}" alt="thumb">
          </button>`).join("")}
      </div>
    </div>

    <div class="info-panel">
      <h1>${escapeHtml(p.title)} <span class="limit-tip">Amazon title limit helper</span></h1>
      <div class="char-line">Title characters: <strong>${p.titleCount}</strong>/200</div>

      <div class="meta-lines">
        <div><b>Brand</b> <span>${escapeHtml(p.brand || 'ANGFAN')}</span></div>
        <div><b>First Release Time</b> <span>${escapeHtml(p.first_release_time || '')}</span></div>
        <div><b>Copyright Information</b> <span>${escapeHtml((p.brand || 'ANGFAN') + ' Copyright belongs to ' + (p.copyright_owner || 'LUWANJUN'))}</span></div>
      </div>

      <div class="summary-box">${escapeHtml(summary)}</div>

      <div class="qty-row">
        <div class="qty-label">Qty</div>
        <div class="qty-box">
          <button type="button" onclick="changeQty(-1)">−</button>
          <input id="qtyInput" value="1" inputmode="numeric">
          <button type="button" onclick="changeQty(1)">+</button>
        </div>
      </div>

      <div class="action-row">
        <button class="btn-main" type="button" onclick="addToCart('${escapeJs(p.slug)}')">🛒 Add To Cart</button>
        <button class="btn-icon ${getWishlist().some(x=>x.slug===p.slug) ? 'active-heart':''}" id="wishBtn" type="button" onclick="toggleWishlist('${escapeJs(p.slug)}')">♡</button>
        <button class="btn-icon ${getCompare().some(x=>x.slug===p.slug) ? 'active-compare':''}" id="compareBtn" type="button" onclick="toggleCompare('${escapeJs(p.slug)}')">⇄</button>
      </div>

      <div class="options-section">
        <h2>Available Options</h2>
        <div class="option-field">
          <label>Product launch time:</label>
          <input value="${escapeHtml(p.first_release_time || '')}" readonly>
        </div>
      </div>
    </div>
  </div>

  <div class="details-tabs">
    <div class="tabs-head">
      <button class="active" type="button" onclick="switchTab(event, 'tab-bullets')">Five Bullet Points</button>
      <button type="button" onclick="switchTab(event, 'tab-details')">Product Details</button>
      <button type="button" onclick="switchTab(event, 'tab-meta')">Product Meta</button>
    </div>
    <div id="tab-bullets" class="tab-panel active">
      <ul class="bullet-list">
        ${p.bullets.map((b,idx)=>`<li><strong>Bullet ${idx+1}:</strong> ${escapeHtml(b)} ${countBadge((b||"").length, 500)}</li>`).join("")}
      </ul>
    </div>
    <div id="tab-details" class="tab-panel">
      <p><strong>Category:</strong> ${escapeHtml(p.category || '')}</p>
      <p><strong>SKU:</strong> ${escapeHtml(p.sku || '')}</p>
      <p><strong>ASIN:</strong> ${escapeHtml(p.asin || '')}</p>
      <p><strong>Price:</strong> ${escapeHtml(formatPrice(p.price))}</p>
      <p><strong>Status:</strong> ${escapeHtml(p.status || '')}</p>
    </div>
    <div id="tab-meta" class="tab-panel">
      <p><strong>Suggested title limit:</strong> up to 200 characters.</p>
      <p><strong>Suggested bullet limit:</strong> 5 bullets, each up to 500 characters.</p>
      <p><strong>Current title:</strong> ${p.titleCount}/200</p>
      ${p.bulletCounts.map((n,idx)=>`<p><strong>Bullet ${idx+1}:</strong> ${n}/500</p>`).join("")}
    </div>
  </div>
  `;
}
function escapeJs(str=""){ return String(str).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
function changeQty(delta){
  const input = document.getElementById("qtyInput");
  if(!input) return;
  let val = parseInt(input.value || "1", 10);
  if(isNaN(val)) val = 1;
  val = Math.max(1, val + delta);
  input.value = String(val);
}
function switchMainImage(src, btn){
  const img = document.getElementById("mainProductImage");
  if(img) img.src = src;
  document.querySelectorAll(".thumb-card").forEach(x => x.classList.remove("active"));
  if(btn) btn.classList.add("active");
}
function switchTab(ev, id){
  document.querySelectorAll(".tabs-head button").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(x => x.classList.remove("active"));
  ev.currentTarget.classList.add("active");
  const panel = document.getElementById(id);
  if(panel) panel.classList.add("active");
}
async function addToCart(slug){
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug);
  if(!p) return;
  const qty = Math.max(1, parseInt((document.getElementById("qtyInput") || {}).value || "1", 10) || 1);
  const cart = getCart();
  const found = cart.find(x => x.slug === slug);
  if(found) found.qty += qty;
  else cart.push({slug:p.slug,title:p.title,price:p.price,qty,main_image:p.main_image,sku:p.sku,asin:p.asin});
  setCart(cart);
  showToast("Added to cart");
  setTimeout(()=> location.href = "/cart.html", 420);
}
async function toggleWishlist(slug){
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug);
  if(!p) return;
  let items = getWishlist();
  const found = items.find(x => x.slug === slug);
  if(found){
    items = items.filter(x => x.slug !== slug);
    setWishlist(items);
    showToast("Removed from wishlist");
  }else{
    items.push({slug:p.slug,title:p.title,main_image:p.main_image,sku:p.sku,asin:p.asin});
    setWishlist(items);
    showToast("Added to wishlist");
  }
  setTimeout(()=> location.href = "/wishlist.html", 420);
}
async function toggleCompare(slug){
  const products = await loadProducts();
  const p = products.find(x => x.slug === slug);
  if(!p) return;
  let items = getCompare();
  const found = items.find(x => x.slug === slug);
  if(found){
    items = items.filter(x => x.slug !== slug);
    setCompare(items);
    showToast("Removed from compare");
  }else{
    items.push({slug:p.slug,title:p.title,main_image:p.main_image,sku:p.sku,asin:p.asin,category:p.category});
    setCompare(items);
    showToast("Added to compare");
  }
  setTimeout(()=> location.href = "/compare.html", 420);
}
async function renderCartPage(){
  const root = document.querySelector("#cart-page");
  if(!root) return;
  const items = getCart();
  if(!items.length){ root.innerHTML = '<div class="empty-box">Your cart is empty.</div>'; return; }
  root.innerHTML = `<table class="table-list">
    <thead><tr><th>Image</th><th>Product</th><th>Qty</th><th>Price</th><th>Remove</th></tr></thead>
    <tbody>
      ${items.map((x,i)=>`<tr>
        <td><img src="${escapeHtml(x.main_image || '/main.svg')}" alt=""></td>
        <td><strong>${escapeHtml(x.title)}</strong><br><span style="color:#6b7280">SKU: ${escapeHtml(x.sku || '')} | ASIN: ${escapeHtml(x.asin || '')}</span></td>
        <td>${x.qty}</td>
        <td>${escapeHtml(x.price || '$0.00')}</td>
        <td><button class="btn-icon" type="button" onclick="removeCartItem(${i})">×</button></td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}
function removeCartItem(i){
  const cart = getCart();
  cart.splice(i,1);
  setCart(cart);
  renderCartPage();
}
async function renderWishlistPage(){
  const root = document.querySelector("#wishlist-page");
  if(!root) return;
  const items = getWishlist();
  if(!items.length){ root.innerHTML = '<div class="empty-box">Your wishlist is empty.</div>'; return; }
  root.innerHTML = `<table class="table-list">
    <thead><tr><th>Image</th><th>Product</th><th>Action</th><th>Remove</th></tr></thead>
    <tbody>
      ${items.map((x,i)=>`<tr>
        <td><img src="${escapeHtml(x.main_image || '/main.svg')}" alt=""></td>
        <td><strong>${escapeHtml(x.title)}</strong><br><span style="color:#6b7280">SKU: ${escapeHtml(x.sku || '')} | ASIN: ${escapeHtml(x.asin || '')}</span></td>
        <td><a class="header-action" href="/product.html?slug=${encodeURIComponent(x.slug)}">View Product</a></td>
        <td><button class="btn-icon" type="button" onclick="removeWishlistItem(${i})">×</button></td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}
function removeWishlistItem(i){
  const items = getWishlist();
  items.splice(i,1);
  setWishlist(items);
  renderWishlistPage();
}
async function renderComparePage(){
  const root = document.querySelector("#compare-page");
  if(!root) return;
  const items = getCompare();
  if(!items.length){ root.innerHTML = '<div class="empty-box">No products selected for comparison.</div>'; return; }
  root.innerHTML = `<table class="table-list">
    <thead><tr><th>Image</th><th>Product</th><th>Category</th><th>Action</th><th>Remove</th></tr></thead>
    <tbody>
      ${items.map((x,i)=>`<tr>
        <td><img src="${escapeHtml(x.main_image || '/main.svg')}" alt=""></td>
        <td><strong>${escapeHtml(x.title)}</strong><br><span style="color:#6b7280">SKU: ${escapeHtml(x.sku || '')} | ASIN: ${escapeHtml(x.asin || '')}</span></td>
        <td>${escapeHtml(x.category || '')}</td>
        <td><a class="header-action" href="/product.html?slug=${encodeURIComponent(x.slug)}">View Product</a></td>
        <td><button class="btn-icon" type="button" onclick="removeCompareItem(${i})">×</button></td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}
function removeCompareItem(i){
  const items = getCompare();
  items.splice(i,1);
  setCompare(items);
  renderComparePage();
}
document.addEventListener("DOMContentLoaded", ()=>{
  renderHomeProducts();
  renderProductGrid();
  renderProductDetail();
  renderCartPage();
  renderWishlistPage();
  renderComparePage();
});
