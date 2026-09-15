const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
if(finePointer.matches){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const core=document.createElement('div'),orbit=document.createElement('div');
 core.className='space-cursor cursor-core';orbit.className='space-cursor cursor-orbit';
 core.setAttribute('aria-hidden','true');orbit.setAttribute('aria-hidden','true');document.body.append(core,orbit);
 let x=0,y=0,rx=0,ry=0,visible=false,frame=0,last=0;
 const position=(el,a,b)=>{el.style.transform=`translate3d(${a}px,${b}px,0)`};
 function tick(t){frame=0;const dt=Math.min((t-last)/1000,.05)||.016;last=t;const ease=reduced.matches?1:1-Math.exp(-dt*24);rx+=(x-rx)*ease;ry+=(y-ry)*ease;position(orbit,rx,ry);if(visible&&Math.hypot(x-rx,y-ry)>.1)frame=requestAnimationFrame(tick);}
 function hide(){visible=false;core.classList.remove('visible');orbit.classList.remove('visible','pressed');document.documentElement.classList.remove('custom-cursor');cancelAnimationFrame(frame);frame=0;}
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!finePointer.matches)return;x=e.clientX;y=e.clientY;if(!visible){rx=x;ry=y;visible=true;core.classList.add('visible');orbit.classList.add('visible');document.documentElement.classList.add('custom-cursor');}position(core,x,y);orbit.classList.toggle('target',!!e.target.closest('a,button,input,textarea,select,[role="button"]'));if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}, {passive:true});
 document.addEventListener('pointerdown',()=>orbit.classList.add('pressed'),{passive:true});
 document.addEventListener('pointerup',()=>orbit.classList.remove('pressed'),{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);window.addEventListener('blur',hide);
 document.addEventListener('keydown',e=>{if(e.key==='Tab')hide();});finePointer.addEventListener('change',hide);
}
