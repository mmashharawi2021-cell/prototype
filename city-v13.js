import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);

function rng(seed=1){
  let a=seed>>>0;
  return ()=>{
    a|=0; a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
const R=rng(13092026);

const host=document.getElementById('city');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xaeb4af);
scene.fog=new THREE.Fog(0xa9b0ab,20,285);

const camera=new THREE.PerspectiveCamera(59,innerWidth/innerHeight,.05,1400);
const renderer=new THREE.WebGLRenderer({
  antialias: innerWidth>900,
  powerPreference:'high-performance'
});
renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth<768?1.0:1.45));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.93;
host.appendChild(renderer.domElement);

renderer.domElement.addEventListener('webglcontextlost',e=>{
  e.preventDefault();
  window.dispatchEvent(new Event('atlas-city-lost'));
},{passive:false});

const hemi=new THREE.HemisphereLight(0xd4d9d4,0x4d524e,1.28);
scene.add(hemi);
const sun=new THREE.DirectionalLight(0xeee9dd,1.75);
sun.position.set(7,10,4);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8b0aa,.42);
fill.position.set(-8,4,-3);
scene.add(fill);

function skyTexture(){
  const w=1024,h=320,c=document.createElement('canvas');
  c.width=w;c.height=h;
  const x=c.getContext('2d');
  const bg=x.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,'#8e9996');
  bg.addColorStop(.46,'#aeb6b2');
  bg.addColorStop(1,'#c9ccc5');
  x.fillStyle=bg;x.fillRect(0,0,w,h);
  for(let i=0;i<95;i++){
    const px=R()*w,py=R()*h*.75,rx=55+R()*145,ry=20+R()*52;
    const g=x.createRadialGradient(px,py,0,px,py,rx);
    const shade=112+Math.floor(R()*56);
    g.addColorStop(0,`rgba(${shade},${shade+7},${shade+4},${.10+R()*.18})`);
    g.addColorStop(.58,`rgba(${shade+18},${shade+21},${shade+19},${.035+R()*.09})`);
    g.addColorStop(1,'rgba(255,255,255,0)');
    x.save();x.translate(px,py);x.scale(1,ry/rx);x.translate(-px,-py);
    x.fillStyle=g;x.fillRect(px-rx,py-rx,rx*2,rx*2);x.restore();
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
const skyMat=new THREE.MeshBasicMaterial({map:skyTexture(),depthWrite:false,fog:false});
const sky=new THREE.Mesh(new THREE.PlaneGeometry(980,320),skyMat);
sky.position.set(0,92,-620);
scene.add(sky);

const concrete=new THREE.MeshStandardMaterial({color:0x747873,roughness:1});
const concreteDark=new THREE.MeshStandardMaterial({color:0x505652,roughness:1});
const concreteLight=new THREE.MeshStandardMaterial({color:0x90938c,roughness:1});
const facade=new THREE.MeshStandardMaterial({color:0x676c67,roughness:1});
const voidMat=new THREE.MeshStandardMaterial({color:0x353a37,roughness:1});
const roadMat=new THREE.MeshStandardMaterial({color:0x4b504c,roughness:1});
const groundMat=new THREE.MeshStandardMaterial({color:0x5d625d,roughness:1});
const rubbleMat=new THREE.MeshStandardMaterial({color:0x686c66,roughness:1});
const slabMat=new THREE.MeshStandardMaterial({color:0x85877f,roughness:1});
const rebarMat=new THREE.MeshStandardMaterial({color:0x343835,roughness:.95});

const box=new THREE.BoxGeometry(1,1,1);
const buckets=[[],[],[],[],[]];
const M=new THREE.Matrix4(), P=new THREE.Vector3(), Q=new THREE.Quaternion(), S=new THREE.Vector3();

function addLocal(base,bucket,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
  P.set(x,y,z);
  Q.setFromEuler(new THREE.Euler(rx,ry,rz));
  S.set(sx,sy,sz);
  const lm=new THREE.Matrix4().compose(P,Q,S);
  buckets[bucket].push(base.clone().multiply(lm));
}

const ground=new THREE.Mesh(new THREE.PlaneGeometry(680,980),groundMat);
ground.rotation.x=-Math.PI/2;
ground.position.set(0,-.18,-240);
scene.add(ground);

for(const [x,z,len,w] of [
  [0,-220,920,9],[-42,-210,850,6.5],[43,-230,870,6],
  [-6,-112,135,5.5],[14,-282,170,5.2]
]){
  const r=new THREE.Mesh(box,roadMat);
  r.position.set(x,.01,z);
  r.scale.set(w,.045,len);
  r.rotation.y=(R()-.5)*.012;
  scene.add(r);
}

function ruinedMass(x,z,w,d,floors,damage=.6,rot=0,hero=false){
  const fh=4.05;
  const base=new THREE.Matrix4().makeRotationY(rot);
  base.setPosition(x,0,z);
  const topStart=Math.floor(floors*(.52+R()*.18));

  const coreW=w*(.42+R()*.16), coreD=d*(.48+R()*.18);
  const coreH=floors*fh*(.60+R()*.28);
  addLocal(base,R()>.5?0:3,(R()-.5)*w*.08,coreH/2,(R()-.5)*d*.08,coreW,coreH,coreD);

  for(let f=0;f<floors;f++){
    const y=f*fh;
    const top=f/Math.max(1,floors-1);
    const levelDamage=damage*(.70+.52*top);
    const floorMissing=R()<levelDamage*(f>=topStart?.35:.12);

    if(!floorMissing){
      if(R()<levelDamage*.55){
        const side=R()>.5?1:-1;
        addLocal(base,2,side*w*.10,y+.02,(R()-.5)*d*.08,w*(.58+R()*.25),.22,d*(.72+R()*.23),0,0,(R()-.5)*.045);
      }else{
        addLocal(base,2,0,y+.02,0,w,.22,d);
      }
    } else if(R()>.42){
      addLocal(base,0,(R()-.5)*w*.36,y+.02,(R()-.5)*d*.30,w*(.20+R()*.30),.18,d*(.20+R()*.34),0,(R()-.5)*.1,(R()-.5)*.22);
    }

    const bays=Math.max(3,Math.round(w/5.2));
    for(let b=0;b<bays;b++){
      const bx=-w/2+(b+.5)*w/bays;
      const keep=R()>levelDamage*(hero?.38:.48);
      if(keep){
        const panelW=(w/bays)*(.78+R()*.16);
        const panelH=fh*(.68+R()*.18);
        const bucket=R()>.72?0:3;
        addLocal(base,bucket,bx,y+fh*.52,-d/2-.06,panelW,panelH,.18,0,(R()-.5)*.018,(R()-.5)*.025);
        if(R()>.52) addLocal(base,bucket,bx,y+fh*.52,d/2+.06,panelW,panelH,.18,0,(R()-.5)*.018,(R()-.5)*.025);
      }else if(R()>.44){
        addLocal(base,4,bx,y+fh*.52,-d/2+.30,(w/bays)*.64,fh*.50,.12);
      }
    }

    if(R()>levelDamage*.42){
      addLocal(base,3,-w/2-.06,y+fh*.52,(R()-.5)*d*.14,.18,fh*(.68+R()*.16),d*(.58+R()*.28));
    }
    if(R()>levelDamage*.52){
      addLocal(base,0,w/2+.06,y+fh*.52,(R()-.5)*d*.16,.18,fh*(.62+R()*.18),d*(.48+R()*.35));
    }

    if(R()<levelDamage*.88){
      const cols=Math.max(2,Math.round(w/6));
      for(let c=0;c<=cols;c++){
        if(R()<.42) continue;
        addLocal(base,1,-w/2+c*w/cols,y+fh*.5,-d/2,.30,fh,.30);
      }
    }
  }

  const hanging=hero?4+Math.floor(R()*4):1+Math.floor(R()*3);
  for(let i=0;i<hanging;i++){
    addLocal(base,R()>.62?0:1,(R()-.5)*w*.42,(floors*(.48+R()*.47))*fh,(R()-.5)*d*.42,
      w*(.18+R()*.34),.16,d*(.16+R()*.38),
      (R()-.5)*.22,(R()-.5)*.12,(R()-.5)*.28);
  }

  if(R()<damage*.9){
    addLocal(base,2,(R()-.5)*w*.55,1.2+R()*1.8,(R()-.5)*d*.65,w*(.34+R()*.35),.16,d*(.24+R()*.34),
      (R()-.5)*.8,(R()-.5)*.4,(R()-.5)*.6);
  }
}

const hero=[
 [-50,30,28,22,8,.55,.018,true],
 [34,5,25,20,9,.52,-.028,true],
 [-18,-28,32,24,8,.68,.035,true],
 [49,-57,25,19,10,.60,-.025,true],
 [-45,-88,28,21,12,.56,.022,true],
 [30,-118,24,19,10,.62,-.036,true],
 [-31,-151,29,22,11,.64,.028,true],
 [-15,-180,27,21,13,.58,.018,true],
 [24,-216,25,20,14,.57,-.020,true],
 [-23,-252,28,21,13,.61,.020,true],
 [38,-286,24,19,11,.68,-.024,true],
 [-20,-328,30,23,12,.61,.018,true],
 [35,-372,23,19,11,.66,-.018,true],
 [-31,-420,28,22,11,.65,.020,true]
];
hero.forEach(v=>ruinedMass(...v));

for(let row=0;row<9;row++){
  const z=62-row*58;
  for(let i=0;i<11;i++){
    const x=-190+i*38+(R()-.5)*15;
    if(Math.abs(x)<25 && R()<.60) continue;
    ruinedMass(x,z+(R()-.5)*22,14+R()*18,12+R()*15,5+Math.floor(R()*8),.40+R()*.28,(R()-.5)*.07,false);
  }
}
for(let i=0;i<28;i++){
  const x=(R()-.5)*400,z=-25-R()*455;
  if(Math.abs(x)<34 && R()<.62) continue;
  ruinedMass(x,z,12+R()*16,11+R()*14,5+Math.floor(R()*9),.42+R()*.28,(R()-.5)*.09,false);
}

for(let b=0;b<5;b++){
  const arr=buckets[b];
  const inst=new THREE.InstancedMesh(box,[concrete,concreteDark,concreteLight,facade,voidMat][b],arr.length);
  arr.forEach((m,i)=>inst.setMatrixAt(i,m));
  inst.instanceMatrix.needsUpdate=true;
  inst.frustumCulled=false;
  scene.add(inst);
}

const slabCount=860;
const slabs=new THREE.InstancedMesh(box,slabMat,slabCount);
for(let i=0;i<slabCount;i++){
  const z=60-R()*520;
  let x=(R()-.5)*230;
  if(R()<.42) x=(R()>.5?1:-1)*(10+R()*62);
  const ss=.9+R()*4.5;
  P.set(x,.16+R()*1.0,z);
  Q.setFromEuler(new THREE.Euler((R()-.5)*.65,R()*Math.PI,(R()-.5)*.78));
  S.set(ss*(.8+R()*1.7),.11+R()*.30,ss*(.48+R()*1.5));
  M.compose(P,Q,S);slabs.setMatrixAt(i,M);
}
slabs.instanceMatrix.needsUpdate=true;scene.add(slabs);

const rubbleCount=1350;
const rubble=new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1,0),rubbleMat,rubbleCount);
for(let i=0;i<rubbleCount;i++){
  const z=60-R()*520;
  const x=(R()-.5)*235;
  const rr=.20+R()*1.55;
  P.set(x,.10+R()*.62,z);
  Q.setFromEuler(new THREE.Euler(R()*Math.PI,R()*Math.PI,R()*Math.PI));
  S.set(rr*(.4+R()*1.4),rr*(.20+R()*.62),rr*(.5+R()*1.8));
  M.compose(P,Q,S);rubble.setMatrixAt(i,M);
}
rubble.instanceMatrix.needsUpdate=true;scene.add(rubble);

const rebarCount=460;
const rebars=new THREE.InstancedMesh(box,rebarMat,rebarCount);
for(let i=0;i<rebarCount;i++){
  const z=45-R()*500,x=(R()-.5)*215,len=1.8+R()*5.8;
  P.set(x,.22+R()*1.4,z);
  Q.setFromEuler(new THREE.Euler((R()-.5)*.7,R()*Math.PI,(R()-.5)*.7));
  S.set(.045+R()*.055,.045+R()*.055,len);
  M.compose(P,Q,S);rebars.setMatrixAt(i,M);
}
rebars.instanceMatrix.needsUpdate=true;scene.add(rebars);

function smokeTexture(){
  const n=128,c=document.createElement('canvas');c.width=c.height=n;
  const x=c.getContext('2d');
  for(let i=0;i<7;i++){
    const px=n*(.34+R()*.32),py=n*(.34+R()*.30),r=n*(.18+R()*.27);
    const g=x.createRadialGradient(px,py,0,px,py,r);
    g.addColorStop(0,'rgba(90,98,93,.26)');
    g.addColorStop(.55,'rgba(78,87,82,.12)');
    g.addColorStop(1,'rgba(70,78,74,0)');
    x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();
  }
  return new THREE.CanvasTexture(c);
}
const smokeTex=smokeTexture();
for(const [cx,cz] of [[-62,-45],[40,-92],[-38,-142],[50,-198],[-58,-258],[24,-316],[-42,-382],[52,-438]]){
  for(let j=0;j<4;j++){
    const sm=new THREE.Sprite(new THREE.SpriteMaterial({
      map:smokeTex,color:0x969d97,transparent:true,opacity:.18,depthWrite:false
    }));
    sm.position.set(cx+(R()-.5)*8,8+j*7+R()*4,cz+(R()-.5)*8);
    const ss=18+j*8+R()*10;
    sm.scale.set(ss,ss*.90,1);
    scene.add(sm);
  }
}

const keys=[
 [4.82,0,34,58,0,12,-18,59],
 [5.20,2,31,30,0,11,-44,59.5],
 [5.60,-1,28,-4,1,10,-80,60],
 [6.00,-4,25,-42,0,10,-114,60.5],
 [6.50,5,23,-88,2,9,-160,61.5],
 [7.00,-5,22,-132,0,9,-204,62.5],
 [7.50,8,21,-171,-3,9,-243,64],
 [8.00,10,20,-207,-5,8,-278,66],
 [8.50,-7,19,-244,2,8,-316,66.5],
 [9.00,7,18,-286,-2,7,-358,67],
 [9.50,-8,17,-330,0,7,-403,67],
 [10.005,0,16,-382,0,7,-456,67.5]
];
function sample(t){
  let a=keys[0],b=keys.at(-1);
  for(let i=1;i<keys.length;i++) if(t<=keys[i][0]){a=keys[i-1];b=keys[i];break}
  let u=clamp((t-a[0])/(b[0]-a[0]));u=ease(u);
  return {
    pos:new THREE.Vector3(lerp(a[1],b[1],u),lerp(a[2],b[2],u),lerp(a[3],b[3],u)),
    look:new THREE.Vector3(lerp(a[4],b[4],u),lerp(a[5],b[5],u),lerp(a[6],b[6],u)),
    fov:lerp(a[7],b[7],u)
  };
}

let look=new THREE.Vector3(),last=performance.now(),readySent=false;
function draw(now){
  requestAnimationFrame(draw);
  const dt=Math.min((now-last)/1000,.05);last=now;
  const max=document.documentElement.scrollHeight-innerHeight;
  const pct=max>0?scrollY/max:0;
  const t=pct*10.005;
  if(t<4.58 && !readySent){
    const k=sample(4.82);
    camera.position.copy(k.pos);camera.lookAt(k.look);
    renderer.render(scene,camera);
    readySent=true;
    window.dispatchEvent(new Event('atlas-city-ready'));
    return;
  }
  const k=sample(Math.max(4.82,t));
  camera.position.copy(k.pos);
  look.lerp(k.look,1-Math.exp(-13*dt));
  camera.lookAt(look);
  camera.fov=k.fov;camera.updateProjectionMatrix();

  const cp=clamp((t-4.82)/(10.005-4.82));
  scene.fog.near=lerp(24,18,cp);
  scene.fog.far=lerp(280,205,cp);
  scene.fog.color.set(0xa9b0ab).lerp(new THREE.Color(0x9ba39e),cp*.35);
  renderer.toneMappingExposure=lerp(.95,.90,cp);

  renderer.render(scene,camera);
  if(!readySent){
    readySent=true;
    window.dispatchEvent(new Event('atlas-city-ready'));
  }
}
requestAnimationFrame(draw);

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.0:1.45));
});