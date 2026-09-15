import {initPredictive} from './predictive.js?v=5';
import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';


const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>a+(b-a)*t, smooth=t=>t*t*(3-2*t);
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let target=0,progress=0,chapter=-1,ar=true,sensor='vision',version=0;
const names=['00 / PREDICT. INSPECT. INTERVENE.','01 / OURANOS RISK ENGINE','02 / THE VEHICLE','03 / INSPECT & DIAGNOSE','04 / INTERVENTION','05 / BEFORE FAILURE','06 / THE NETWORK'];
const chapters=all('.chapter');
// Reserve a clear footer band even when headings wrap or report copy expands.
const copyBlocks=all('.chapter .copy');
function fitCopy(){
  copyBlocks.forEach(el=>{
    const overflow=Math.max(0,el.offsetTop+el.offsetHeight-(innerHeight-100));
    el.style.translate=`0 ${-overflow}px`;
  });
}
const copyObserver=new ResizeObserver(fitCopy);
copyBlocks.forEach(el=>copyObserver.observe(el));
addEventListener('resize',fitCopy);
document.fonts.ready.then(fitCopy);

const maxScroll=()=>Math.max(1,$('#journey').offsetHeight-innerHeight);
function jump(i){window.scrollTo({top:(i/6)*maxScroll(),behavior:reduced?'instant':'smooth'});}
all('[data-jump]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();jump(+b.dataset.jump)}));
function resetJourney(){target=0;progress=0;window.scrollTo({top:0,left:0,behavior:'instant'});}
if('scrollRestoration' in history)history.scrollRestoration='manual';
if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);
resetJourney();
addEventListener('pageshow',resetJourney);
function readScroll(){target=clamp(scrollY/maxScroll())*6;}
addEventListener('scroll',readScroll,{passive:true});
document.body.classList.toggle('reduced',reduced);
let scanTimer,scanStep=0,scanRunning=false;
const reportText={evidence:'Visual: asymmetrical array position. Lidar: deployment geometry mismatch. Telemetry: deployment command issued, endpoint unconfirmed.',action:'Operator review → confirm compatibility → engage hinge mechanism → service before next high-load cycle → verify deployment. Physical intervention is a future capability.'};
all('[data-report-tab]').forEach(b=>b.addEventListener('click',()=>{all('[data-report-tab]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#report-detail').textContent=reportText[b.dataset.reportTab]}));
function closeReport(){clearInterval(scanTimer);scanRunning=false;$('#diagnostic').hidden=true;$('#command').disabled=false;$('#command').innerHTML='Run inspection report <span>↗</span>';$('#response').textContent='Initiate a close-range scan to reveal what telemetry cannot.';}
$('#close-report').addEventListener('click',closeReport);
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#diagnostic').hidden){closeReport();$('#command').focus();}});
$('#command').addEventListener('click',()=>{
 clearInterval(scanTimer);scanStep=0;scanRunning=true;$('#diagnostic').hidden=false;$('#diag-result').hidden=true;$('#diagnostic').classList.add('scanning');$('#command').disabled=true;$('#command').textContent='Inspection in progress…';$('#response').textContent='Acquiring spacecraft geometry. Tracking deployment mechanism.';
 $('#scan-fill').style.width='0%';$('#scan-percent').textContent='0%';$('#scan-phase').textContent='ACQUIRING TARGET';all('[data-check] b').forEach(b=>b.textContent='QUEUED');
 scanTimer=setInterval(()=>{scanStep++;const pct=Math.min(100,scanStep*5);$('#scan-percent').textContent=pct+'%';$('#scan-fill').style.width=pct+'%';$('#scan-phase').textContent=pct<35?'MAPPING SURFACE':pct<70?'INSPECTING HINGE':pct<100?'CORRELATING TELEMETRY':'INSPECTION COMPLETE';all('[data-check]').forEach((el,i)=>el.querySelector('b').textContent=pct>=(i+1)*30?(i===1?'FLAGGED':'COMPLETE'):pct>=i*30?'SCANNING':'QUEUED');
 if(pct===100){clearInterval(scanTimer);scanRunning=false;$('#diagnostic').classList.remove('scanning');$('#diag-result').hidden=false;$('#command').disabled=false;$('#command').innerHTML='Run scan again <span>↗</span>';$('#response').textContent='Inspection complete. A probable actuator degradation has been localized. Review the diagnostic report.';}
 },180);
});
$('#ar-toggle').addEventListener('click',()=>{ar=!ar;$('#ar-toggle').setAttribute('aria-pressed',ar);$('#ar-toggle span').textContent=ar?'ON':'OFF';$('#fault-label').style.visibility=ar?'':'hidden'});
const sensorCopy={vision:'Computer vision tracks spacecraft geometry and relative motion.',lidar:'Lidar measures relative range and surface geometry during the approach.',guidance:'Onboard guidance coordinates proximity operations and controlled maneuvering.'};
all('[data-sensor]').forEach(b=>b.addEventListener('click',()=>{sensor=b.dataset.sensor;all('[data-sensor]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b)});$('#sensor-info').textContent=sensorCopy[sensor]}));
const versionCopy=['Autonomously rendezvous, inspect from multiple angles, and diagnose likely physical failures.','Attach to compatible spacecraft, stabilize uncontrolled motion, reposition them, or provide supplemental propulsion.','Deploy stuck mechanisms, attach life-extension modules, refuel compatible spacecraft, and perform standardized maintenance.','Use robotic manipulators and interchangeable tools to repair or replace spacecraft components.','Operate a distributed fleet with predictive monitoring and preventive inspection coverage across orbital regions.'];
all('[data-version]').forEach(b=>b.addEventListener('click',()=>{version=+b.dataset.version;all('[data-version]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b)});$('#version-copy').textContent=versionCopy[version];$('#version-status').textContent=['V1 / INSPECT & DIAGNOSE — FIRST CAPABILITY','V2 / STABILIZE & RECOVER — PLANNED','V3 / SERVICE — PLANNED','V4 / REPAIR — PLANNED','V5 / ORBITAL EMERGENCY NETWORK — VISION'][version]}));

let renderer,scene,camera,responder,client,earth,network,inspection,shoulder,elbow,repairWing;
const mobile=()=>innerWidth<600;const pointer={x:0,y:0};let paused=false;
addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5},{passive:true});
document.addEventListener('visibilitychange',()=>paused=document.hidden);
const alloy=new THREE.MeshStandardMaterial({color:0xb0bec7,metalness:.78,roughness:.3});
const graphite=new THREE.MeshStandardMaterial({color:0x17212a,metalness:.6,roughness:.36});
const gold=new THREE.MeshStandardMaterial({color:0xa58a52,metalness:.8,roughness:.4});
const blue=new THREE.MeshStandardMaterial({color:0x122e53,metalness:.68,roughness:.26});
const light=new THREE.MeshBasicMaterial({color:0xb3e7ff});
function mesh(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
function box(p,w,h,d,x,y,z,m=alloy){return mesh(new RoundedBoxGeometry(w,h,d,2,.035),m,p,x,y,z);}
function cylinder(p,a,b,h,x,y,z,m=alloy){const o=mesh(new THREE.CylinderGeometry(a,b,h,32),m,p,x,y,z);o.rotation.x=Math.PI/2;return o;}
function ring(p,r,t,x,y,z,m=alloy){return mesh(new THREE.TorusGeometry(r,t,8,48),m,p,x,y,z);}
function array(p,sign,fold=0){const wing=new THREE.Group();wing.position.set(sign*1.1,0,-.2);wing.rotation.y=fold;p.add(wing);box(wing,2.9,.07,.10,sign*1.4,0,0,alloy);for(let k=0;k<3;k++){const x=sign*(.8+k*1.15);box(wing,1.10,1.9,.055,x,0,0,graphite);box(wing,1.02,1.80,.012,x,0,.036,blue);for(let i=0;i<6;i++)box(wing,.008,1.79,.009,x-.44+i*.175,0,.048,alloy);for(let i=0;i<9;i++)box(wing,1.02,.008,.009,x,-.8+i*.2,.048,alloy);}return wing;}
function spacecraft(servicer){const p=new THREE.Group();
if(!servicer){box(p,1.7,1.55,2.1,0,0,0,gold);box(p,1.46,1.31,.14,0,0,1.11,graphite);array(p,-1);repairWing=array(p,1,1.25);
for(const x of [-.65,.65])for(const y of [-.58,.58]){box(p,.12,.12,2.2,x,y,0,graphite);cylinder(p,.13,.23,.4,x,y,-1.25,graphite);ring(p,.17,.018,x,y,-1.47,alloy);}
for(let i=0;i<6;i++)box(p,1.25,.025,.025,0,-.5+i*.2,1.2,alloy);
}
if(servicer){
const armor=new THREE.MeshStandardMaterial({color:0xd9dedf,metalness:.48,roughness:.43});
const cyan=new THREE.MeshBasicMaterial({color:0x60d9ff});
mesh(new RoundedBoxGeometry(1.85,1.65,1.95,3,.22),armor,p);
// Four outboard propulsion pods, with solar-topped structural booms.
for(const x of [-1,1])for(const z of [-1,1]){
box(p,1.05,.22,.32,x*1.28,.1,z*.72,graphite);
box(p,.78,.025,.28,x*1.35,.23,z*.72,blue);
const pod=new THREE.Group();pod.position.set(x*1.95,.1,z*.88);p.add(pod);
mesh(new RoundedBoxGeometry(.64,.72,.67,3,.1),armor,pod);
for(const face of [-1,1]){cylinder(pod,.19,.24,.18,0,0,face*.39,graphite);ring(pod,.17,.025,0,0,face*.49,alloy);}
const nozzle=cylinder(pod,.17,.23,.18,0,.43,0,graphite);nozzle.rotation.x=0;
box(pod,.035,.35,.025,-.23,0,.35,cyan);box(pod,.035,.35,.025,.23,0,-.35,cyan);
}
// Recessed multispectral optics and illuminated sensor bars on the armored bus.
for(const face of [-1,1]){
mesh(new RoundedBoxGeometry(1.36,.93,.12,3,.12),graphite,p,0,.08,face*1.0);
for(const x of [-.43,.43]){cylinder(p,.22,.24,.08,x,.08,face*1.1,graphite);ring(p,.19,.024,x,.08,face*1.16,alloy);cylinder(p,.14,.14,.02,x,.08,face*1.185,blue);ring(p,.10,.012,x,.08,face*1.2,graphite);}
for(const y of [-.13,.2]){cylinder(p,.085,.085,.025,0,y,face*1.11,alloy);cylinder(p,.055,.055,.035,0,y,face*1.13,blue);}
box(p,.42,.035,.03,0,.48,face*1.09,cyan);
for(const x of [-.45,.45])box(p,.19,.022,.025,x,-.3,face*1.09,cyan);
for(const x of [-.77,.77])for(const y of [-.62,.62]){cylinder(p,.035,.035,.025,x,y,face*.96,graphite);}
}
for(const side of [-1,1])for(let i=0;i<3;i++){
box(p,.25,.35,.66,side*1.02,-.52+i*.41,0,graphite);
box(p,.035,.28,.57,side*1.16,-.52+i*.41,0,armor);
box(p,.045,.11,.045,side*1.19,-.52+i*.41,.22,gold);
}
const top=cylinder(p,.44,.48,.13,0,.88,0,graphite);top.rotation.x=0;
const topRing=ring(p,.35,.035,0,.96,0,alloy);topRing.rotation.x=Math.PI/2;
shoulder=new THREE.Group();shoulder.position.set(.68,.95,.65);p.add(shoulder);mesh(new THREE.SphereGeometry(.18,16,12),graphite,shoulder);box(shoulder,.17,.17,1.35,0,0,.65);elbow=new THREE.Group();elbow.position.z=1.32;shoulder.add(elbow);mesh(new THREE.SphereGeometry(.2,16,12),graphite,elbow);box(elbow,.14,.14,1.1,0,0,.55);cylinder(elbow,.15,.15,.2,0,0,1.18,graphite);box(elbow,.07,.3,.3,-.13,0,1.38);box(elbow,.07,.3,.3,.13,0,1.38);
}else{const dish=mesh(new THREE.SphereGeometry(.6,28,12,0,Math.PI*2,0,.9),alloy,p,0,1.1,.2);dish.rotation.x=Math.PI/2;box(p,.06,.8,.06,0,1.15,.2);}
return p;}
function init(){renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x020509);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;$('#world').appendChild(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,.1,600);
scene.add(new THREE.HemisphereLight(0xc6e6ff,0x162133,2));const sun=new THREE.DirectionalLight(0xffedda,4);sun.position.set(-12,18,22);scene.add(sun);const rim=new THREE.DirectionalLight(0x648dc6,3);rim.position.set(15,4,-15);scene.add(rim);
responder=spacecraft(true);scene.add(responder);client=spacecraft(false);client.scale.setScalar(2.5);client.position.set(3,0,-17);client.rotation.set(0,0,0);scene.add(client);
earth=new THREE.Group();earth.position.set(-15,-46,-65);scene.add(earth);const earthMap=new THREE.TextureLoader().load('./assets/earth-day.jpg');earthMap.colorSpace=THREE.SRGBColorSpace;earthMap.anisotropy=renderer.capabilities.getMaxAnisotropy();const globe=mesh(new THREE.SphereGeometry(43,96,64),new THREE.MeshStandardMaterial({map:earthMap,roughness:1,metalness:0}),earth);globe.rotation.y=2.1;
const gridMat=new THREE.LineBasicMaterial({color:0x5592ad,transparent:true,opacity:.025});for(let lat=-60;lat<=60;lat+=30){const a=lat*Math.PI/180,pts=[];for(let i=0;i<=128;i++){const b=i/128*Math.PI*2;pts.push(new THREE.Vector3(43.05*Math.cos(a)*Math.cos(b),43.05*Math.sin(a),43.05*Math.cos(a)*Math.sin(b)));}earth.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMat));}for(let lon=0;lon<180;lon+=30){const a=lon*Math.PI/180,pts=[];for(let i=0;i<=128;i++){const b=i/128*Math.PI*2;pts.push(new THREE.Vector3(43.05*Math.cos(b)*Math.cos(a),43.05*Math.sin(b),43.05*Math.cos(b)*Math.sin(a)));}earth.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMat));}
const atm=new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(.16,.5,1.,f*.65);}'});mesh(new THREE.SphereGeometry(43.8,64,40),atm,earth);
const pos=[];let seed=72;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};for(let i=0;i<1800;i++)pos.push((rand()-.5)*400,(rand()-.5)*300,-rand()*220);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xc4d7e8,size:.10,transparent:true,opacity:.65})));
network=new THREE.Group();earth.add(network);for(let j=0;j<3;j++){const orbit=new THREE.Group();orbit.rotation.set(.45+j*.6,.2+j*.5,.3);network.add(orbit);const points=[];for(let i=0;i<=200;i++){const a=i/200*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*(49+j*3),Math.sin(a)*(49+j*3),0));}orbit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x8ac9eb,transparent:true,opacity:.42})));for(let i=0;i<4;i++){const a=i*Math.PI/2+j;mesh(new THREE.SphereGeometry(.45,12,8),light,orbit,Math.cos(a)*(49+j*3),Math.sin(a)*(49+j*3),0);}}
network.children.forEach((orbit,j)=>{const vehicle=responder.clone(true);vehicle.scale.setScalar(.65);vehicle.position.set(49+j*3,0,0);orbit.add(vehicle);});
inspection=new THREE.Group();client.add(inspection);const mat=new THREE.MeshBasicMaterial({color:0xd3edff,transparent:true,opacity:0,depthWrite:false});for(const r of [.45,.65])ring(inspection,r,.009,1.1,0,.35,mat);document.body.classList.add('ready');}
try{init();}catch(e){renderer=null;document.body.classList.add('fallback','ready');console.error(e);}
const predictive=initPredictive({THREE,model:responder,reduced,camera,scene,client});
const cameraKeys=[[4,12,55],[5,8,30],[7,5,5],[14,6,5],[15,6,3],[8,7,12],[5,16,100]];
const lookKeys=[[-6,-3,-17],[-4,-1,-16],[-2,0,-16],[0,0,-16],[0,0,-16],[-2,0,-16],[-12,-32,-60]];
const responderKeys=[[4,1,12],[4,1,2],[3.4,.65,-9],[7.4,-2.5,-16.85],[7.4,-2.5,-16.85],[5,1,-10],[9,0,-8]];
const curve=a=>new THREE.CatmullRomCurve3(a.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.15);
const camPath=curve(cameraKeys),lookPath=curve(lookKeys),shipPath=curve(responderKeys);const cp=new THREE.Vector3(),lp=new THREE.Vector3();let last=0;
function frame(now){requestAnimationFrame(frame);if(paused)return;const dt=Math.min((now-last)/1000,.05)||.016;last=now;progress=reduced?target:mix(progress,target,1-Math.exp(-dt*5));const index=Math.round(progress);if(chapter!==index){chapter=index;$('#chapter-name').textContent=names[index];all('.chapter-nav button').forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-current',i===index?'step':'false');});}
chapters.forEach((el,i)=>{const d=Math.abs(progress-i),opacity=reduced?(index===i?1:0):1-smooth(clamp((d-.25)/.24));el.classList.toggle('active',opacity>0);el.inert=index!==i;el.style.opacity=opacity;el.style.transform=reduced?'none':`translateY(${(i-progress)*-25}px)`;});$('#progress').textContent=String(Math.round(progress/6*100)).padStart(3,'0')+'%';if(!renderer)return;

const sample=reduced?Math.round(progress):progress,t=sample/6;camPath.getPoint(t,cp);lookPath.getPoint(t,lp);if(mobile()){cp.z+=12;lp.x+=4;lp.y-=2.5;}if(!reduced){cp.x+=pointer.x*.15;cp.y-=pointer.y*.1;}camera.position.copy(cp);camera.lookAt(lp);camera.rotateZ(Math.sin(sample*.9)*.025);shipPath.getPoint(t,responder.position);
// Hold station throughout contact; all phases are reversible functions of scroll.
responder.rotation.set(0,Math.PI,0);
const hold=smooth(clamp((sample-2.7)/.3))*(1-smooth(clamp((sample-4.55)/.4)));
responder.position.lerp(new THREE.Vector3(7.4,-2.5,-16.85),hold);
const contact=smooth(clamp((sample-3.05)/.45))*(1-smooth(clamp((sample-4.35)/.3)));
const deployment=smooth(clamp((sample-3.65)/.6));
repairWing.rotation.y=mix(1.25,0,deployment);
responder.updateMatrixWorld(true);client.updateMatrixWorld(true);
const hinge=client.localToWorld(new THREE.Vector3(1.1,0,-.2));
const localTarget=responder.worldToLocal(hinge.clone()).sub(shoulder.position);
const l1=1.32,l2=1.38,d=clamp(localTarget.length(),.1,l1+l2-.001);
const bend=Math.acos(clamp((d*d-l1*l1-l2*l2)/(2*l1*l2),-1,1));
const offset=Math.atan2(l2*Math.sin(bend),l1+l2*Math.cos(bend));
const aim=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),localTarget.normalize());
aim.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-offset));
const stowed=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-1.5);
shoulder.quaternion.copy(stowed).slerp(aim,contact);elbow.rotation.y=mix(2.1,bend,contact);
const status=sample<3.5?'ARM APPROACH / HINGE TARGET':sample<3.65?'TOOL ENGAGED / RELEASE LATCH':sample<4.25?'SOLAR ARRAY / DEPLOYING':'SOLAR ARRAY / DEPLOYMENT COMPLETE';
$('#repair-status').textContent=status;
$('#repair-status').classList.toggle('complete',sample>=4.25);
const reveal=smooth(clamp((sample-2.4)/.45))*(1-smooth(clamp((sample-4.5)/.5)));inspection.children.forEach(m=>m.material.opacity=ar?reveal*.8:0);inspection.rotation.z=scanRunning?Math.sin(now*.003)*.3:0;inspection.children.forEach(m=>m.material.color.setHex(deployment>.95?0x8df0bf:0xd3edff));
network.children.forEach(o=>o.children.forEach(m=>{if(m.isLine)m.material.opacity=.12+.40*smooth(clamp((sample-5)/.7));}));predictive.update(now,sample);renderer.render(scene,camera);}
addEventListener('resize',()=>{if(renderer){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}readScroll();});readScroll();requestAnimationFrame(frame);
