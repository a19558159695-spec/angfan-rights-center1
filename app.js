
function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),1500)}
function get(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}} function set(k,v){localStorage.setItem(k,JSON.stringify(v))}
function changeQty(d){const i=document.getElementById('qtyInput');if(!i)return;let v=parseInt(i.value||'1',10);if(isNaN(v))v=1;i.value=Math.max(1,v+d)}
function switchMainImage(src,btn){const img=document.getElementById('mainProductImage');if(img)img.src=src;document.querySelectorAll('.thumb').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active')}
function addToCart(slug,title,img,sku,asin,price){const q=Math.max(1,parseInt((document.getElementById('qtyInput')||{}).value||'1',10)||1);const a=get('cart');const f=a.find(x=>x.slug===slug);if(f)f.qty+=q;else a.push({slug,title,img,sku,asin,price,qty:q});set('cart',a);toast('Added to cart');setTimeout(()=>location.href='/cart.html',350)}
function addWishlist(slug,title,img,sku,asin){let a=get('wishlist');if(!a.find(x=>x.slug===slug))a.push({slug,title,img,sku,asin});set('wishlist',a);toast('Wishlist updated');setTimeout(()=>location.href='/wishlist.html',350)}
function addCompare(slug,title,img,sku,asin,category){let a=get('compare');if(!a.find(x=>x.slug===slug))a.push({slug,title,img,sku,asin,category});set('compare',a);toast('Compare updated');setTimeout(()=>location.href='/compare.html',350)}
function renderList(id,key,empty){const root=document.getElementById(id);if(!root)return;const a=get(key);if(!a.length){root.innerHTML='<div class="plain-card">'+empty+'</div>';return;}root.innerHTML='<table class="table-list"><tbody>'+a.map((x,i)=>`<tr><td><img src="${x.img||'/main.svg'}" onerror="this.src='/main.svg'"></td><td><b>${x.title}</b><br><span style="color:#64748b">SKU: ${x.sku||''} | ASIN: ${x.asin||''}</span></td><td><a href="/${x.slug}.html">View Product</a></td><td><button class="square-btn" onclick="removeItem('${id}','${key}',${i})">×</button></td></tr>`).join('')+'</tbody></table>'}
function removeItem(id,key,i){const a=get(key);a.splice(i,1);set(key,a);renderList(id,key,'Empty.')}
document.addEventListener('DOMContentLoaded',()=>{renderList('cart-page','cart','Your cart is empty.');renderList('wishlist-page','wishlist','Your wishlist is empty.');renderList('compare-page','compare','No products selected.');const params=new URLSearchParams(location.search);const q=(params.get('q')||'').toLowerCase();const c=params.get('category')||'';document.querySelectorAll('#static-product-grid .product-card').forEach(card=>{const show=(!q||(card.dataset.title+' '+card.dataset.asin+' '+card.dataset.sku).includes(q))&&(!c||card.dataset.category===c);card.style.display=show?'':'none';});});


function moneyToNumber(v){
  const n = parseFloat(String(v || '0').replace(/[^0-9.]/g,''));
  return isNaN(n) ? 0 : n;
}
function renderCheckoutSummary(){
  const root = document.getElementById('checkout-summary');
  if(!root) return;
  const items = get('cart');
  if(!items.length){
    root.innerHTML = '<div class="empty-box">Your cart is empty. <a href="/products.html">Shop products</a></div>';
    return;
  }
  let subtotal = 0;
  const rows = items.map(x => {
    const qty = parseInt(x.qty || 1, 10) || 1;
    const price = moneyToNumber(x.price);
    subtotal += price * qty;
    return `<div class="summary-row">
      <img src="${x.img || '/main.svg'}" onerror="this.src='/main.svg'">
      <div><b>${x.title || ''}</b><span>Qty: ${qty}</span></div>
      <strong>$${(price * qty).toFixed(2)}</strong>
    </div>`;
  }).join('');
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;
  root.innerHTML = `${rows}
    <div class="summary-totals">
      <p><span>Subtotal</span><b>$${subtotal.toFixed(2)}</b></p>
      <p><span>Shipping</span><b>$${shipping.toFixed(2)}</b></p>
      <p><span>Tax</span><b>$${tax.toFixed(2)}</b></p>
      <p class="grand-total"><span>Total</span><b>$${total.toFixed(2)}</b></p>
    </div>`;
}
function placeDemoOrder(){
  const items = get('cart');
  const msg = document.getElementById('order-message');
  if(!msg) return;
  if(!items.length){
    msg.innerHTML = '<div class="order-error">Your cart is empty.</div>';
    return;
  }
  const name = (document.getElementById('checkoutName') || {}).value || '';
  const email = (document.getElementById('checkoutEmail') || {}).value || '';
  if(!name.trim() || !email.trim()){
    msg.innerHTML = '<div class="order-error">Please enter your name and email before placing the order.</div>';
    return;
  }
  const orderId = 'AF-' + Date.now().toString().slice(-8);
  localStorage.setItem('lastOrderId', orderId);
  msg.innerHTML = `<div class="order-success">
    <h2>Order Submitted</h2>
    <p>Your order reference is <b>${orderId}</b>.</p>
    <p>Customer service will confirm the order by email.</p>
  </div>`;
}


function addCheckoutButtonToCart(){
  const root = document.getElementById('cart-page');
  if(!root) return;
  const items = get('cart');
  if(!items.length) return;
  if(document.getElementById('proceedCheckoutBtn')) return;
  const wrap = document.createElement('div');
  wrap.className = 'cart-checkout-row';
  wrap.innerHTML = '<a id="proceedCheckoutBtn" class="checkout-submit" href="/checkout.html">Proceed to Checkout</a>';
  root.appendChild(wrap);
}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{renderCheckoutSummary();addCheckoutButtonToCart();},80);});
