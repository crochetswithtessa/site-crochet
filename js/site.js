/* Crochet with Tessa — interactions. Les fiches et données produits sont maintenant dans le HTML. */
(function(){
'use strict';
// Lien officiel Google Forms pour les commandes personnalisées et les précommandes.
// Les liens HTML utilisent également directement cette même URL.
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeuFJhaX00vRbRWMokGY5jEcAT4gAjUzrdtgphpJ84NN14t6A/viewform';
const SHIPPING={france:[[250,5.49],[500,7.59],[750,9.29],[1000,9.59],[2000,11.19],[5000,17.39],[10000,25.29],[15000,31.99],[30000,39.59]],eu:[[500,14.99],[1000,19.39],[2000,22.19],[5000,28.59],[10000,46.99],[15000,67.99],[30000,87.99]],uk:[[500,18.99],[1000,23.39],[2000,26.19],[5000,32.59],[10000,50.99],[15000,71.99],[30000,91.99]],europe_b:[[500,23.79],[1000,28.39],[2000,31.09],[5000,39.89],[10000,66.09],[15000,89.59],[20000,109.49]]};
function money(v){v=Number(v);if(!Number.isFinite(v))return 'Prix à renseigner';return Number.isInteger(v)?v+'€':v.toFixed(2).replace('.',',')+'€';}
// Keep prices, product links and friendly names in sync with older carts stored in the browser.
const CURRENT_PRODUCT_PRICES={poulpe:7,coeurs:7,fleurs:7,oie:50,tortue:55,dragon:45,dragonbis:50,flamant:16,sac:130,baleine:10,poussin:9,raie:8,dessousverre:9,tortuebis:40,axolotl:9,
 'patron-elephant':5,'patron-girafe':5,'patron-flamant':3.5,'patron-ballon':4};
const PRODUCT_PAGES={elephant:'produit-elephant.html',ballon:'produit-ballon.html',capybara:'produit-capybara.html',girafe:'produit-girafe.html',pingouin:'produit-pingouin.html',tortue:'produit-tortue.html',
 oie:'produit-oie.html',dragon:'produit-dragon.html',dragonbis:'produit-dragonbis.html',flamant:'produit-flamant.html',sac:'produit-sac.html',baleine:'produit-baleine.html',poussin:'produit-poussin.html',raie:'produit-raie.html',dessousverre:'produit-dessousverre.html',tortuebis:'produit-tortuebis.html',axolotl:'produit-axolotl.html',
 poulpe:'produit-poulpe.html',bouquet:'produit-bouquet.html',coeurs:'produit-coeurs.html',fleurs:'produit-fleurs.html',
 'patron-elephant':'produit-patron-elephant.html','patron-girafe':'produit-patron-girafe.html','patron-flamant':'produit-patron-flamant.html','patron-ballon':'produit-patron-ballon.html'};
const PRODUCT_NAMES={elephant:'Poppy l’Éléphant',ballon:'Jules le Ballon',capybara:'Moka le Capybara',girafe:'Gigi la Girafe',pingouin:'Tutu le Pingouin',tortue:'Marie la Tortue',oie:'Olive l’Oie',dragon:'Draco le Dragon',dragonbis:'Nino le Dragon',flamant:'Rosie le Flamant rose',sac:'Sac à main au crochet',baleine:'Bulle la Baleine',poussin:'Pipou le Poussin',raie:'Stella la Raie',dessousverre:'Le Dessous de verre',tortuebis:'Tina la Tortue',axolotl:'Axie l’Axolotl',poulpe:'Polo le Poulpe',bouquet:'Rosalie le Bouquet',coeurs:'Les Cœurs tendres',fleurs:'Les Fleurs du jardin'};
// Stock local indicatif : à mettre à jour manuellement lorsque les créations sont vendues.
// Les variantes disponibles ont chacune un exemplaire, sauf exceptions explicitement annoncées.
function stockLimit(id, variants={}){
 if(id==='elephant'||id==='dessousverre')return 0;
 const color=variants.Coloris||'';
 if(id==='poussin')return color==='Marron'?0:(color==='Bleu'||color==='Vert'?4:1);
 if(id==='poulpe')return color==='Violet foncé'?0:color==='Écru'?2:1;
 if(id==='fleurs'&&color==='Blanc et bordeaux')return 0;
 return 1;
}
function stockRemaining(id,variants={}){
 const max=stockLimit(id,variants);
 const count=getCart().filter(i=>i.type!=='patron'&&i.id===id&&JSON.stringify(i.variants||{})===JSON.stringify(variants)).reduce((n,i)=>n+Math.max(0,Number(i.qty)||0),0);
 return Math.max(0,max-count);
}
function selectedVariants(summary){
 const groups=[...summary.querySelectorAll('[data-variant-group]')];
 const variants={};
 for(const group of groups){
  const picked=group.querySelector('input[type="radio"]:checked');
  if(!picked)return null;
  variants[group.dataset.variantLabel||'Variante']=picked.value;
 }
 return variants;
}
// Quantité à ajouter : sélection locale par fiche, plafonnée au stock encore disponible.
function initProductQuantity(){
 document.querySelectorAll('.product-page-grid .product-summary').forEach(summary=>{
  const add=summary.querySelector('[data-add-product][data-type="peluche"]');
  const status=summary.querySelector('[data-stock-status]');
  if(!add||!status)return;
  const picker=document.createElement('div');
  picker.className='product-quantity';picker.hidden=true;picker.setAttribute('data-product-quantity','');
  picker.innerHTML=`<span class="product-quantity-label">Quantité à ajouter</span><div class="quantity-stepper" role="group" aria-label="Choisir la quantité à ajouter au panier"><button type="button" data-quantity-minus aria-label="Diminuer la quantité">−</button><output data-quantity-value aria-live="polite">1</output><button type="button" data-quantity-plus aria-label="Augmenter la quantité">+</button></div><span class="product-quantity-help" data-quantity-help></span>`;
  status.insertAdjacentElement('afterend',picker);
  picker.dataset.quantity='1';
  const change=(step)=>{
   const variants=selectedVariants(summary);
   if(variants===null)return;
   const remaining=stockRemaining(add.dataset.id,variants||{});
   const current=Number(picker.dataset.quantity)||1;
   picker.dataset.quantity=String(Math.max(1,Math.min(remaining,current+step)));
   syncProductQuantity(summary);
  };
  picker.querySelector('[data-quantity-minus]').addEventListener('click',()=>change(-1));
  picker.querySelector('[data-quantity-plus]').addEventListener('click',()=>change(1));
  summary.querySelectorAll('[data-variant-group] input[type="radio"]').forEach(input=>input.addEventListener('change',()=>{
   picker.dataset.quantity='1';syncProductQuantity(summary);
  }));
 });
}
function syncProductQuantity(summary){
 const picker=summary.querySelector('[data-product-quantity]');
 const add=summary.querySelector('[data-add-product][data-type="peluche"]');
 if(!picker||!add)return;
 const variants=selectedVariants(summary),max=variants===null?0:stockLimit(add.dataset.id,variants||{});
 const remaining=variants===null?0:stockRemaining(add.dataset.id,variants||{});
 const visible=max>1&&remaining>0;
 picker.hidden=!visible;
 if(!visible){picker.dataset.quantity='1';return}
 const value=Math.max(1,Math.min(remaining,Number(picker.dataset.quantity)||1));
 picker.dataset.quantity=String(value);
 picker.querySelector('[data-quantity-value]').textContent=String(value);
 picker.querySelector('[data-quantity-minus]').disabled=value<=1;
 picker.querySelector('[data-quantity-plus]').disabled=value>=remaining;
 picker.querySelector('[data-quantity-help]').textContent=`${remaining} exemplaire${remaining>1?'s':''} encore disponible${remaining>1?'s':''}`;
}
function updateInventory(){
 document.querySelectorAll('[data-stock-status]').forEach(output=>{
  const summary=output.closest('.product-summary');
  const id=output.dataset.stockProduct;
  if(!summary||!id)return;
  const variants=selectedVariants(summary);
  const add=summary.querySelector('[data-add-product]');
  const request=summary.querySelector('[data-variant-request]');
  const hasGroups=summary.querySelectorAll('[data-variant-group]').length>0;
  output.classList.remove('is-unavailable');
  if(variants===null&&hasGroups){
   if(id==='elephant'){
    output.textContent='Indisponible en stock — demande de précommande possible.';
    output.classList.add('is-unavailable');
   } else output.textContent='Choisis un coloris ou un modèle pour voir le stock.';
   if(add){add.disabled=false;add.removeAttribute('aria-disabled')}
   syncProductQuantity(summary);
   return;
  }
  const chosen=variants||{};
  const max=stockLimit(id,chosen),remaining=stockRemaining(id,chosen);
  if(max===0){
   output.textContent='Indisponible en stock — demande possible via le formulaire.';
   output.classList.add('is-unavailable');
  }else{
   const inCart=max-remaining;
   const status=remaining===1?'Stock bas : 1 exemplaire restant':remaining===0?'Stock épuisé pour cette sélection':`${remaining} exemplaires en stock`;
   output.textContent=status+(inCart?` · ${inCart} dans ton panier`:'');
   if(remaining===0)output.classList.add('is-unavailable');
  }
  if(add){
   const preorder=!!request&&!request.hidden;
   add.disabled=max>0&&remaining===0&&!preorder;
   add.setAttribute('aria-disabled',String(add.disabled));
  }
  syncProductQuantity(summary);
 });
 document.dispatchEvent(new Event('site:inventory-updated'));
}
function getCart(){try{
 const saved=JSON.parse(localStorage.getItem('cwt-cart'))||[];
 if(!Array.isArray(saved))return [];
 return saved.filter(item=>item&&item.id&&item.id!=='elephant'&&item.id!=='dessousverre'&&!(item.id==='poussin'&&item.variants?.Coloris==='Marron')).map(item=>({
 ...item,
 price:Object.prototype.hasOwnProperty.call(CURRENT_PRODUCT_PRICES,item.id)?CURRENT_PRODUCT_PRICES[item.id]:item.price,
 name:PRODUCT_NAMES[item.id]||item.name,
 category:item.category||((item.type==='patron')?'PATRON PDF':'AMIGURUMI')
 }));
}catch(e){return []}}
function saveCart(cart){localStorage.setItem('cwt-cart',JSON.stringify(cart));updateBadges();updateInventory()}
function updateBadges(){const n=getCart().reduce((s,i)=>s+(Number(i.qty)||0),0);document.querySelectorAll('[data-cart-count]').forEach(b=>{b.textContent=n;b.hidden=!n})}
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
// The second image shows IMMEDIATELY on hover; images 3 and 4 follow after 1.3 s each.
const SLIDE_TIME=1300;
const reduceMotion=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function initCardSliders(){
 // Les photos animées sont réservées aux pages d'accueil et aux deux collections.
 const currentPage=location.pathname.split('/').pop();
 if(!['travail_projet.html','peluches.html','patrons.html'].includes(currentPage))return;
 document.querySelectorAll('.product-image').forEach(photo=>{
  const slider=photo.querySelector('[data-auto-slider]');
  if(!slider)return;
  const slides=[...slider.querySelectorAll('.product-slides img')];
  const dots=[...photo.querySelectorAll('[data-slide-dot]')];
  if(!slides.length)return;
  let active=0,timer=null;
  const show=n=>{
   active=Math.max(0,Math.min(slides.length-1,n));
   slides.forEach((img,i)=>img.classList.toggle('is-active',i===active));
   dots.forEach((dot,i)=>{dot.classList.toggle('is-active',i===active);dot.setAttribute('aria-pressed',String(i===active))});
  };
  const stop=()=>{if(timer!==null){window.clearInterval(timer);timer=null}};
  const reset=()=>{stop();show(0)};
  const start=()=>{
   stop();
   if(slides.length<2||reduceMotion()||document.hidden)return;
   show(1); // no initial 2.4s delay
   if(slides.length>2){timer=window.setInterval(()=>{if(active>=slides.length-1){stop();return}show(active+1);if(active===slides.length-1)stop()},SLIDE_TIME)}
  };
  photo.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')start()});
  photo.addEventListener('pointerleave',reset);
  slider.addEventListener('focusin',start);
  photo.addEventListener('focusout',e=>{if(!photo.contains(e.relatedTarget))reset()});
  dots.forEach((dot,i)=>dot.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();stop();show(i)}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
  show(0);
 });
}
function initAddButtons(){
  document.querySelectorAll('[data-add-product]').forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.disabled)return;
    const summary=btn.closest('.product-summary')||document;
    const groups=[...summary.querySelectorAll('[data-variant-group]')];
    const variants={};
    let preferredImage=btn.dataset.image||'';
    const error=summary.querySelector('[data-variant-error]');
    for(const group of groups){
      const selected=group.querySelector('input[type="radio"]:checked:not(:disabled)');
      if(!selected){
        if(error){error.hidden=false;error.textContent='Choisis '+(group.dataset.variantLabel||'une variante').toLowerCase()+' avant d’ajouter cette création au panier.'}
        const first=group.querySelector('input[type="radio"]:not(:disabled)');
        first?.focus();return;
      }
      variants[group.dataset.variantLabel||'Variante']=selected.value;
      if(selected.dataset.variantImage)preferredImage=selected.dataset.variantImage;
    }
    if(error){error.hidden=true;error.textContent=''}
    const rawPrice=btn.dataset.price;
    const price=rawPrice!==undefined&&rawPrice.trim()!==''?Number(rawPrice):null;
    const quantityPicker=summary.querySelector('[data-product-quantity]');
    const requestedQty=btn.dataset.type==='patron'?1:quantityPicker&&!quantityPicker.hidden?Math.max(1,Number(quantityPicker.dataset.quantity)||1):1;
    const item={type:btn.dataset.type,id:btn.dataset.id,name:btn.dataset.name,price:Number.isFinite(price)?price:null,image:preferredImage,category:btn.dataset.category,variants,qty:requestedQty};
    if(!item.id)return;
    if(item.type!=='patron'&&stockRemaining(item.id,variants)<requestedQty){
      if(error){error.hidden=false;error.textContent='La quantité demandée dépasse le stock restant. Ajuste ton choix avant de continuer.'}
      updateInventory();return;
    }
    const cart=getCart();const variantKey=JSON.stringify(variants);
    const old=cart.find(x=>x.type===item.type&&x.id===item.id&&JSON.stringify(x.variants||{})===variantKey);
    if(old){old.qty=(Number(old.qty)||1)+requestedQty;Object.assign(old,{name:item.name,price:item.price,image:item.image,category:item.category,variants})}else cart.push(item);
    if(quantityPicker)quantityPicker.dataset.quantity='1';
    saveCart(cart);
    const original=btn.innerHTML;btn.textContent=requestedQty>1?`${requestedQty} articles ajoutés ✓`:'Ajouté au panier ✓';
    window.setTimeout(()=>btn.innerHTML=original,1300);
  }));
  document.querySelectorAll('[data-variant-group] input[type="radio"]').forEach(input=>input.addEventListener('change',()=>{
    const summary=input.closest('.product-summary');
    const error=summary?.querySelector('[data-variant-error]');
    if(error){error.hidden=true;error.textContent=''}
    updateInventory();
    if(input.dataset.variantImage){
      const gallery=summary?.closest('.product-page-grid')?.querySelector('[data-gallery]');
      gallery?.dispatchEvent(new CustomEvent('gallery:show',{detail:{src:input.dataset.variantImage}}));
    }
  }));
}
function initGallery(){
 document.querySelectorAll('[data-gallery]').forEach(g=>{
  const img=g.querySelector('[data-gallery-image]');
  const thumbs=[...g.querySelectorAll('[data-thumb]')];
  if(!img||!thumbs.length)return;
  const main=g.querySelector('[data-gallery-main]');
  let active=0;
  const showIndex=n=>{
   active=(n+thumbs.length)%thumbs.length;
   img.src=thumbs[active].dataset.thumb;
   thumbs.forEach((t,i)=>t.classList.toggle('is-active',i===active));
  };
  const showSrc=src=>{const i=thumbs.findIndex(t=>t.dataset.thumb===src);if(i>=0)showIndex(i)};
  // Une fiche produit reste entièrement manuelle : pas d'autoplay et pas de retour au survol.
  thumbs.forEach((t,i)=>t.addEventListener('click',()=>showIndex(i)));
  if(main)main.addEventListener('click',()=>showIndex(active+1));
  g.addEventListener('gallery:show',e=>showSrc(e.detail?.src));
  showIndex(0);
 });
}
function initShipping(){document.querySelectorAll('[data-customer-shipping]').forEach(form=>{const z=form.querySelector('[data-zone]'),w=form.querySelector('[data-weight]'),out=form.querySelector('[data-shipping-result]');const update=()=>{const weight=Number(w.value),row=(SHIPPING[z.value]||[]).find(r=>weight<=r[0]);out.innerHTML=row?`<strong>${money(row[1])}</strong><span>Estimation indicative jusqu’à ${row[0]>=1000?(row[0]/1000)+' kg':row[0]+' g'}.</span>`:'<strong>À vérifier</strong><span>Poids hors grille ou invalide.</span>'};z.addEventListener('change',update);w.addEventListener('input',update);update()})}
function renderCart(){
 const root=document.querySelector('[data-cart-page]');if(!root)return;
 let cart=getCart().filter(i=>i&&i.id&&(i.price==null||Number.isFinite(Number(i.price))));
 if(!cart.length){root.innerHTML='<div class="empty-state"><p class="eyebrow">TON PANIER</p><h1>Il est encore <em>tout léger.</em></h1><p>Ajoute une peluche ou un patron pour commencer.</p><div class="empty-actions"><a class="button button-dark" href="peluches.html">Voir les peluches</a><a class="button button-outline" href="patrons.html">Voir les patrons</a></div></div>';return}
 const priceKnown=i=>i.price!==null&&i.price!==undefined&&i.price!==''&&Number.isFinite(Number(i.price));
 const subtotal=cart.reduce((s,i)=>s+(priceKnown(i)?Number(i.price)*(Number(i.qty)||1):0),0);
 const hasUnknown=cart.some(i=>!priceKnown(i));
 const missingLanguage=cart.some(i=>i.type==='patron'&&!i.variants?.Langue);
 const variantEntries=i=>Object.entries(i.variants||{});
 const variantDisplay=i=>variantEntries(i).map(([k,v])=>`${escapeHTML(k)} : <strong>${escapeHTML(v)}</strong>`).join(' · ');
 const linesHtml=cart.map((i,n)=>{
  const href=PRODUCT_PAGES[i.id]||'peluches.html';
  const hrefSafe=escapeHTML(href),nameSafe=escapeHTML(i.name);
  return `<article class="cart-line" data-product-href="${hrefSafe}" role="link" tabindex="0" aria-label="Voir la fiche de ${nameSafe}">
   <a class="cart-line-image-link" href="${hrefSafe}" aria-label="Voir ${nameSafe}"><img src="${escapeHTML(i.image)}" alt="${nameSafe}"></a>
   <div class="cart-line-main"><p class="product-type">${escapeHTML(i.category||'')}</p><h2><a class="cart-line-name" href="${hrefSafe}">${nameSafe}</a></h2>
   ${variantEntries(i).length?`<p class="cart-variant">${variantDisplay(i)}</p>`:''}
   ${i.type==='patron'&&!i.variants?.Langue?`<p class="cart-language-warning"><a href="${hrefSafe}">Choisir la langue du PDF sur la fiche produit</a></p>`:''}
   <p>${priceKnown(i)?money(i.price):'Prix à confirmer'}</p></div>
   <label for="qty-${n}">Qté<input id="qty-${n}" class="cart-qty" data-index="${n}" type="number" min="1" max="${i.type==='patron'?20:stockLimit(i.id,i.variants||{})}" value="${Math.max(1,Number(i.qty)||1)}"></label>
   <button class="remove-item" data-remove="${n}" type="button">Supprimer</button></article>`;
 }).join('');
 root.innerHTML=`<div class="container cart-layout"><section><p class="eyebrow">TON PANIER</p><h1>Presque <em>chez toi.</em></h1><p class="cart-preorder-intro">Les peluches disponibles peuvent être ajoutées au panier. Les demandes de précommande et de créations personnalisées se font séparément via le formulaire. Les patrons PDF sont envoyés manuellement, dans la langue choisie.</p><div class="cart-lines">${linesHtml}</div></section><aside class="cart-summary"><h2>Récapitulatif</h2><div><span>${hasUnknown?'Sous-total des articles chiffrés':'Sous-total'}</span><strong>${money(subtotal)}</strong></div>${hasUnknown?'<p class="cart-price-warning">Certains articles n’ont pas encore de prix fixé. Le total définitif sera confirmé par e-mail avant toute commande ou paiement.</p>':''}${missingLanguage?'<p class="cart-price-warning">Un ancien patron dans ton panier n’a pas de langue sélectionnée. Ouvre sa fiche et choisis Français ou English avant d’envoyer ta demande.</p>':''}<p class="cart-help">Le montant de la livraison des peluches sera confirmé avant validation. Les créations indisponibles se demandent via le formulaire personnalisé ; les patrons PDF n’ont pas de frais de port.</p><div class="checkout-legal"><strong>Avant de finaliser</strong><p>Consulte les <a href="cgv.html">CGV</a> et les informations de <a href="retractation.html">rétractation et remboursement</a>.</p></div><a class="button button-dark button-more" id="emailOrder" href="#">Envoyer ma demande ${cart.some(i=>i.type==='peluche')?'de commande':'de patrons'}</a><p class="small-note">Cette étape prépare un e-mail de demande, sans paiement en ligne ni confirmation définitive de commande.</p></aside></div>`;
 root.querySelectorAll('.cart-qty').forEach(inp=>inp.addEventListener('change',()=>{const n=Number(inp.dataset.index);cart[n].qty=Math.max(1,Math.min(cart[n].type==='patron'?20:stockLimit(cart[n].id,cart[n].variants||{}),Number(inp.value)||1));saveCart(cart);renderCart()}));
 root.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{cart.splice(Number(btn.dataset.remove),1);saveCart(cart);renderCart()}));
 root.querySelectorAll('.cart-line[data-product-href]').forEach(line=>{
  const navigate=()=>{window.location.href=line.dataset.productHref};
  line.addEventListener('click',e=>{if(!e.target.closest('a,button,input,label,select,textarea'))navigate()});
  line.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===line){e.preventDefault();navigate()}});
 });
 const lines=cart.map(i=>`- ${i.name}${variantEntries(i).length?' ('+variantEntries(i).map(([k,v])=>`${k} : ${v}`).join(', ')+')':''} x${i.qty||1} : ${priceKnown(i)?money(Number(i.price)*(i.qty||1)):'Prix à confirmer'}`).join('\n');
 const totals=hasUnknown?`Sous-total des produits avec prix : ${money(subtotal)}\nAutres produits : prix à confirmer avant validation`:`Sous-total : ${money(subtotal)}`;
 const mail=document.getElementById('emailOrder');
 if(missingLanguage){mail.removeAttribute('href');mail.setAttribute('aria-disabled','true');mail.classList.add('is-disabled');}
 else mail.href='mailto:crochetswithtessa@gmail.com?subject='+encodeURIComponent('Demande de commande / patrons — Crochet with Tessa')+'&body='+encodeURIComponent(`Bonjour,\n\nJe souhaite commander les créations suivantes :\n${lines}\n\n${totals}\n\nPays de livraison : \nAdresse : \nPrécisions, couleurs ou délai souhaité : \n\nMerci de me confirmer les frais de livraison et les modalités de paiement avant validation.\n`);
}
function initSearchPage(){const items=[...document.querySelectorAll('[data-search-item]')],status=document.querySelector('[data-search-status]');if(!items.length)return;const q=new URLSearchParams(location.search).get('q')?.trim().toLowerCase()||'';let count=0;items.forEach(i=>{const ok=!q||i.dataset.searchText.includes(q);i.hidden=!ok;if(ok)count++});if(status)status.textContent=q?`${count} résultat${count>1?'s':''} pour « ${q} »`:'Toutes les créations';const field=document.querySelector('[data-overlay-search]');if(field)field.value=q}

function initPanels(){
 const menu=document.querySelector('[data-menu-panel]'),search=document.querySelector('[data-search-panel]'),backdrop=document.querySelector('[data-panel-backdrop]');
 const menuOpen=document.querySelector('[data-menu-open]'),searchOpen=document.querySelector('[data-search-open]');
 const searchInput=document.querySelector('[data-overlay-search]'),searchItems=[...document.querySelectorAll('[data-overlay-search-item]')];
 let closeTimer=0;
 const setBody=()=>document.body.classList.toggle('panel-open',Boolean(menu?.classList.contains('is-open')||search?.classList.contains('is-open')));
 const afterClose=(el,ms=470)=>{window.clearTimeout(closeTimer);closeTimer=window.setTimeout(()=>{if(el&&!el.classList.contains('is-open'))el.hidden=true},ms)};
 const closeMenu=()=>{if(!menu)return;menu.classList.remove('is-open');backdrop?.classList.remove('is-open');menuOpen?.setAttribute('aria-expanded','false');setBody();afterClose(menu);if(backdrop)window.setTimeout(()=>{if(!backdrop.classList.contains('is-open'))backdrop.hidden=true},430)};
 const closeSearch=()=>{if(!search)return;search.classList.remove('is-open');searchOpen?.setAttribute('aria-expanded','false');setBody();afterClose(search)};
 if(menuOpen&&menu){menuOpen.addEventListener('click',()=>{closeSearch();menu.hidden=false;if(backdrop)backdrop.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>{menu.classList.add('is-open');backdrop?.classList.add('is-open');menuOpen.setAttribute('aria-expanded','true');setBody();menu.querySelector('[data-menu-close]')?.focus()}))})}
 document.querySelector('[data-menu-close]')?.addEventListener('click',()=>{closeMenu();window.setTimeout(()=>menuOpen?.focus(),460)});
 backdrop?.addEventListener('click',()=>{closeMenu();closeSearch()});
 if(searchOpen&&search){searchOpen.addEventListener('click',()=>{closeMenu();search.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>{search.classList.add('is-open');searchOpen.setAttribute('aria-expanded','true');setBody();window.setTimeout(()=>searchInput?.focus(),320)}))})}
 document.querySelector('[data-search-close]')?.addEventListener('click',()=>{closeSearch();window.setTimeout(()=>searchOpen?.focus(),460)});
 if(searchInput&&searchItems.length){searchInput.addEventListener('input',()=>{const q=searchInput.value.trim().toLowerCase();searchItems.forEach(item=>{item.hidden=Boolean(q&&!item.dataset.searchText.includes(q))})})}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasOpen=menu?.classList.contains('is-open')||search?.classList.contains('is-open');closeMenu();closeSearch();if(wasOpen)window.setTimeout(()=>{(searchOpen||menuOpen)?.focus()},460)}})
}

function initVariantAvailability(){
 document.querySelectorAll('[data-variant-request]').forEach(link=>{
  const summary=link.closest('.product-summary');
  const add=summary?.querySelector('[data-add-product]');
  const group=summary?.querySelector('[data-variant-group][data-variant-label="Coloris"]');
  if(!add||!group)return;
  const sync=()=>{
   const chosen=group.querySelector('input[type="radio"]:checked');
   const unavailable=!!chosen?.hasAttribute('data-unavailable-variant');
   add.hidden=unavailable;
   link.hidden=!unavailable;
  };
  group.addEventListener('change',sync);sync();
 });
}
function initCustomOrderLinks(){
 const url=GOOGLE_FORM_URL.trim();
 if(!/^https:\/\/(?:docs\.google\.com|forms\.gle)\//i.test(url))return;
 document.querySelectorAll('a[data-custom-order-link]').forEach(a=>{
  a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 });
}
function initPreorderForm(){
 const form=document.querySelector('form.commande-form');if(!form)return;
 const product=new URLSearchParams(window.location.search).get('produit');
 if(!product||product.length>150)return;
 const desc=form.querySelector('#description');
 if(desc&&!desc.value.trim())desc.value=`Je souhaite précommander ${product}. Merci de me confirmer les possibilités de personnalisation, le délai de confection et le montant final.`;
 const creation=form.querySelector('#creation');
 if(creation)creation.value=/sac|dessous de verre/i.test(product)?'Accessoire':'Amigurumi / peluche';
 const subject=form.querySelector('input[name="_subject"]');
 if(subject)subject.value='Demande de précommande — '+product;
 const note=form.querySelector('.commande-note');
 if(note)note.textContent=`Précommande de ${product} : complète les détails ci-dessous pour recevoir une proposition personnalisée et un délai de confection.`;
}

function initCollectionFilters(){
 const buttons=[...document.querySelectorAll('[data-collection-filter]')];
 const items=[...document.querySelectorAll('[data-collection-category]')];
 const status=document.querySelector('[data-collection-status]');
 if(!buttons.length||!items.length)return;
 const counts={all:items.length,peluches:0,portecles:0,sacs:0};
 items.forEach(item=>{const key=item.dataset.collectionCategory;counts[key]=(counts[key]||0)+1});
 document.querySelectorAll('[data-collection-count]').forEach(el=>{
  el.textContent=String(counts[el.dataset.collectionCount]||0);
 });
 let active='all';
 const update=()=>{
  let shown=0;
  items.forEach(item=>{
   const visible=active==='all'||item.dataset.collectionCategory===active;
   item.hidden=!visible;if(visible)shown++;
  });
  buttons.forEach(button=>{
   const selected=button.dataset.collectionFilter===active;
   button.setAttribute('aria-pressed',String(selected));
   button.classList.toggle('is-active',selected);
  });
  if(status){
   const label=buttons.find(b=>b.dataset.collectionFilter===active)?.firstChild?.textContent.trim();
   status.textContent=active==='all'?'Toutes les créations sont affichées.':`${shown} création${shown>1?'s':''} dans la catégorie « ${label} ».`;
  }
 };
 buttons.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.collectionFilter;update()}));
 update();
}

// Mobile : barre d'achat toujours visible sur chaque fiche produit, même en haut de page.
function initMobilePurchaseBar(){
 const summary=document.querySelector('.product-page-grid .product-summary');
 if(!summary)return;
 const actions=summary.querySelector('.detail-actions');
 const mainAdd=actions?.querySelector('[data-add-product]');
 const mainRequest=actions?.querySelector('.button[href]');
 const variantRequest=actions?.querySelector('[data-variant-request]');
 if(!actions||(!mainAdd&&!mainRequest&&!variantRequest))return;
 const bar=document.createElement('div');
 bar.className='mobile-purchase-bar';bar.hidden=true;
 bar.setAttribute('data-mobile-purchase-bar','');
 const price=summary.querySelector('.detail-price')?.textContent.trim()||'Prix à confirmer';
 bar.innerHTML=`<div class="mobile-purchase-price"><span>Prix</span><strong></strong></div><button class="button button-dark mobile-purchase-add" type="button" data-mobile-purchase-add></button><a class="button button-dark mobile-purchase-request" target="_blank" rel="noopener noreferrer" data-mobile-purchase-request hidden></a>`;
 const add=bar.querySelector('[data-mobile-purchase-add]');
 const request=bar.querySelector('[data-mobile-purchase-request]');
 bar.querySelector('strong').textContent=price;
 document.body.appendChild(bar);
  const mobile=window.matchMedia('(max-width: 767px)');
 const update=()=>{
  const currentRequest=variantRequest&&!variantRequest.hidden?variantRequest:!mainAdd?mainRequest:null;
  const isRequest=Boolean(currentRequest);
  add.hidden=isRequest;request.hidden=!isRequest;
  if(isRequest){request.href=currentRequest.href;request.textContent=currentRequest.textContent.trim();}
  else if(mainAdd){add.disabled=mainAdd.disabled;add.textContent=mainAdd.textContent.replace('♡','').trim();}
  const show=mobile.matches;
  bar.hidden=!show;
  document.body.classList.toggle('has-mobile-purchase',show);
 };
 add.addEventListener('click',()=>{
  if(!mainAdd)return;
  mainAdd.click();
  if(summary.querySelector('[data-variant-error]:not([hidden])')){
    const variant=summary.querySelector('.variant-picker');
    variant?.scrollIntoView({behavior:'smooth',block:'center'});
  }
 });
 summary.querySelectorAll('[data-variant-group] input').forEach(el=>el.addEventListener('change',update));
 document.addEventListener('site:inventory-updated',update);
 window.addEventListener('resize',update,{passive:true});
 window.addEventListener('scroll',update,{passive:true});
 update();
}

// Bouton retour en haut accessible même avant d'atteindre le pied de page.
function initFloatingBackTop(){
 const button=document.createElement('button');
 button.type='button';button.className='floating-back-top';button.setAttribute('aria-label','Retour en haut de la page');button.title='Retour en haut';
 button.innerHTML='<span aria-hidden="true">↑</span>';
 button.hidden=true;
 document.body.appendChild(button);
 const sync=()=>{button.hidden=window.scrollY<460};
 button.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'}));
 window.addEventListener('scroll',sync,{passive:true});sync();
}

function initMobileHeadings(){
 if(!window.matchMedia('(max-width: 767px)').matches)return;
 document.querySelectorAll('.collection-heading h2 br, .section-heading h2 br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
}
function initDate(){const d=document.getElementById('date');if(!d)return;const t=new Date();d.min=[t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-')}
document.addEventListener('DOMContentLoaded',()=>{updateBadges();initCardSliders();initCollectionFilters();initGallery();initProductQuantity();initAddButtons();initVariantAvailability();initCustomOrderLinks();initShipping();renderCart();initSearchPage();initPanels();initDate();initMobileHeadings();initPreorderForm();updateInventory();initMobilePurchaseBar();initFloatingBackTop()});
})();