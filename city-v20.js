async function loadGazaRealism(){
  const r=await fetch('./city-v19.js?v=20',{cache:'no-store'});
  let src=await r.text();

  const replaceBetween=(startMarker,endMarker,replacement)=>{
    const a=src.indexOf(startMarker),b=src.indexOf(endMarker,a);
    if(a<0||b<0) throw new Error('V20 patch marker missing: '+startMarker);
    src=src.slice(0,a)+replacement+src.slice(b);
  };

  const buildingFn=`function buildingAt(q,side,w,d,floors,damage,hero=false){
 const f=frameAt(q),dist=9.8+w*.50+R()*2.5,c=f.p.clone().addScaledVector(f.n,side*dist),ang=Math.atan2(f.t.x,f.t.z)+(side<0?Math.PI:0),base=new THREE.Matrix4().makeRotationY(ang);base.setPosition(c.x,0,c.z);
 const fh=3.55,mode=Math.floor(R()*5),cutSide=R()>.5?1:-1,cutLevel=Math.max(1,Math.floor(floors*(.38+R()*.30)));
 push(3,base,0,floors*fh*.34,0,w*.30,floors*fh*.58,d*.32);
 const baysX=Math.max(3,Math.round(w/3.9)),baysZ=Math.max(2,Math.round(d/4.0));
 for(let fl=0;fl<floors;fl++){
   const y=fl*fh,top=fl/Math.max(1,floors-1),destroy=damage*(.76+.56*top);
   const upperGone=(mode===2&&fl>=cutLevel),lowBlast=(mode===4&&fl<Math.max(2,cutLevel-1));
   if(!upperGone&&!lowBlast&&R()>destroy*(fl>floors*.55?.26:.08)) push(R()>.70?2:0,base,0,y+.06,0,w,.18,d,0,0,(R()-.5)*.035);
   for(let ix=0;ix<=baysX;ix++){
     const nx=ix/baysX*2-1,halfGone=(mode===0&&nx*cutSide>.10&&fl>=cutLevel-1),cornerGone=(mode===1&&nx*cutSide>.42&&fl>=Math.floor(cutLevel*.7));
     if(!upperGone&&!halfGone&&!cornerGone&&R()>destroy*.17) push(R()>.73?0:1,base,-w/2+ix*w/baysX,y+fh*.50,-d/2+.13,.24,fh,.24,0,0,(R()-.5)*.025);
     if(!upperGone&&!halfGone&&R()>destroy*.32) push(R()>.76?0:1,base,-w/2+ix*w/baysX,y+fh*.50,d/2-.13,.24,fh,.24);
   }
   for(let bx=0;bx<baysX;bx++){
     const nx=(bx+.5)/baysX*2-1,cx=-w/2+(bx+.5)*w/baysX,bw=w/baysX*.92;
     const halfGone=(mode===0&&nx*cutSide>.02&&fl>=cutLevel-1),cornerGone=(mode===1&&nx*cutSide>.36&&fl>=Math.max(1,cutLevel-1)),frontGone=(mode===3&&fl>=Math.floor(cutLevel*.75));
     const keep=!upperGone&&!halfGone&&!cornerGone&&!frontGone&&R()>destroy*(hero?.31:.38);
     if(keep){
       push(R()>.74?2:0,base,cx,y+.30,-d/2-.05,bw,.46,.16);
       push(R()>.74?2:0,base,cx,y+fh-.22,-d/2-.05,bw,.34,.16);
       if(R()>.18)push(R()>.72?0:1,base,cx-bw*.46,y+fh*.51,-d/2-.05,.20,fh*.68,.16);
       if(R()>.18)push(R()>.72?0:1,base,cx+bw*.46,y+fh*.51,-d/2-.05,.20,fh*.68,.16);
       if(R()>.35)push(3,base,cx,y+fh*.52,-d/2+.10,bw*.62,fh*.43,.055);
     }else if(!upperGone&&R()>.22){
       pushJag(base,cx+(R()-.5)*bw*.34,y+fh*(.25+R()*.52),-d/2-.16,bw*(.18+R()*.38),fh*(.10+R()*.31),.20,(R()-.5)*.7,(R()-.5)*.26,(R()-.5)*.8);
       if(R()>.45)push(1,base,cx+(R()-.5)*bw*.25,y+fh*(.22+R()*.48),-d/2-.03,bw*(.18+R()*.34),fh*(.10+R()*.28),.12,(R()-.5)*.30,0,(R()-.5)*.38);
     }
     if(!upperGone&&!halfGone&&R()>destroy*.55){push(0,base,cx,y+.30,d/2+.05,bw,.46,.16);if(R()>.35)push(3,base,cx,y+fh*.52,d/2-.10,bw*.58,fh*.40,.055)}
   }
   for(let bz=0;bz<baysZ;bz++){
     const cz=-d/2+(bz+.5)*d/baysZ,sideGone=(mode===1&&bz>=(cutSide>0?Math.floor(baysZ*.55):0)&&bz<=(cutSide<0?Math.ceil(baysZ*.45):baysZ));
     if(!upperGone&&!sideGone&&R()>destroy*.34) push(R()>.68?2:0,base,-w/2-.05,y+fh*.50,cz,.16,fh*.66,d/baysZ*.74);
   }
   if((upperGone||mode===0||mode===1)&&fl>=cutLevel-1){
     for(let j=0;j<(hero?3:1);j++) if(R()>.28) pushJag(base,(R()-.5)*w*.82,y+fh*(.18+R()*.62),(R()-.5)*d*.70,w*(.08+R()*.22),fh*(.08+R()*.20),d*(.08+R()*.22),(R()-.5)*1.0,(R()-.5)*.7,(R()-.5)*1.0);
   }
 }
 for(let i=0;i<(hero?10:5);i++){
   const edge=R()>.5?1:-1;
   push(R()>.55?2:0,base,edge*w*(.25+R()*.20)+(R()-.5)*2,.20+R()*1.5,(R()-.5)*d*.86,w*(.08+R()*.28),.10+R()*.10,d*(.08+R()*.30),(R()-.5)*.9,(R()-.5)*.7,(R()-.5)*1.0);
 }
}`;

  replaceBetween('function buildingAt(', '\n\nconst heroQs=', buildingFn+'\n\n');

  const stock=`const heroQs=[.025,.08,.15,.22,.30,.39,.49,.59,.69,.79,.89,.97];for(let i=0;i<heroQs.length;i++){const q=heroQs[i];for(const side of[-1,1]){const w=14+R()*10,d=12+R()*8,f=5+Math.floor(R()*6),damage=.60+R()*.24;buildingAt(q+(R()-.5)*.014,side,w,d,f,damage,true)}}
for(let i=0;i<52;i++){const q=.012+R()*.976,side=R()>.5?1:-1,w=10+R()*12,d=10+R()*10,f=4+Math.floor(R()*6);buildingAt(q,side,w,d,f,.52+R()*.27,false)}
`;
  replaceBetween('const heroQs=', 'for(let b=0;b<buckets.length;b++)', stock);

  const rubble=`const rubble=new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1,0),rubbleMat,2200);for(let i=0;i<2200;i++){const q=R(),f=frameAt(q),side=R()>.5?1:-1,edge=R()<.72,off=edge?side*(6.5+R()*22):(R()-.5)*8.5,pos=f.p.clone().addScaledVector(f.n,off),rr=edge?.28+R()*2.15:.10+R()*.58;P.set(pos.x,.08+R()*.95,pos.z);Q.setFromEuler(new THREE.Euler(R()*Math.PI,R()*Math.PI,R()*Math.PI));S.set(rr*(.42+R()*1.55),rr*(.16+R()*.68),rr*(.48+R()*1.75));M.compose(P,Q,S);rubble.setMatrixAt(i,M)}rubble.instanceMatrix.needsUpdate=true;scene.add(rubble);
`;
  replaceBetween('const rubble=', 'const slabs=', rubble);

  const slabs=`const slabs=new THREE.InstancedMesh(box,slabMat,940);for(let i=0;i<940;i++){const q=R(),f=frameAt(q),side=R()>.5?1:-1,near=R()<.58,pos=f.p.clone().addScaledVector(f.n,side*(near?7+R()*14:11+R()*25)),ss=.65+R()*4.7;P.set(pos.x,.10+R()*1.15,pos.z);Q.setFromEuler(new THREE.Euler((R()-.5)*.95,R()*Math.PI,(R()-.5)*1.05));S.set(ss*(.75+R()*1.8),.09+R()*.27,ss*(.42+R()*1.55));M.compose(P,Q,S);slabs.setMatrixAt(i,M)}slabs.instanceMatrix.needsUpdate=true;scene.add(slabs);
`;
  replaceBetween('const slabs=', 'const rebars=', slabs);

  const rebars=`const rebars=new THREE.InstancedMesh(box,mats[4],520);for(let i=0;i<520;i++){const q=R(),f=frameAt(q),side=R()>.5?1:-1,pos=f.p.clone().addScaledVector(f.n,side*(6+R()*22)),len=1.0+R()*5.5;P.set(pos.x,.16+R()*1.35,pos.z);Q.setFromEuler(new THREE.Euler((R()-.5)*1.0,R()*Math.PI,(R()-.5)*1.0));S.set(.035+R()*.045,.035+R()*.045,len);M.compose(P,Q,S);rebars.setMatrixAt(i,M)}rebars.instanceMatrix.needsUpdate=true;scene.add(rebars);
const wallPlates=new THREE.InstancedMesh(box,slabMat,260);for(let i=0;i<260;i++){const q=R(),f=frameAt(q),side=R()>.5?1:-1,pos=f.p.clone().addScaledVector(f.n,side*(8+R()*19));P.set(pos.x,.45+R()*4.8,pos.z);Q.setFromEuler(new THREE.Euler((R()-.5)*.25,Math.atan2(f.t.x,f.t.z)+(side<0?Math.PI:0)+(R()-.5)*.55,(R()-.5)*.75));S.set(2+R()*6.8,.16+R()*.40,.45+R()*1.3);M.compose(P,Q,S);wallPlates.setMatrixAt(i,M)}wallPlates.instanceMatrix.needsUpdate=true;scene.add(wallPlates);
const berms=new THREE.InstancedMesh(box,rubbleMat,150);for(let i=0;i<150;i++){const q=R(),f=frameAt(q),side=R()>.5?1:-1,pos=f.p.clone().addScaledVector(f.n,side*(6.0+R()*4.0));P.set(pos.x,.18+R()*.34,pos.z);Q.setFromEuler(new THREE.Euler(0,Math.atan2(f.t.x,f.t.z)+(R()-.5)*.5,0));S.set(2.2+R()*8.0,.18+R()*.48,1.5+R()*5.0);M.compose(P,Q,S);berms.setMatrixAt(i,M)}berms.instanceMatrix.needsUpdate=true;scene.add(berms);
`;
  replaceBetween('const rebars=', 'function smokeTexture', rebars+'\n');

  const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));
  try{await import(url)}finally{URL.revokeObjectURL(url)}
}
loadGazaRealism().catch(err=>{console.error('V20 Gaza realism failed',err);window.dispatchEvent(new Event('atlas-city-lost'))});
