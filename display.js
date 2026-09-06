const cfg=window.PRAYER_WALL_CONFIG;
const stage=document.getElementById('nameStage');
const palette=['gold','cream','white','sand'];
const MAX_VISIBLE=135;
const active=new Map();

function makeQR(){
  const box=document.getElementById('qrcode');box.innerHTML='';
  if(window.QRCode){
    new QRCode(box,{text:cfg.SUBMISSION_URL,width:360,height:360,colorDark:'#071f20',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
  } else box.textContent='QR';
}

function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seeded(id,min,max,offset=0){const h=hash(id+':'+offset);return min+(h%10000)/10000*(max-min)}
function escapeText(t){return String(t).replace(/[<>]/g,'')}

function addName(item,animate=true){
  const id=item.id||`${item.name}-${item.createdAt||Date.now()}`;
  if(active.has(id))return;
  const el=document.createElement('div');
  el.className=`floating-name ${palette[Math.floor(seeded(id,0,palette.length,1))%palette.length]}`;
  el.textContent=escapeText(item.name);
  const x=seeded(id,2,83,2), y=seeded(id,3,91,3);
  const size=seeded(id,1.35,3.05,4);
  const alpha=seeded(id,.62,.96,5);
  const dx=seeded(id,-42,42,6), dy=seeded(id,-20,24,7);
  const dur=seeded(id,11,23,8), delay=seeded(id,-12,0,9);
  el.style.left=`${x}%`;el.style.top=`${y}%`;el.style.fontSize=`${size}vw`;
  el.style.setProperty('--alpha',alpha);el.style.setProperty('--dx',`${dx}px`);el.style.setProperty('--dy',`${dy}px`);el.style.setProperty('--drift-duration',`${dur}s`);el.style.setProperty('--drift-delay',`${delay}s`);
  if(!animate) el.style.animationDelay='-0.7s,'+delay+'s';
  stage.appendChild(el);active.set(id,el);
  while(active.size>MAX_VISIBLE){
    const [oldId,oldEl]=active.entries().next().value;
    oldEl.style.transition='opacity .8s';oldEl.style.opacity='0';
    setTimeout(()=>oldEl.remove(),850);active.delete(oldId);
  }
}

function removeName(id){
  const el=active.get(id);
  if(!el)return;
  el.style.transition='opacity .45s, transform .45s';
  el.style.opacity='0';
  el.style.transform='scale(.85)';
  setTimeout(()=>el.remove(),500);
  active.delete(id);
}

function loadDemo(){
  let arr=[];try{arr=JSON.parse(localStorage.getItem(`srpw:${cfg.EVENT_ID}:demoNames`)||'[]')}catch{}
  arr.slice(-MAX_VISIBLE).forEach(x=>addName(x,false));
  const bc=new BroadcastChannel('solid-rock-prayer-wall');bc.onmessage=e=>{if(e.data?.type==='new-name')addName(e.data.item,true)};
  if(!arr.length){['Grace','Daniel','Esther','Joshua','Miriam','Samuel','Faith','Emmanuel','Rebecca','David','Sarah','Nathan'].forEach((name,i)=>addName({id:'seed'+i,name,createdAt:i},false));}
}

async function loadFirebase(){
  const appMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const dbMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');
  const app=appMod.initializeApp(cfg.FIREBASE,'display');
  const db=dbMod.getDatabase(app);
  const submissionsRef=dbMod.ref(db,`events/${cfg.EVENT_ID}/submissions`);
  let firstSnapshot=true;

  dbMod.onValue(submissionsRef,snap=>{
    const incoming=new Map();
    if(snap.exists()){
      snap.forEach(userSnap=>{
        userSnap.forEach(nameSnap=>{
          const v=nameSnap.val();
          if(v?.name){
            const id=`${userSnap.key}:${nameSnap.key}`;
            incoming.set(id,{id,name:v.name,createdAt:v.createdAt});
          }
        });
      });
    }

    // Remove names deleted by an admin.
    for(const id of Array.from(active.keys())){
      if(!incoming.has(id)) removeName(id);
    }

    // Add names not already on screen. Initial load is calm; subsequent ones animate in.
    for(const item of incoming.values()){
      if(!active.has(item.id)) addName(item,!firstSnapshot);
    }
    firstSnapshot=false;
  });
}

makeQR();
if(cfg.DEMO_MODE)loadDemo();else loadFirebase().catch(console.error);
