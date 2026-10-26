(function(){
'use strict';
const {P,T,TOP,esc,postCard,nav,bindCommon,qs,sorted,authorCounts,avatar}=SP;
const params=qs();
const st={q:params.get('q')||'',topic:params.get('topic')||'',author:params.get('author')||'',sort:params.get('sort')==='oldest'?'oldest':'newest'};
if(st.topic&&!TOP[st.topic])st.topic='';
const HAY={};P.forEach(p=>HAY[p.id]=(p.author+'\n'+p.headline+'\n'+p.text).toLowerCase());
const BATCH=20;let list=[],shown=0;
document.getElementById('nav').innerHTML=nav('feed',st.q);
const feed=document.getElementById('feed'),sent=document.getElementById('sentinel');
const qIn=document.getElementById('q');
function terms(){return st.q.toLowerCase().split(/\s+/).filter(t=>t.length>0)}
function base(){const ts=terms();return sorted(st.sort).filter(p=>(!st.author||p.author===st.author)&&ts.every(t=>HAY[p.id].includes(t)))}
function renderFilters(b){
  const cnt={};b.forEach(p=>cnt[p.topic]=(cnt[p.topic]||0)+1);
  let h=`<h3>Topics</h3><button class="tf${st.topic?'':' on'}" data-topic="" style="--c:#1d1d1d"><span class="dot" style="background:linear-gradient(135deg,${T.map(t=>t.color).join(',')})"></span>All posts<span class="n">${b.length}</span></button>`;
  T.forEach(t=>{h+=`<button class="tf${st.topic===t.key?' on':''}" data-topic="${t.key}" style="--c:${t.color}"><span class="dot"></span>${esc(t.label)}<span class="n">${cnt[t.key]||0}</span></button>`});
  document.getElementById('filters').innerHTML=h;
}
function renderRight(){
  const top=authorCounts().slice(0,8);
  document.getElementById('right').innerHTML=`<div class="card rcard"><h3>Most-saved authors</h3>${top.map(([a,n])=>`<a class="ra" href="index.html?author=${encodeURIComponent(a)}">${avatar(a)}<div style="min-width:0"><div class="t">${esc(a)}</div><div class="s">${n} saved post${n>1?'s':''}</div></div></a>`).join('')}<a class="rmore" href="authors.html">See all authors →</a></div>
  <div class="card rcard"><h3>By topic</h3><div style="padding:0 14px 6px"><div class="bars">${T.map(t=>`<i title="${esc(t.label)}" style="flex:${P.filter(p=>p.topic===t.key).length};background:${t.color}"></i>`).join('')}</div><a class="rmore" style="padding:8px 0 0" href="topics.html">Topic overview →</a></div></div>
  <div class="foot">My Saved Posts · personal archive<br>Generated ${esc(SAVED_META.generated)} · ${P.length} posts (${SAVED_META.dupes} duplicates merged)</div>`;
}
function syncURL(){
  const u=new URLSearchParams();if(st.q)u.set('q',st.q);if(st.topic)u.set('topic',st.topic);if(st.author)u.set('author',st.author);if(st.sort==='oldest')u.set('sort','oldest');
  const s=u.toString();try{history.replaceState(null,'','index.html'+(s?'?'+s:''))}catch(e){}
}
function more(){
  const ts=terms();const frag=list.slice(shown,shown+BATCH).map(p=>postCard(p,{terms:ts})).join('');
  feed.insertAdjacentHTML('beforeend',frag);shown=Math.min(shown+BATCH,list.length);
  sent.textContent=shown<list.length?'Loading more…':(list.length?'You’re all caught up · '+list.length+' posts':'');
}
function apply(){
  const b=base();renderFilters(b);
  list=st.topic?b.filter(p=>p.topic===st.topic):b;
  feed.innerHTML='';shown=0;
  const chips=[];
  if(st.q)chips.push(`<span class="fchip">“${esc(st.q)}”<button data-clear="q" aria-label="Clear search">×</button></span>`);
  if(st.author)chips.push(`<span class="fchip">Author: ${esc(st.author)}<button data-clear="author" aria-label="Clear author">×</button></span>`);
  if(st.topic)chips.push(`<span class="fchip" style="background:${TOP[st.topic].tint};color:${TOP[st.topic].color};border-color:${TOP[st.topic].color}55">${esc(TOP[st.topic].label)}<button data-clear="topic" aria-label="Clear topic">×</button></span>`);
  document.getElementById('res').innerHTML=`<b>${list.length}</b> post${list.length===1?'':'s'}`;
  document.getElementById('active').innerHTML=chips.join('');
  document.getElementById('sort').value=st.sort;
  if(!list.length)feed.innerHTML='<div class="card empty">No saved posts match. Try a different search or topic.</div>';
  more();syncURL();
}
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(!b)return;st.topic=b.dataset.topic;apply();window.scrollTo({top:0})});
document.getElementById('active').addEventListener('click',e=>{const b=e.target.closest('[data-clear]');if(!b)return;st[b.dataset.clear]='';if(b.dataset.clear==='q')qIn.value='';apply()});
document.getElementById('sort').addEventListener('change',e=>{st.sort=e.target.value;apply()});
let tmr;qIn.addEventListener('input',()=>{clearTimeout(tmr);tmr=setTimeout(()=>{st.q=qIn.value.trim();apply()},180)});
qIn.form.addEventListener('submit',e=>{e.preventDefault();st.q=qIn.value.trim();apply()});
new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)&&shown<list.length)more()},{rootMargin:'800px'}).observe(sent);
bindCommon(document.body);renderRight();apply();
window.__feedReady=true;
})();
