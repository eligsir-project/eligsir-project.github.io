/* EliGSiR static research page. All interactive media is local; no analytics. */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  // Abstract: clamp to a few lines with a "Read more" toggle.
  const abstractText = document.getElementById('abstract-text');
  const abstractMore = document.getElementById('abstract-more');
  if (abstractText && abstractMore) {
    abstractText.classList.add('clamped');
    abstractMore.hidden = false;
    abstractMore.addEventListener('click', () => {
      const expanded = abstractMore.getAttribute('aria-expanded') === 'true';
      abstractText.classList.toggle('clamped', expanded);
      abstractMore.setAttribute('aria-expanded', String(!expanded));
      abstractMore.innerHTML = expanded ? 'Read more <span aria-hidden="true">↓</span>' : 'Show less <span aria-hidden="true">↑</span>';
    });
  }
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const data = window.ELIGSIR_CONTENT;
  const results = data.results;
  const comparisons = data.comparisons;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const announce = text => { $('#live-announcement').textContent = text; };
  const fmt = (value, decimals) => Number(value).toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

  // Navigation and gentle reveals: content is present even without animation or JS.
  const menuButton = $('#menu-toggle');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    $('#mobile-nav').hidden = !open;
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    $('#mobile-nav').hidden = true;
  }));
  window.addEventListener('scroll', () => $('.site-header').classList.toggle('scrolled', window.scrollY > 8), {passive:true});
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.classList.remove('reveal-wait');
        revealObserver.unobserve(entry.target);
      }
    }), {threshold:.08});
    $$('.section-heading, .resource-grid, .during-grid').forEach(el => {
      el.classList.add('reveal');
      if (!reducedMotion.matches) el.classList.add('reveal-wait');
      revealObserver.observe(el);
    });
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) $$('.desktop-nav a').forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
    }), {rootMargin:'-10% 0px -65% 0px'});
    $$('section[id]').forEach(section => navObserver.observe(section));
  }

  // Accessible tabs, with arrow / Home / End keyboard navigation.
  function tabs(list) {
    const buttons = $$('[role="tab"]', list);
    const select = button => {
      buttons.forEach(candidate => {
        const active = candidate === button;
        candidate.setAttribute('aria-selected', String(active));
        candidate.tabIndex = active ? 0 : -1;
        $('#' + candidate.getAttribute('aria-controls')).hidden = !active;
      });
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); select(buttons[next]); buttons[next].focus(); }
      });
    });
  }
  $$('[role="tablist"]').forEach(tabs);

  // 3D payload is not requested until the visitor explicitly loads it.
  const sceneLabels = {
    fr3: 'TUM RGB-D fr3/long_office_household',
    kitchen1: 'Orbbec kitchen1 (real sensor)',
    scannetpp: 'ScanNet++ 8b5caf3398',
    room2: 'Replica room2',
    office0: 'Replica office0',
  };
  const scenePosters = {
    fr3: 'assets/real/viewer-fr3.webp',
    kitchen1: 'assets/real/viewer-kitchen1.webp',
    scannetpp: 'assets/real/viewer-scannetpp.webp',
    room2: 'assets/real/viewer-room2.webp',
    office0: 'assets/real/viewer-office0.webp',
  };
  let selectedScene = 'fr3';
  let viewerFrame = null;
  let viewerTimeout = null;
  let viewerReady = false;
  let viewerLoadStarted = false;
  function updateViewerSize() {
    const bytes = data.viewer.scenes[selectedScene];
    $('#viewer-size').textContent = bytes ? (bytes / 1000000).toFixed(1) + ' MB' : 'size pending';
  }
  updateViewerSize();
  function hideViewerLayers(ready) {
    $('#viewer-invitation').hidden = ready;
    $('#viewer-loading').hidden = true;
    $('#viewer-failure').hidden = true;
  }
  function unloadViewer() {
    clearTimeout(viewerTimeout);
    viewerFrame?.remove();
    viewerFrame = null;
    viewerReady = false;
    viewerLoadStarted = false;
    $('#reset-viewer').disabled = true;
    $('#unload-viewer').hidden = true;
    hideViewerLayers(false);
    announce('Interactive map closed.');
  }
  function viewerFailed(message) {
    clearTimeout(viewerTimeout);
    $('#viewer-loading').hidden = true;
    $('#viewer-invitation').hidden = true;
    $('#viewer-failure').hidden = false;
    $('#viewer-error-text').textContent = message;
    $('#unload-viewer').hidden = false;
    announce(message);
  }
  function loadViewer() {
    if (viewerLoadStarted) return;
    if (location.protocol === 'file:') {
      viewerFailed('Serve the folder over localhost to load the 3D scene. The README includes a one-command preview server.');
      return;
    }
    viewerLoadStarted = true;
    $('#overview-video')?.pause();
    $('#viewer-invitation').hidden = true;
    $('#viewer-loading').hidden = false;
    $('#viewer-failure').hidden = true;
    viewerFrame = document.createElement('iframe');
    viewerFrame.title = 'Interactive EliGSiR map export · ' + sceneLabels[selectedScene];
    viewerFrame.setAttribute('allow', 'fullscreen');
    viewerFrame.referrerPolicy = 'no-referrer';
    viewerFrame.src = 'assets/viewer/viewer.html?scene=' + selectedScene + '&webgl&noanim&lang=en';
    $('#viewer-mount').appendChild(viewerFrame);
    $('#unload-viewer').hidden = false;
    // Readiness comes from a rendered frame, not from the iframe load event.
    viewerTimeout = window.setTimeout(() => {
      if (!viewerReady) viewerFailed('The 3D renderer is taking too long on this device. Use the overview video, or close the viewer and try again in a WebGL2-capable browser.');
    }, 60000);
  }
  window.addEventListener('message', event => {
    if (!viewerFrame || event.source !== viewerFrame.contentWindow || event.origin !== location.origin) return;
    if (event.data?.type === 'eligsir-viewer-ready') {
      viewerReady = true;
      clearTimeout(viewerTimeout);
      hideViewerLayers(true);
      $('#reset-viewer').disabled = false;
      announce('The interactive 3D map is ready. Drag to orbit. Scroll to zoom.');
    }
    if (event.data?.type === 'eligsir-viewer-error') viewerFailed('The browser could not initialize the 3D renderer. The overview video remains available above.');
    if (event.data === 'requestFullscreen') fullscreen($('#viewer-shell'));
    if (event.data === 'exitFullscreen' && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  });
  $('#load-viewer').addEventListener('click', loadViewer);
  $('#unload-viewer').addEventListener('click', unloadViewer);
  $('#reset-viewer').addEventListener('click', () => {
    if (viewerFrame && viewerReady) viewerFrame.contentWindow.postMessage({type:'eligsir-viewer-reset'}, location.origin);
  });
  async function fullscreen(element) {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (element.requestFullscreen) await element.requestFullscreen();
      else if (element.webkitEnterFullscreen) element.webkitEnterFullscreen();
      else announce('Fullscreen is unavailable in this browser.');
    } catch (_) { announce('Fullscreen is unavailable in this browser.'); }
  }
  $('#fullscreen-viewer').addEventListener('click', () => fullscreen($('#viewer-shell')));
  document.addEventListener('visibilitychange', () => { if (document.hidden) $('#overview-video')?.pause(); });

  $$('.scene-strip[role="group"][aria-label="Scene"] .scene-chip').forEach(chip => chip.addEventListener('click', () => {
    const scene = chip.dataset.scene;
    if (scene === selectedScene) return;
    selectedScene = scene;
    $$('.scene-strip[role="group"][aria-label="Scene"] .scene-chip').forEach(c => {
      const active = c === chip;
      c.classList.toggle('selected', active);
      c.setAttribute('aria-pressed', String(active));
    });
    $('#viewer-scene-name').textContent = sceneLabels[scene];
    const poster = $('#viewer-poster');
    poster.src = scenePosters[scene];
    poster.alt = 'Render of the ' + sceneLabels[scene] + ' EliGSiR map at the viewer\'s start camera';
    updateViewerSize();
    announce('Scene: ' + sceneLabels[scene]);
    if (viewerLoadStarted) { unloadViewer(); loadViewer(); }
  }));

  // Method demos: reversible supervision fidelity, geometry growth.
  $('#workload').addEventListener('input', event => {
    const index = Number(event.target.value);
    const pressures = ['Low','Moderate','Elevated','High'];
    const levels = ['1×','1/2×','1/4×','1/8×'];
    const files = ['1x','half','quarter','eighth'];
    $('#pressure-value').textContent = pressures[index];
    $('#fidelity-value').textContent = levels[index];
    $('#fidelity-image').src = 'assets/real/fidelity-' + files[index] + '.webp';
    $('#fidelity-image').alt = 'Real TUM fr3 frame at ' + levels[index] + ' supervision resolution';
    $$('.fidelity-tiers>span').forEach((el,i) => el.classList.toggle('selected', i === index));
  });
  const growthStates = {
    supported:['Supervise existing','The current map already supports this surface.'],
    single:['Wait','One unsupported measurement is not enough for fine insertion.'],
    confirmed:['Add Gaussians','Repeated multi-view evidence supports new Gaussian capacity.']
  };
  $$('.growth-controls button').forEach(button => button.addEventListener('click', () => {
    const state = button.dataset.growth;
    $$('.growth-controls button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('.growth-demo').dataset.growth = state;
    $('#growth-outcome').textContent = growthStates[state][0];
    $('#growth-detail').textContent = growthStates[state][1];
  }));

  // Overview video: native controls, a chapter list and a smaller 720p source.
  // The <source> is added in JS (not in the HTML markup) so the browser never
  // requests the 1080p file on small screens before the 720p swap can happen.
  const video = $('#overview-video');
  const source = document.createElement('source');
  source.type = 'video/mp4';
  source.src = window.matchMedia('(max-width: 720px)').matches
    ? 'assets/video/eligsir-overview-720p.mp4'
    : 'assets/video/eligsir-overview.mp4';
  video.prepend(source);
  $('#use-720p').addEventListener('click', event => {
    source.src = 'assets/video/eligsir-overview-720p.mp4';
    video.load();
    event.currentTarget.textContent = 'Using the 720p file';
    event.currentTarget.setAttribute('aria-disabled', 'true');
    announce('Switched to the smaller 720p video file.');
  });
  const chapterButtons = $$('.video-chapter');
  function seekChapter(seconds) {
    const doSeek = () => { video.currentTime = seconds; video.play().catch(() => {}); };
    if (video.readyState >= 1) doSeek();
    else { video.addEventListener('loadedmetadata', doSeek, {once:true}); video.load(); }
  }
  chapterButtons.forEach(button => button.addEventListener('click', () => seekChapter(Number(button.dataset.time))));
  video.addEventListener('timeupdate', () => {
    let current = chapterButtons[0];
    for (const button of chapterButtons) { if (video.currentTime >= Number(button.dataset.time)) current = button; }
    chapterButtons.forEach(button => {
      const selected = button === current;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  });
  video.addEventListener('error', () => announce('The overview video could not be loaded.'));

  // Results: real-time-factor scatter, the across-scenes table and refinement.
  const ns = 'http://www.w3.org/2000/svg';
  function svgElement(name, attributes, text) {
    const element = document.createElementNS(ns, name);
    Object.entries(attributes || {}).forEach(([key,value]) => element.setAttribute(key,String(value)));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  const xMin = 0.9, xMax = 32, yMin = 13, yMax = 24.5;
  const plotX0 = 76, plotX1 = 690, plotY0 = 268, plotY1 = 42;
  const scaleX = rtf => plotX0 + (Math.log10(rtf) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * (plotX1 - plotX0);
  const scaleY = db => plotY0 - (db - yMin) / (yMax - yMin) * (plotY0 - plotY1);
  const rtfChart = svgElement('svg', {viewBox:'0 14 730 306',role:'group','aria-label':'Held-out PSNR versus real-time factor for TUM RGB-D fr3. Select a method point for exact values.'});
  rtfChart.appendChild(svgElement('title',{},'Online mapping endpoints for TUM RGB-D fr3, GT and tracked poses'));
  [14,16,18,20,22,24].forEach(db => {
    const y = scaleY(db);
    rtfChart.append(svgElement('line',{x1:plotX0,y1:y,x2:plotX1,y2:y,class:'chart-grid'}));
    rtfChart.append(svgElement('text',{x:plotX0-14,y:y+4,'text-anchor':'end',class:'chart-label'},String(db)));
  });
  [1,2,5,10,20,30].forEach(rtf => {
    const x = scaleX(rtf);
    rtfChart.append(svgElement('text',{x,y:plotY0+22,'text-anchor':'middle',class:'chart-label'},rtf+'×'));
  });
  const refX = scaleX(1);
  rtfChart.append(svgElement('line',{x1:refX,y1:plotY0,x2:refX,y2:plotY1,class:'chart-ref-line'}));
  rtfChart.append(svgElement('text',{x:refX+6,y:plotY1+10,class:'chart-ref-label'},'1× = real time'));
  rtfChart.append(svgElement('line',{x1:plotX0,y1:plotY0,x2:plotX1,y2:plotY0,class:'chart-axis'}));
  rtfChart.append(svgElement('text',{x:(plotX0+plotX1)/2,y:308,'text-anchor':'middle',class:'chart-label'},'Real-time factor (log scale) →'));
  rtfChart.append(svgElement('text',{x:18,y:(plotY0+plotY1)/2,transform:'rotate(-90 18 '+((plotY0+plotY1)/2)+')','text-anchor':'middle',class:'chart-label'},'PSNR (dB) ↑'));
  const rtfColors = {
    'eligsir-gt': '#148d86', 'eligsir-tracked': '#148d86',
    'splatam-gt': '#7e99aa', 'varsplat-gt': '#9a8bb0', 'rtgslam-gt': '#b0847e',
    'cartgs-tracked': '#3c5874',
  };
  function poseGroupLabel(row) {
    return row.poses === 'gt' ? 'GT mapping poses' : 'Tracked poses (' + row.tracker + ')';
  }
  const pointLabels = {
    'eligsir-gt': 'EliGSiR · GT poses',
    'eligsir-tracked': 'EliGSiR · live ORB-SLAM3',
    'cartgs-tracked': 'CaRtGS · native tracker',
  };
  // Custom per-point label placement so labels stay inside the plot and don't overlap.
  const labelPlacement = {
    'eligsir-tracked': {dx: 16, dy1: -12, dy2: 3, anchor: 'start'},
    'cartgs-tracked': {dx: 16, dy1: 22, dy2: 36, anchor: 'start'},
    'splatam-gt': {dx: 14, dy1: -6, dy2: 12, anchor: 'start'},
    'rtgslam-gt': {dx: -16, dy1: -6, dy2: 12, anchor: 'end'},
    'varsplat-gt': {dx: -16, dy1: -6, dy2: 12, anchor: 'end'},
  };
  const defaultPlacement = {dx: 16, dy1: -6, dy2: 12, anchor: 'start'};
  function selectRtfRow(row) {
    $('#selected-method').textContent = row.method;
    $('#selected-poses').textContent = poseGroupLabel(row);
    $('#selected-state').textContent = row.map_state;
    $('#selected-psnr').textContent = fmt(row.psnr_db, 2);
    $('#selected-time').textContent = fmt(row.seconds, 1);
    $('#selected-rtf').textContent = fmt(row.rtf, 2) + '×';
    $('#selected-ssim').textContent = fmt(row.ssim, 3);
    $('#selected-lpips').textContent = fmt(row.lpips, 3);
    $$('.chart-point', rtfChart).forEach(el => {el.classList.toggle('selected', el.dataset.id === row.id); el.setAttribute('aria-pressed', String(el.dataset.id === row.id));});
  }
  for (const row of results.online.rows) {
    const x = scaleX(row.rtf), y = scaleY(row.psnr_db);
    const tracked = row.poses !== 'gt';
    const group = svgElement('g', {class:'chart-point'+(row.id === 'eligsir-gt' ? ' selected' : ''), tabindex:'0', role:'button', 'aria-pressed': String(row.id === 'eligsir-gt'), 'aria-label': row.method + ', ' + poseGroupLabel(row) + ': ' + row.psnr_db + ' dB, ' + row.rtf + '× real time.', 'data-id': row.id});
    group.append(svgElement('circle',{cx:x,cy:y,r:17,fill:rtfColors[row.id],'fill-opacity':.12,class:'outer-dot'}));
    const hitPlacement = labelPlacement[row.id] || defaultPlacement;
    const hitMinY = Math.min(hitPlacement.dy1, hitPlacement.dy2, -14) - 12;
    const hitMaxY = Math.max(hitPlacement.dy1, hitPlacement.dy2, 14) + 12;
    const hitX = hitPlacement.anchor === 'end' ? x - 176 : x - 14;
    group.append(svgElement('rect',{x:hitX,y:y+hitMinY,width:190,height:hitMaxY-hitMinY,fill:'transparent'}));
    if (tracked) group.append(svgElement('rect',{x:x-6,y:y-6,width:12,height:12,transform:'rotate(45 '+x+' '+y+')',fill:rtfColors[row.id]}));
    else group.append(svgElement('circle',{cx:x,cy:y,r:6.5,fill:rtfColors[row.id]}));
    const placement = labelPlacement[row.id] || defaultPlacement;
    const labelText = pointLabels[row.id] || row.method;
    group.append(svgElement('text',{x:x+placement.dx,y:y+placement.dy1,'text-anchor':placement.anchor,class:'point-label'},labelText));
    group.append(svgElement('text',{x:x+placement.dx,y:y+placement.dy2,'text-anchor':placement.anchor,class:'point-value'},row.psnr_db.toFixed(2)+' dB / '+row.rtf.toFixed(2)+'×'));
    ['mouseenter','focus','click'].forEach(type => group.addEventListener(type,()=>selectRtfRow(row)));
    group.addEventListener('keydown',event => {if(event.key==='Enter'||event.key===' '){event.preventDefault();selectRtfRow(row);}});
    rtfChart.append(group);
  }
  $('#rtf-chart').append(rtfChart);
  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.innerHTML = '<span><svg class="legend-glyph" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="#148d86"></circle></svg>GT mapping poses</span>'
    + '<span><svg class="legend-glyph" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="10" fill="#148d86" transform="rotate(45 8 8)"></rect></svg>Tracked poses</span>';
  $('#rtf-chart').prepend(legend);
  selectRtfRow(results.online.rows.find(r => r.id === 'eligsir-gt') || results.online.rows[0]);

  // Across-scenes accessible table.
  function scenesTable() {
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = 'Across scenes · final paper Table I';
    table.appendChild(caption);
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th scope="col">Method</th><th scope="col">Map state</th><th scope="col">PSNR ↑</th><th scope="col">SSIM ↑</th><th scope="col">LPIPS ↓</th><th scope="col">Time [s]</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    const footnotes = [];
    const footnoteLetter = text => {
      let index = footnotes.indexOf(text);
      if (index === -1) { footnotes.push(text); index = footnotes.length - 1; }
      return String.fromCharCode(97 + index);
    };
    function addGroup(label, rows) {
      const heading = document.createElement('tr');
      heading.className = 'table-group-row';
      heading.innerHTML = '<th colspan="6" scope="colgroup">' + label + '</th>';
      tbody.appendChild(heading);
      const bestPsnr = Math.max(...rows.map(r => r.psnr_db));
      rows.forEach(row => {
        const tr = document.createElement('tr');
        if (row.method === 'EliGSiR') tr.className = 'eligsir-row';
        const timeCell = fmt(row.seconds ?? row.total_seconds, 1) + (row.footnote ? ' [' + footnoteLetter(row.footnote) + ']' : '');
        tr.innerHTML = '<th scope="row">' + row.method + '</th><td>' + row.map_state + '</td>'
          + '<td' + (rows.length > 1 && row.psnr_db === bestPsnr ? ' class="best-psnr"' : '') + '>' + fmt(row.psnr_db, 2) + ' dB</td>'
          + '<td>' + fmt(row.ssim, 3) + '</td><td>' + fmt(row.lpips, 3) + '</td><td>' + timeCell + '</td>';
        tbody.appendChild(tr);
      });
    }
    addGroup('TUM fr3 · GT poses', results.online.rows.filter(r => r.poses === 'gt'));
    addGroup('TUM fr3 · tracked poses', results.online.rows.filter(r => r.poses === 'tracked'));
    for (const scene of results.scenes) addGroup(scene.scene, scene.rows);
    table.appendChild(tbody);
    $('#scenes-table-wrap').append(table);
    if (footnotes.length) {
      const list = document.createElement('ol');
      list.className = 'table-footnotes caption';
      footnotes.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.appendChild(li); });
      $('#scenes-table-wrap').after(list);
    }
  }
  scenesTable();

  // Continued refinement.
  function selectRefinement(row) {
    $('#refine-stage').textContent = row.stage.toUpperCase() + (row.steps === 0 ? '' : ' · SEPARATE RUN');
    $('#refine-psnr').textContent = fmt(row.psnr_db, 2);
    $('#refine-time').textContent = fmt(row.total_seconds, 1);
    $('#refine-ssim').textContent = fmt(row.ssim, 3);
    $('#refine-lpips').textContent = fmt(row.lpips, 3);
    $('#refine-depth-rmse').textContent = fmt(row.depth_rmse_m, 3);
    $('#refine-gaussians').textContent = fmt(row.gaussians_k, 1);
    $$('#refinement-stages button').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.steps) === row.steps)));
    $$('.refine-row').forEach(el => el.classList.toggle('selected', Number(el.dataset.steps) === row.steps));
  }
  for (const row of results.refinement.rows) {
    const button = document.createElement('button'); button.textContent = row.stage; button.dataset.steps = row.steps; button.setAttribute('aria-pressed', String(row.steps === 0));
    button.addEventListener('click', () => selectRefinement(row)); $('#refinement-stages').append(button);
    const bar = document.createElement('div'); bar.className = 'refine-row' + (row.steps === 0 ? ' selected' : ''); bar.dataset.steps = row.steps;
    const label = document.createElement('span'); label.textContent = row.stage;
    const track = document.createElement('span'); track.className = 'refine-bar-bg'; const fill = document.createElement('i'); fill.style.width = (row.psnr_db / 30 * 100) + '%'; track.append(fill);
    const value = document.createElement('span'); value.textContent = fmt(row.psnr_db, 2) + ' dB'; bar.append(label, track, value); $('#refine-bars').append(bar);
  }
  $('#refinement-caption').textContent = results.refinement.note;
  selectRefinement(results.refinement.rows[0]);

  // During-mapping ablations table (Table III).
  function ablationsTable() {
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = 'Component ablations · final paper Table III';
    table.appendChild(caption);
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th scope="col">Variant</th><th scope="col">PSNR ↑</th><th scope="col">CVQ-AUC ↑</th><th scope="col">CUC@20 ↑ [%]</th><th scope="col">Sup. px [M] ↓</th><th scope="col">Gaussians [k]</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    for (const scene of results.ablations.scenes) {
      const heading = document.createElement('tr'); heading.className = 'table-group-row';
      heading.innerHTML = '<th colspan="6" scope="colgroup">' + scene.scene + '</th>';
      tbody.appendChild(heading);
      scene.rows.forEach(row => {
        const tr = document.createElement('tr');
        if (row.variant === 'EliGSiR') tr.className = 'eligsir-row';
        tr.innerHTML = '<th scope="row">' + row.variant + '</th><td>' + fmt(row.psnr_db,2) + ' dB</td><td>' + fmt(row.cvq_auc_db,2) + ' dB</td><td>' + fmt(row.cuc20_pct,1) + '</td><td>' + fmt(row.supervised_mpix,1) + '</td><td>' + fmt(row.gaussians_k,1) + '</td>';
        tbody.appendChild(tr);
      });
    }
    table.appendChild(tbody);
    $('#ablations-table-wrap').append(table);
  }
  ablationsTable();
  $('#ablations-note').textContent = results.ablations.note;

  // Look Closer: qualitative comparisons, grouped by scene/view.
  let selectedGroup = comparisons.default.group;
  let selectedView = comparisons.default.view;
  let selectedMode = comparisons.default.mode;
  const comparisonEl = $('#comparison');
  function groupById(id) { return comparisons.groups.find(g => g.id === id); }
  function viewsForGroup(id) { return comparisons.views.filter(v => v.group === id); }
  function viewById(id) { return comparisons.views.find(v => v.id === id); }
  function populateReferenceViews() {
    const wrap = $('#reference-views');
    wrap.innerHTML = '';
    const groupViews = viewsForGroup(selectedGroup);
    const singleView = groupViews.length <= 1;
    $('#select-view-label').hidden = singleView;
    wrap.hidden = singleView;
    if (singleView) return;
    for (const view of groupViews) {
      const button = document.createElement('button');
      button.className = 'reference-view';
      button.dataset.view = view.id;
      button.setAttribute('aria-pressed', String(view.id === selectedView));
      const img = document.createElement('img');
      img.src = view.images.reference_rgb; img.alt = ''; img.loading = 'lazy'; img.width = 55; img.height = 34;
      const label = document.createElement('span');
      const title = document.createElement('strong'); title.textContent = view.label;
      label.append(title);
      button.append(img, label);
      button.addEventListener('click', () => { selectedView = view.id; renderComparison(); });
      wrap.appendChild(button);
    }
  }
  function renderComparison() {
    const group = groupById(selectedGroup);
    const view = viewById(selectedView);
    if (!group.modes.includes(selectedMode)) selectedMode = 'rgb';
    if (view.width && view.height) {
      // Side by side doubles the width, so the box keeps both images without letterboxing.
      const across = comparisonEl.classList.contains('side-by-side') ? 2 : 1;
      comparisonEl.style.aspectRatio = (view.width * across) + ' / ' + view.height;
      comparisonEl.style.maxWidth = Math.round(view.width * 1.5 * across) + 'px';
    }
    $$('.mode-tabs button').forEach(button => {
      const mode = button.dataset.mode;
      const available = group.modes.includes(mode);
      button.setAttribute('aria-disabled', String(!available));
      button.title = available ? '' : 'Depth panels are only in the paper for TUM fr3 and kitchen1.';
      button.setAttribute('aria-pressed', String(mode === selectedMode));
    });
    $('#compare-baseline-label').textContent = group.baseline_label;
    const oursSrc = view.images['eligsir_' + selectedMode];
    const baselineSrc = view.images['baseline_' + selectedMode];
    const available = Boolean(oursSrc && baselineSrc);
    $('#missing-modality').hidden = available;
    $('#compare-wipe').disabled = !available;
    $('#toggle-comparison').disabled = !available;
    if (available) {
      $('#comparison-ours').src = oursSrc;
      $('#comparison-baseline').src = baselineSrc;
      $('#comparison-ours').alt = 'EliGSiR ' + selectedMode.toUpperCase() + ' rendering · ' + group.label + ' · ' + view.label;
      $('#comparison-baseline').alt = group.baseline_label + ' ' + selectedMode.toUpperCase() + ' rendering · ' + view.label;
      const metrics = view.metrics && view.metrics[selectedMode];
      $('#comparison-baseline-tag').textContent = metrics ? metrics.baseline : group.baseline_label;
      $('#comparison-ours-tag').textContent = metrics ? metrics.eligsir : 'EliGSiR';
    } else {
      $('#missing-mode-title').textContent = selectedMode === 'depth' ? 'Depth' : selectedMode.toUpperCase();
      $('#missing-mode-reason').textContent = 'Depth is not available for this scene; only RGB was compared.';
    }
    const showColorbar = selectedMode === 'depth' && available;
    $('#depth-colorbar').hidden = !showColorbar;
    $('#depth-colorbar-caption').hidden = !showColorbar;
    if (showColorbar) { $('#depth-colorbar').src = comparisons.colorbar.image; $('#depth-colorbar-caption').textContent = comparisons.colorbar.caption; }
    $('#reference-image').src = view.images.reference_rgb;
    $('#reference-image').alt = 'Reference RGB · ' + view.label;
    $('#reference-expand').dataset.lightbox = view.images.reference_rgb;
    $('#reference-expand').dataset.caption = 'Reference RGB · ' + group.label + ' · ' + view.label;
    const sceneName = group.label.split(' · ')[0];
    const viewPart = view.label.charAt(0).toLowerCase() + view.label.slice(1);
    $('#comparison-caption').textContent = sceneName + ' · ' + viewPart + ' · ' + (group.source || 'matched viewpoint');
    $$('.reference-view').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === selectedView)));
    announce('Comparison: ' + group.label + ', ' + view.label + ', ' + selectedMode + '.');
  }
  $$('#compare-groups .scene-chip').forEach(chip => chip.addEventListener('click', () => {
    const groupId = chip.dataset.group;
    if (groupId === selectedGroup) return;
    selectedGroup = groupId;
    $$('#compare-groups .scene-chip').forEach(c => { const active = c === chip; c.classList.toggle('selected', active); c.setAttribute('aria-pressed', String(active)); });
    const firstView = viewsForGroup(selectedGroup)[0];
    selectedView = firstView.id;
    populateReferenceViews();
    renderComparison();
  }));
  $$('.mode-tabs button').forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-disabled') === 'true') return;
    selectedMode = button.dataset.mode;
    renderComparison();
  }));
  $('#return-rgb').addEventListener('click', () => { selectedMode = 'rgb'; renderComparison(); });
  $('#compare-wipe').addEventListener('input', event => comparisonEl.style.setProperty('--wipe', event.target.value + '%'));
  $('#toggle-comparison').addEventListener('click', event => {
    const active = comparisonEl.classList.toggle('side-by-side');
    const button = event.currentTarget;
    button.setAttribute('aria-pressed', String(active));
    button.innerHTML = active ? 'Wipe comparison <span aria-hidden="true">⇄</span>' : 'Side by side <span aria-hidden="true">⇄</span>';
    renderComparison();
  });
  populateReferenceViews();
  renderComparison();

  // Paper & code: copy BibTeX.
  $('#copy-bibtex').addEventListener('click', async event => {
    const text = $('#bibtex-text').textContent;
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents($('#bibtex-text'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
    }
    const original = button.textContent;
    button.textContent = 'Copied';
    announce('BibTeX copied to clipboard.');
    setTimeout(() => { button.textContent = original; }, 2000);
  });

  // Progressive image expansion, with native focus-trapping and Escape close.
  const dialog = $('#media-dialog');
  let lastLightboxTrigger;
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-lightbox]');
    if (!trigger) return;
    lastLightboxTrigger = trigger;
    $('#dialog-image').src = trigger.dataset.lightbox;
    $('#dialog-image').alt = trigger.dataset.caption || 'Expanded figure';
    $('#dialog-caption').textContent = trigger.dataset.caption || 'Expanded figure';
    if (dialog.showModal) dialog.showModal();
  });
  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => lastLightboxTrigger?.focus({preventScroll:true}));
})();
