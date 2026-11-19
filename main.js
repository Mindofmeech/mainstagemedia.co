(()=>{
  const q=(s,c=document)=>c.querySelector(s), qa=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params=new URLSearchParams(location.search);

  // Intro cue plays once per session; ?intro=1 forces it, ?intro=0 skips it.
  const seen=sessionStorage.getItem('ms_intro');
  if(params.get('intro')==='0'||(seen&&params.get('intro')!=='1')) document.documentElement.classList.add('noanim');
  sessionStorage.setItem('ms_intro','1');

  // Landing hero video: always muted, inline, looping, no audio track. 1080p on desktop, 720p on small / touch screens.
  const atmos=q('#atmos');
  const saver=navigator.connection&&navigator.connection.saveData;
  if(atmos){
    atmos.muted=true;atmos.defaultMuted=true;atmos.volume=0;
    const small=matchMedia('(max-width: 820px), (pointer: coarse)').matches;
    if(small) atmos.poster=atmos.dataset.posterSd;
    if(!reduce&&!saver){
      atmos.src=small?atmos.dataset.srcSd:atmos.dataset.srcHd;
      const go=()=>{const p=atmos.play();p&&p.catch(()=>{})};
      atmos.addEventListener('canplay',go,{once:true});
      document.addEventListener('visibilitychange',()=>{document.hidden?atmos.pause():go()});
      atmos.load();
    } // else: poster frame stays as a still
  }

  // Menu
  const btn=q('#menuBtn'), menu=q('#menu'), label=q('.mb-label',btn);
  const setMenu=o=>{
    btn.setAttribute('aria-expanded',o); label.textContent=o?'Close':'Menu';
    if(o){menu.hidden=false;requestAnimationFrame(()=>menu.classList.add('open'));document.body.style.overflow='hidden'}
    else{menu.classList.remove('open');document.body.style.overflow='';setTimeout(()=>{if(!menu.classList.contains('open'))menu.hidden=true},350)}
  };
  btn.addEventListener('click',()=>setMenu(btn.getAttribute('aria-expanded')!=='true'));
  qa('a',menu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

  // Tap the logo to fire the lights again
  const lw=q('#logoBtn');
  lw.addEventListener('click',()=>{lw.classList.remove('fire');void lw.offsetWidth;lw.classList.add('fire');document.documentElement.classList.add('noanim')});

  // Light follows the pointer, a few pixels
  const stage=q('#stage');
  if(!reduce&&matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',e=>{
      const x=(e.clientX/innerWidth-.5)*2,y=(e.clientY/innerHeight-.5)*2;
      stage.style.setProperty('--px',x.toFixed(3));stage.style.setProperty('--py',y.toFixed(3));
      q('.beams',stage).style.transform=`translate(calc(-50% + ${x*16}px),calc(-52% + ${y*8}px))`;
    },{passive:true});
  }

  // YouTube facade: loads the privacy-enhanced (youtube-nocookie) player only after a click. No autoplay on page load.
  const yt=q('#ytVlog');
  if(yt){
    const f=q('.yt-facade',yt);
    f.addEventListener('click',e=>{
      e.preventDefault();
      const i=document.createElement('iframe');
      i.src='https://www.youtube-nocookie.com/embed/'+yt.dataset.id+'?autoplay=1&rel=0&playsinline=1';
      i.title=yt.dataset.title;i.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      i.referrerPolicy='strict-origin-when-cross-origin';i.allowFullscreen=true;
      f.replaceWith(i);i.focus();
    });
  }

  // Touch: tap a tile to toggle its second reveal (hover-only on desktop, same as the live site)
  const touch=matchMedia('(hover:none)').matches;
  qa('.hover-swap,.hover-swap-service').forEach(t=>{
    t.addEventListener('click',()=>{
      if(!touch) return;
      const on=!t.classList.contains('is-revealed');
      qa('.is-revealed').forEach(o=>{if(o!==t)o.classList.remove('is-revealed')});
      t.classList.toggle('is-revealed',on);
    });
    t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t.classList.toggle('is-revealed')}});
  });

  // Scroll reveals
  const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12}):null;
  qa('.sec-head,.trusted>li,.svc-row,.contact>*').forEach(el=>{el.classList.add('rv');io?io.observe(el):el.classList.add('in')});

  // Header: fade the wordmark once past the landing
  const bar=q('#bar');
  addEventListener('scroll',()=>bar.classList.toggle('scrolled',scrollY>40),{passive:true});
})();
