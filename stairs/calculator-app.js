(() => {
function recommend(height, available) {
  if (!Number.isFinite(height) || !Number.isFinite(available)) return null;
  let count;
  if (height >= 30 && height <= 1200 && available === 0) {
    count = Math.max(2, Math.round(height / 17.5));
    available = (63 - 2 * height / count) * (count - 1);
  } else if (available >= 20 && available <= 3000 && height === 0) {
    count = Math.max(2, Math.round(available / 28) + 1);
    height = (63 - available / (count - 1)) / 2 * count;
  } else return null;
  if (height < 30 || height > 1200 || available < 20 || available > 3000) return null;
  return { height, available, count };
}
function calculate(height, available, count) {
  if (![height, available, count].every(Number.isFinite) || height <= 0 || available <= 0 || !Number.isInteger(count) || count < 2) return null;
  const rise = height / count;
  const tread = available / (count - 1);
  const comfort = 2 * rise + tread;
  return { count, treads: count - 1, rise, tread, run: available, comfort, angle: Math.atan(rise / tread) * 180 / Math.PI, inRange: comfort >= 61 - 1e-9 && comfort <= 65 + 1e-9 };
}
function options(height, available) {
  // With n risers and n-1 treads, the formula decreases strictly as n grows.
  // Include every possible in-range integer count, plus adjacent alternatives.
  const min = 2;
  const max = Math.max(12, Math.ceil((2 * height + available) / 61) + 2);
  const all = Array.from({length: max - min + 1}, (_, i) => calculate(height, available, min + i));
  const fit = all.filter(o => o.inRange);
  const best = (fit.length ? fit : all).reduce((a,b) => Math.abs(a.comfort - 63) <= Math.abs(b.comfort - 63) ? a : b);
  return { min, max, best: best.count, all, validCount: fit.length };
}

const stairText = window.portfolioImages?.stairCalculator || {};
const $ = id => document.getElementById(id);
let view = 'perspective';
const fmt = (v, digits=1) => v.toLocaleString('en-US', {minimumFractionDigits:digits, maximumFractionDigits:digits});
function values(){return {h:Number($('height').value),l:Number($('length').value)};}
function valid(){const {h,l}=values();return h>=30&&h<=1200&&l>=20&&l<=3000;}
function refreshDimensions(auto=false){
  const current = values();
  const suggested = recommend(current.h,current.l);
  $('recommend').hidden = !suggested;
  if (suggested) {
    $('input-error').hidden=true; $('count').disabled=true; $('best').disabled=true;
    $('fit-title').textContent=stairText.recommendPrompt || 'See recommended dimensions';
    $('fit-detail').textContent=''; $('drawing').innerHTML='';
    for(const id of ['rise','tread','run','angle','math-rise','math-tread','math-result','count-value']) $(id).textContent='—';
    $('drawing-caption').textContent=''; $('run-check').textContent='';
    return;
  }
  if(!valid()){
    $('input-error').textContent='Enter a height from 30–1,200 cm and a length from 20–3,000 cm.';$('input-error').hidden=false;
    $('count').disabled=true;$('best').disabled=true;document.querySelector('.visual').classList.add('invalid');
    $('fit-title').textContent='Check your dimensions';$('fit-detail').textContent='The preview shows your last valid dimensions.';
    return;
  }
  $('input-error').hidden=true;$('count').disabled=false;$('best').disabled=false;document.querySelector('.visual').classList.remove('invalid');
  const {h,l}=values(), opts=options(h,l);
  $('count').min=opts.min;$('count').max=opts.max;
  $('count').value=auto?opts.best:Math.max(opts.min,Math.min(opts.max,Number($('count').value)));
  $('min-label').textContent=opts.min+' risers';$('max-label').textContent=opts.max+' risers';render();
}
function render(){
  if(!valid())return;
  const {h,l}=values(), o=calculate(h,l,Number($('count').value));if(!o)return;
  $('count-value').textContent=o.count;$('count').setAttribute('aria-valuetext',`${o.count} risers, ${fmt(o.rise)} cm rise, ${fmt(o.tread)} cm tread. Formula ${fmt(o.comfort,2)} cm, ${o.inRange?'within':'outside'} 61 to 65 cm. Both dimensions fixed.`);
  for(const [id,val] of Object.entries({rise:o.rise,tread:o.tread,run:o.run,angle:o.angle,'math-rise':o.rise,'math-tread':o.tread}))$(id).textContent=fmt(val,id==='angle'?1:2);
  $('drawing-caption').textContent=`${o.count} risers / ${o.treads} treads`;
  const opts=options(h,l);
  $('fit-box').classList.toggle('warning',!o.inRange);$('fit-icon').textContent=o.inRange?'✓':'!';
  $('fit-title').textContent=o.inRange?'Within 61–65 cm':opts.validCount?'Outside 61–65 cm':'No option within 61–65 cm';
  $('fit-detail').textContent='2r + b = '+fmt(o.comfort,2)+' cm. '+(o.inRange?'Both dimensions are matched exactly.':opts.validCount?'Try Best fit for an in-range option.':'The fixed dimensions need to change to meet this range.');
  $('math-result').textContent=fmt(o.comfort,2)+' cm';
  $('math-result').style.color=o.inRange?'#982c31':'#a16430';
  $('math-check').textContent=o.inRange?'✓':'!';
  $('run-check').textContent=o.treads+' treads × ('+fmt(l,2)+' ÷ '+o.treads+') = '+fmt(l,2)+' cm exactly. Displayed step dimensions are rounded.';
  draw(o,h,l);
}
function draw(o,h,l){
  const side=view==='side', width=side?0:88, scale=Math.min(570/Math.max(o.run,l),295/h,1.25), dx=side?0:-width*.9,dy=side?0:-width*.52;
  const left=190, bottom=391, x=v=>left+v*scale, y=v=>bottom-v*scale;
  const p=(a,b,back=false)=>[x(a)+(back?dx:0),y(b)+(back?dy:0)];
  const pts=arr=>arr.map(v=>v.join(',')).join(' ');
  const line=(a,b,color='#cdbdbd',extra='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="1" ${extra}/>`;
  const label=(a,text,extra='')=>`<text x="${a[0]}" y="${a[1]}" class="drawing-text" ${extra}>${text}</text>`;
  let s=`<title id="drawing-title">${o.count} risers with ${fmt(o.rise)} cm rise and ${fmt(o.tread)} cm tread</title><desc id="drawing-description">Total run ${fmt(o.run)} cm, height ${fmt(h)} cm. Available run ${fmt(l)} cm. Both dimensions matched exactly. Formula ${fmt(o.comfort,2)} cm, ${o.inRange?'within':'outside'} 61 to 65 cm.</desc><defs><linearGradient id="side-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dfc8ca"/><stop offset="1" stop-color="#f1e8e8"/></linearGradient><linearGradient id="riser-fill" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c6a0a2"/><stop offset="1" stop-color="#dfc8ca"/></linearGradient><filter id="shadow" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="9"/></filter></defs>`;
  if(!side)s+=`<polygon points="${pts([p(-12,0),p(o.run+22,0),p(o.run+22,0,true),p(-12,0,true)])}" fill="#761d1c" opacity=".12" filter="url(#shadow)"/>`;
  s+=line(p(-38,0),p(Math.max(l,o.run)+38,0),'#e5d7d8');
  // Available footprint is dimensioned independently from the actual stair run.
  s+=line([x(0),bottom+65],[x(l),bottom+65],'#a78d8e','stroke-dasharray="4 4"');
  s+=line([x(0),bottom+59],[x(0),bottom+71]);s+=line([x(l),bottom+59],[x(l),bottom+71]);
  s+=label([x(l/2),bottom+83],`FIXED LENGTH ${fmt(l,2)} cm`,'text-anchor="middle" style="font-size:10px;letter-spacing:1px"');
  let outline=[p(0,0),p(0,o.rise)];
  for(let i=1;i<o.count;i++){outline.push(p(i*o.tread,i*o.rise));outline.push(p(i*o.tread,(i+1)*o.rise));}
  outline.push(p(o.run,0));
  s+=`<polygon points="${pts(outline)}" fill="url(#side-fill)" stroke="#a45a5e" stroke-width="1.1" stroke-linejoin="round"/>`;
  if(!side){
    for(let i=0;i<o.count;i++){
      const a=i*o.tread, low=i*o.rise, high=(i+1)*o.rise;
      s+=`<polygon points="${pts([p(a,low),p(a,low,true),p(a,high,true),p(a,high)])}" fill="url(#riser-fill)" stroke="#a45a5e" stroke-width=".8"/>`;
      if(i<o.treads)s+=`<polygon points="${pts([p(a,high),p(a,high,true),p(a+o.tread,high,true),p(a+o.tread,high)])}" fill="#f1e8e8" stroke="#b48184" stroke-width=".8"/>`;
    }
  }
  // Upper landing marks the final riser; it is not included in the horizontal run.
  s+=`<polygon points="${pts([p(o.run,h),p(o.run,h,true),p(o.run+42/scale,h,true),p(o.run+42/scale,h)])}" fill="#f6eeee" stroke="#998687" stroke-width="1"/>`;
  s+=label([x(o.run)+dx+10,y(h)+dy-15],'UPPER FLOOR','style="font-size:9px;letter-spacing:1px"');
  s+=line([left-49,bottom],[left-49,y(h)],'#8b7475');
  for(const yy of [bottom,y(h)]){s+=line([left-55,yy+5],[left-43,yy-5],'#8b7475');s+=line([left-38,yy],[left-13,yy],'#dfd3d3','stroke-dasharray="3 4"');}
  s+=label([left-66,(bottom+y(h))/2],`${fmt(h,0)} cm`,`text-anchor="middle" transform="rotate(-90 ${left-66} ${(bottom+y(h))/2})"`);
  s+=line([left,bottom+29],[x(o.run),bottom+29],'#8b7475');
  for(const xx of [left,x(o.run)])s+=line([xx-4,bottom+34],[xx+4,bottom+24],'#8b7475');
  s+=label([x(o.run/2),bottom+47],`${fmt(o.run)} cm run`,'text-anchor="middle"');
  if(o.count<=35){
    const i=Math.floor(o.treads*.54), a=p(i*o.tread,(i+1)*o.rise), b=p((i+1)*o.tread,(i+1)*o.rise);
    s+=line([a[0],a[1]+17],[b[0],b[1]+17],'#761d1c');
    s+=label([b[0]+13,b[1]+22],`b ${fmt(o.tread)}`,'style="font-size:11px;fill:#761d1c"');
    const c=p(i*o.tread,i*o.rise);s+=line([a[0]-13,a[1]],[c[0]-13,c[1]],'#761d1c');s+=label([c[0]-20,c[1]-3],`r ${fmt(o.rise)}`,'text-anchor="end" style="font-size:11px;fill:#761d1c"');
  }
  $('drawing').innerHTML=s;
}
for(const id of ['height','length'])$(id).addEventListener('input',()=>refreshDimensions(true));
$('count').addEventListener('input',render);
$('best').addEventListener('click',()=>refreshDimensions(true));
$('recommend').addEventListener('click',()=>{
  const {h,l}=values(), suggestion=recommend(h,l); if(!suggestion)return;
  $('height').value=suggestion.height; $('length').value=suggestion.available;
  $('count').value=suggestion.count; refreshDimensions(false);
});
$('reset').addEventListener('click',()=>{$('height').value=280;$('length').value=450;refreshDimensions(true)});
for(const [id,mode] of [['view-3d','perspective'],['view-side','side']])$(id).addEventListener('click',()=>{view=mode;for(const v of ['view-3d','view-side']){$(v).classList.toggle('active',v===id);$(v).setAttribute('aria-pressed',String(v===id));}render();});
refreshDimensions(true);


})();
