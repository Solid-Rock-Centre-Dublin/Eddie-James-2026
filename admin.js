const cfg=window.PRAYER_WALL_CONFIG;
const loginView=document.getElementById('loginView'),adminView=document.getElementById('adminView'),grid=document.getElementById('adminGrid'),countLabel=document.getElementById('countLabel');
let api=null;let items=[];

function render(){grid.innerHTML='';countLabel.textContent=`${items.length} name${items.length===1?'':'s'}`;items.slice().reverse().forEach(x=>{const d=document.createElement('div');d.className='name-chip';const s=document.createElement('span');s.textContent=x.name;const b=document.createElement('button');b.textContent='Remove';b.onclick=()=>removeItem(x);d.append(s,b);grid.appendChild(d)})}
function loadDemo(){try{items=JSON.parse(localStorage.getItem(`srpw:${cfg.EVENT_ID}:demoNames`)||'[]')}catch{items=[]}loginView.hidden=true;adminView.hidden=false;render()}
async function initFirebase(){
 const appMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');const authMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');const dbMod=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');
 const app=appMod.initializeApp(cfg.FIREBASE,'admin');const auth=authMod.getAuth(app),db=dbMod.getDatabase(app);api={authMod,dbMod,auth,db};
 authMod.onAuthStateChanged(auth,user=>{if(user&&cfg.ADMIN_UIDS.includes(user.uid)){loginView.hidden=true;adminView.hidden=false;refreshFirebase()}else{loginView.hidden=false;adminView.hidden=true}})
}
async function refreshFirebase(){const {dbMod,db}=api;const snap=await dbMod.get(dbMod.ref(db,`events/${cfg.EVENT_ID}/submissions`));items=[];if(snap.exists())snap.forEach(us=>us.forEach(ns=>{const v=ns.val();if(v?.name)items.push({id:`${us.key}/${ns.key}`,uid:us.key,key:ns.key,name:v.name,createdAt:v.createdAt})}));render()}
async function removeItem(x){if(!confirm(`Remove ${x.name}?`))return;if(cfg.DEMO_MODE){items=items.filter(i=>i.id!==x.id);localStorage.setItem(`srpw:${cfg.EVENT_ID}:demoNames`,JSON.stringify(items));render()}else{await api.dbMod.remove(api.dbMod.ref(api.db,`events/${cfg.EVENT_ID}/submissions/${x.uid}/${x.key}`));refreshFirebase()}}
async function clearAll(){if(!confirm('Clear ALL names for this event? This cannot be undone.'))return;if(cfg.DEMO_MODE){items=[];localStorage.setItem(`srpw:${cfg.EVENT_ID}:demoNames`,'[]');render()}else{await api.dbMod.remove(api.dbMod.ref(api.db,`events/${cfg.EVENT_ID}/submissions`));refreshFirebase()}}
function downloadCSV(){const rows=[['Name','Submitted'],...items.map(x=>[x.name,x.createdAt?new Date(x.createdAt).toISOString():''])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`${cfg.EVENT_ID}-names.csv`;a.click();URL.revokeObjectURL(a.href)}

document.getElementById('loginBtn').onclick=async()=>{if(cfg.DEMO_MODE)return loadDemo();const email=document.getElementById('email').value,password=document.getElementById('password').value;try{await api.authMod.signInWithEmailAndPassword(api.auth,email,password)}catch(e){document.getElementById('loginMsg').textContent='Sign-in failed.'}};
document.getElementById('logoutBtn').onclick=()=>cfg.DEMO_MODE?location.reload():api.authMod.signOut(api.auth);
document.getElementById('refreshBtn').onclick=()=>cfg.DEMO_MODE?loadDemo():refreshFirebase();document.getElementById('clearBtn').onclick=clearAll;document.getElementById('downloadBtn').onclick=downloadCSV;
if(cfg.DEMO_MODE)loadDemo();else initFirebase().catch(console.error);
