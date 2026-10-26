/* SystemDesign.hinglish — theme toggle, TOC builder + scroll highlight, mobile menu, image lightbox */
(function(){
  var KEY='sd-theme', root=document.documentElement;
  try{
    var saved=localStorage.getItem(KEY);
    if(saved==='dark'||(!saved&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)) root.classList.add('dark');
  }catch(e){}
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn);}
  function slug(t){return t.toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g,'-').replace(/^-|-$/g,'')||'section';}
  ready(function(){
    var btn=document.querySelector('.theme-toggle');
    if(btn){btn.addEventListener('click',function(){
      root.classList.toggle('dark');
      try{localStorage.setItem(KEY,root.classList.contains('dark')?'dark':'light');}catch(e){}
    });}
    // mobile menu button
    var top=document.querySelector('.topbar'), side=document.querySelector('.sidebar');
    if(top&&side&&!document.querySelector('.menu-toggle')){
      var m=document.createElement('button');m.className='menu-toggle';m.setAttribute('aria-label','menu');m.textContent='☰';
      top.insertBefore(m,top.firstChild);
      m.addEventListener('click',function(){document.body.classList.toggle('nav-open');});
      side.addEventListener('click',function(e){if(e.target.closest('a'))document.body.classList.remove('nav-open');});
    }
    // sidebar: scroll active into view
    var act=side&&side.querySelector('a.active'); if(act&&act.scrollIntoView){try{act.scrollIntoView({block:'center'});}catch(e){}}
    // TOC
    var content=document.querySelector('.content'), toc=document.querySelector('aside.toc');
    var heads=content?Array.prototype.slice.call(content.querySelectorAll('h2')):[];
    var used={};
    heads.forEach(function(h){
      if(!h.id){var s=slug(h.textContent),b=s,i=2;while(used[s]||document.getElementById(s))s=b+'-'+(i++);h.id=s;}
      used[h.id]=1;
    });
    if(toc&&!toc.querySelector('a')&&heads.length){
      var html='<div class="toc-title">On this page</div><ul>';
      heads.forEach(function(h){html+='<li><a href="#'+h.id+'">'+h.textContent.replace(/[<>&]/g,'')+'</a></li>';});
      toc.innerHTML=html+'</ul>';
    }
    if(toc){
      var links=Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
      var onScroll=function(){
        var cur=null,y=window.scrollY+120;
        heads.forEach(function(h){if(h.offsetTop<=y)cur=h.id;});
        links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+cur);});
      };
      window.addEventListener('scroll',onScroll,{passive:true});onScroll();
    }
    // lightbox for diagrams
    document.addEventListener('click',function(e){
      var img=e.target.closest&&e.target.closest('.diagram img');
      if(img){var lb=document.createElement('div');lb.className='lightbox';lb.innerHTML='<img alt="">';lb.firstChild.src=img.src;
        lb.addEventListener('click',function(){lb.remove();});document.body.appendChild(lb);}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){var l=document.querySelector('.lightbox');if(l)l.remove();}});
  });
})();
