(() => {
  const c = window.portfolioImages?.analytics;
  if (!c?.enabled || !['www.oz-ege.works','oz-ege.works','ketchupe.github.io'].includes(location.hostname)) return;
  const key = 'portfolio-statistics-choice-v2';
  const visitorKey = 'portfolio-browser-v1';
  const visitKey = 'portfolio-session-v2';
  const uuid = v => typeof v === 'string' && /^[a-f0-9-]{36}$/i.test(v);
  const days = Math.min(365,Math.max(1,Number(c.visitorIdDays) || 30));
  const get = (storage, k) => { try { return window[storage].getItem(k); } catch { return null; } };
  const put = (storage, k, v) => { try { window[storage].setItem(k, v); } catch {} };
  const page = location.pathname.includes('/stairs/') ? 'stairs' : 'home';
  const areas = ['top','work','about','project-01','project-02','project-03','project-04'];
  let allowed = false, visit, visitor, returning = false, pageLoad, seconds = 0, depth = 0, areaTimes = {}, clicks = {};
  let last = performance.now(), interaction = last, sequence = 0, dirty = false;
  let candidate = null, dwell = 0, announced = null, lastSectionMessage = -Infinity;
  const device = /ipad|tablet/i.test(navigator.userAgent) ? 'tablet' : /mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  const panel = document.createElement('section'); panel.className = 'visit-consent'; panel.setAttribute('aria-label', c.title);
  const heading = document.createElement('h2'); heading.textContent = c.title;
  const notice = document.createElement('p'); notice.textContent = c.notice.replace('{days}',String(days));
  const saved = document.createElement('p'); saved.textContent = c.savedText;
  const yes = document.createElement('button'); yes.textContent = c.allowText;
  const no = document.createElement('button'); no.textContent = c.declineText;
  const settings = document.createElement('button'); settings.className = 'visit-settings'; settings.textContent = c.settingsText;
  panel.append(heading,notice,saved,yes,no); document.body.append(panel,settings);
  function reset() { seconds = 0; depth = 0; areaTimes = {}; clicks = {}; sequence = 0; dirty = false; last = interaction = performance.now(); candidate = announced = null; dwell = 0; lastSectionMessage = -Infinity; }
  function start() {
    reset();
    let browser, session;
    try { browser = JSON.parse(get('localStorage',visitorKey)); } catch {}
    try { session = JSON.parse(get('sessionStorage',visitKey)); } catch {}
    const existing = browser && uuid(browser.id) && browser.expires > Date.now();
    if (!existing) browser = {id:crypto.randomUUID(),expires:Date.now()+days*86400000};
    visitor = browser.id;
    // One visit per tab session; a 30-minute inactivity gap starts another visit.
    if (!session || session.visitor !== visitor || !uuid(session.id) || Date.now()-session.last > 1800000) {
      session = {id:crypto.randomUUID(),visitor,returning:Boolean(existing),last:Date.now()};
    }
    visit = session.id; returning = Boolean(session.returning); pageLoad = crypto.randomUUID();
    put('localStorage',visitorKey,JSON.stringify(browser)); put('sessionStorage',visitKey,JSON.stringify(session));
    allowed = true; dirty = true; report();
  }
  function choose(value) {
    allowed = false; reset(); put('localStorage',key,value); panel.hidden = true;
    if (value === 'yes') start();
    else { try { sessionStorage.removeItem(visitKey); localStorage.removeItem(visitorKey); } catch {} }
    settings.focus();
  }
  yes.onclick = () => choose('yes'); no.onclick = () => choose('no');
  settings.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) yes.focus(); };
  addEventListener('storage', e => { if (e.key === key) { allowed = false; reset(); if (e.newValue === 'yes') start(); panel.hidden = e.newValue !== null; } });
  function tick() {
    const now = performance.now();
    const elapsed = Math.min((now-last)/1000, 2); last = now;
    if (!allowed || document.hidden || now-interaction > Math.max(10,c.idleSeconds || 60)*1000) { candidate = null; dwell = 0; return; }
    seconds = Math.min(86400, seconds+elapsed); dirty = true;
    const maxScroll = document.documentElement.scrollHeight-innerHeight;
    depth = Math.max(depth, Math.min(100,Math.round(maxScroll > 0 ? scrollY/maxScroll*100 : 100)));
    // Assign time to the section occupying the viewport's centre, including very tall chapters.
    let current = page === 'stairs' ? 'stairs' : null;
    for (const id of areas) {
      const rect = document.getElementById(id)?.getBoundingClientRect();
      if (rect && rect.top <= innerHeight/2 && rect.bottom > innerHeight/2) {
        current = id;
        if (id === 'top' && document.getElementById('video')?.getBoundingClientRect().top <= innerHeight/2) current = 'video';
        areaTimes[current] = Math.min(86400,(areaTimes[current] || 0)+elapsed); break;
      }
    }
    if (current !== candidate) { candidate = current; dwell = 0; }
    dwell += elapsed;
    if (c.sectionUpdates !== false && current && current !== announced &&
        dwell >= Math.max(1,Number(c.sectionDwellSeconds) || 2) &&
        now-lastSectionMessage >= Math.max(5,Number(c.sectionCooldownSeconds) || 10)*1000) {
      send({event:'section_enter',target:current,visit,visitor,pageLoad,sequence:++sequence});
      announced = current; lastSectionMessage = now;
    }
  }
  function send(payload) {
    fetch(c.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true}).catch(()=>{});
  }
  function report() {
    if (!allowed || !dirty) return;
    put('sessionStorage',visitKey,JSON.stringify({id:visit,visitor,returning,last:Date.now()}));
    const payload = {event:'visit_summary',target:page,visit,visitor,returning,pageLoad,sequence:++sequence,device,seconds:Math.round(seconds),depth,
      areas:Object.fromEntries(Object.entries(areaTimes).map(([k,v])=>[k,Math.round(v)])),clicks};
    dirty = false;
    send(payload);
  }
  for (const event of ['pointerdown','keydown','scroll','touchstart']) addEventListener(event,()=>{interaction=performance.now();},{passive:true});
  document.addEventListener('click', e => {
    if (!allowed) return;
    const el = e.target.closest('a,button'); if (!el) return;
    let label;
    if (el.matches('a') && /\.pdf(?:[?#]|$)/i.test(el.getAttribute('href') || '')) label = /cv/i.test(el.getAttribute('href')) ? 'cv' : 'portfolio';
    if (label) label += el.hasAttribute('download') ? '-download' : '-view';
    if (page === 'stairs' && ['recommend','reset','best','view-3d','view-side'].includes(el.id)) label = el.id;
    if (el.matches('.lucky-button')) label = 'random-project';
    if (label) { clicks[label] = Math.min(1000,(clicks[label] || 0)+1); dirty = true; }
  });
  document.addEventListener('change', e => {
    if (allowed && page === 'stairs' && ['height','length','count'].includes(e.target.id)) {
      clicks.calculate = Math.min(1000,(clicks.calculate || 0)+1); dirty = true;
    }
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden) report(); last=performance.now();});
  addEventListener('pagehide',report);
  setInterval(tick,1000); setInterval(report,Math.max(30,c.reportSeconds || 60)*1000);
  const choice = get('localStorage',key); panel.hidden = choice !== null;
  if (choice === 'yes') start();
})();
