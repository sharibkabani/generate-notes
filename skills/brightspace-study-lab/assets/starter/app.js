/* Study lab engine. Reads window.SITE (data.js) and window.LABS (labs.js).
   You normally don't edit this file: fill data.js, write labs.js, restyle index.html. */
(function(){
'use strict';
const S = window.SITE || {};
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const NS = S.storeKey || (S.code||'lab').toLowerCase().replace(/[^a-z0-9]/g,'');
const store = {
  get(k,d){ try{ const v=localStorage.getItem(NS+'.'+k); return v==null?d:JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(NS+'.'+k, JSON.stringify(v)); }catch(e){} }
};
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const pct = (a,b)=>b?Math.round(100*a/b):0;
const h = (html)=>{ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; };

/* ---------- math: x^y and log_b become real sup/sub; MathJax if loaded ---------- */
const SKIP = new Set(['PRE','CODE','SCRIPT','STYLE','TEXTAREA','INPUT','SUP','SUB','SVG','MJX-CONTAINER']);
const EXP = /\^(\((?:[^()]|\([^()]*\))*\)|\{[^{}]*\}|√?[0-9]+(?:\.[0-9]+)?|[A-Za-zε][A-Za-z]*(?![A-Za-z]))/g;
const LOGB = /log_\{?([A-Za-z0-9]+)\}?/g;
function convText(t){
  let s = t.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  s = s.replace(EXP,(m,e)=>{ if(e[0]==='('||e[0]==='{') e=e.slice(1,-1); return '<sup>'+e+'</sup>'; });
  return s.replace(LOGB,'log<sub>$1</sub>');
}
function mathify(root){
  if(!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode(n){
    if(!/\^|log_/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
    if(/\\\(|\\\[/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT; /* leave TeX to MathJax */
    for(let p=n.parentNode; p && p!==root.parentNode; p=p.parentNode){ if(p.nodeType===1 && SKIP.has(p.tagName.toUpperCase())) return NodeFilter.FILTER_REJECT; }
    return NodeFilter.FILTER_ACCEPT; }});
  const list=[]; while(w.nextNode()) list.push(w.currentNode);
  list.forEach(n=>{ const sp=document.createElement('span'); sp.innerHTML=convText(n.nodeValue); n.replaceWith(...sp.childNodes); });
}
function typeset(el){
  mathify(el);
  try{ if(window.MathJax && MathJax.typesetPromise){ MathJax.typesetClear && MathJax.typesetClear([el]); MathJax.typesetPromise([el]).catch(()=>{}); } }catch(e){}
}
window.typeset = typeset;

/* ---------- header ---------- */
$('#brandTag').textContent = S.code || '';
$('#brandName').textContent = S.title || 'Study Lab';
document.title = (S.code ? S.code+' ' : '') + (S.title || 'Study Lab');
$('#footText').innerHTML = S.footer || '';

/* ---------- tabs ---------- */
const LABELS = Object.assign({brief:'Brief',plan:'Study plan',notes:'Notes',labs:'Labs',practice:'Practice',cards:'Flashcards',formulas:'Formula sheet'}, S.tabLabels||{});
const has = {brief:true, plan:!!(S.plan&&S.plan.length), notes:!!(S.notes&&S.notes.length), labs:!!(window.LABS&&window.LABS.length),
  practice:!!(S.questions&&S.questions.length), cards:!!(S.cards&&S.cards.length), formulas:!!(S.formulas&&S.formulas.length)};
const TABS = (S.tabs || ['brief','plan','notes','labs','practice','cards','formulas']).filter(t=>has[t]!==false && $('#tab-'+t));
$$('section.tab').forEach(s=>{ if(!TABS.includes(s.id.slice(4))) s.remove(); });
$('#tabs').innerHTML = TABS.map(t=>`<button role="tab" data-tab="${t}" aria-selected="false" aria-controls="tab-${t}">${esc(LABELS[t]||t)}</button>`).join('');
const onShow = {};
function show(t){
  if(!TABS.includes(t)) t = TABS[0];
  TABS.forEach(x=>{ $('#tab-'+x).hidden = x!==t; });
  $$('#tabs button').forEach(b=>b.setAttribute('aria-selected', String(b.dataset.tab===t)));
  try{ const b=$('#tabs button[aria-selected="true"]'); b && b.scrollIntoView({inline:'nearest',block:'nearest'}); }catch(e){}
  store.set('tab', t);
  try{ history.replaceState(null,'','#'+t); }catch(e){}
  window.scrollTo(0,0);
  onShow[t] && onShow[t]();
}
$('#tabs').addEventListener('click', e=>{ const b=e.target.closest('button[data-tab]'); if(b) show(b.dataset.tab); });
function openNote(id){
  show('notes');
  const t=document.getElementById(id);
  if(t) setTimeout(()=>t.scrollIntoView({block:'start'}),0);
}
document.addEventListener('click', e=>{
  const n=e.target.closest('[data-note]'); if(n){ e.preventDefault(); openNote(n.dataset.note); return; }
  const g=e.target.closest('[data-go]'); if(g){ e.preventDefault(); show(g.dataset.go); return; }
  const a=e.target.closest('.toc a'); if(a){ e.preventDefault(); const t=document.querySelector(a.getAttribute('href')); t && t.scrollIntoView({block:'start'}); }
});

/* scrollable tab bar: arrows + edge fades only when overflowing, wheel scroll, mouse drag without stray clicks */
(function(){
  const w=$('#tabwrap'), t=$('#tabs');
  const upd=()=>{ const m=t.scrollWidth-t.clientWidth; w.classList.toggle('l',t.scrollLeft>2); w.classList.toggle('r',t.scrollLeft<m-2); };
  t.addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd);
  if(window.ResizeObserver) new ResizeObserver(upd).observe(t);
  const step=()=>Math.max(120,t.clientWidth*.7);
  $('.tabarr.prev',w).addEventListener('click',()=>t.scrollBy({left:-step(),behavior:'smooth'}));
  $('.tabarr.next',w).addEventListener('click',()=>t.scrollBy({left:step(),behavior:'smooth'}));
  t.addEventListener('wheel',e=>{ if(t.scrollWidth<=t.clientWidth) return; if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ t.scrollLeft+=e.deltaY; e.preventDefault(); } },{passive:false});
  let sx=0,sl=0,down=false,moved=false;
  t.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') return; down=true; moved=false; sx=e.clientX; sl=t.scrollLeft; });
  addEventListener('pointermove',e=>{ if(!down) return; const dx=e.clientX-sx; if(Math.abs(dx)>4){ moved=true; t.classList.add('drag'); } if(moved) t.scrollLeft=sl-dx; });
  addEventListener('pointerup',()=>{ down=false; t.classList.remove('drag'); });
  t.addEventListener('click',e=>{ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } },true);
  upd(); setTimeout(upd,300);
  /* keep --head in sync with the real header height so sticky offsets are right */
  const hd=$('#top'); const setH=()=>document.documentElement.style.setProperty('--head',hd.offsetHeight+'px');
  setH(); addEventListener('resize',setH); if(window.ResizeObserver) new ResizeObserver(setH).observe(hd);
})();

/* ---------- countdown ---------- */
const EXAM = S.exam && S.exam.at ? Date.parse(S.exam.at) : NaN;
function tick(){
  const mini=$('#miniCount');
  if(isNaN(EXAM)){ mini.textContent=''; return; }
  const ms=EXAM-Date.now();
  const d=Math.max(0,Math.floor(ms/864e5)), hr=Math.max(0,Math.floor(ms%864e5/36e5)), mn=Math.max(0,Math.floor(ms%36e5/6e4));
  const name=(S.exam.name||'Exam');
  mini.innerHTML = ms<=0 ? esc(name)+' day: good luck' : esc(name)+' in <b>'+d+'d '+hr+'h</b>';
  const c=$('#clock'); if(c) c.innerHTML = ms<=0 ? `<div><b>0</b><span>days</span></div>` :
    `<div><b>${d}</b><span>days</span></div><div><b>${hr}</b><span>hours</span></div><div><b>${mn}</b><span>min</span></div>`;
}

/* ---------- brief ---------- */
(function(){
  const E=S.exam||{}, el=$('#tab-brief');
  const facts=(E.facts||[]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${v}</dd>`).join('');
  const scope=(E.scope||[]).map(s=>`<div class="panel"><span class="k">${esc(s.k||'')}</span><h3>${s.title}</h3><p class="muted">${s.text||''}</p>${s.go?`<button class="btn" data-go="${s.go}">${esc(s.goLabel||'Practice')}</button>`:''}${s.note?`<button class="btn" data-note="${s.note}">${esc(s.noteLabel||'Read the notes')}</button>`:''}</div>`).join('');
  const max=Math.max(1,...(E.breakdown||[]).map(r=>r[1]));
  const bars=(E.breakdown||[]).map(([k,n])=>`<div class="brow"><span>${esc(k)}</span><div class="track"><div class="fill" style="width:${100*n/max}%"></div></div><span class="n num">${n}</span></div>`).join('');
  const checks=(E.checklist||[]).map((c,i)=>`<label class="check"><input type="checkbox" data-ck="${i}"> <span>${c}</span></label>`).join('');
  el.innerHTML = `
  <div class="hero">
    <div class="panel graph stack" style="padding:28px">
      <p class="eyebrow">${E.eyebrow||''}</p>
      <h1>${E.headline||esc(E.name||'Exam')}</h1>
      <p class="lead">${E.blurb||''}</p>
      <div class="row">${TABS.includes('plan')?'<button class="btn primary" data-go="plan">Open the study plan</button>':''}${TABS.includes('notes')?`<button class="btn" data-go="notes">Start the notes</button>`:''}</div>
    </div>
    <div class="panel stack">
      <p class="eyebrow">Time left</p>
      <div class="clock" id="clock" aria-live="polite"></div>
      ${facts?`<dl class="facts">${facts}</dl>`:''}
      ${E.bring?`<h4>Bring</h4><div class="chips">${E.bring.map(b=>`<span class="chip yes">✓ ${b}</span>`).join('')}</div>`:''}
      ${E.notAllowed?`<h4>Not allowed</h4><div class="chips">${E.notAllowed.map(b=>`<span class="chip no">✕ ${b}</span>`).join('')}</div>`:''}
    </div>
  </div>
  ${scope?`<div class="stack"><h2>What's on it</h2><div class="scope">${scope}</div></div>`:''}
  <div class="cols">
    ${bars?`<div class="panel stack"><div><span class="eyebrow">${esc(E.breakdownLabel||'Question breakdown')}</span></div><div class="bars">${bars}</div>${E.breakdownNote?`<p class="small muted">${E.breakdownNote}</p>`:''}</div>`:''}
    ${E.marking?`<div class="panel stack"><h3>${esc(E.markingTitle||'How answers are marked')}</h3><ol class="recipe">${E.marking.map(m=>`<li><div>${m}</div></li>`).join('')}</ol>${E.rules?`<p class="small muted">${E.rules}</p>`:''}</div>`:''}
    ${checks?`<div class="panel stack"><h3>Before the ${esc((E.name||'exam').toLowerCase())}</h3>${checks}</div>`:''}
  </div>`;
  $$('input[data-ck]',el).forEach(c=>{ c.checked=store.get('ck'+c.dataset.ck,false); c.addEventListener('change',()=>store.set('ck'+c.dataset.ck,c.checked)); });
  tick(); setInterval(tick,30000);
})();

/* ---------- study plan ---------- */
(function(){
  if(!TABS.includes('plan')) return;
  const el=$('#tab-plan'), done=store.get('plan',{});
  const today=new Date(); const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const T=iso(today);
  const fmtDay=s=>{ const d=new Date(s+'T12:00:00'); return {w:d.toLocaleDateString(undefined,{weekday:'long'}), m:d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}; };
  el.innerHTML=`<div class="stack"><p class="eyebrow">${esc(S.planRange||'')}</p><h2>Study plan</h2><p class="lead">${S.planIntro||'A day-by-day route to exam day. Each task links to the notes or tool it refers to. Your ticks stay in this browser.'}</p>
    <div class="row"><div class="progress" style="flex:1;min-width:160px"><i id="planBar"></i></div><span class="num small" id="planScore"></span></div></div>
    <div class="plan">${S.plan.map((day,di)=>{ const f=fmtDay(day.d); return `
      <div class="day ${day.d===T?'today':day.d<T?'past':''}" ${day.d===T?'id="plan-today"':''}>
        <div class="d"><b>${f.w}</b>${f.m}${day.d===T?' · today':''}</div>
        <div class="panel stack" style="gap:8px"><h3>${day.title}</h3>${day.focus?`<p class="muted small">${day.focus}</p>`:''}
          <div>${(day.tasks||[]).map((t,ti)=>{ const id=di+'-'+ti; const link=t.note?`<a href="#" data-note="${t.note}">Open</a>`:t.go?`<a href="#" data-go="${t.go}">Open</a>`:'';
            return `<label class="task ${done[id]?'done':''}"><input type="checkbox" data-p="${id}" ${done[id]?'checked':''}><span class="t">${t.tag?`<span class="tagx">${esc(t.tag)}</span>`:''}${t.t} ${link}</span><span class="min">${t.min?t.min+' min':''}</span></label>`; }).join('')}</div>
        </div></div>`; }).join('')}</div>`;
  function upd(){ const all=$$('input[data-p]',el), n=all.filter(x=>x.checked).length; $('#planBar').style.width=pct(n,all.length)+'%'; $('#planScore').textContent=n+' / '+all.length+' tasks'; }
  el.addEventListener('change',e=>{ const c=e.target.closest('input[data-p]'); if(!c) return; done[c.dataset.p]=c.checked; store.set('plan',done); c.closest('.task').classList.toggle('done',c.checked); upd(); });
  upd();
  onShow.plan=()=>{ const t=$('#plan-today'); if(t) setTimeout(()=>t.scrollIntoView({block:'center'}),0); };
})();

/* ---------- quiz engine (one question at a time) ---------- */
/* question: {q, o:[...], a:index, e:'explanation', c:'chapter key', src:'Quiz 2, Q5', keepOrder:true} */
function runQuiz(host, qs, opts={}){
  let i=0, right=0; const log=[];
  const order = qs.map(q=>{ if(q.keepOrder || q.o.length<=2) return q; const idx=shuffle(q.o.map((_,k)=>k)); const lastK=q.o.findIndex(x=>/^(all|none) of the above/i.test(x)); if(lastK>=0){ idx.splice(idx.indexOf(lastK),1); idx.push(lastK); } return Object.assign({},q,{o:idx.map(k=>q.o[k]),a:idx.indexOf(q.a)}); });
  function render(){
    if(i>=order.length) return finish();
    const q=order[i];
    host.innerHTML=`<div class="quiz">
      <div class="qmeta"><span class="eyebrow">Question ${i+1} of ${order.length}${q.c&&opts.chapName?' · '+esc(opts.chapName(q.c)):''}</span><span class="num small">${right} right</span></div>
      <div class="progress"><i style="width:${pct(i,order.length)}%"></i></div>
      <div class="qtext">${q.q}</div>
      <div class="opts">${q.o.map((o,k)=>`<button class="opt" data-k="${k}"><span class="k">${String.fromCharCode(65+k)}</span><span>${o}</span></button>`).join('')}</div>
      <div class="explain" hidden></div>
      <div class="row" hidden><button class="btn primary" data-next>${i+1<order.length?'Next':'See score'}</button></div></div>`;
    typeset(host);
  }
  function answer(k){
    const q=order[i]; if(host.querySelector('.opt:disabled')) return;
    const ok=k===q.a; if(ok) right++; log.push({q,ok});
    $$('.opt',host).forEach(b=>{ const bk=+b.dataset.k; b.disabled=true; b.classList.add(bk===q.a?'right':bk===k?'wrong':'dim'); });
    const ex=$('.explain',host); ex.hidden=false;
    ex.innerHTML=`<span class="res ${ok?'ok':'no'}">${ok?'Correct':'Not quite: the answer is '+String.fromCharCode(65+q.a)}</span><div>${q.e||''}</div>${q.src?`<span class="src">${esc(q.src)}</span>`:''}`;
    typeset(ex);
    const nx=$('[data-next]',host); nx.parentNode.hidden=false; nx.focus({preventScroll:true});
  }
  function finish(){
    const score=pct(right,order.length);
    if(opts.onFinish) return opts.onFinish({right,total:order.length,score,log,host,restart});
    host.innerHTML=`<div class="stack"><span class="eyebrow">Done</span><div class="big num">${right} / ${order.length}</div><p>${score}%</p><div class="row"><button class="btn primary" data-restart>Try again</button></div></div>`;
  }
  function restart(){ i=0; right=0; log.length=0; render(); }
  host.onclick=e=>{ const b=e.target.closest('.opt'); if(b) return answer(+b.dataset.k);
    if(e.target.closest('[data-next]')){ i++; render(); host.scrollIntoView({block:'nearest'}); }
    if(e.target.closest('[data-restart]')) restart(); };
  host.onkeydown=e=>{ if(e.target.matches('input,textarea,select')) return;
    const k='1234ABCDabcd'.indexOf(e.key); if(k>=0 && !host.querySelector('.opt:disabled')){ const idx=k%4; if(idx<order[i].o.length) answer(idx); }
    else if(e.key==='Enter'){ const n=$('[data-next]',host); if(n && !n.parentNode.hidden){ e.preventDefault(); n.click(); } } };
  host.tabIndex=-1; render(); return {restart};
}
window.runQuiz = runQuiz;

/* ---------- notes: TOC, sections, quiz breaks, scroll-spy ---------- */
(function(){
  if(!TABS.includes('notes')) return;
  const el=$('#tab-notes'); let toc='', body='', g=null;
  S.notes.forEach(n=>{
    if(n.group && n.group!==g){ g=n.group; toc+=`<span class="toc-h">${esc(g)}</span>`; }
    if(n.qb){ const b=(S.quizBreaks||{})[n.qb]; if(!b) return; toc+=`<a href="#qb-${n.qb}" class="qb-link">Quiz break ${n.qb}</a>`; body+=`<div class="qbreak" id="qb-${n.qb}" data-qb="${n.qb}"></div>`; return; }
    toc+=`<a href="#${n.id}">${esc(n.short||n.title)}</a>`;
    body+=`<article class="note" id="${n.id}"><p class="eyebrow">${esc(n.group||'')}</p><h2>${n.title}</h2>${n.html||''}</article>`;
  });
  el.innerHTML=`<div class="notes-layout"><nav class="toc" aria-label="Notes contents">${toc}</nav><div class="stack" style="gap:32px">${body}</div></div>`;
  typeset(el);

  /* quiz breaks: 80% to move on, otherwise point back to the sections to reread */
  $$('.qbreak',el).forEach(box=>{
    const id=box.dataset.qb, B=S.quizBreaks[id], pass=B.pass||80;
    const best=store.get('qb'+id,null);
    const intro=()=>{ box.innerHTML=`<div class="row" style="justify-content:space-between"><span class="eyebrow">Quiz break ${id}${B.like?' · '+esc(B.like):''}</span>${best!=null?`<span class="num small">Best: ${store.get('qb'+id)}%</span>`:''}</div>
      <h3>${B.title}</h3><p class="muted small">${B.qs.length} questions on ${B.covers||'the sections above'}. Get ${pass}% or more to move on.</p>
      <div><button class="btn primary" data-start>Start quiz break</button></div>`; };
    intro();
    box.addEventListener('click',e=>{ if(!e.target.closest('[data-start]')) return;
      const host=document.createElement('div'); box.replaceChildren(host);
      runQuiz(host,B.qs,{onFinish({right,total,score,restart}){
        const prev=store.get('qb'+id,0); if(score>prev) store.set('qb'+id,score);
        const ok=score>=pass;
        host.innerHTML=`<div class="stack"><span class="eyebrow">Quiz break ${id}</span><div class="big num">${right} / ${total}</div>
          <p class="verdict ${ok?'good':'bad'}">${ok?`${score}%: you're ready for the next sections.`:`${score}%: below ${pass}%. Reread these, then try again:`}</p>
          ${ok?'':`<div class="row">${(B.reread||[]).map(([nid,l])=>`<button class="btn" data-note="${nid}">${esc(l)}</button>`).join('')}</div>`}
          <div class="row"><button class="btn ${ok?'':'primary'}" data-restart>Try again</button></div></div>`;
      }});
    });
  });

  /* scroll-spy: highlight the section being read, keep its link visible inside the TOC */
  const tocEl=$('.toc',el), links=$$('a[href^="#"]',tocEl);
  const items=links.map(a=>({a,el:document.querySelector(a.getAttribute('href'))})).filter(x=>x.el);
  let cur=null, ticking=false;
  function update(){ ticking=false; if(el.hidden) return;
    const line=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head'))+60||130;
    let hit=items[0]; for(const it of items){ if(it.el.getBoundingClientRect().top<=line) hit=it; else break; }
    if(!hit||hit===cur) return; cur=hit;
    links.forEach(l=>{ const on=l===hit.a; l.classList.toggle('on',on); on?l.setAttribute('aria-current','true'):l.removeAttribute('aria-current'); });
    if(getComputedStyle(tocEl).position==='sticky'){ const tr=tocEl.getBoundingClientRect(), ar=hit.a.getBoundingClientRect();
      if(ar.top<tr.top+30||ar.bottom>tr.bottom-30) tocEl.scrollTop+=ar.top-tr.top-tr.height/2+ar.height/2; }
  }
  const req=()=>{ if(!ticking){ ticking=true; requestAnimationFrame(update); } };
  addEventListener('scroll',req,{passive:true}); addEventListener('resize',req);
  onShow.notes=()=>{ cur=null; req(); };
})();

/* ---------- practice ---------- */
(function(){
  if(!TABS.includes('practice')) return;
  const el=$('#tab-practice'), CH=S.chapters||[];
  const chapName=k=>(CH.find(c=>c.k===k)||{}).name||k;
  const hist=store.get('attempts',[]);
  el.innerHTML=`<div class="stack"><p class="eyebrow">${S.questions.length} questions</p><h2>Practice</h2><p class="lead">${S.practiceIntro||'Pick a topic to drill, or take a mock that mirrors the real exam. Every answer is explained.'}</p>
    <div class="filters" id="pf"><button aria-pressed="true" data-c="*">All topics</button>${CH.map(c=>`<button aria-pressed="false" data-c="${c.k}">${esc(c.name)}</button>`).join('')}</div>
    <div class="row"><button class="btn primary" id="pStart">Start drill</button>${S.mock?`<button class="btn" id="pMock">Mock exam (${S.mock.reduce((a,m)=>a+m.n,0)} Qs, real weighting)</button>`:''}<span class="small muted" id="pHist"></span></div></div>
    <div class="panel" id="pHost"><p class="muted">Choose a set above.</p></div>`;
  const showHist=()=>{ const h=store.get('attempts',[]); $('#pHist').textContent=h.length?`Last: ${h[h.length-1].score}% · best ${Math.max(...h.map(x=>x.score))}%`:''; };
  showHist();
  let sel='*';
  $('#pf').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; sel=b.dataset.c; $$('#pf button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); });
  function finish({right,total,score,log,host}){
    const by={}; log.forEach(({q,ok})=>{ const k=q.c||'*'; by[k]=by[k]||[0,0]; by[k][1]++; if(ok) by[k][0]++; });
    const h=store.get('attempts',[]); h.push({t:Date.now(),score,total}); store.set('attempts',h.slice(-30)); showHist();
    host.innerHTML=`<div class="stack"><span class="eyebrow">Score</span><div class="big num">${right} / ${total}</div><p>${score}%</p>
      <div class="bars">${Object.entries(by).map(([k,[r,t]])=>{ const ch=CH.find(c=>c.k===k)||{}; return `<div class="brow"><span>${esc(chapName(k))}</span><div class="track"><div class="fill" style="width:${pct(r,t)}%;${pct(r,t)<70?'background:var(--bad)':''}"></div></div><span class="n num">${r}/${t}</span></div>${pct(r,t)<70&&ch.note?`<div><button class="btn" data-note="${ch.note}">Reread ${esc(ch.name)}</button></div>`:''}`; }).join('')}</div>
      <div class="row"><button class="btn primary" data-again>New set</button></div></div>`;
  }
  const start=qs=>runQuiz($('#pHost'),qs,{chapName,onFinish:finish});
  $('#pStart').addEventListener('click',()=>{ const pool=S.questions.filter(q=>sel==='*'||q.c===sel); start(shuffle(pool).slice(0,S.drillSize||15)); });
  if(S.mock) $('#pMock').addEventListener('click',()=>{ const qs=[]; S.mock.forEach(m=>qs.push(...shuffle(S.questions.filter(q=>q.c===m.c)).slice(0,m.n))); start(qs); });
  $('#pHost').addEventListener('click',e=>{ if(e.target.closest('[data-again]')) $('#pStart').click(); });
})();

/* ---------- flashcards ---------- */
(function(){
  if(!TABS.includes('cards')) return;
  const el=$('#tab-cards'), CH=S.chapters||[];
  let deck=[], i=0, sel='*';
  el.innerHTML=`<div class="stack"><p class="eyebrow">${S.cards.length} cards</p><h2>Flashcards</h2><p class="lead">Click or press space to flip. Arrow keys move.</p>
    <div class="filters" id="cf"><button aria-pressed="true" data-c="*">All</button>${CH.filter(c=>S.cards.some(x=>x.c===c.k)).map(c=>`<button aria-pressed="false" data-c="${c.k}">${esc(c.name)}</button>`).join('')}</div></div>
    <div class="card3d" id="card" tabindex="0" role="button" aria-label="Flip card"><div class="inner"><div class="face front"></div><div class="face back"></div></div></div>
    <div class="row" style="justify-content:center"><button class="btn" id="cPrev">← Prev</button><span class="num small" id="cPos"></span><button class="btn" id="cNext">Next →</button><button class="btn" id="cShuf">Shuffle</button></div>`;
  const card=$('#card');
  function build(sh){ deck=S.cards.filter(c=>sel==='*'||c.c===sel); if(sh) deck=shuffle(deck); i=0; draw(); }
  function draw(){ const c=deck[i]; if(!c) return; card.classList.remove('flip');
    $('.front',card).innerHTML=`<span class="eyebrow">${esc((CH.find(x=>x.k===c.c)||{}).name||'')}</span><div class="term">${c.term}</div>`;
    $('.back',card).innerHTML=`<div>${c.def}</div>`; $('#cPos').textContent=(i+1)+' / '+deck.length; typeset(card); }
  const move=d=>{ i=(i+d+deck.length)%deck.length; draw(); };
  card.addEventListener('click',()=>card.classList.toggle('flip'));
  $('#cPrev').onclick=()=>move(-1); $('#cNext').onclick=()=>move(1); $('#cShuf').onclick=()=>build(true);
  $('#cf').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; sel=b.dataset.c; $$('#cf button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); build(false); });
  document.addEventListener('keydown',e=>{ if(el.hidden||e.target.matches('input,textarea,select')||!$('#lb').hidden) return;
    if(e.key===' '){ e.preventDefault(); card.classList.toggle('flip'); } else if(e.key==='ArrowRight') move(1); else if(e.key==='ArrowLeft') move(-1); });
  build(false);
})();

/* ---------- formula sheet ---------- */
(function(){
  if(!TABS.includes('formulas')) return;
  const el=$('#tab-formulas');
  el.innerHTML=`<div class="stack"><h2>Formula sheet</h2>${S.formulaNote?`<p class="lead">${S.formulaNote}</p>`:''}</div>
    <div class="cols">${S.formulas.map(f=>`<div class="panel stack"><span class="eyebrow">${esc(f.group||'')}</span><h3>${f.name}</h3><div class="eq">${f.html}</div>${f.use?`<p class="small">${f.use}</p>`:''}${f.example?`<p class="small muted">${f.example}</p>`:''}</div>`).join('')}</div>`;
  typeset(el);
})();

/* ---------- labs (from labs.js) ---------- */
(function(){
  if(!TABS.includes('labs')) return;
  const el=$('#tab-labs'), L=window.LABS;
  el.innerHTML=`<div class="stack"><h2>${esc(LABELS.labs)}</h2>${S.labsIntro?`<p class="lead">${S.labsIntro}</p>`:''}
    <div class="filters" id="lf">${L.map((l,k)=>`<button aria-pressed="${k===0}" data-l="${k}">${esc(l.title)}</button>`).join('')}</div></div><div id="labHost"></div>`;
  const api={store,esc,typeset,svg:(tag,attrs)=>{ const n=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const k in attrs) n.setAttribute(k,attrs[k]); return n; },
    css:v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim()};
  let cur=null;
  function open(k){ const l=L[k]; const host=$('#labHost'); host.innerHTML=`<div class="panel stack"><h3>${l.title}</h3>${l.blurb?`<p class="muted">${l.blurb}</p>`:''}<div class="lab-body"></div></div>`;
    cur=l; l.mount($('.lab-body',host),api); typeset(host); store.set('lab',k);
    $$('#lf button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.l===k))); }
  $('#lf').addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) open(+b.dataset.l); });
  const redraw=()=>{ if(!el.hidden && cur && cur.redraw) cur.redraw(); };
  try{ matchMedia('(prefers-color-scheme: dark)').addEventListener('change',redraw); }catch(e){}
  new MutationObserver(redraw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  onShow.labs=redraw;
  open(Math.min(store.get('lab',0),L.length-1));
})();

/* ---------- lightbox for figures ---------- */
(function(){
  const lb=$('#lb'), img=$('#lbImg'); let list=[], i=0, last=null;
  const visible=()=>$$('figure .plate img, .qtext img').filter(x=>x.offsetParent!==null);
  function draw(){ const t=list[i]; img.src=t.currentSrc||t.src; img.alt=t.alt;
    const fc=t.closest('figure') && t.closest('figure').querySelector('figcaption');
    $('#lbCap').textContent=fc?fc.textContent:(t.alt||'');
    $('#lbPos').textContent=list.length>1?`Figure ${i+1} of ${list.length}`:'';
    $('#lbPrev').hidden=$('#lbNext').hidden=list.length<2; lb.classList.remove('zoom'); $('#lbZoom').textContent='Zoom 2×'; $('#lbStage').scrollTo(0,0); }
  function open(t){ last=t; list=visible(); i=Math.max(0,list.indexOf(t)); lb.hidden=false; document.body.style.overflow='hidden'; draw(); $('#lbClose').focus(); }
  function close(){ lb.hidden=true; document.body.style.overflow=''; last && last.focus && last.focus(); }
  const zoom=()=>{ lb.classList.toggle('zoom'); $('#lbZoom').textContent=lb.classList.contains('zoom')?'Fit to screen':'Zoom 2×'; };
  document.addEventListener('click',e=>{ const t=e.target.closest('figure .plate img, .qtext img'); if(t && !lb.contains(t)){ e.preventDefault(); open(t); } });
  $('#lbClose').onclick=close; $('#lbZoom').onclick=zoom; img.onclick=zoom;
  $('#lbPrev').onclick=()=>{ i=(i-1+list.length)%list.length; draw(); };
  $('#lbNext').onclick=()=>{ i=(i+1)%list.length; draw(); };
  lb.addEventListener('click',e=>{ if(e.target===lb||e.target.id==='lbStage') close(); });
  document.addEventListener('keydown',e=>{ if(lb.hidden) return;
    if(e.key==='Escape'){ e.stopImmediatePropagation(); close(); }
    else if(e.key==='ArrowRight'){ e.stopImmediatePropagation(); $('#lbNext').click(); }
    else if(e.key==='ArrowLeft'){ e.stopImmediatePropagation(); $('#lbPrev').click(); } },true);
})();

/* ---------- pomodoro (stores the end time, so it survives reloads) ---------- */
(function(){
  if(S.pomodoro===false) return;
  $('#pomoPill').hidden=false;
  const P=store.get('pomo',{}), today=new Date().toDateString();
  const st={mode:'focus',run:false,end:0,left:0,cycle:P.cycle||0,cfg:Object.assign({focus:25,short:5,long:15,sound:true,auto:false},P.cfg||{}),log:(P.day===today&&P.log)||{}};
  const LBL={focus:'Focus',short:'Short break',long:'Long break'}, total=()=>st.cfg[st.mode]*60000;
  const sel=$('#pomoTask'); sel.innerHTML=(S.pomoTasks||(S.chapters||[]).map(c=>c.name).concat(['Mock exam / review'])).map(t=>`<option>${esc(t)}</option>`).join('');
  if(P.task) sel.value=P.task;
  st.left=total();
  if(P.run&&P.end>Date.now()&&P.mode){ st.mode=P.mode; st.run=true; st.end=P.end; } else if(P.mode&&P.left>0){ st.mode=P.mode; st.left=Math.min(P.left,total()); }
  const save=()=>store.set('pomo',{mode:st.mode,run:st.run,end:st.end,left:st.left,cycle:st.cycle,cfg:st.cfg,day:today,log:st.log,task:sel.value});
  const mmss=ms=>{ const s=Math.max(0,Math.ceil(ms/1000)); return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); };
  let actx=null;
  function chime(){ if(!st.cfg.sound) return; try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    [0,.25,.5].forEach((t,k)=>{ const o=actx.createOscillator(), g=actx.createGain(); o.frequency.value=[660,880,990][k];
      g.gain.setValueAtTime(.0001,actx.currentTime+t); g.gain.exponentialRampToValueAtTime(.25,actx.currentTime+t+.02); g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+t+.6);
      o.connect(g).connect(actx.destination); o.start(actx.currentTime+t); o.stop(actx.currentTime+t+.65); }); }catch(e){} }
  const baseTitle=document.title;
  function render(){ const left=st.run?st.end-Date.now():st.left;
    $('#pomoTime').textContent=mmss(left); $('#pomoLabel').innerHTML=LBL[st.mode]+(st.run?'':'<br>paused');
    $('#pomoArc').setAttribute('stroke-dashoffset',String(326.73*(1-Math.max(0,left)/total())));
    $('#pomoArc').setAttribute('stroke',st.mode==='focus'?'var(--bad)':'var(--good)');
    $('#pomoStart').textContent=st.run?'Pause':(st.left<total()?'Resume':'Start');
    $$('#pomoModes button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m===st.mode)));
    const pill=$('#pomoPill'); pill.dataset.mode=st.mode; pill.dataset.run=st.run?'1':'0';
    $('#pomoPillT').textContent=(st.mode==='focus'?'Focus ':'Break ')+mmss(left);
    document.title=st.run?mmss(left)+' · '+LBL[st.mode]+' · '+baseTitle:baseTitle;
    const n=Object.values(st.log).reduce((a,b)=>a+b,0);
    $('#pomoTally').innerHTML=Array.from({length:Math.max(8,n)},(_,k)=>`<i class="${k<n?'on':''}"></i>`).join('')+` <span class="small num muted">${n} session${n===1?'':'s'} · ${n*st.cfg.focus} min</span>`;
    $('#pomoLog').textContent=Object.entries(st.log).map(([k,v])=>k.split(' · ')[0]+' ×'+v).join(' · '); }
  function next(){ if(st.mode==='focus'){ st.cycle++; st.mode=st.cycle%4===0?'long':'short'; } else st.mode='focus'; st.left=total(); }
  function finish(){ st.run=false; chime(); if(st.mode==='focus'){ st.log[sel.value]=(st.log[sel.value]||0)+1; } next(); save(); render(); if(st.cfg.auto) start(); }
  function start(){ st.run=true; st.end=Date.now()+st.left; try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} save(); render(); }
  function pause(){ st.left=Math.max(0,st.end-Date.now()); st.run=false; save(); render(); }
  $('#pomoStart').onclick=()=>st.run?pause():start();
  $('#pomoReset').onclick=()=>{ st.run=false; st.left=total(); save(); render(); };
  $('#pomoSkip').onclick=()=>{ st.run=false; next(); save(); render(); };
  $$('#pomoModes button').forEach(b=>b.onclick=()=>{ st.mode=b.dataset.m; st.run=false; st.left=total(); save(); render(); });
  [['pomoF','focus'],['pomoS','short'],['pomoL','long']].forEach(([id,k])=>{ const inp=$('#'+id); inp.value=st.cfg[k];
    inp.onchange=()=>{ const v=Math.min(+inp.max,Math.max(1,Math.round(+inp.value)||st.cfg[k])); inp.value=v; st.cfg[k]=v; if(!st.run&&st.mode===k) st.left=total(); save(); render(); }; });
  $('#pomoSound').checked=st.cfg.sound; $('#pomoSound').onchange=e=>{ st.cfg.sound=e.target.checked; save(); };
  $('#pomoAuto').checked=st.cfg.auto; $('#pomoAuto').onchange=e=>{ st.cfg.auto=e.target.checked; save(); };
  sel.onchange=save;
  const panel=$('#pomo'), pill=$('#pomoPill'), toggle=o=>{ panel.hidden=!o; pill.setAttribute('aria-expanded',String(o)); };
  pill.onclick=()=>toggle(panel.hidden); $('#pomoClose').onclick=()=>toggle(false);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!panel.hidden) toggle(false); });
  setInterval(()=>{ if(st.run&&Date.now()>=st.end) finish(); else if(st.run) render(); },250);
  render();
})();

/* ---------- start ---------- */
mathify($('#tab-brief'));
const hash=(location.hash||'').slice(1);
show(TABS.includes(hash)?hash:store.get('tab',TABS[0]));
})();
