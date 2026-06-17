
const CONFIG = {
  // If you publish Google Sheets as CSV, paste the CSV URL here.
  // Example: https://docs.google.com/spreadsheets/d/e/xxxx/pub?output=csv
  googleSheetCsvUrl: "",
  localCsvUrl: "/products.csv",
  siteName: "BRAND SHOP"
};

document.addEventListener("contextmenu", e => {
  if (e.target.tagName === "IMG") e.preventDefault();
});
document.addEventListener("dragstart", e => {
  if (e.target.tagName === "IMG") e.preventDefault();
});

function parseCSV(text){
  const rows=[]; let row=[], cell="", q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c === '"' && q && n === '"'){ cell += '"'; i++; }
    else if(c === '"'){ q = !q; }
    else if(c === "," && !q){ row.push(cell); cell=""; }
    else if((c === "\n" || c === "\r") && !q){
      if(cell.length || row.length){ row.push(cell); rows.push(row); row=[]; cell=""; }
      if(c === "\r" && n === "\n") i++;
    } else cell += c;
  }
  if(cell.length || row.length){ row.push(cell); rows.push(row); }
  const headers = rows.shift().map(h=>h.trim());
  return rows.filter(r=>r.length && r.join("").trim()).map(r=>{
    const obj={}; headers.forEach((h,i)=>obj[h]=(r[i]||"").trim()); return obj;
  });
}
async function loadProducts(){
  const url = CONFIG.googleSheetCsvUrl || CONFIG.localCsvUrl;
  const res = await fetch(url, {cache:"no-store"});
  const text = await res.text();
  return parseCSV(text).filter(p => (p.status || "published").toLowerCase() === "published");
}
function imgUrl(path){ return path || "/main.svg"; }
function productLink(p){ return `/product.html?slug=${encodeURIComponent(p.slug)}`; }
function productCard(p){
  return `<a class="card" href="${productLink(p)}">
    <img class="product-img" src="${imgUrl(p.main_image)}" alt="${escapeHtml(p.title)}" loading="lazy">
    <div class="card-body">
      <div class="meta">${escapeHtml(p.brand)} · ${escapeHtml(p.category)}</div>
      <h3>${escapeHtml(p.title)}</h3>
      <div class="tag">${escapeHtml(p.sku || "Original Content")}</div>
    </div>
  </a>`;
}
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

async function renderHome(){
  const el = document.querySelector("#featured-products");
  if(!el) return;
  const products = await loadProducts();
  el.innerHTML = products.slice(0,8).map(productCard).join("") || "<p>No products yet.</p>";
  renderCategoryLinks(products);
}
function renderCategoryLinks(products){
  const box=document.querySelector("#category-links"); if(!box) return;
  const cats=[...new Set(products.map(p=>p.category).filter(Boolean))];
  box.innerHTML=cats.map(c=>`<a class="filter-btn" href="/products.html?category=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`).join("");
}
async function renderProducts(){
  const grid = document.querySelector("#product-grid");
  if(!grid) return;
  let products = await loadProducts();
  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "";
  const search = (params.get("q") || "").toLowerCase();
  const cats=[...new Set(products.map(p=>p.category).filter(Boolean))];
  const filters=document.querySelector("#filters");
  if(filters){
    filters.innerHTML = `<a class="filter-btn ${!category?'active':''}" href="/products.html">All</a>` + 
      cats.map(c=>`<a class="filter-btn ${category===c?'active':''}" href="/products.html?category=${encodeURIComponent(c)}">${escapeHtml(c)}</a>`).join("");
  }
  if(category) products = products.filter(p=>p.category===category);
  if(search) products = products.filter(p=>(p.title+" "+p.brand+" "+p.sku+" "+p.asin+" "+p.description).toLowerCase().includes(search));
  grid.innerHTML = products.map(productCard).join("") || "<p>No products found.</p>";
}
async function renderProductDetail(){
  const root=document.querySelector("#product-detail");
  if(!root) return;
  const slug=new URLSearchParams(location.search).get("slug");
  const products=await loadProducts();
  const p=products.find(x=>x.slug===slug) || products[0];
  if(!p){ root.innerHTML="<p>Product not found.</p>"; return; }
  document.title = `${p.title} - ${CONFIG.siteName}`;
  const gallery=(p.gallery_images||p.main_image||"").split("|").map(s=>s.trim()).filter(Boolean);
  const imgs = gallery.length ? gallery : [p.main_image];
  root.innerHTML = `<div class="product-page">
    <div class="gallery">
      <img id="main-photo" class="main-photo" src="${imgUrl(imgs[0])}" alt="${escapeHtml(p.title)}">
      <div class="thumbs">${imgs.map(src=>`<img src="${imgUrl(src)}" onclick="document.getElementById('main-photo').src=this.src" alt="">`).join("")}</div>
    </div>
    <div class="details">
      <div class="tag">${escapeHtml(p.category)}</div>
      <h1>${escapeHtml(p.title)}</h1>
      <div class="info-table">
        <div class="info-row"><b>Brand</b><span>${escapeHtml(p.brand)}</span></div>
        <div class="info-row"><b>SKU</b><span>${escapeHtml(p.sku)}</span></div>
        <div class="info-row"><b>ASIN</b><span>${escapeHtml(p.asin)}</span></div>
        <div class="info-row"><b>First Release Time</b><span>${escapeHtml(p.first_release_time)}</span></div>
        <div class="info-row"><b>Copyright Owner</b><span>${escapeHtml(p.copyright_owner)}</span></div>
      </div>
      <p>${escapeHtml(p.description)}</p>
      <div class="notice"><b>Copyright Information:</b> Product images, descriptions, and visual materials on this page belong to LUWANJUN. Unauthorized copying, reproduction, redistribution, or commercial use is prohibited. Rights contact: ANGFANBRAND163@163.COM</div>
      <div class="btns" style="margin-top:18px">
        <a class="btn primary" href="/contact.html">Contact Rights Owner</a>
        <button class="btn secondary" onclick="navigator.clipboard.writeText(location.href);this.innerText='Copied Link'">Copy Product URL</button>
      </div>
    </div>
  </div>
  <div class="copybox">
    <h2>Evidence Statement</h2>
    <p>This page is maintained as an official product image and copyright record. The first release time, product identity, and rights owner information above are intended to support copyright and marketplace infringement complaints.</p>
  </div>`;
}
document.addEventListener("DOMContentLoaded", () => {
  renderHome(); renderProducts(); renderProductDetail();
});
