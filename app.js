const cfg = window.PRAYER_WALL_CONFIG;
const form = document.getElementById('inviteForm');
const input = document.getElementById('inviteeName');
const btn = document.getElementById('submitButton');
const msg = document.getElementById('formMessage');
const counter = document.getElementById('counterText');
const bars = [document.getElementById('p1'),document.getElementById('p2'),document.getElementById('p3')];

function sessionKey(){ return `srpw:${cfg.EVENT_ID}:demoNames`; }
function deviceKey(){ return `srpw:${cfg.EVENT_ID}:deviceId`; }
function getDeviceId(){ let id=localStorage.getItem(deviceKey()); if(!id){id=crypto.randomUUID();localStorage.setItem(deviceKey(),id)} return id; }
function demoNames(){ try{return JSON.parse(localStorage.getItem(sessionKey())||'[]')}catch{return[]} }
function showMessage(text,type='ok'){ msg.textContent=text;msg.className=`message show ${type}`; }
function updateUI(count){
  bars.forEach((b,i)=>b.classList.toggle('on',i<count));
  if(count>=cfg.MAX_SUBMISSIONS){counter.textContent='3 of 3 submitted';input.disabled=true;btn.disabled=true;btn.textContent='Thank You';showMessage('Thank you! Your three names have been added. We’re praying and believing with you.','ok');}
  else{counter.textContent=`Person ${count+1} of ${cfg.MAX_SUBMISSIONS}`;}
}

let count=0;
let firebaseApi=null;

async function initFirebase(){
  const appMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const authMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
  const dbMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');
  const app=appMod.initializeApp(cfg.FIREBASE);
  const auth=authMod.getAuth(app);
  const db=dbMod.getDatabase(app);
  const cred=await authMod.signInAnonymously(auth);
  const uid=cred.user.uid;
  const userRef=dbMod.ref(db,`events/${cfg.EVENT_ID}/submissions/${uid}`);
  const snap=await dbMod.get(userRef); count=snap.exists()?snap.size:0;
  firebaseApi={dbMod,db,uid,userRef};
  updateUI(count);
}

async function submitFirebase(name){
  const {dbMod,userRef,uid,db}=firebaseApi;
  // Write beneath this user's node; the RTDB rules enforce max 3 children.
  const itemRef=dbMod.push(userRef);
  await dbMod.set(itemRef,{name,createdAt:dbMod.serverTimestamp()});
  count++;
}

function submitDemo(name){
  const arr=demoNames();
  const mine=arr.filter(x=>x.deviceId===getDeviceId());
  if(mine.length>=cfg.MAX_SUBMISSIONS) throw new Error('LIMIT');
  const item={id:crypto.randomUUID(),name,createdAt:Date.now(),deviceId:getDeviceId()};
  arr.push(item);localStorage.setItem(sessionKey(),JSON.stringify(arr));
  new BroadcastChannel('solid-rock-prayer-wall').postMessage({type:'new-name',item});
  count=mine.length+1;
}

async function boot(){
  if(cfg.DEMO_MODE){count=demoNames().filter(x=>x.deviceId===getDeviceId()).length;updateUI(count);}
  else{try{await initFirebase()}catch(e){console.error(e);showMessage('Connection problem. Please ask a member of the media team for help.','error');btn.disabled=true}}
}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(count>=cfg.MAX_SUBMISSIONS)return;
  const result=window.PrayerWallFilter.validateName(input.value);
  if(!result.ok){showMessage(result.message,'error');return;}
  btn.disabled=true;btn.textContent='Sending…';
  try{
    if(cfg.DEMO_MODE) submitDemo(result.value); else await submitFirebase(result.value);
    input.value='';
    if(count<cfg.MAX_SUBMISSIONS){showMessage(`✓ ${result.value} has been added. Who is the next person?`,'ok');input.focus();}
    updateUI(count);
  }catch(err){
    console.error(err);
    if(String(err).includes('PERMISSION_DENIED')||String(err).includes('LIMIT')){count=cfg.MAX_SUBMISSIONS;updateUI(count);}else showMessage('That name could not be sent. Please try again.','error');
  }finally{if(count<cfg.MAX_SUBMISSIONS){btn.disabled=false;btn.textContent='Send Name';}}
});

boot();
