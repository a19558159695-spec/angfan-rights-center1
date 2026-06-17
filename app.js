
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
      <span class="tag">产品展示</span>
    </div>
  </a>`;
}

async function renderHome(){
  const el = document.querySelector("#home-products");
  if(!el) return;
  const products = await loadProducts();
  el.innerHTML = products.slice(0,8).map(productCard).join("") || "<p>暂无产品。</p>";
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
  grid.innerHTML = products.map(productCard).join("") || "<p>未找到产品。</p>";
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
    <div class="breadcrumb">首页 / ${escapeHtml(p.category)} / ${escapeHtml(p.title)}</div>
    <div class="product-layout">
      <div>
        <div class="gallery-main"><img id="mainPhoto" src="${escapeHtml(imgs[0])}" alt="${escapeHtml(p.title)}"></div>
        <div class="thumbs">${imgs.map(src => `<img src="${escapeHtml(src)}" onclick="document.getElementById('mainPhoto').src=this.src">`).join("")}</div>
      </div>
      <div class="product-info">
        <h1>${escapeHtml(p.title)}</h1>
        <div class="rating">★★★★★ <span style="color:#777">产品详情</span></div>
        <div class="info-line"><b>品牌</b><span>${escapeHtml(p.brand || SITE_NAME)}</span></div>
        <div class="info-line"><b>SKU</b><span>${escapeHtml(p.sku)}</span></div>
        <div class="info-line"><b>ASIN</b><span>${escapeHtml(p.asin)}</span></div>
        <div class="info-line"><b>上架时间</b><span>${escapeHtml(p.first_release_time)}</span></div>
        <div class="info-line"><b>版权信息</b><span>Copyright belongs to ${RIGHTS_OWNER}</span></div>
        <div class="description">${escapeHtml(p.description)}</div>
        <div class="qty-row">
          <b>数量</b>
          <div class="qty-box"><button onclick="let q=document.getElementById('qty');q.value=Math.max(1,+q.value-1)">-</button><input id="qty" value="1"><button onclick="let q=document.getElementById('qty');q.value=+q.value+1">+</button></div>
        </div>
        <div class="actions">
          <button class="btn" onclick="addToCart(\`${p.slug}\`)">🛒 加入购物车</button>
          <button class="btn icon">♡</button>
          <button class="btn icon">⇄</button>
        </div>
        <div class="options">
          <h2>产品选项</h2>
          <div class="option-field">
            <label><span style="color:#dc2626">*</span> 产品上架时间：</label>
            <input value="${escapeHtml(p.first_release_time)}" readonly>
          </div>
        </div>
      </div>
    </div>
    <div class="tabs">
      <div class="tab-head"><div>产品描述</div><div>产品信息</div></div>
      <div class="tab-body">
        <p>${escapeHtml(p.description)}</p>
        <p><b>客服邮箱：</b> ${RIGHTS_EMAIL}</p>
        <p>如需更多产品信息，请联系客户服务。</p>
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
  showToast("已加入购物车");
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
    root.innerHTML = `<div class="cart-empty">购物车为空。<a href="/products.html" style="color:#2563eb">查看产品</a></div>`;
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
      <thead><tr><th>图片</th><th>产品</th><th>价格</th><th>数量</th><th>移除</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="cart-actions">
      <a class="btn" href="mailto:ANGFANBRAND163@163.COM?subject=产品咨询 - ANGFAN 品牌店&body=${inquiry}">发送询盘</a>
      <a class="btn icon" href="/products.html" title="Continue shopping">+</a>
      <button class="btn icon" onclick="clearCart()" title="Clear cart">🗑</button>
    </div>`;
}


document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderProducts();
  renderProduct();
  renderCartPage();
});
