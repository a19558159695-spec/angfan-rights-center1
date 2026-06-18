
async function loadProducts(){
  if(window.__products) return window.__products;
  const res = await fetch('/products.csv?ts=' + Date.now(), {cache:'no-store'});
  const text = await res.text();
  const rows = parseCSV(text);
  if(!rows.length){ window.__products=[]; return []; }
  const headers = rows.shift().map(h => h.replace(/^\uFEFF/, '').trim());
  const items = rows.map(row => {
    const o = {};
    headers.forEach((h,i)=> o[h] = (row[i] || '').trim());
    if(!o.gallery_images && o.main_image) o.gallery_images = o.main_image;
    o.gallery = String(o.gallery_images || o.main_image || '/main.svg').split('|').map(x=>x.trim()).filter(Boolean);
    o.published = String(o.status || '').toLowerCase() === 'published' || !o.status;
    o.title = cleanText(o.title || ('ANGFAN Product ' + (o.asin || '')));
    o.brand = 'ANGFAN';
    o.category = o.category || 'Other Products';
    o.bullets = extractBullets(o);
    return o;
  }).filter(x => x.slug || x.asin);
  window.__products = items;
  return items;
}
function parseCSV(text){
  const rows=[]; let row=[], cur='', q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c==='"'){ if(q && n==='"'){cur+='"';i++;} else q=!q; }
    else if(c===',' && !q){ row.push(cur); cur=''; }
    else if((c==='\n'||c==='\r') && !q){ if(c==='\r'&&n==='\n')i++; row.push(cur); if(row.some(x=>x!=='')) rows.push(row); row=[]; cur=''; }
    else cur+=c;
  }
  if(cur || row.length){ row.push(cur); if(row.some(x=>x!=='')) rows.push(row); }
  return rows;
}
function cleanText(s=''){ return String(s).replace(/\bOkoey\b/ig,'ANGFAN').replace(/\s+/g,' ').trim(); }
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeJs(s=''){ return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
function getParam(n){ return new URLSearchParams(location.search).get(n) || ''; }
function extractBullets(p){
  const direct=[p.bullet1,p.bullet2,p.bullet3,p.bullet4,p.bullet5].filter(Boolean).map(cleanText);
  if(direct.length) return direct.slice(0,5);
  let d=cleanText(p.description||'');
  let parts=d.includes('|') ? d.split('|') : d.split(/\.\s+/);
  parts=parts.map(x=>cleanText(x.replace(/^Feature\s*\d+\s*:\s*/i,''))).filter(Boolean);
  while(parts.length<5) parts.push('Product information available upon request.');
  return parts.slice(0,5).map(x=>x.length>500 ? x.slice(0,497)+'...' : x);
}
function imgTag(src,title){ return `<img src="${escapeHtml(src||'/main.svg')}" alt="${escapeHtml(title||'')}" onerror="this.onerror=null;this.src='/main.svg'">`; }
function cardHTML(p){
  const slug = p.slug || ('asin-' + (p.asin||'').toLowerCase());
  return `<a class="product-card" href="/product.html?slug=${encodeURIComponent(slug)}">
    <div class="thumb">${imgTag(p.main_image,p.title)}</div>
    <div class="body">
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">SKU: ${escapeHtml(p.sku||'')} | ASIN: ${escapeHtml(p.asin||'')}</div>
      <div class="price">${escapeHtml(p.price || '$0.00')}</div>
    </div>
  </a>`;
}
async function renderHomeProducts(){
  const root=document.querySelector('#home-products'); if(!root) return;
  const products=(await loadProducts()).filter(p=>p.published);
  root.innerHTML = products.length ? products.slice(0,8).map(cardHTML).join('') : '<div class="empty-box">No products found. Please check products.csv.</div>';
}
async function renderProductGrid(){
  const root=document.querySelector('#product-grid'); if(!root) return;
  let products=(await loadProducts()).filter(p=>p.published);
  const q=getParam('q').toLowerCase(), cat=getParam('category');
  if(q) products=products.filter(p=>[p.title,p.sku,p.asin,p.category].join(' ').toLowerCase().includes(q));
  if(cat) products=products.filter(p=>p.category===cat);
  const count=document.querySelector('#product-count'); if(count) count.textContent = products.length + ' products';
  root.innerHTML = products.length ? products.map(cardHTML).join('') : '<div class="empty-box">No products found. Please check products.csv.</div>';
}
function getStore(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}}
function setStore(k,v){localStorage.setItem(k,JSON.stringify(v))}
function getCart(){return getStore('brandShopCart')} function setCart(v){setStore('brandShopCart',v)}
function getWishlist(){return getStore('brandShopWishlist')} function setWishlist(v){setStore('brandShopWishlist',v)}
function getCompare(){return getStore('brandShopCompare')} function setCompare(v){setStore('brandShopCompare',v)}
function showToast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1500)}
async function renderProductDetail(){
  const root=document.querySelector('#product-detail'); if(!root) return;
  const slug=getParam('slug');
  const products=await loadProducts();
  const p=products.find(x=>x.slug===slug) || products.find(x=>x.published) || products[0];
  if(!p){root.innerHTML='<div class="empty-box">No product found.</div>';return;}
  const gallery=(p.gallery&&p.gallery.length?p.gallery:[p.main_image||'/main.svg']).slice(0,4);
  const summary=p.bullets[0]||'Product information available upon request.';
  root.innerHTML=`<div class="product-detail-layout">
    <div class="gallery-panel">
      <div class="main-image-wrap">${imgTag(gallery[0],p.title).replace('<img','<img id="mainProductImage"')}</div>
      <div class="thumb-row">${gallery.map((g,i)=>`<button class="thumb-card ${i===0?'active':''}" type="button" onclick="switchMainImage('${escapeJs(g)}',this)">${imgTag(g,p.title)}</button>`).join('')}</div>
    </div>
    <div class="info-panel">
      <h1>${escapeHtml(p.title)}</h1>
      <div class="meta-lines">
        <div><b>Brand</b> <span>${escapeHtml(p.brand||'ANGFAN')}</span></div>
        <div><b>First Release Time</b> <span>${escapeHtml(p.first_release_time||'')}</span></div>
        <div><b>Copyright Information</b> <span>${escapeHtml('ANGFAN Copyright belongs to ' + (p.copyright_owner || 'LUWANJUN'))}</span></div>
      </div>
      <div class="summary-box">${escapeHtml(summary)}</div>
      <div class="qty-row"><div class="qty-label">Qty</div><div class="qty-box"><button onclick="changeQty(-1)" type="button">-</button><input id="qtyInput" value="1"><button onclick="changeQty(1)" type="button">+</button></div></div>
      <div class="action-row">
        <button class="btn-main" type="button" onclick="addToCart('${escapeJs(p.slug)}')">🛒 Add To Cart</button>
        <button class="btn-icon ${getWishlist().some(x=>x.slug===p.slug)?'active-heart':''}" type="button" onclick="toggleWishlist('${escapeJs(p.slug)}')">♡</button>
        <button class="btn-icon ${getCompare().some(x=>x.slug===p.slug)?'active-compare':''}" type="button" onclick="toggleCompare('${escapeJs(p.slug)}')">⇄</button>
      </div>
      <div class="options-section"><h2>Available Options</h2><div class="option-field"><label>Product launch time:</label><input value="${escapeHtml(p.first_release_time||'')}" readonly></div></div>
    </div>
  </div>
  <div class="details-tabs">
    <div class="tabs-head"><button class="active" onclick="switchTab(event,'tab-desc')" type="button">Description</button><button onclick="switchTab(event,'tab-info')" type="button">Product Details</button></div>
    <div id="tab-desc" class="tab-panel active"><ul class="bullet-list">${p.bullets.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
    <div id="tab-info" class="tab-panel"><p><b>SKU:</b> ${escapeHtml(p.sku||'')}</p><p><b>ASIN:</b> ${escapeHtml(p.asin||'')}</p><p><b>Category:</b> ${escapeHtml(p.category||'')}</p></div>
  </div>`;
}
function changeQty(d){const i=document.querySelector('#qtyInput');let v=parseInt(i.value||'1',10);if(isNaN(v))v=1;i.value=Math.max(1,v+d)}
function switchMainImage(src,btn){const i=document.querySelector('#mainProductImage');if(i)i.src=src;document.querySelectorAll('.thumb-card').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active')}
function switchTab(e,id){document.querySelectorAll('.tabs-head button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));e.currentTarget.classList.add('active');document.getElementById(id).classList.add('active')}
async function addToCart(slug){const products=await loadProducts();const p=products.find(x=>x.slug===slug);if(!p)return;const q=Math.max(1,parseInt((document.querySelector('#qtyInput')||{}).value||'1',10)||1);const cart=getCart();const f=cart.find(x=>x.slug===slug);if(f)f.qty+=q;else cart.push({slug:p.slug,title:p.title,qty:q,price:p.price,main_image:p.main_image,sku:p.sku,asin:p.asin});setCart(cart);showToast('Added to cart');setTimeout(()=>location.href='/cart.html',400)}
async function toggleWishlist(slug){const p=(await loadProducts()).find(x=>x.slug===slug);if(!p)return;let list=getWishlist();const f=list.find(x=>x.slug===slug);if(f)list=list.filter(x=>x.slug!==slug);else list.push({slug:p.slug,title:p.title,main_image:p.main_image,sku:p.sku,asin:p.asin});setWishlist(list);showToast('Wishlist updated');setTimeout(()=>location.href='/wishlist.html',400)}
async function toggleCompare(slug){const p=(await loadProducts()).find(x=>x.slug===slug);if(!p)return;let list=getCompare();const f=list.find(x=>x.slug===slug);if(f)list=list.filter(x=>x.slug!==slug);else list.push({slug:p.slug,title:p.title,main_image:p.main_image,sku:p.sku,asin:p.asin,category:p.category});setCompare(list);showToast('Compare updated');setTimeout(()=>location.href='/compare.html',400)}
function listTable(root,items,empty){if(!root)return;if(!items.length){root.innerHTML=`<div class="empty-box">${empty}</div>`;return;}root.innerHTML=`<table class="table-list"><tbody>${items.map((x,i)=>`<tr><td>${imgTag(x.main_image,x.title)}</td><td><b>${escapeHtml(x.title)}</b><br><span style="color:#64748b">SKU: ${escapeHtml(x.sku||'')} | ASIN: ${escapeHtml(x.asin||'')}</span></td><td><a class="header-action" href="/product.html?slug=${encodeURIComponent(x.slug)}">View Product</a></td><td><button class="btn-icon" onclick="removeItem('${root.id}',${i})">×</button></td></tr>`).join('')}</tbody></table>`}
function removeItem(id,i){const key=id==='cart-page'?'brandShopCart':id==='wishlist-page'?'brandShopWishlist':'brandShopCompare';const a=getStore(key);a.splice(i,1);setStore(key,a);renderCartPage();renderWishlistPage();renderComparePage()}
function renderCartPage(){listTable(document.querySelector('#cart-page'),getCart(),'Your cart is empty.')}
function renderWishlistPage(){listTable(document.querySelector('#wishlist-page'),getWishlist(),'Your wishlist is empty.')}
function renderComparePage(){listTable(document.querySelector('#compare-page'),getCompare(),'No products selected for comparison.')}
document.addEventListener('DOMContentLoaded',()=>{renderHomeProducts();renderProductGrid();renderProductDetail();renderCartPage();renderWishlistPage();renderComparePage();});
