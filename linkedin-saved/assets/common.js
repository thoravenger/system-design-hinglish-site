(function(){
'use strict';
const P=window.SAVED_POSTS||[], T=window.TOPICS||[];
const TOP={}; T.forEach(t=>TOP[t.key]=t);
const BYID={}; P.forEach(p=>BYID[p.id]=p);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PALETTE=['#0b63ce','#7b2cbf','#c2410c','#0f766e','#15803d','#b91c1c','#a16207','#4338ca','#be185d','#0369a1','#475569','#9333ea'];
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function initials(name){
  const w=String(name).replace(/[^\p{L}\p{N}\s.'-]/gu,' ').split(/\s+/).filter(x=>/[\p{L}\p{N}]/u.test(x));
  if(!w.length)return '?';
  return (w[0][0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase();
}
function avatar(name,cls){return `<div class="av ${cls||''}" style="background:${PALETTE[hash(name)%PALETTE.length]}" aria-hidden="true">${esc(initials(name))}</div>`}
function chip(k,link){const t=TOP[k]||TOP.other;const st=`--c:${t.color};--t:${t.tint}`;
  return link?`<a class="chip" style="${st}" href="index.html?topic=${t.key}">${esc(t.label)}</a>`:`<span class="chip" style="${st}">${esc(t.label)}</span>`}
const URLRE=/(https?:\/\/[^\s<>"]+|\blnkd\.in\/[A-Za-z0-9_-]+)/g;
function hl(escaped,terms){
  if(!terms||!terms.length)return escaped;
  const re=new RegExp('('+terms.map(t=>esc(t).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');
  return escaped.replace(re,'<mark>$1</mark>');
}
function linkify(line,terms){
  let out='',pos=0,m;URLRE.lastIndex=0;
  while((m=URLRE.exec(line))){
    out+=hl(esc(line.slice(pos,m.index)),terms);
    let u=m[0].replace(/[.,);:!?]+$/,'');const tail=m[0].slice(u.length);
    const href=/^https?:/.test(u)?u:'https://'+u;
    out+=`<a href="${esc(href)}" target="_blank" rel="noopener">${esc(u)}</a>`+esc(tail);
    pos=m.index+m[0].length;
  }
  return out+hl(esc(line.slice(pos)),terms);
}
function bodyHTML(text,terms){
  if(!text)return '<p><i style="color:#888">(no post text captured)</i></p>';
  return text.split('\n').map(l=>l===''?'<div class="gap"></div>':(/^(#\S+\s*)+$/.test(l)?`<p class="tags">${linkify(l,terms)}</p>`:`<p>${linkify(l,terms)}</p>`)).join('');
}
function domain(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}}
function linksHTML(links,max){
  if(!links||!links.length)return '';
  const item=u=>{const d=domain(u);return `<a class="li" href="${esc(u)}" target="_blank" rel="noopener"><span class="fav">${esc(d.slice(0,2).toUpperCase())}</span><span class="lt"><span class="dom">${esc(d)}</span><span class="url">${esc(u)}</span></span></a>`};
  const shown=max&&links.length>max?links.slice(0,max):links;
  let h=`<div class="lp"><div class="lh">Links (${links.length})</div>${shown.map(item).join('')}`;
  if(shown.length<links.length)h+=`<button class="moreL" data-more-links>+ ${links.length-shown.length} more links</button><div hidden>${links.slice(max).map(item).join('')}</div>`;
  return h+'</div>';
}
const ICON={
 ext:'<svg viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>',
 open:'<svg viewBox="0 0 24 24"><path d="M4 4h16v2H4zm0 5h16v2H4zm0 5h10v2H4zm0 5h10v2H4z"/></svg>',
 copy:'<svg viewBox="0 0 24 24"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>',
 media:'<svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>',
 search:'<svg viewBox="0 0 24 24"><path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>',
 logo:'<svg viewBox="0 0 24 24" fill="#fff"><path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4.5L5 22V3a1 1 0 0 1 1-1z"/></svg>'
};
function postCard(p,opts){
  opts=opts||{};const terms=opts.terms||[];const full=!!opts.full;
  const authorHref=`index.html?author=${encodeURIComponent(p.author)}`;
  let h=`<article class="card post" data-id="${p.id}"><div class="ph">${avatar(p.author,full?'lg':'')}<div class="who">
   <a class="nm" href="${authorHref}">${hl(esc(p.author),terms)}</a>
   ${p.headline?`<div class="hl" title="${esc(p.headline)}">${esc(p.headline)}</div>`:''}
   <div class="dt">${esc(p.date)} · Saved post</div></div>
   <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">${chip(p.topic,true)}<span class="num">#${p.id}</span></div></div>`;
  const long=!full&&(p.text.length>420||p.text.split('\n').length>6);
  h+=`<div class="body${long?' clip':''}">${bodyHTML(p.text,terms)}</div>`;
  if(long)h+=`<button class="more" data-see-more>…see more</button>`;
  if(p.media)h+=`<div class="media">${ICON.media}<span><b>Media:</b> ${esc(p.media)}</span></div>`;
  h+=linksHTML(p.links,full?0:3);
  if(p.also&&p.also.length)h+=`<div class="also"><b>Also saved as:</b> ${p.also.map(a=>`${esc(a.author)} (${esc(a.date)}) · <a href="${esc(a.url)}" target="_blank" rel="noopener">open</a>`).join('; ')}</div>`;
  h+=`<div class="acts"><a href="${esc(p.permalink)}" target="_blank" rel="noopener">${ICON.ext}View on LinkedIn</a>${full?'':`<a href="post.html?id=${p.id}">${ICON.open}Open post</a>`}<button data-copy="${esc(p.permalink)}">${ICON.copy}<span>Copy link</span></button></div></article>`;
  return h;
}
function nav(active,q){
  return `<header class="nav"><div class="nav-in"><a class="brand" href="index.html"><span class="logo">${ICON.logo}</span><span>My Saved Posts</span></a>
  <form class="nsearch" action="index.html" role="search">${ICON.search}<input type="search" name="q" id="q" placeholder="Search authors or text" value="${esc(q||'')}" autocomplete="off" aria-label="Search"></form>
  <nav class="navlinks"><a href="index.html" class="${active==='feed'?'on':''}">Feed</a><a href="topics.html" class="${active==='topics'?'on':''}">Topics</a><a href="authors.html" class="${active==='authors'?'on':''}">Authors</a></nav></div></header>`;
}
function bindCommon(root){
  root.addEventListener('click',e=>{
    const sm=e.target.closest('[data-see-more]');
    if(sm){const b=sm.previousElementSibling;if(b.classList.contains('clip')){b.classList.remove('clip');sm.textContent='show less'}else{b.classList.add('clip');sm.textContent='…see more';b.closest('.post').scrollIntoView({block:'nearest'})}return}
    const ml=e.target.closest('[data-more-links]');
    if(ml){ml.nextElementSibling.hidden=false;ml.remove();return}
    const cp=e.target.closest('[data-copy]');
    if(cp){const s=cp.querySelector('span');const done=()=>{s.textContent='Copied';setTimeout(()=>s.textContent='Copy link',1400)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(cp.dataset.copy).then(done,()=>{prompt('Copy link:',cp.dataset.copy)});else prompt('Copy link:',cp.dataset.copy);}
  });
}
function qs(){return new URLSearchParams(location.search)}
function sorted(order){const a=P.slice().sort((x,y)=>x.age-y.age||x.id-y.id);return order==='oldest'?a.reverse():a}
function authorCounts(list){const m=new Map();(list||P).forEach(p=>m.set(p.author,(m.get(p.author)||0)+1));return [...m.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))}
window.SP={P,T,TOP,BYID,esc,avatar,chip,postCard,nav,bindCommon,qs,sorted,authorCounts,ICON,initials};
})();
