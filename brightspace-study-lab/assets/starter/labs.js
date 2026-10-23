/* Course-specific interactive labs. Replace the example with 3 to 6 labs for the procedures this course tests.
   Each lab: { title, blurb, mount(el, api), redraw() }.
   api: { store, esc, typeset, svg(tag, attrs), css('--token') }. Draw with theme tokens and implement redraw()
   so charts recolour when the theme changes. Layout: .lab grid = controls left, visual right (stacks on phones). */
window.LABS = [
  (function(){
    let el, api;
    const lab = {
      title: 'Master Theorem solver',
      blurb: 'T(n) = a·T(n/b) + n^y. Change a, b and y and watch which levels of the recursion tree do the most work.',
      mount(host, A){ el = host; api = A;
        const s = api.store.get('mt', {a:2, b:2, y:1});
        el.innerHTML = `<div class="lab">
          <div class="stack">
            <div class="cols" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">
              <div class="field"><label for="mtA">a</label><input id="mtA" type="number" min="1" max="16" value="${s.a}"></div>
              <div class="field"><label for="mtB">b</label><input id="mtB" type="number" min="2" max="8" value="${s.b}"></div>
              <div class="field"><label for="mtY">y</label><input id="mtY" type="number" min="0" max="4" step="0.5" value="${s.y}"></div>
            </div>
            <div class="readout"><div><span>log_b a</span><b id="mtL"></b></div><div><span>y</span><b id="mtYv"></b></div><div><span>Answer</span><b id="mtAns"></b></div></div>
            <p class="verdict" id="mtV"></p>
          </div>
          <svg class="chart" id="mtSvg" viewBox="0 0 420 260" role="img" aria-label="Work per level of the recursion tree"></svg>
        </div>`;
        el.addEventListener('input', ()=>this.redraw());
        this.redraw();
      },
      redraw(){
        if(!el) return;
        const a=Math.max(1,+el.querySelector('#mtA').value||1), b=Math.max(2,+el.querySelector('#mtB').value||2), y=Math.max(0,+el.querySelector('#mtY').value||0);
        api.store.set('mt',{a,b,y});
        const L=Math.log(a)/Math.log(b), r=Math.round(L*1000)/1000, eq=Math.abs(L-y)<1e-9;
        const ans = eq ? `Θ(n^${y} log n)` : y<L ? `Θ(n^${r})` : `Θ(n^${y})`;
        const kind = eq ? ['warn','Balanced: every level does about the same work, so multiply by the number of levels.'] :
          y<L ? ['good','Leaves dominate: work grows toward the bottom of the tree.'] : ['bad','Root dominates: the top level does most of the work.'];
        el.querySelector('#mtL').textContent=r; el.querySelector('#mtYv').textContent=y; el.querySelector('#mtAns').textContent=ans;
        const v=el.querySelector('#mtV'); v.className='verdict '+kind[0]; v.textContent=kind[1];
        api.typeset(el.querySelector('.readout'));
        /* bars: work at level i is (a / b^y)^i relative to the root */
        const svg=el.querySelector('#mtSvg'); svg.replaceChildren();
        const q=a/Math.pow(b,y), lv=6, vals=Array.from({length:lv},(_,i)=>Math.pow(q,i)), mx=Math.max(...vals);
        vals.forEach((w,i)=>{ const bw=Math.max(2,330*w/mx), yy=20+i*38;
          svg.append(api.svg('text',{x:8,y:yy+18}), api.svg('rect',{x:70,y:yy,width:bw,height:24,rx:3,fill:api.css('--accent')}));
          svg.lastChild.previousSibling.textContent='level '+i; });
      }
    };
    return lab;
  })()
];
