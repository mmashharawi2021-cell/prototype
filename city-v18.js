import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
function rng(seed=1){let a=seed>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}const R=rng(18092027);

const host=document.getElementById('city');
const scene=new THREE.Scene();scene.background=new THREE.Color(0xaeb3ae);scene.fog=new THREE.Fog(0xa9afaa,34,360);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.05,1600);
const renderer=new THREE.WebGLRenderer({antialias:innerWidth>900,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.0:1.45));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;host.appendChild(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();window.dispatchEvent(new Event('atlas-city-lost'))},{passive:false});
scene.add(new THREE.HemisphereLight(0xe0e4df,0x4c514d,1.38));const sun=new THREE.DirectionalLight(0xf0eadf,2.05);sun.position.set(7,11,5);scene.add(sun);const fill=new THREE.DirectionalLight(0xaeb7b0,.52);fill.position.set(-8,5,-3);scene.add(fill);

function concreteTexture(seed=1,base=132){const rr=rng(seed),n=256,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');x.fillStyle=`rgb(${base},${base},${base-5})`;x.fillRect(0,0,n,n);const img=x.getImageData(0,0,n,n),d=img.data;for(let i=0;i<d.length;i+=4){const v=(rr()-.5)*38;d[i]=clamp(d[i]+v,0,255);d[i+1]=clamp(d[i+1]+v*.94,0,255);d[i+2]=clamp(d[i+2]+v*.78,0,255)}x.putImageData(img,0,0);x.globalAlpha=.20;x.strokeStyle='#3c403b';for(let i=0;i<38;i++){x.lineWidth=.5+rr()*1.5;let px=rr()*n,py=rr()*n;x.beginPath();x.moveTo(px,py);for(let j=0;j<3+Math.floor(rr()*6);j++){px+=(rr()-.5)*34;py+=(rr()-.5)*34;x.lineTo(px,py)}x.stroke()}x.globalAlpha=.10;x.fillStyle='#efe9df';for(let i=0;i<70;i++){const px=rr()*n,py=rr()*n,s=1+rr()*9;x.fillRect(px,py,s,s*(.25+rr()*.3))}x.globalAlpha=.18;x.fillStyle='#5c625d';for(let i=0;i<25;i++){const px=rr()*n,py=rr()*n,rx=4+rr()*20,ry=2+rr()*10;x.beginPath();x.ellipse(px,py,rx,ry,rr()*Math.PI,0,Math.PI*2);x.fill()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3.2,3.2);t.anisotropy=4;return t}
const texA=concreteTexture(181,145),texB=concreteTexture(182,118),texC=concreteTexture(183,162);
const mats=[
 new THREE.MeshStandardMaterial({map:texA,color:0xb1aea5,roughness:1}),
 new THREE.MeshStandardMaterial({map:texB,color:0x777a74,roughness:1}),
 new THREE.MeshStandardMaterial({map:texC,color:0xc2bfb4,roughness:1}),
 new THREE.MeshStandardMaterial({color:0x303431,roughness:1}),
 new THREE.MeshStandardMaterial({color:0x3d423e,roughness:.92})
];
const roadMat=new THREE.MeshStandardMaterial({color:0x505550,roughness:1}),groundMat=new THREE.MeshStandardMaterial({color:0x646963,roughness:1}),rubbleMat=new THREE.MeshStandardMaterial({map:texB,color:0x7b7c75,roughness:1}),slabMat=new THREE.MeshStandardMaterial({map:texC,color:0xa29e94,roughness:1});

function skyTexture(){const w=1024,h=320,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#98a19e');g.addColorStop(.48,'#b6bcb8');g.addColorStop(1,'#d0d2cb');x.fillStyle=g;x.fillRect(0,0,w,h);for(let i=0;i<88;i++){const px=R()*w,py=R()*h*.78,rx=48+R()*150,ry=18+R()*48,rg=x.createRadialGradient(px,py,0,px,py,rx),s=118+Math.floor(R()*56);rg.addColorStop(0,`rgba(${s},${s+5},${s+3},${.08+R()*.15})`);rg.addColorStop(.6,`rgba(${s+18},${s+19},${s+17},${.03+R()*.07})`);rg.addColorStop(1,'rgba(255,255,255,0)');x.save();x.translate(px,py);x.scale(1,ry/rx);x.translate(-px,-py);x.fillStyle=rg;x.fillRect(px-rx,py-rx,rx*2,rx*2);x.restore()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const sky=new THREE.Mesh(new THREE.PlaneGeometry(1200,360),new THREE.MeshBasicMaterial({map:skyTexture(),depthWrite:false,fog:false}));sky.position.set(0,100,-720);scene.add(sky);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(840,1200),groundMat);ground.rotation.x=-Math.PI/2;ground.position.set(0,-.24,-280);scene.add(ground);

const route=new THREE.CatmullRomCurve3([
 new THREE.Vector3(26,0,78),new THREE.Vector3(18,0,30),new THREE.Vector3(-26,0,-68),new THREE.Vector3(-8,0,-148),new THREE.Vector3(30,0,-244),new THREE.Vector3(10,0,-330),new THREE.Vector3(-24,0,-425),new THREE.Vector3(0,0,-530)
],false,'catmullrom',.45);
function frameAt(q){q=clamp(q);const p=route.getPoint(q),t=route.getTangent(q).normalize(),n=new THREE.Vector3(-t.z,0,t.x).normalize();return{p,t,n}}
const box=new THREE.BoxGeometry(1,1,1),M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),S=new THREE.Vector3();
const roadParts=[];for(let i=0;i<86;i++){const a=route.getPoint(i/86),b=route.getPoint((i+1)/86),m=a.clone().add(b).multiplyScalar(.5),dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);P.set(m.x,.01,m.z);Q.setFromEuler(new THREE.Euler(0,ang,0));S.set(11.8,.055,len+1.3);M.compose(P,Q,S);roadParts.push(M.clone())}const road=new THREE.InstancedMesh(box,roadMat,roadParts.length);roadParts.forEach((m,i)=>road.setMatrixAt(i,m));road.instanceMatrix.needsUpdate=true;scene.add(road);

const buckets=[[],[],[],[],[]];
function push(bucket,base,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){P.set(x,y,z);Q.setFromEuler(new THREE.Euler(rx,ry,rz));S.set(sx,sy,sz);const lm=new THREE.Matrix4().compose(P,Q,S);buckets[bucket].push(base.clone().multiply(lm))}
function buildingAt(q,side,w,d,floors,damage,hero=false){const f=frameAt(q),dist=10.8+w*.52+R()*3.2,c=f.p.clone().addScaledVector(f.n,side*dist);const ang=Math.atan2(f.t.x,f.t.z)+(side<0?Math.PI:0),base=new THREE.Matrix4().makeRotationY(ang);base.setPosition(c.x,0,c.z);const fh=3.75;
 push(3,base,0,floors*fh*.42,0,w*.70,floors*fh*.84,d*.70);
 const baysX=Math.max(3,Math.round(w/4.2)),baysZ=Math.max(2,Math.round(d/4.3));
 for(let fl=0;fl<floors;fl++){
   const y=fl*fh,top=fl/Math.max(1,floors-1),destroy=damage*(.78+.45*top);
   if(R()>destroy*(fl>floors*.55?.34:.12)) push(R()>.72?2:0,base,0,y+.06,0,w,.20,d,0,0,(R()-.5)*.025);
   for(let ix=0;ix<=baysX;ix++) if(R()>destroy*.30) push(R()>.72?0:1,base,-w/2+ix*w/baysX,y+fh*.50,-d/2+.16,.28,fh,.28,0,0,(R()-.5)*.018);
   for(let ix=0;ix<=baysX;ix++) if(R()>destroy*.48) push(R()>.72?0:1,base,-w/2+ix*w/baysX,y+fh*.50,d/2-.16,.28,fh,.28);
   for(let bx=0;bx<baysX;bx++){
     const cx=-w/2+(bx+.5)*w/baysX,bw=w/baysX*.90,keep=R()>destroy*(hero?.43:.51);
     if(keep){
       push(R()>.72?2:0,base,cx,y+.34,-d/2-.06,bw,.58,.18);
       push(R()>.72?2:0,base,cx,y+fh-.23,-d/2-.06,bw,.42,.18);
       push(R()>.72?0:1,base,cx-bw*.46,y+fh*.52,-d/2-.06,.22,fh*.70,.18);
       push(R()>.72?0:1,base,cx+bw*.46,y+fh*.52,-d/2-.06,.22,fh*.70,.18);
       push(3,base,cx,y+fh*.52,-d/2+.12,bw*.76,fh*.54,.08);
     }else if(R()>.48){
       push(1,base,cx+(R()-.5)*bw*.22,y+fh*(.28+R()*.45),-d/2-.05,bw*(.22+R()*.42),fh*(.12+R()*.32),.14,(R()-.5)*.18,0,(R()-.5)*.28);
     }
     if(R()>destroy*.72){push(0,base,cx,y+.34,d/2+.06,bw,.58,.18);push(3,base,cx,y+fh*.52,d/2-.12,bw*.72,fh*.50,.08)}
   }
   for(let bz=0;bz<baysZ;bz++) if(R()>destroy*.54){const cz=-d/2+(bz+.5)*d/baysZ;push(R()>.7?2:0,base,-w/2-.06,y+fh*.52,cz,.18,fh*.68,d/baysZ*.76);}
 }
 for(let i=0;i<(hero?5:2);i++) if(R()<.78){push(R()>.5?0:1,base,(R()-.5)*w*.58,floors*fh*(.62+R()*.38),(R()-.5)*d*.60,w*(.14+R()*.30),.16,d*(.12+R()*.30),(R()-.5)*.34,(R()-.5)*.18,(R()-.5)*.40)}
 for(let i=0;i<(hero?8:4);i++){push(R()>.5?2:0,base,(R()-.5)*w*.75,.35+R()*1.4,(R()-.5)*d*.80,w*(.10+R()*.28),.12,d*(.10+R()*.30),(R()-.5)*.7,(R()-.5)*.5,(R()-.5)*.8)}
}

const heroQs=[.03,.10,.18,.27,.36,.46,.56,.66,.76,.86,.94];for(let i=0;i<heroQs.length;i++){const q=heroQs[i];for(const side of[-1,1]){const w=18+R()*10,d=15+R()*8,f=7+Math.floor(R()*8),damage=.50+R()*.22;buildingAt(q+(R()-.5)*.014,side,w,d,f,damage,true)}}
for(let i=0;i<54;i++){const q=.015+R()*.97,side=R()>.5?1:-1,w=12+R()*14,d=11+R()*12,f=5+Math.floor(R()*8);buildingAt(q,side,w,d,f,.42+R()*.27,false)}
for(let b=0;b<buckets.length;b++){const arr=buckets[b],inst=new THREE.InstancedMesh(box,mats[b],arr.length);arr.forEach((m,i)=>inst.setMatrixAt(i,m));inst.instanceMatrix.needsUpdate=true;inst.frustumCulled=false;scene.add(inst)}

const rubble=new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1,0),rubbleMat,1550);for(let i=0;i<1550;i++){const q=R(),f=frameAt(q),big=R()<.58,side=R()>.5?1:-1,off=big?(8+R()*18):(R()-.5)*8,pos=f.p.clone().addScaledVector(f.n,big?side*off:off),rr=big?.35+R()*1.8:.12+R()*.58;P.set(pos.x,.10+R()*.68,pos.z);Q.setFromEuler(new THREE.Euler(R()*Math.PI,R()*Math.PI,R()*Math.PI));S.set(rr*(.45+R()*1.3),rr*(.22+R()*.6),rr*(.5+R()*1.6));M.compose(P,Q,S);rubble.setMatrixAt(i,M)}rubble.instanceMatrix.needsUpdate=true;scene.add(rubble);
const slabs=new THREE.InstancedMesh(box,slabMat,720);for(let i=0;i<720;i++){const q=R(),f=frameAt(q),side=R()>.5?1:-1,pos=f.p.clone().addScaledVector(f.n,side*(9+R()*22)),ss=.7+R()*3.5;P.set(pos.x,.15+R()*.9,pos.z);Q.setFromEuler(new THREE.Euler((R()-.5)*.65,R()*Math.PI,(R()-.5)*.8));S.set(ss*(.8+R()*1.5),.10+R()*.24,ss*(.5+R()*1.3));M.compose(P,Q,S);slabs.setMatrixAt(i,M)}slabs.instanceMatrix.needsUpdate=true;scene.add(slabs);
const rebars=new THREE.InstancedMesh(box,mats[4],420);for(let i=0;i<420;i++){const q=R(),f=frameAt(q),side=R()>.5?1:-1,pos=f.p.clone().addScaledVector(f.n,side*(7+R()*22)),len=1.2+R()*4.8;P.set(pos.x,.18+R()*1.1,pos.z);Q.setFromEuler(new THREE.Euler((R()-.5)*.8,R()*Math.PI,(R()-.5)*.8));S.set(.04+R()*.045,.04+R()*.045,len);M.compose(P,Q,S);rebars.setMatrixAt(i,M)}rebars.instanceMatrix.needsUpdate=true;scene.add(rebars);

function smokeTexture(){const n=128,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');for(let i=0;i<8;i++){const px=n*(.32+R()*.36),py=n*(.32+R()*.34),r=n*(.16+R()*.26),g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(88,95,91,.24)');g.addColorStop(.56,'rgba(78,86,82,.11)');g.addColorStop(1,'rgba(68,76,72,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill()}return new THREE.CanvasTexture(c)}const smokeTex=smokeTexture();for(const q of[.16,.31,.47,.63,.79,.91]){const f=frameAt(q),side=R()>.5?1:-1;for(let j=0;j<4;j++){const p=f.p.clone().addScaledVector(f.n,side*(17+R()*15)),s=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,color:0x9aa09b,transparent:true,opacity:.16,depthWrite:false}));s.position.set(p.x+(R()-.5)*5,8+j*7+R()*4,p.z+(R()-.5)*5);const ss=17+j*7+R()*9;s.scale.set(ss,ss*.9,1);scene.add(s)}}

let last=performance.now(),camPos=new THREE.Vector3(),look=new THREE.Vector3(),ready=false,camInit=false;
function draw(now){requestAnimationFrame(draw);const dt=Math.min((now-last)/1000,.05);last=now;const max=document.documentElement.scrollHeight-innerHeight,pct=max>0?scrollY/max:0,t=pct*10.005;
 const cp=clamp((t-4.82)/(10.005-4.82)),q=ease(cp*(.88+.12*cp)),f=frameAt(q),ahead=frameAt(Math.min(1,q+.055));const desired=f.p.clone();desired.y=lerp(33,14,cp);desired.addScaledVector(f.n,Math.sin(cp*Math.PI*4)*.22);const target=ahead.p.clone();target.y=lerp(11,7,cp);
 if(!camInit){camPos.copy(desired);look.copy(target);camInit=true}else{camPos.lerp(desired,1-Math.exp(-18*dt));look.lerp(target,1-Math.exp(-16*dt))}camera.position.copy(camPos);camera.lookAt(look);camera.fov=lerp(58.5,65.5,ease(cp));camera.updateProjectionMatrix();scene.fog.near=lerp(34,19,cp);scene.fog.far=lerp(360,235,cp);scene.fog.color.set(0xa9afaa).lerp(new THREE.Color(0x9ba39e),cp*.30);renderer.toneMappingExposure=lerp(.99,.93,cp);sky.position.x=camera.position.x*.15;renderer.render(scene,camera);if(!ready){ready=true;window.dispatchEvent(new Event('atlas-city-ready'))}}
requestAnimationFrame(draw);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.0:1.45))});