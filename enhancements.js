/* Дополнения к исходному сайту. Медиа настраиваются в начале index.html. */
(() => {
  const assets = PORTFOLIO_ASSETS;
  const pages = [...document.querySelectorAll('.page')];
  const routes = new Map(pages.map(page => [page.dataset.route,page]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const main = document.querySelector('main');
  const nav = document.querySelector('.top-nav');
  const navLinks = document.querySelector('.top-nav__links');
  const burger = document.querySelector('.top-nav__burger');
  let current = null;
  let homeY = 0;
  let homeSource = null;
  let restoring = false;
  let showHomeTop = false;
  let returnFocus = null;
  const validAsset = value => {
    if(typeof value !== 'string' || !value.trim()) return null;
    try { const url=new URL(value,location.href); return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
  };
  document.querySelectorAll('[data-asset]').forEach(el => {
    const path=validAsset(assets[el.dataset.asset]);
    if(!path) return;
    if(el.tagName==='A')el.href=path;else el.src=path;
    el.closest('.artifact,.flow-artifact,.photo,.about-promo__photo')?.classList.add('has-image');
  });
  if(validAsset(assets.coplayingScreen)) {
    const target=document.querySelector('.coplaying-object');
    const image=document.createElement('img'); image.src=validAsset(assets.coplayingScreen);image.alt='Интерфейс CoPlaying';image.className='coplaying-screen';image.loading='lazy';
    target.replaceWith(image);
  }
  document.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
    if(img.closest('dialog'))return;
    const note=document.createElement('p');note.className='media-error';note.textContent='Изображение временно недоступно';
    img.replaceWith(note);
  },{once:true}));
  const skip=document.createElement('a');skip.href='#content';skip.className='skip-link';skip.textContent='К содержанию';document.body.prepend(skip);
  main.id='content';main.tabIndex=-1;
  const mobileHome=document.createElement('a');mobileHome.href='#/';mobileHome.className='mobile-home';mobileHome.textContent='Проекты';mobileHome.dataset.homeTop='true';
  const mobileCurrent=document.createElement('span');mobileCurrent.className='mobile-current';mobileCurrent.setAttribute('aria-live','polite');
  document.querySelector('.top-nav__inner').prepend(mobileHome,mobileCurrent);
  document.querySelectorAll('.top-nav__links a[href="#/"]').forEach(a=>a.dataset.homeTop='true');
  navLinks.id='main-menu';burger.setAttribute('aria-controls','main-menu');
  function closeMenu(){navLinks.classList.remove('is-open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Открыть меню');}
  burger.addEventListener('click',()=>{const open=navLinks.classList.toggle('is-open');burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && navLinks.classList.contains('is-open')){closeMenu();burger.focus();}});
  document.addEventListener('click',event=>{if(!nav.contains(event.target))closeMenu();});
  const error=document.createElement('section');error.className='page-status';error.hidden=true;error.innerHTML='<h1>Проект не найден</h1><p>Проверьте ссылку или выберите проект в портфолио.</p><a class="route-back" href="#/">Вернуться к портфолио</a>';main.append(error);
  function parseHash(){
    const raw=location.hash.slice(1)||'/';
    if(!raw.startsWith('/'))return {route:null,chapter:raw};
    const segments=raw.split('/').filter(Boolean);
    return {route:segments.length?'/'+segments[0]:'/',chapter:segments[1]||null};
  }
  function scrollToY(y){window.scrollTo({top:y,behavior:'instant'});}
  function focusTitle(page){const title=page.querySelector('h1,h2');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
  function syncExpand(page){
    const chapters=[...page.querySelectorAll('.case-chapter')];const button=page.querySelector('.expand-story');if(!button)return;
    const all=chapters.length>0 && chapters.every(ch=>ch.open);button.setAttribute('aria-expanded',String(all));button.textContent=all?'Свернуть подробности':'Раскрыть весь кейс';
  }
  function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;document.getElementById('progressBar').style.width=(max>0?Math.min(100,window.scrollY/max*100):0)+'%';}
  function render({initial=false}={}){
    const state=parseHash();
    if(!state.route){document.getElementById(state.chapter)?.scrollIntoView({behavior:reduce.matches?'instant':'smooth'});return;}
    const changed=current!==state.route;const previous=current;
    if(changed && current==='/')homeY=window.scrollY;
    restoring=true;
    pages.forEach(page=>{const active=page.dataset.route===state.route;page.classList.toggle('is-active',active);page.hidden=!active;});
    error.hidden=routes.has(state.route);const page=routes.get(state.route)||error;
    const titles={'/':'Котляренко Владислав — Product Manager','/about':'Обо мне — Владислав Котляренко','/coplaying':'CoPlaying — Владислав Котляренко','/lowcode':'Low-code — Product Story','/origami':'Origami Wear — Product Story','/obblic':'Obblic — Product Story','/klever':'Клевер — Product Story','/space-soda':'Космос — Product Story'};
    document.title=titles[state.route]||'Проект не найден — Владислав Котляренко';
    document.querySelectorAll('[data-nav-route]').forEach(a=>{const active=a.dataset.navRoute===state.route;a.classList.toggle('is-active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    mobileCurrent.textContent=state.route==='/'?'':state.route==='/about'?'Обо мне':titles[state.route]?.split(' — ')[0]||'';
    closeMenu();current=state.route;
    document.querySelectorAll('video').forEach(v=>{if(v.closest('.page')?.hidden)v.pause();});
    let target=null;
    if(state.chapter){target=document.getElementById(state.chapter);if(target && target.closest('.page')===page && target.classList.contains('case-chapter'))target.open=true;else target=null;}
    syncExpand(page);
    requestAnimationFrame(()=>{
      if(target){target.scrollIntoView({behavior:'instant'});const summary=target.querySelector('summary');summary?.focus({preventScroll:true});}
      else if(state.route==='/' && previous && previous!=='/' && !showHomeTop){scrollToY(homeY);if(homeSource?.isConnected)homeSource.focus({preventScroll:true});}
      else if(changed||showHomeTop){scrollToY(state.route!=='/' && matchMedia('(max-width:820px)').matches?nav.offsetTop:0);if(!initial)focusTitle(page);}
      showHomeTop=false;restoring=false;updateProgress();
    });
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a');if(!link||event.defaultPrevented||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const href=link.getAttribute('href');if(!href?.startsWith('#'))return;
    if(current==='/' && href.startsWith('#/'))homeSource=link;
    if(link.dataset.homeTop)showHomeTop=true;
    if(href.startsWith('#/')){
      if(location.hash===href){event.preventDefault();closeMenu();if(href==='#/')scrollToY(0);else render();}
      return;
    }
    const id=href.slice(1);const target=document.getElementById(id);if(!target)return;
    event.preventDefault();target.scrollIntoView({behavior:reduce.matches?'instant':'smooth'});
    const focus=target.matches('[tabindex],a,button')?target:target.querySelector('h1,h2,a');if(focus){focus.tabIndex=-1;focus.focus({preventScroll:true});}
  });
  document.querySelectorAll('.expand-story').forEach(button=>button.addEventListener('click',()=>{
    const page=button.closest('.page');const all=button.getAttribute('aria-expanded')==='true';page.querySelectorAll('.case-chapter').forEach(ch=>ch.open=!all);syncExpand(page);updateProgress();
  }));
  document.querySelectorAll('.case-chapter').forEach(ch=>ch.addEventListener('toggle',()=>{syncExpand(ch.closest('.page'));updateProgress();}));
  document.querySelectorAll('.hobby-card').forEach(card=>{
    const toggle=()=>{const open=card.classList.toggle('is-open');card.setAttribute('aria-expanded',String(open));};
    card.addEventListener('click',toggle);card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});
  });
  // Native modal provides focus containment, Escape and return to the invoking image.
  const dialog=document.getElementById('media-dialog');
  document.querySelectorAll('.flow-artifact .asset-image').forEach(img=>{
    img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Рассмотреть изображение: '+(img.alt||''));
    const open=()=>{returnFocus=img;dialog.querySelector('img').src=img.currentSrc||img.src;dialog.querySelector('img').alt=img.alt;dialog.querySelector('p').textContent=img.alt;dialog.showModal();};
    img.addEventListener('click',open);img.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
  });
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{dialog.querySelector('img').removeAttribute('src');returnFocus?.focus({preventScroll:true});});
  // Pointer motion affects images only. Vertical touch scrolling remains native.
  const artTargets=[...document.querySelectorAll('.chapter__inner>.artifact,.chapter__inner>.artifact-stack')];
  artTargets.forEach(art=>{
    art.classList.add('is-interactive');art.tabIndex=0;art.setAttribute('role','button');art.setAttribute('aria-label','Покачать объект проекта. Используйте стрелки, Enter — вернуть в центр.');
    let x=0,y=0,dragging=false,keyboardMode=false;
    const paint=()=>{art.style.setProperty('--art-x',x+'deg');art.style.setProperty('--art-y',y+'deg');art.style.setProperty('--art-shift',y*.6+'px');};
    const reset=()=>{x=0;y=0;art.classList.remove('is-moving');paint();};
    art.addEventListener('pointerdown',event=>{keyboardMode=false;if(event.pointerType!=='mouse')dragging=true;});
    art.addEventListener('pointermove',event=>{if(reduce.matches || keyboardMode || event.pointerType!=='mouse'&&!dragging)return;const r=art.getBoundingClientRect();x=Math.max(-7,Math.min(7,(.5-(event.clientY-r.top)/r.height)*14));y=Math.max(-9,Math.min(9,((event.clientX-r.left)/r.width-.5)*18));art.classList.add('is-moving');paint();});
    ['pointerleave','pointerup','pointercancel'].forEach(name=>art.addEventListener(name,()=>{dragging=false;if(!keyboardMode)reset();}));
    art.addEventListener('blur',()=>{keyboardMode=false;dragging=false;reset();});
    art.addEventListener('keydown',event=>{if(reduce.matches)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(event.key)){event.preventDefault();keyboardMode=true;if(event.key==='Enter'||event.key===' ')reset();else{x=Math.max(-7,Math.min(7,x+(event.key==='ArrowUp'?2:event.key==='ArrowDown'?-2:0)));y=Math.max(-9,Math.min(9,y+(event.key==='ArrowRight'?3:event.key==='ArrowLeft'?-3:0)));paint();}}});
  });
  // Preserve the author's moving video, with pause and reduced-motion support.
  const videos=[...document.querySelectorAll('video')];
  const manuallyPaused=new WeakSet();
  videos.forEach(video=>{
    video.muted=true;video.playsInline=true;
    if(video.closest('.about-promo__photo')){
      const button=document.createElement('button');button.type='button';button.className='media-toggle';button.textContent='Пауза';video.parentElement.append(button);
      video.addEventListener('play',()=>button.textContent='Пауза');video.addEventListener('pause',()=>button.textContent='Смотреть видео');
      button.addEventListener('click',()=>{if(video.paused){manuallyPaused.delete(video);video.play().catch(()=>{});}else{manuallyPaused.add(video);video.pause();}});
    }else video.controls=true;
    if(reduce.matches)video.pause();
  });
  if('IntersectionObserver' in window){
    const watcher=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const v=entry.target;
      if(!entry.isIntersecting||v.closest('.page')?.hidden||document.hidden)v.pause();
      else if(!reduce.matches&&!manuallyPaused.has(v)&&v.hasAttribute('autoplay'))v.play().catch(()=>{});
    }),{threshold:.25});videos.forEach(v=>watcher.observe(v));
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(v=>v.pause());});
  reduce.addEventListener('change',()=>{if(reduce.matches)videos.forEach(v=>v.pause());});
  window.addEventListener('hashchange',()=>render());
  window.addEventListener('scroll',()=>{if(current==='/'&&!restoring)homeY=window.scrollY;updateProgress();},{passive:true});
  window.addEventListener('resize',updateProgress);
  document.getElementById('year').textContent=new Date().getFullYear();
  if(!location.hash)history.replaceState(null,'','#/');
  render({initial:true});
})();
