const images = window.portfolioImages;
const stairMenuLabel = document.querySelector('[data-stair-menu-label]');
if (stairMenuLabel) stairMenuLabel.textContent = images.stairCalculator?.menuLabel || 'Stair calculator';
const usefulLabel = document.querySelector('[data-useful-label]');
if (usefulLabel) usefulLabel.textContent = images.stairCalculator?.groupLabel || 'Useful stuff';
const intro = document.querySelector('.intro');
const stage = document.querySelector('.intro-stage');
const identity = document.querySelector('.identity');


const root = document.documentElement;
const configuredNameSize = Number(images.nameFontSize ?? 4.2);
const nameFontSize = Number.isFinite(configuredNameSize) && configuredNameSize > 0 ? configuredNameSize : 4.2;
root.style.setProperty('--name-font-size', `${nameFontSize}vw`);
const configuredGrayscale = Number(images.stripBlackAndWhiteStrength ?? 1);
const stripGrayscale = Number.isFinite(configuredGrayscale) ? Math.min(1, Math.max(0, configuredGrayscale)) : 1;
const configuredFilmFeather = Number(images.filmRevealFeather ?? 120);
const filmFeather = Number.isFinite(configuredFilmFeather) ? Math.max(0, configuredFilmFeather) : 120;
root.style.setProperty('--strip-grayscale', images.stripBlackAndWhite === false ? '0' : String(stripGrayscale));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

// Measure the actual fonts on this device instead of guessing tracking per face.
const titleFaces = [
  ['Helvetica,Arial,sans-serif', '700', 'normal'],
  ['Georgia,"Times New Roman",serif', '400', 'italic'],
  ['Impact,"Arial Narrow",sans-serif', '400', 'normal'],
  ['"Segoe Script","Brush Script MT","Comic Sans MS",cursive', '400', 'normal'],
  ['"Cascadia Code",Consolas,monospace', '400', 'normal'],
  ['"Times New Roman",Times,serif', '700', 'normal']
];
let titleStyles = [];
let titleIndex = 0;
let titleTimer = null;
function applyTitleFace(index) {
  if (titleStyles[index]) Object.assign(identity.style, titleStyles[index]);
}
function measureTitleFaces() {
  const size = innerWidth * nameFontSize / 100;
  const canvas = document.createElement('canvas').getContext('2d');
  const probe = document.createElement('span');
  probe.textContent = identity.textContent;
  Object.assign(probe.style, { position:'fixed', visibility:'hidden', whiteSpace:'nowrap', width:'max-content', pointerEvents:'none', left:'-20000px', fontSize:`${size}px` });
  document.body.append(probe);
  const capHeight = (face, fontSize) => {
    canvas.font = `${face[2]} ${face[1]} ${fontSize}px ${face[0]}`;
    return canvas.measureText('H').actualBoundingBoxAscent || fontSize * .7;
  };
  Object.assign(probe.style, { fontFamily:titleFaces[0][0], fontWeight:'700', fontStyle:'normal', letterSpacing:`${size * -.055}px` });
  const targetWidth = probe.getBoundingClientRect().width;
  const targetHeight = capHeight(titleFaces[0], size);
  titleStyles = titleFaces.map((face, index) => {
    const fontSize = index === 0 ? size : size * targetHeight / capHeight(face, size);
    const style = { fontFamily:face[0], fontWeight:face[1], fontStyle:face[2], fontSize:`${fontSize}px`, lineHeight:`${size * 1.05}px`, letterSpacing:'0px' };
    Object.assign(probe.style, style);
    // CSS tracking contributes once per character, including the final advance.
    style.letterSpacing = `${(targetWidth - probe.getBoundingClientRect().width) / [...probe.textContent].length}px`;
    return style;
  });
  probe.remove();
  applyTitleFace(titleTimer === null ? 0 : titleIndex);
}
function setFontCycling(active) {
  if (active && titleTimer === null) {
    titleIndex = 0;
    applyTitleFace(0);
    titleTimer = setInterval(() => {
      titleIndex = (titleIndex + 1) % titleFaces.length;
      applyTitleFace(titleIndex);
    }, 250); // Four swaps per second; six faces take 1.5 seconds.
  } else if (!active && titleTimer !== null) {
    clearInterval(titleTimer);
    titleTimer = null;
    applyTitleFace(0);
  }
}
measureTitleFaces();
Promise.all(titleFaces.map(face => document.fonts.load(`${face[2]} ${face[1]} 100px ${face[0]}`, identity.textContent))).then(measureTitleFaces);
window.addEventListener('resize', measureTitleFaces);


document.querySelectorAll('[data-image]').forEach(image => {
  const source = images[image.dataset.image];
  if (image.dataset.image === 'film' && /\.(mp4|webm)(?:[?#]|$)/i.test(source || '')) {
    const video = document.createElement('video');
    video.muted = true; video.defaultMuted = true; video.autoplay = true;
    video.loop = images.filmPlayback?.loop !== false; video.playsInline = true;
    video.preload = 'auto'; video.setAttribute('aria-label', images.filmPlayback?.label || 'Portfolio film');
    video.src = source;
    const speed = Number(images.filmPlayback?.speed ?? 1);
    video.playbackRate = Number.isFinite(speed) ? Math.max(.25, Math.min(4, speed)) : 1;
    image.replaceWith(video);
    const play = () => video.play().catch(() => { video.controls = true; });
    play();
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
  } else image.src = source;
});
const stripTracks = [...document.querySelectorAll('.lane-track')];
const groupedStrips = images.strips.every(Array.isArray);
const uniqueStrips = groupedStrips ? [] : [...new Set(images.strips)];
const configuredStripSpeed = Number(images.stripScrollSpeed ?? 1);
const stripSpeed = Number.isFinite(configuredStripSpeed) && configuredStripSpeed >= 0 ? configuredStripSpeed : 1;
stripTracks.forEach((track, lane) => {
  track.replaceChildren();
  // Each column loops its own project's images; loop length adjusts to its count.
  const sequence = groupedStrips
    ? [...new Set(images.strips[lane] ?? [])]
    : uniqueStrips.filter((_, index) => index % stripTracks.length === lane);
  const copies = [...sequence, ...sequence];
  track.style.height = `${copies.length * 60}%`;
  // Image height and travel speed stay consistent across different group lengths.
  const duration = parseFloat(getComputedStyle(track).animationDuration);
  const delay = parseFloat(getComputedStyle(track).animationDelay);
  track.style.animationDuration = `${duration * sequence.length / 3 / (stripSpeed || 1)}s`;
  track.style.animationDelay = `${delay * sequence.length / 3 / (stripSpeed || 1)}s`;
  track.style.animationPlayState = stripSpeed === 0 ? 'paused' : 'running';
  copies.forEach(src => {
    const image = document.createElement('img');
    image.src = src; image.alt = '';
    image.style.height = `${100 / copies.length}%`;
    track.append(image);
  });
});

let scheduled = false;
let titleRevealed = false;
function updateScroll() {
  const screenHeight = stage.offsetHeight;
  const scrollScreens = Math.max(0, -intro.getBoundingClientRect().top / Math.max(1, screenHeight));
  titleRevealed = scrollScreens > .002;
  // Preserve the original opening pace; extra scroll distance belongs to the film.
  const progress = clamp(scrollScreens / 2.4);
  // Bring the artwork into focus before the film begins rising into view.
  const focus = ease(scrollScreens / .2);
  root.style.setProperty('--strip-blur', `${reducedMotion.matches ? 0 : 14 * (1 - focus)}px`);
  const videoIn = ease((progress - .62) / .32);
  // Grow the feather from zero; smooth alpha stops avoid a visible seam.
  const featherWidth = filmFeather * ease(videoIn / .8);
  const filmEdge = screenHeight - videoIn * (screenHeight + featherWidth);
  const featherStops = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1].map(position => {
    // Smootherstep has flat slopes at both ends of the blend.
    const alpha = position ** 3 * (position * (position * 6 - 15) + 10);
    return `rgba(0,0,0,${alpha}) ${filmEdge + position * featherWidth}px`;
  });
  root.style.setProperty('--film-mask', `linear-gradient(to bottom, ${featherStops.join(',')})`);
  identity.style.opacity = reducedMotion.matches || titleRevealed ? '1' : '0';
  identity.inert = !(reducedMotion.matches || titleRevealed);
  // Stop cycling as the rising film reaches the lower edge of the title.
  // Use the Helvetica line height so changing fonts cannot toggle this boundary.
  const titleBottom = screenHeight * .5 + window.innerWidth * nameFontSize / 100 * 1.05 / 2;
  const filmTouchesTitle = screenHeight * (1 - videoIn) <= titleBottom;
  setFontCycling(titleRevealed && !filmTouchesTitle && !reducedMotion.matches && !document.hidden);
  // Move toward the bottom only as the pinned stage starts leaving the viewport.
  const exitDistance = Math.max(0, -stage.getBoundingClientRect().top);
  const descent = ease(exitDistance / Math.max(1, screenHeight * .65));
  const startY = screenHeight * .5;
  const bottomY = screenHeight - Math.max(32, screenHeight * .05) - identity.offsetHeight / 2;
  identity.style.top = `${startY + (bottomY - startY) * descent}px`;
  scheduled = false;
}
function requestUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
}
window.addEventListener('scroll', requestUpdate, { passive:true });
window.addEventListener('resize', requestUpdate);
window.addEventListener('load', requestUpdate);
reducedMotion.addEventListener('change', requestUpdate);
document.addEventListener('visibilitychange', requestUpdate);
updateScroll();
// Four projects form one continuous reading sequence, with native anchor links.
const portfolioProjects = images.projects.slice(0, 4);
const projectIndex = document.querySelector('.project-index');
const chapters = document.querySelector('.project-chapters');
const railLinks = document.querySelector('.rail-links');
const projectSections = [];
const projectTabs = [];
const make = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};
function projectImage(src, alt, eager = false) {
  const image = make('img');
  image.src = src; image.alt = alt; image.loading = eager ? 'eager' : 'lazy';
  image.decoding = 'async';
  return image;
}
function addDrawingOutline(container) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'drawing-outline');
  svg.setAttribute('aria-hidden', 'true');
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('width', '100%'); rect.setAttribute('height', '100%');
  svg.append(rect); container.append(svg);
}
// Small pixel-built numbers echo the gridded numerals in the printed portfolio.
const numberPixels = {
  '0': ['11111','11011','11011','11011','11011','11011','11111'],
  '1': ['00110','01110','00110','00110','00110','00110','01111'],
  '2': ['11111','00011','00011','11111','11000','11000','11111'],
  '3': ['11111','00011','00011','01111','00011','00011','11111'],
  '4': ['11011','11011','11011','11111','00011','00011','00011']
};
function timelineNumber(number) {
  const grid = make('span', 'timeline-number'); grid.setAttribute('aria-hidden', 'true');
  for (const character of number) {
    const digit = make('span', 'pixel-digit');
    numberPixels[character].join('').split('').forEach(pixel => digit.append(make('i', pixel === '1' ? 'filled' : '')));
    grid.append(digit);
  }
  return grid;
}
portfolioProjects.forEach((project, index) => {
  const number = String(index + 1).padStart(2, '0');
  const id = `project-${number}`;
  const title = project.title || `Project ${number}`;
  const card = make('a', 'project-card');
  card.dataset.category = index < 2 ? 'studio' : 'construction';
  card.href = `#${id}`;
  const preview = make('div', 'project-card-image');
  const cover = projectImage(project.image, '');
  preview.append(cover);
  const caption = make('div', 'project-card-caption');
  const indexTitle = make('h3', '', project.indexTitle || title);
  if (index === 2 && title === '2YAKA') {
    indexTitle.textContent = '';
    indexTitle.append(make('span', 'yaka-two', '2'), make('span', 'yaka-word', 'YAKA'));
  }
  caption.append(indexTitle, timelineNumber(number));
  card.append(preview, caption);
  if (index === 0 || index === 3) card.append(make('span', 'project-category', index === 0 ? 'STUDIO' : 'CONSTRUCTION'));
  card.dataset.number = number;
  card.setAttribute('aria-label', `Explore ${title}`);
  projectIndex.append(card);

  const tab = make('a', 'project-tab', number);
  tab.href = `#${id}`; tab.setAttribute('aria-label', title);
  railLinks.append(tab); projectTabs.push(tab);

  const section = make('section', 'project-chapter');
  section.id = id; section.setAttribute('aria-labelledby', `${id}-title`);
  const header = make('header', 'chapter-heading');
  const heading = make('h2', '', title); heading.id = `${id}-title`;
  if (project.titleStyle === 'collapse') {
    heading.className = 'collapse-title';
    heading.textContent = '';
    heading.setAttribute('aria-label', title);
    ['the stage', 'has', 'collapsed', 'into us!'].forEach((line, lineIndex) => {
      const row = make('span', `collapse-line collapse-line-${lineIndex + 1}`, line);
      row.setAttribute('aria-hidden', 'true'); heading.append(row);
    });
  }
  header.append(make('span', 'chapter-number', `${number} / 04`), heading);
  const introduction = make('div', 'chapter-intro');
  const introductionCopy = make('div', 'chapter-intro-copy');
  if (project.titleStyle === 'collapse') introductionCopy.classList.add('collapse-copy');
  introductionCopy.append(header);
  if (project.course || project.instructor) {
    const metadata = make('div', 'chapter-metadata');
    if (project.course) metadata.append(make('p', 'project-course', project.course));
    if (project.instructor) metadata.append(make('p', 'project-instructor', `instructor: ${project.instructor}`));
    introductionCopy.append(metadata);
  }
  if (project.description) introductionCopy.append(make('p', 'chapter-description', project.description));
  const sources = [...new Set(project.gallery ?? images.strips[index] ?? [project.image])];
  const gallery = sources.length ? sources : [project.image];
  const lead = make('figure', 'chapter-lead');
  lead.append(projectImage(project.introImage || gallery[0], `${title} — overview`));
  introduction.append(lead, introductionCopy); section.append(introduction);
  addDrawingOutline(introduction);
  if (project.verticalText?.enabled) {
    introduction.classList.add('has-vertical-text');
    const rail = make('div', 'vertical-marquee'); rail.setAttribute('aria-hidden', 'true');
    const text = (project.verticalText.text || title).trim();
    const duration = Math.max(5, Number(project.verticalText.duration) || 28);
    rail.style.setProperty('--text-duration', `${duration}s`);
    for (let i = 0; i < 2; i++) {
      const lane = make('div', 'vertical-text-lane');
      const track = make('div', 'vertical-text-track');
      for (let copy = 0; copy < 2; copy++) {
        track.append(make('span', 'vertical-text-group', `${text}   `.repeat(12)));
      }
      lane.append(track); rail.append(lane);
    }
    introduction.append(rail);
  }
  if (project.beforeMapImages?.length) {
    const insert = make('div', 'chapter-insert');
    insert.setAttribute('aria-label', `${title} — additional images`);
    const hasCopy = project.beforeMapText?.length > 0;
    const insertContent = hasCopy ? make('div', 'insert-editorial-content') : insert;
    if (hasCopy) insert.classList.add('has-editorial-copy');
    project.beforeMapImages.slice(0, hasCopy ? 1 : 2).forEach((src, imageIndex) => {
      const figure = make('figure');
      figure.append(projectImage(src, src === 'images/black.svg' ? `Placeholder ${imageIndex + 1}` : `${title} — additional image ${imageIndex + 1}`));
      figure.append(make('figcaption', 'insert-caption', project.beforeMapCaptions?.[imageIndex] || ''));
      insertContent.append(figure);
    });
    if (hasCopy) {
      const copy = make('div', 'insert-editorial-copy');
      project.beforeMapText.forEach(text => copy.append(make('p', '', text)));
      insertContent.append(copy); insert.append(insertContent);
    }
    addDrawingOutline(insert); section.append(insert);
  }
  if (project.map?.image) {
    const mapScroll = make('div', 'map-scroll');
    const mapFrame = make('div', 'map-frame');
    const mapCanvas = make('div', 'map-canvas');
    const mapSheet = make('div', 'map-sheet');
    const mapImage = projectImage(project.map.image, project.map.image.includes('placeholder') ? 'Map placeholder, awaiting the project site map' : `${title} — site map`);
    mapScroll.dataset.zoom = String(Math.max(1, Number(project.map.zoom) || 3));
    const blackout = make('div', 'map-blackout');
    blackout.append(make('p', 'map-statement', project.map.statement || title));
    mapSheet.append(mapImage); addDrawingOutline(mapSheet);
    mapCanvas.append(mapSheet); mapFrame.append(mapCanvas, blackout);
    mapScroll.append(mapFrame); section.append(mapScroll);
  }
  if (project.mapping?.enabled && project.mapping.images?.length >= 4) {
    const reading = make('section', 'mapping-reading');
    reading.setAttribute('aria-label', 'Reading the existing stage');
    const matrixScroll = make('div', 'matrix-scroll');
    const matrix = make('table', 'reading-matrix');
    matrix.setAttribute('aria-label', 'Actions and spatial conditions');
    const head = make('thead'), header = make('tr');
    ['', 'material', 'immaterial', 'surface', 'space', 'action', 'cycle'].forEach(label => {
      const cell = make('th', '', label); cell.scope = 'col'; header.append(cell);
    });
    head.append(header); matrix.append(head);
    const body = make('tbody');
    const marks = { swap:[1,4], split:[], loan:[0,1,4], divide:[3,5] };
    Object.entries(marks).forEach(([action, columns]) => {
      const row = make('tr'), label = make('th', '', action); label.scope = 'row'; row.append(label);
      for (let column = 0; column < 6; column++) {
        const cell = make('td');
        if (columns.includes(column)) {
          const mark = make('span', 'matrix-mark'); mark.setAttribute('role', 'img');
          mark.setAttribute('aria-label', 'Mapped relationship'); cell.append(mark);
        }
        row.append(cell);
      }
      body.append(row);
    });
    matrix.append(body); matrixScroll.append(matrix);
    const explanation = make('div', 'mapping-reading-copy');
    explanation.append(make('h3', '', 'reading the existing stage'), make('p', '', 'Rather than documenting buildings as isolated objects, the street was read through actions and spatial conditions. Each location paired verbs such as swap, loan, divide, and split with material, immaterial, surface, space, action, and cycle. This method revealed hidden performances embedded within everyday urban life, transforming observation into spatial strategy.'));
    reading.append(matrixScroll, explanation);
    const mappingSheet = make('div', 'mapping-sheet');
    mappingSheet.style.setProperty('--mapping-label-size', `${Math.max(8, Number(project.mapping.labelFontSize) || 16)}px`);
    const mappingScene = make('div', 'mapping-scene');
    const mapping = make('section', 'mapping-strip');
    mapping.setAttribute('aria-label', `${title} — site analysis`);
    const tiles = project.mapping.images.slice(0, 4).map((src, i) => {
      const tile = make('figure', 'mapping-tile');
      const caption = make('figcaption', 'mapping-caption');
      const captionText = make('span', 'mapping-caption-text', project.mapping.labels?.[i] || '');
      caption.append(captionText);
      new ResizeObserver(() => {
        const available = caption.clientWidth - 20;
        if (available > 0 && captionText.scrollWidth > 0) {
          captionText.style.transform = `scaleX(${Math.min(1, available / captionText.scrollWidth)})`;
        }
      }).observe(caption);
      tile.append(caption, projectImage(src, `Site analysis section ${i + 1}`));
      mapping.append(tile); return tile;
    });
    let frame = 0, timer = null, visible = false, paused = false;
    const paint = () => tiles.forEach((tile, i) => {
      const slot = (i - frame + 4) % 4;
      tile.hidden = slot > 2;
      tile.style.order = String(slot);
    });
    const sync = () => {
      clearInterval(timer); timer = null;
      if (visible && !document.hidden && !paused) timer = setInterval(() => {
        frame = (frame + 3) % 4; paint();
      }, Math.max(250, Number(project.mapping.interval) || 900));
    };
    mapping.tabIndex = 0;
    mapping.setAttribute('role', 'button');
    mapping.setAttribute('aria-label', 'Pause site analysis mapping');
    mapping.setAttribute('aria-pressed', 'false');
    mapping.title = 'Click to pause';
    const playback = make('button', 'mapping-playback');
    playback.type = 'button';
    playback.setAttribute('aria-label', 'Pause mapping');
    playback.setAttribute('aria-pressed', 'false');
    playback.innerHTML = '<span class="playback-icon" aria-hidden="true"></span>';
    const toggleMapping = () => {
      paused = !paused;
      mapping.setAttribute('aria-pressed', String(paused));
      mapping.setAttribute('aria-label', `${paused ? 'Resume' : 'Pause'} site analysis mapping`);
      mapping.title = paused ? 'Click to resume' : 'Click to pause';
      playback.classList.toggle('is-paused', paused);
      playback.setAttribute('aria-label', paused ? 'Play mapping' : 'Pause mapping');
      playback.setAttribute('aria-pressed', String(paused));
      sync();
    };
    mapping.addEventListener('click', toggleMapping);
    playback.addEventListener('click', toggleMapping);
    mapping.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!event.repeat) toggleMapping();
      }
    });
    paint();
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(mapping);
    document.addEventListener('visibilitychange', sync);
    const mappingGroup = make('div', 'mapping-group');
    mappingGroup.append(mapping, playback);
    mappingScene.append(mappingGroup);
    mappingSheet.append(reading, mappingScene);
    addDrawingOutline(mappingSheet); section.append(mappingSheet);
  }
  if (project.spatialStudy?.enabled) {
    const settings = project.spatialStudy;
    const sheet = make('section', 'spatial-study');
    sheet.setAttribute('aria-label', `${title} — spatial study`);
    sheet.style.setProperty('--study-height-scale', String(Math.max(1, Number(settings.heightScale) || 1.2)));
    sheet.style.setProperty('--study-red', settings.lineColor || '#761d1c');
    sheet.style.setProperty('--study-hover-duration', `${Math.max(.2, Number(settings.hoverDuration) || 1.8)}s`);
    const canvas = make('div', 'study-canvas');
    const ns = 'http://www.w3.org/2000/svg';
    const connectors = document.createElementNS(ns, 'svg');
    connectors.setAttribute('viewBox', '0 0 1000 800');
    connectors.setAttribute('preserveAspectRatio', 'none');
    connectors.setAttribute('class', 'study-connectors');
    connectors.setAttribute('aria-hidden', 'true');
    const arrowId = `study-arrow-${index}`;
    connectors.innerHTML = `<defs><marker id="${arrowId}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" stroke-width="1"/></marker></defs>`;
    const connectorGap = Math.min(40, Math.max(4, Number(settings.connectorGap) || 16));
    const startY = 648 - connectorGap;
    const routes = [
      `M100 ${startY}V70H740V${144-connectorGap}`,
      `M300 ${startY}V430H125V120H450V${144-connectorGap}`,
      `M500 ${startY}V460H350V${376+connectorGap}`,
      `M700 ${startY}V440H525V${376+connectorGap}`,
      `M900 ${startY}V330H${790+connectorGap}`
    ];
    const lines = routes.map((route, i) => {
      const group = document.createElementNS(ns, 'g');
      const line = document.createElementNS(ns, 'path');
      line.setAttribute('d', route); line.setAttribute('class', 'study-connector');
      line.setAttribute('marker-end', `url(#${arrowId})`);
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', String(100 + i * 200)); dot.setAttribute('cy', String(startY)); dot.setAttribute('r', '3');
      group.append(line, dot); connectors.append(group); return group;
    });
    canvas.append(connectors);
    const plan = make('figure', 'study-plan');
    const planWidth = Math.min(90, Math.max(30, Number(settings.planWidth) || 82));
    plan.style.width = `${planWidth}%`; plan.style.left = `${(100-planWidth)/2}%`;
    plan.classList.toggle('is-placeholder', !settings.planImage);
    plan.setAttribute('aria-label', 'Plan image placeholder');
    if (settings.planImage) plan.append(projectImage(settings.planImage, `${title} — annotated plan`));
    if (settings.planCrop && settings.planImage) {
      const crop = settings.planCrop;
      plan.style.aspectRatio = `${crop.sourceWidth} / ${crop.height}`;
      plan.style.height = 'auto'; plan.style.overflow = 'hidden';
      Object.assign(plan.firstElementChild.style, { position:'absolute', width:'100%', height:'auto', maxHeight:'none', top:`${-100*crop.top/crop.height}%`, left:'0', background:'#fff' });
    }
    canvas.append(plan);
    const positionConnectors = () => {
      const box = canvas.getBoundingClientRect(), art = plan.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const top = (art.top-box.top)/box.height*800;
      const bottom = (art.bottom-box.top)/box.height*800;
      const right = (art.right-box.left)/box.width*1000;
      const left = (art.left-box.left)/box.width*1000;
      const paths = [
        `M100 ${startY}V${bottom+120}H${Math.max(12,left-60)}V${top-70}H740V${top-connectorGap}`,
        `M300 ${startY}V${bottom+65}H${left-35}V${top-35}H450V${top-connectorGap}`,
        `M500 ${startY}V${bottom+95}H350V${bottom+connectorGap}`,
        `M700 ${startY}V${bottom+75}H525V${bottom+connectorGap}`,
        `M950 ${startY}V${bottom-30}H${right+connectorGap}`
      ];
      paths.forEach((path,i) => lines[i].querySelector('path').setAttribute('d',path));
      // Keep the fifth starting point centered above its image slot.
      lines[4].querySelector('path').setAttribute('d', `M900 ${startY}V${bottom+45}H950V${bottom-30}H${right+connectorGap}`);
    };
    new ResizeObserver(positionConnectors).observe(canvas);
    new ResizeObserver(positionConnectors).observe(plan);
    const detailRow = make('div', 'study-details');
    Array.from({length:5}, (_,i) => {
      const detail = make('figure', 'study-detail'); detail.tabIndex = 0;
      detail.classList.toggle('is-placeholder', !settings.detailImages?.[i]);
      detail.setAttribute('aria-label', `Spatial detail ${i+1}${settings.detailImages?.[i] ? '' : ' placeholder'}`);
      if (settings.detailImages?.[i]) detail.append(projectImage(settings.detailImages[i], `${title} — spatial detail ${i+1}`));
      const setActive = active => lines[i].classList.toggle('is-active', active);
      detail.addEventListener('pointerenter', () => setActive(true));
      detail.addEventListener('pointerleave', () => setActive(false));
      detail.addEventListener('focus', () => setActive(true));
      detail.addEventListener('blur', () => setActive(false));
      detailRow.append(detail);
    });
    canvas.append(detailRow);
    sheet.append(canvas, make('p', 'study-description', settings.description || ''));
    addDrawingOutline(sheet); section.append(sheet);
  }
  if (gallery.length > 1) {
    const details = make('div', 'chapter-gallery');
    gallery.slice(1).forEach((src, imageIndex) => {
      const figure = make('figure');
      figure.append(projectImage(src, `${title} — image ${imageIndex + 2}`)); details.append(figure);
    });
    section.append(details);
  }
  if (project.diagram?.enabled) {
    const diagram = make('section', 'interactive-diagram');
    diagram.setAttribute('aria-label', `${title} — interactive diagram`);
    diagram.append(make('p', 'diagram-hint', 'Move to uncover · Tap to hold'));
    const scroll = make('div', 'diagram-scroll');
    const stage = make('div', 'diagram-stage');
    const graphic = projectImage(project.diagram.background || 'images/spatial-diagram.svg', '');
    graphic.className = 'diagram-background'; stage.append(graphic);
    const windows = [
      [7,22,6],[22,22,6],[31,22,6],[46,22,6],
      [64,22,6],[80,22,6],[90,22,6]
    ];
    (project.diagram.windows || []).forEach((item, windowIndex) => {
      const [x,y,w] = windows[windowIndex % windows.length];
      const portal = make('button', 'diagram-window'); portal.type = 'button';
      const label = item.label || `Window ${windowIndex + 1}`;
      portal.setAttribute('aria-label', `Reveal ${label}`); portal.setAttribute('aria-pressed', 'false');
      Object.assign(portal.style, { left:`${item.x ?? x}%`,top:`${item.y ?? y}%`,width:`${item.width ?? w}%` });
      const cover = make('span', 'diagram-window-cover'); cover.setAttribute('aria-hidden','true');
      const inside = projectImage(item.image, label); inside.className = 'diagram-window-image';
      portal.append(cover, inside);
      let revealFrame = null;
      portal.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch' || reducedMotion.matches) return;
        if (revealFrame !== null) cancelAnimationFrame(revealFrame);
        revealFrame = requestAnimationFrame(() => {
          const rect = portal.getBoundingClientRect();
          portal.style.setProperty('--reveal-x', `${event.clientX - rect.left}px`);
          portal.style.setProperty('--reveal-y', `${event.clientY - rect.top}px`);
          revealFrame = null;
        });
      });
      portal.addEventListener('pointerleave', () => {
        if (revealFrame !== null) { cancelAnimationFrame(revealFrame); revealFrame = null; }
      });
      portal.addEventListener('click', () => {
        const visible = portal.classList.toggle('is-revealed');
        portal.setAttribute('aria-pressed', String(visible));
        portal.setAttribute('aria-label', `${visible ? 'Cover' : 'Reveal'} ${label}`);
      });
      stage.append(portal);
    });
    if (!project.diagram.background || project.diagram.background === 'images/spatial-diagram.svg') {
      const frame = projectImage('images/spatial-frame.svg', '');
      frame.className = 'diagram-frame'; stage.append(frame);
    }
    scroll.append(stage); diagram.append(scroll);
    const insert = section.querySelector('.chapter-insert');
    const revealHint = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.45)) return;
      if (!reducedMotion.matches) {
        stage.classList.add('is-hinting');
        setTimeout(() => stage.classList.remove('is-hinting'), 4200);
      }
      revealHint.disconnect();
    }, { threshold:0.45 });
    revealHint.observe(stage);
    if (insert) insert.append(diagram);
    else section.append(diagram);
  }
  const next = make('a', 'chapter-next');
  const last = index === portfolioProjects.length - 1;
  next.href = last ? '#about' : `#project-${String(index + 2).padStart(2, '0')}`;
  next.append(make('span', '', last ? 'About me' : `Next / ${portfolioProjects[index + 1].title}`), make('span', '', '↓'));
  section.append(next); chapters.append(section); projectSections.push(section);
});
document.querySelector('.lucky-button').addEventListener('click', () => {
  const section = projectSections[Math.floor(Math.random() * projectSections.length)];
  if (section) location.hash = section.id;
});
// Indicate the chapter being read without changing scroll position or URL.
const activeChapters = new Map();
const chapterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => activeChapters.set(entry.target.id, entry.isIntersecting));
  const active = projectSections.find(section => activeChapters.get(section.id));
  projectTabs.forEach((tab, index) => {
    if (projectSections[index] === active) tab.setAttribute('aria-current', 'location');
    else tab.removeAttribute('aria-current');
  });
}, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
projectSections.forEach(section => chapterObserver.observe(section));

const collapseTimers = new Map();
const collapseObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const heading = entry.target;
    if (entry.isIntersecting && entry.intersectionRatio >= .7 && !document.hidden) {
      if (collapseTimers.has(heading)) return;
      if (reducedMotion.matches) {
        heading.classList.add('is-collapsed'); collapseObserver.unobserve(heading);
      } else {
        collapseTimers.set(heading, setTimeout(() => {
          heading.classList.add('is-collapsed');
          collapseTimers.delete(heading); collapseObserver.unobserve(heading);
        }, 1500));
      }
    } else if (collapseTimers.has(heading)) {
      clearTimeout(collapseTimers.get(heading)); collapseTimers.delete(heading);
    }
  });
}, { threshold: [0, .7], rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.collapse-title').forEach(heading => collapseObserver.observe(heading));
document.addEventListener('visibilitychange', () => {
  collapseTimers.forEach(timer => clearTimeout(timer)); collapseTimers.clear();
  if (!document.hidden) document.querySelectorAll('.collapse-title:not(.is-collapsed)').forEach(heading => {
    collapseObserver.unobserve(heading); collapseObserver.observe(heading);
  });
});

const workSection = document.querySelector('.work');
const welcomeSettings = images.welcomeStrip ?? {};
const menuAnimation = images.projectMenuAnimation ?? {};
const welcomeText = welcomeSettings.text ?? 'Welcome to my portfolio, pick a project to proceed. Or just scroll.';
const welcomeStrip = workSection.querySelector('.work-welcome');
welcomeStrip.setAttribute('aria-label', welcomeText);
welcomeStrip.querySelectorAll('span').forEach(span => { span.textContent = `${welcomeText}\u00a0\u00a0\u00a0`; });
const menuValue = (value, fallback, minimum = 0) => Number.isFinite(Number(value)) ? Math.max(minimum, Number(value)) : fallback;
const menuVariables = {
  '--menu-bottom': `${Math.min(50,menuValue(menuAnimation.bottomOffset,4))}%`,
  '--welcome-size': `${menuValue(welcomeSettings.fontSize,19,1)}px`,
  '--welcome-top': `${menuValue(welcomeSettings.topOffset,82)}px`,
  '--welcome-loop': `${menuValue(welcomeSettings.loopDuration,32,.1)}s`,
  '--welcome-duration': `${menuValue(welcomeSettings.entranceDuration,2.2,.01)}s`,
  '--welcome-delay': `${menuValue(welcomeSettings.entranceDelay,3.4)}s`,
  '--menu-line-duration': `${menuValue(menuAnimation.lineDuration,3,.01)}s`,
  '--menu-card-duration': `${menuValue(menuAnimation.cardDuration,1.7,.01)}s`,
  '--menu-button-duration': `${menuValue(menuAnimation.buttonDuration,1.4,.01)}s`,
  '--menu-button-delay': `${menuValue(menuAnimation.buttonDelay,2)}s`
};
Object.entries(menuVariables).forEach(([key,value]) => workSection.style.setProperty(key,value));
workSection.querySelectorAll('.project-card').forEach((card,index) => {
  card.style.setProperty('--card-delay', `${menuValue(menuAnimation.firstCardDelay,.15) + index * menuValue(menuAnimation.cardStagger,.5)}s`);
});
const mapScenes = [...document.querySelectorAll('.map-scroll')];
let projectMotionFrame = null;
function updateProjectMotion() {
  const viewport = innerHeight;
  // Begin only once the projects section itself reaches the top of the viewport.
  const workBounds = workSection.getBoundingClientRect();
  if (workBounds.top <= 1 && workBounds.bottom > viewport * .5) workSection.classList.add('has-entered');
  workSection.classList.toggle('is-on-screen', workBounds.top < viewport && workBounds.bottom > 0);
  const menuProgress = reducedMotion.matches ? 1 : clamp(-workBounds.top / (viewport * menuValue(menuAnimation.scrollRevealDistance,.65,.01)));
  const menuLength = Math.max(
    menuValue(menuAnimation.lineDuration,3,.01),
    menuValue(menuAnimation.firstCardDelay,.15) + 3 * menuValue(menuAnimation.cardStagger,.5) + menuValue(menuAnimation.cardDuration,1.7,.01),
    menuValue(menuAnimation.buttonDelay,2) + menuValue(menuAnimation.buttonDuration,1.4,.01)
  );
  const menuTime = menuProgress * menuLength;
  const reveal = (delay,duration) => reducedMotion.matches ? 1 : ease((menuTime-delay)/duration);
  workSection.style.setProperty('--line-draw', reveal(0,menuValue(menuAnimation.lineDuration,3,.01)));
  workSection.querySelectorAll('.project-card').forEach((card,index) => {
    card.style.opacity = String(reveal(menuValue(menuAnimation.firstCardDelay,.15) + index * menuValue(menuAnimation.cardStagger,.5),menuValue(menuAnimation.cardDuration,1.7,.01)));
  });
  workSection.querySelector('.index-footer').style.opacity = String(reveal(menuValue(menuAnimation.buttonDelay,2),menuValue(menuAnimation.buttonDuration,1.4,.01)));
  root.style.setProperty('--viewport-width', `${document.documentElement.clientWidth}px`);
  let immersive = false;
  mapScenes.forEach(scene => {
    const frame = scene.querySelector('.map-frame');
    const distance = scene.offsetHeight - frame.offsetHeight;
    const inset = parseFloat(getComputedStyle(frame).top) || 0;
    const bounds = scene.getBoundingClientRect();
    const progress = clamp((inset - bounds.top) / Math.max(1, distance));
    // Exponential zoom keeps the approach readable before diving into the silhouette.
    const zoom = reducedMotion.matches ? 1 : Math.exp(Math.log(Number(scene.dataset.zoom)) * ease(progress / .56));
    scene.style.setProperty('--map-zoom', zoom);
    // The silhouette already fills the viewport before handing off to solid black.
    const blackIn = progress >= .58 ? 1 : 0;
    const whiteOut = ease((progress - .84) / .16);
    scene.style.setProperty('--map-inset', `${10 * (1 - ease(progress / .25))}%`);
    scene.style.setProperty('--map-image-opacity', 1 - blackIn);
    scene.style.setProperty('--map-black-opacity', blackIn * (1 - whiteOut));
    scene.style.setProperty('--map-text-opacity', ease((progress - .6) / .1) * (1 - ease((progress - .8) / .1)));
    immersive ||= !reducedMotion.matches && bounds.top <= 60 && bounds.bottom > 0;
  });
  document.body.classList.toggle('map-immersive', immersive);
  document.querySelector('.project-rail').inert = immersive;
  projectMotionFrame = null;
}
function requestProjectMotion() {
  if (projectMotionFrame === null) projectMotionFrame = requestAnimationFrame(updateProjectMotion);
}
window.addEventListener('scroll', requestProjectMotion, { passive:true });
window.addEventListener('resize', requestProjectMotion);
window.addEventListener('load', requestProjectMotion);
reducedMotion.addEventListener('change', requestProjectMotion);
updateProjectMotion();

const quickNav = document.querySelector('.quick-nav');
const navToggle = quickNav.querySelector('.nav-toggle');
const navigation = quickNav.querySelector('nav');
function setNavigation(open, returnFocus = false) {
  quickNav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close page navigation' : 'Open page navigation');
  navigation.inert = !open;
  if (returnFocus) navToggle.focus({ preventScroll:true });
}
navToggle.addEventListener('click', () => setNavigation(!quickNav.classList.contains('is-open')));
quickNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setNavigation(false, true));
});
document.addEventListener('pointerdown', event => {
  if (!quickNav.contains(event.target)) setNavigation(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && quickNav.classList.contains('is-open')) setNavigation(false, true);
});





// Meet the designer: selectable topics and user-configured downloads.
const topicButtons = document.querySelector('.designer-topics');
const topicReveal = document.querySelector('.designer-reveal');
const topics = images.designerTopics || [];
function selectDesignerTopic(index) {
  [...topicButtons.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  topicReveal.querySelector('h3').textContent = topics[index].title;
  topicReveal.querySelector('p').textContent = topics[index].text;
}
topics.forEach((topic, index) => {
  const button = make('button', 'designer-topic', topic.label);
  button.type = 'button'; button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => selectDesignerTopic(index));
  topicButtons.append(button);
});
if (topics.length) selectDesignerTopic(0);
for (const [key, label] of [['portfolio', 'View portfolio'], ['cv', 'View CV']]) {
  const path = images.downloads?.[key]?.trim();
  if (!path) continue;
  const item = make('div', 'designer-download');
  const view = make('a', 'pdf-view', label);
  view.href = path; view.target = '_blank'; view.rel = 'noopener';
  const download = make('a', 'pdf-download', 'Download ↓');
  download.href = path; download.setAttribute('download', '');
  download.setAttribute('aria-label', `Download ${key === 'cv' ? 'CV' : 'portfolio'}`);
  item.append(view, download);
  document.querySelector('.download-links').append(item);
}
