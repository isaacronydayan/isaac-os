// ============================================================================
// ISAAC OS — Sistema operacional pessoal
// Arquitetura: SPA React servida por esta função + camadas de dados em
//   /whoop/data (WHOOP v2) e /google/data (Calendar + Tasks CRUD).
// Preparado para IA futura: window.IsaacOS.getContext() agrega todos os dados.
// REGRA DO ARQUIVO: nenhum backtick ou ${ dentro do HTML (só concatenação).
// ============================================================================
const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#08090b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Isaac OS">
<title>Isaac OS</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
:root{
  --bg:#08090b;--s1:#0e0f12;--s2:#14151a;--s3:#1b1d23;
  --b:rgba(255,255,255,.065);--bh:rgba(255,255,255,.14);
  --t:#f2f3f5;--t2:#9a9ca6;--t3:#5f6169;
  --accent:#6366f1;--a2:#818cf8;--abg:rgba(99,102,241,.12);
  --green:#34d399;--gbg:rgba(52,211,153,.12);
  --red:#f87171;--rbg:rgba(248,113,113,.12);
  --amber:#fbbf24;--ybg:rgba(251,191,36,.12);
  --blue:#60a5fa;--bbg:rgba(96,165,250,.12);
  --violet:#a78bfa;--vbg:rgba(167,139,250,.12);
  --orange:#fb923c;--obg:rgba(251,146,60,.12);
  --cyan:#22d3ee;
  --r:16px;--rs:10px;--sb:236px;
  --fn:'Inter',-apple-system,system-ui,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html{color-scheme:dark}
body{background:var(--bg);color:var(--t);font-family:var(--fn);font-size:14px;line-height:1.45;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:4px}
::-webkit-scrollbar-track{background:transparent}
::selection{background:rgba(99,102,241,.35)}
button{font-family:var(--fn)}
input,textarea,select{font-family:var(--fn);color:var(--t)}

/* ===== Layout ===== */
.layout{display:flex;min-height:100vh}
.sidebar{width:var(--sb);min-width:var(--sb);height:100vh;position:sticky;top:0;background:var(--s1);border-right:1px solid var(--b);display:flex;flex-direction:column;padding:18px 12px 12px}
.main{flex:1;min-width:0;background:radial-gradient(1200px 500px at 70% -10%,rgba(99,102,241,.06),transparent 60%),var(--bg)}
.page{max-width:1280px;margin:0 auto;padding:28px 30px 60px;animation:fadeUp .32s cubic-bezier(.2,.7,.3,1)}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

/* ===== Sidebar ===== */
.logo{display:flex;align-items:center;gap:10px;padding:6px 12px 18px;font-weight:900;font-size:16px;letter-spacing:-.4px}
.logo .lz{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 14px rgba(99,102,241,.35)}
.nsec{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);padding:14px 12px 6px}
.ni{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;color:var(--t2);font-size:13px;font-weight:500;transition:all .14s;position:relative;margin-bottom:1px}
.ni:hover{background:var(--s2);color:var(--t)}
.ni.active{background:var(--s2);color:var(--t);font-weight:600}
.ni.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:3px;background:var(--accent)}
.ni .ico{width:20px;text-align:center;font-size:14px}
.dot{width:7px;height:7px;border-radius:50%}
.sbot{margin-top:auto}
.uc{display:flex;align-items:center;gap:10px;padding:10px 12px;border-top:1px solid var(--b);margin-top:8px}
.av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800}

/* ===== Cards & typography ===== */
.card{background:linear-gradient(180deg,#111217,#0d0e11);border:1px solid var(--b);border-radius:var(--r);padding:18px;transition:border-color .16s,box-shadow .16s,transform .16s}
.card:hover{border-color:var(--bh);box-shadow:0 6px 28px rgba(0,0,0,.4)}
.pt{font-size:22px;font-weight:800;letter-spacing:-.5px}
.ps{font-size:13px;color:var(--t2)}
.ct{font-size:11px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;color:var(--t3);margin-bottom:12px}
.mv{font-size:27px;font-weight:800;letter-spacing:-1px;line-height:1;font-variant-numeric:tabular-nums}
.ph{margin-bottom:20px}
.g{display:grid;gap:14px}
.g2{grid-template-columns:1fr 1fr}
.g3{grid-template-columns:repeat(3,1fr)}
.g4{grid-template-columns:repeat(4,1fr)}
.g23{grid-template-columns:2fr 1fr}

/* ===== Badges, chips, buttons ===== */
.badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2.5px 8px;border-radius:20px;white-space:nowrap}
.b-{background:var(--bbg);color:var(--blue)}
.g-{background:var(--gbg);color:var(--green)}
.y-{background:var(--ybg);color:var(--amber)}
.r-{background:var(--rbg);color:var(--red)}
.v-{background:var(--vbg);color:var(--violet)}
.o-{background:var(--obg);color:var(--orange)}
.z-{background:var(--s2);color:var(--t3)}
.a-{background:var(--abg);color:var(--a2)}
.live{display:inline-flex;align-items:center;gap:5px;background:var(--gbg);color:var(--green);font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px}
.live::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 1.8s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.btn{display:inline-flex;align-items:center;gap:6px;background:var(--accent);border:none;border-radius:9px;color:#fff;font-size:12.5px;font-weight:700;padding:8px 14px;cursor:pointer;transition:all .14s}
.btn:hover{background:#585af0;transform:translateY(-1px);box-shadow:0 4px 16px rgba(99,102,241,.4)}
.btn.ghost{background:var(--s2);color:var(--t2);border:1px solid var(--b)}
.btn.ghost:hover{color:var(--t);border-color:var(--bh);box-shadow:none}
.btn.danger{background:var(--rbg);color:var(--red)}
.btn.sm{padding:5px 10px;font-size:11.5px;border-radius:7px}
.refresh-btn{display:inline-flex;align-items:center;gap:5px;background:var(--s2);border:1px solid var(--b);border-radius:7px;color:var(--t2);font-size:11px;font-weight:600;padding:4px 10px;cursor:pointer;transition:all .12s}
.refresh-btn:hover{background:var(--s3);color:var(--t)}
.refresh-btn:disabled{opacity:.5;cursor:default}
.seg{display:inline-flex;background:var(--s2);border:1px solid var(--b);border-radius:10px;padding:3px;gap:2px}
.seg .si{padding:5px 13px;border-radius:7px;font-size:12px;font-weight:600;color:var(--t2);cursor:pointer;transition:all .14s}
.seg .si.on{background:var(--s3);color:var(--t);box-shadow:0 1px 6px rgba(0,0,0,.3)}
.input{background:var(--s2);border:1px solid var(--b);border-radius:9px;padding:8px 12px;font-size:13px;outline:none;transition:border-color .14s;width:100%}
.input:focus{border-color:var(--accent)}
textarea.input{resize:vertical;min-height:70px}
select.input{cursor:pointer}

/* ===== Progress & rings ===== */
.pbar{height:6px;background:var(--s2);border-radius:3px;overflow:hidden}
.pf{height:100%;border-radius:3px;transition:width .5s cubic-bezier(.2,.7,.3,1)}

/* ===== Tasks ===== */
.task{display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer;transition:background .12s}
.task:hover{background:var(--s2)}
.task.sub{margin-left:26px}
.cb{width:17px;height:17px;min-width:17px;border-radius:50%;border:1.5px solid var(--t3);display:flex;align-items:center;justify-content:center;transition:all .15s;margin-top:1px}
.cb:hover{border-color:var(--a2)}
.cb.done{background:var(--accent);border-color:var(--accent);animation:pop .25s ease}
@keyframes pop{50%{transform:scale(1.25)}}
.tt{font-size:13px;font-weight:500;line-height:1.35}
.tt.done{color:var(--t3);text-decoration:line-through}
.tmeta{font-size:10.5px;color:var(--t3);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}

/* ===== Calendar ===== */
.cwd{font-size:10px;font-weight:700;color:var(--t3);text-align:center;text-transform:uppercase;letter-spacing:.5px;padding:4px 0}
.cd{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:9px;font-size:12.5px;font-weight:600;color:var(--t2);cursor:pointer;position:relative;transition:all .12s;gap:2px}
.cd:hover{background:var(--s2);color:var(--t)}
.cd.today{box-shadow:inset 0 0 0 1.5px var(--accent);color:var(--a2)}
.cd.sel{background:var(--accent);color:#fff!important}
.cd.out{opacity:.28;cursor:default}
.cd .dts{display:flex;gap:2px;height:4px}
.cd .dt{width:4px;height:4px;border-radius:50%;background:var(--a2)}
.cd.sel .dt{background:#fff}
.ev{display:flex;gap:10px;padding:9px 10px;border-radius:10px;transition:background .12s;align-items:flex-start}
.ev:hover{background:var(--s2)}
.evb{width:3px;border-radius:2px;align-self:stretch;min-height:30px}
.evt{font-size:11px;color:var(--t3);font-variant-numeric:tabular-nums;min-width:40px;padding-top:1px}

/* ===== Habits ===== */
.hrow{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--b)}
.hrow:last-child{border-bottom:none}
.hname{flex:1;font-size:12.5px;font-weight:500;display:flex;align-items:center;gap:8px;min-width:0}
.hname span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hcell{width:26px;height:26px;border-radius:7px;background:var(--s2);display:flex;align-items:center;justify-content:center;font-size:11px;color:transparent;cursor:pointer;transition:all .13s;border:1px solid transparent}
.hcell:hover{border-color:var(--bh)}
.hcell.done{background:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.35)}
.hcell.tdy{border-color:rgba(129,140,248,.5)}
.hcell.fut{opacity:.25;cursor:default}
.hstreak{font-size:11px;font-weight:700;color:var(--amber);min-width:38px;text-align:right;font-variant-numeric:tabular-nums}
.heat{aspect-ratio:1;border-radius:4px;transition:transform .1s}
.heat:hover{transform:scale(1.15)}

/* ===== Modal ===== */
.mask{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .18s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--s1);border:1px solid var(--bh);border-radius:18px;padding:22px;width:100%;max-width:460px;box-shadow:0 24px 80px rgba(0,0,0,.6);animation:fadeUp .22s ease;max-height:88vh;overflow-y:auto}

/* ===== Misc ===== */
canvas{max-height:190px}
.spin{width:30px;height:30px;border:3px solid rgba(255,255,255,.08);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}
.banner{display:flex;align-items:center;gap:10px;background:var(--ybg);border:1px solid rgba(251,191,36,.25);border-radius:12px;padding:10px 14px;margin:0 30px;max-width:1220px;font-size:12.5px;color:var(--amber);margin-left:auto;margin-right:auto;margin-top:16px}
.banner.err{background:var(--rbg);border-color:rgba(248,113,113,.25);color:var(--red)}
.empty{text-align:center;padding:34px 20px;color:var(--t3)}
.empty .ei{font-size:34px;margin-bottom:10px}
.tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.tbl th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--t3);padding:6px 8px;border-bottom:1px solid var(--b)}
.tbl td{padding:8px;border-bottom:1px solid var(--b);font-variant-numeric:tabular-nums}
.tbl tr:last-child td{border-bottom:none}
.mnav{display:none;position:fixed;bottom:0;left:0;right:0;background:rgba(14,15,18,.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--b);z-index:50;padding:6px 8px calc(6px + env(safe-area-inset-bottom))}
.mni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;border-radius:8px;cursor:pointer;color:var(--t3);font-size:9.5px;font-weight:600}
.mni.active{color:var(--a2)}
.mni span{font-size:16px}
@media(max-width:1000px){.g4{grid-template-columns:1fr 1fr}.g23{grid-template-columns:1fr}}
@media(max-width:900px){.sidebar{display:none}.mnav{display:flex}.main{padding-bottom:74px}.page{padding:18px 16px 80px}.g3{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}}
@media(max-width:560px){.g4,.g3{grid-template-columns:1fr 1fr}.pt{font-size:19px}}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const {useState,useEffect,useMemo,useRef}=React;

// ============================ CONSTANTES ============================
const DEFAULT_HABITS=[
  {id:'ex',    name:'Exercício',                ico:'🏋️'},
  {id:'nk',    name:'🚫👊🥩',                    ico:'🛡️'},
  {id:'shiur', name:'Shiur',                    ico:'📖'},
  {id:'sleep1',name:'Dormir antes da 1h',       ico:'🌙'},
  {id:'wake',  name:'Levantar até 7h30',        ico:'⏰'},
  {id:'shach', name:'Shacharit',                ico:'🙏'},
  {id:'minch', name:'Mincha',                   ico:'🙏'},
  {id:'arvit', name:'Arvit',                    ico:'🙏'},
  {id:'creat', name:'Tomar creatina',           ico:'💊'},
  {id:'nocel', name:'Não usar celular ao acordar',ico:'📵'},
  {id:'shema', name:'Kriat Shema Al Hamita',    ico:'🛏️'},
  {id:'invis', name:'Invisalign',               ico:'😁'},
  {id:'agua',  name:'Beber 2L+ de água',        ico:'💧'},
];
function loadHabitDefs(){const v=LS('habit_defs_v1',null);return (v&&Array.isArray(v)&&v.length)?v:DEFAULT_HABITS}
function saveHabitDefs(list){LSet('habit_defs_v1',list);LSet('habit_defs_at',Date.now());DEFS.list=list}
let DEFS={list:null}; // preenchido após utils (loadHabitDefs usa LS)

const SPORT_PT={'weightlifting':'Musculação','running':'Corrida','walking':'Caminhada','cycling':'Ciclismo','swimming':'Natação','functional fitness':'Funcional','basketball':'Basquete','soccer':'Futebol','football':'Futebol Americano','tennis':'Tênis','boxing':'Boxe','hiking/rucking':'Trilha','hiking':'Trilha','activity':'Atividade','hiit':'HIIT','yoga':'Yoga','pilates':'Pilates','spin':'Spinning','spinning':'Spinning','rowing':'Remo','jiu jitsu':'Jiu-Jitsu','martial arts':'Artes Marciais','stairmaster':'Escada','elliptical':'Elíptico','crossfit':'CrossFit'};
const SPORT_ICO={'Musculação':'🏋️','Corrida':'🏃','Caminhada':'🚶','Ciclismo':'🚴','Natação':'🏊','Futebol':'⚽','Basquete':'🏀','Tênis':'🎾','Boxe':'🥊','Trilha':'🥾','Yoga':'🧘','Remo':'🚣','Spinning':'🚴','Jiu-Jitsu':'🥋','Artes Marciais':'🥋','CrossFit':'🏋️'};
const WD=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const WD_M=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const GCOLORS={'1':'#7986cb','2':'#33b679','3':'#8e24aa','4':'#e67c73','5':'#f6c026','6':'#f5511d','7':'#039be5','8':'#616161','9':'#3f51b5','10':'#0b8043','11':'#d60000'};
function evColor(e){return GCOLORS[e&&e.colorId]||'var(--accent)'}

// ============================ UTILS ============================
function pad2(n){return n<10?'0'+n:''+n}
function dayKey(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function todayKey(){return dayKey(new Date())}
function fmtT(iso){const d=new Date(iso);return pad2(d.getHours())+':'+pad2(d.getMinutes())}
function fmtDM(x){const d=(x instanceof Date)?x:new Date(x);return d.getDate()+' '+MESES[d.getMonth()].slice(0,3).toLowerCase()}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function dueKeyOf(t){return t&&t.due?t.due.slice(0,10):null} // Tasks manda date-only em UTC: comparar pela string!
function weekMonday(d){const x=new Date(d);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);x.setHours(0,0,0,0);return x}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function hmFromMs(ms){if(!ms&&ms!==0)return'–';const h=Math.floor(ms/3600000),m=Math.round((ms%3600000)/60000);return h+'h'+pad2(m)}
function kcal(kj){return Math.round(kj/4.184)}
function timeAgo(ts){if(!ts)return'';const m=Math.floor((Date.now()-ts)/60000);if(m<1)return'agora';if(m<60)return'há '+m+' min';const h=Math.floor(m/60);if(h<24)return'há '+h+'h';return'há '+Math.floor(h/24)+'d'}
function greeting(){const h=new Date().getHours();if(h<6)return'Boa madrugada';if(h<12)return'Bom dia';if(h<18)return'Boa tarde';return'Boa noite'}
function scoreColor(v){if(v===null||v===undefined)return'var(--t3)';if(v>=80)return'var(--green)';if(v>=60)return'var(--amber)';return'var(--red)'}
function trend(cur,prev){
  if(cur===null||cur===undefined||prev===null||prev===undefined||!prev)return null;
  const pct=Math.round((cur-prev)/prev*100);
  if(pct===0)return null;
  return {pct:Math.abs(pct),up:pct>0};
}
function LS(k,fb){try{const v=JSON.parse(localStorage.getItem(k));return v===null||v===undefined?fb:v}catch{return fb}}
function LSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
function LDel(k){try{localStorage.removeItem(k)}catch{}}
DEFS.list=loadHabitDefs();

// ============================ TOKENS & CACHE ============================
function getTokens(){return LS('whoop_tokens',null)}
function saveTokens(t){LSet('whoop_tokens',t)}
function clearTokens(){LDel('whoop_tokens');LDel('whoop_cache')}
function getWhoopCache(){return LS('whoop_cache',null)}
function saveWhoopCache(data){LSet('whoop_cache',{data,at:Date.now()})}
function getGoogleTokens(){return LS('google_tokens',null)}
function saveGoogleTokens(t){LSet('google_tokens',t)}
function clearGoogleTokens(){LDel('google_tokens');LDel('google_cache')}
function getGoogleCache(){return LS('google_cache',null)}
function saveGoogleCache(data){LSet('google_cache',{data,at:Date.now()})}

// ============================ VIDA JUDAICA (Hebcal, sem API key) ============================
async function fetchJewish(){
  const cached=LS('jew_cache',null);
  if(cached&&Date.now()-cached.at<6*3600*1000)return cached.v;
  const now=new Date();
  const out={hebrew:null,parasha:null,candles:null,havdalah:null};
  try{
    const conv=await fetch('https://www.hebcal.com/converter?cfg=json&gy='+now.getFullYear()+'&gm='+(now.getMonth()+1)+'&gd='+now.getDate()+'&g2h=1').then(r=>r.json());
    out.hebrew=conv.hebrew||null;
  }catch(e){}
  try{
    // geonameid 3448439 = São Paulo
    const sh=await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=3448439&M=on').then(r=>r.json());
    (sh.items||[]).forEach(it=>{
      if(it.category==='parashat')out.parasha=it.title.replace('Parashat','Parashat ').replace('  ',' ');
      if(it.category==='candles')out.candles=it.date;
      if(it.category==='havdalah')out.havdalah=it.date;
    });
  }catch(e){}
  LSet('jew_cache',{at:Date.now(),v:out});
  return out;
}
function fmtShort(iso){const d=new Date(iso);return WD[d.getDay()].toLowerCase()+' '+pad2(d.getHours())+':'+pad2(d.getMinutes())}

// ============================ SINCRONIZAÇÃO (multi-dispositivo) ============================
function getSyncKey(){return LS('sync_key',null)}
function saveSyncKey(k){if(k)LSet('sync_key',k);else LDel('sync_key')}
async function syncFetch(method,merge){
  const key=getSyncKey();
  if(!key)return null;
  const opts={method,headers:{'X-Sync-Key':key,'Content-Type':'application/json'}};
  if(merge)opts.body=JSON.stringify({merge});
  const r=await fetch('/store',opts);
  if(!r.ok){const e=new Error('sync_'+r.status);e.status=r.status;throw e}
  return r.json();
}
let _pushTimer=null;
function syncPushSoon(merge){ // agrupa escritas em 1.2s (fire-and-forget)
  if(!getSyncKey())return;
  window._pendingMerge=Object.assign(window._pendingMerge||{},merge);
  clearTimeout(_pushTimer);
  _pushTimer=setTimeout(()=>{
    const m=window._pendingMerge;window._pendingMerge=null;
    syncFetch('POST',m).catch(()=>{});
  },1200);
}

// ============================ WHOOP: derivações ============================
function sportName(w){
  let n=((w&&w.sport_name)||'').replace(/_msk$/i,'').replace(/_/g,' ').trim();
  if(!n)return'Treino';
  const key=n.toLowerCase();
  return SPORT_PT[key]||n.charAt(0).toUpperCase()+n.slice(1);
}
function sportIcon(w){return SPORT_ICO[sportName(w)]||'🏋️'}
function pickSleep(data){
  const rs=(data&&data.sleep&&data.sleep.records)||[];
  return rs.find(r=>r.score&&!r.nap)||rs.find(r=>r.score)||rs[0]||null;
}
// Séries ascendentes por data para gráficos/médias
function seriesRecovery(data){
  const rs=((data&&data.recovery&&data.recovery.records)||[]).filter(r=>r.score);
  return rs.slice().reverse().map(r=>({date:new Date(r.created_at||r.updated_at),rec:r.score.recovery_score,hrv:r.score.hrv_rmssd_milli,rhr:r.score.resting_heart_rate,spo2:r.score.spo2_percentage}));
}
function seriesSleep(data){
  const rs=((data&&data.sleep&&data.sleep.records)||[]).filter(r=>r.score&&!r.nap);
  return rs.slice().reverse().map(r=>{
    const st=r.score.stage_summary||{};
    const asleep=(st.total_light_sleep_time_milli||0)+(st.total_slow_wave_sleep_time_milli||0)+(st.total_rem_sleep_time_milli||0);
    return {date:new Date(r.end||r.start),perf:r.score.sleep_performance_percentage,cons:r.score.sleep_consistency_percentage,eff:r.score.sleep_efficiency_percentage,rr:r.score.respiratory_rate,hours:asleep/3600000};
  });
}
function seriesStrain(data){
  const rs=((data&&data.cycles&&data.cycles.records)||[]).filter(r=>r.score);
  return rs.slice().reverse().map(r=>({date:new Date(r.start),strain:r.score.strain,kj:r.score.kilojoule,avgHr:r.score.average_heart_rate,maxHr:r.score.max_heart_rate}));
}
function avgOf(arr,key,n){
  const xs=arr.slice(-n).map(x=>x[key]).filter(v=>v!==null&&v!==undefined&&!isNaN(v));
  if(!xs.length)return null;
  return xs.reduce((a,b)=>a+b,0)/xs.length;
}
function avgRange(arr,key,from,to){ // médias de janelas anteriores: arr.slice(-to,-from)
  const xs=arr.slice(-to,arr.length-from).map(x=>x[key]).filter(v=>v!==null&&v!==undefined&&!isNaN(v));
  if(!xs.length)return null;
  return xs.reduce((a,b)=>a+b,0)/xs.length;
}
function personalRecords(data){
  const rec=seriesRecovery(data),str=seriesStrain(data),slp=seriesSleep(data);
  const wk=((data&&data.workouts&&data.workouts.records)||[]).filter(w=>w.score);
  const best=(arr,key)=>arr.length?arr.reduce((a,b)=>(b[key]||0)>(a[key]||0)?b:a):null;
  const bR=best(rec,'rec'),bH=best(rec,'hrv'),bS=best(str,'strain'),bSl=best(slp,'hours');
  const bW=wk.length?wk.reduce((a,b)=>(b.score.strain||0)>(a.score.strain||0)?b:a):null;
  return {
    rec:bR?{v:Math.round(bR.rec)+'%',d:bR.date}:null,
    hrv:bH?{v:Math.round(bH.hrv)+' ms',d:bH.date}:null,
    strain:bS?{v:(Math.round(bS.strain*10)/10).toFixed(1),d:bS.date}:null,
    sleep:bSl?{v:bSl.hours.toFixed(1)+'h',d:bSl.date}:null,
    workout:bW?{v:(Math.round(bW.score.strain*10)/10).toFixed(1)+' ('+sportName(bW)+')',d:new Date(bW.start)}:null,
  };
}

// ============================ HÁBITOS: engine ============================
function loadHabitLog(){return LS('habit_log_v2',{})}
function habitDone(log,dk,id){return !!(log[dk]&&log[dk][id])}
function habitStreak(log,id){
  let n=0;const d=new Date();
  if(!habitDone(log,dayKey(d),id))d.setDate(d.getDate()-1); // hoje ainda em aberto não quebra streak
  while(habitDone(log,dayKey(d),id)){n++;d.setDate(d.getDate()-1)}
  return n;
}
function habitRate(log,id,days){
  let done=0;const d=new Date();
  for(let i=0;i<days;i++){if(habitDone(log,dayKey(d),id))done++;d.setDate(d.getDate()-1)}
  return done/days;
}
function dayScore(log,dk){
  const done=DEFS.list.filter(h=>habitDone(log,dk,h.id)).length;
  return done/DEFS.list.length;
}

// ============================ CONTEXTO (preparação p/ IA) ============================
// Agrega tudo num JSON único — uma IA futura consome isso direto.
function buildContext(whoopData,googleData,habitLog){
  const rec=seriesRecovery(whoopData||{}),slp=seriesSleep(whoopData||{}),str=seriesStrain(whoopData||{});
  const tasks=(googleData&&googleData.tasks)||[];
  const tk=todayKey();
  return {
    generated_at:new Date().toISOString(),
    whoop:{
      today_recovery:(whoopData&&whoopData.cycle_recovery&&whoopData.cycle_recovery.score)||null,
      last_sleep:(pickSleep(whoopData)||{}).score||null,
      series:{recovery:rec.slice(-30),sleep:slp.slice(-30),strain:str.slice(-30)},
      records:personalRecords(whoopData||{}),
    },
    calendar:{events:((googleData&&googleData.events)||[]).slice(0,60)},
    tasks:{
      pending:tasks.filter(t=>!t.done).length,
      overdue:tasks.filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)<tk).length,
      today:tasks.filter(t=>!t.done&&dueKeyOf(t)===tk).length,
      lists:(googleData&&googleData.task_lists)||[],
      items:tasks,
    },
    habits:{
      defs:DEFS.list,
      log:habitLog,
      today_score:dayScore(habitLog,tk),
      streaks:DEFS.list.map(h=>({id:h.id,name:h.name,streak:habitStreak(habitLog,h.id),rate30:habitRate(habitLog,h.id,30)})),
    },
  };
}

// ============================ INSIGHTS automáticos ============================
function buildInsights(ctx){
  const out=[];
  const w=ctx.whoop.today_recovery;
  const slp=ctx.whoop.last_sleep;
  if(w&&w.recovery_score!==undefined){
    if(w.recovery_score>=80)out.push({i:'💪',tone:'g-',t:'Recovery em '+Math.round(w.recovery_score)+'% — corpo pronto para treino pesado hoje.'});
    else if(w.recovery_score<60)out.push({i:'🛌',tone:'r-',t:'Recovery em '+Math.round(w.recovery_score)+'% — prioriza descanso ou treino leve.'});
  }
  const recS=ctx.whoop.series.recovery;
  if(recS.length>=4){
    const last3=recS.slice(-3).map(r=>r.hrv);
    if(last3.every((v,i)=>i===0||v<last3[i-1]))out.push({i:'📉',tone:'y-',t:'HRV caindo há 3 dias — sinal de fadiga acumulada ou estresse.'});
  }
  if(slp&&slp.sleep_needed&&slp.sleep_needed.need_from_sleep_debt_milli>30*60000){
    out.push({i:'😴',tone:'y-',t:'Débito de sono de '+hmFromMs(slp.sleep_needed.need_from_sleep_debt_milli)+' — tenta dormir mais cedo hoje.'});
  }
  if(slp&&slp.sleep_consistency_percentage!==undefined&&slp.sleep_consistency_percentage<70){
    out.push({i:'🕰️',tone:'y-',t:'Consistência de sono em '+Math.round(slp.sleep_consistency_percentage)+'% — horários regulares melhoram o recovery.'});
  }
  if(ctx.tasks.overdue>0)out.push({i:'⚠️',tone:'r-',t:ctx.tasks.overdue+(ctx.tasks.overdue===1?' tarefa atrasada':' tarefas atrasadas')+' no Google Tasks.'});
  const bestStreak=ctx.habits.streaks.slice().sort((a,b)=>b.streak-a.streak)[0];
  if(bestStreak&&bestStreak.streak>=7)out.push({i:'🔥',tone:'g-',t:bestStreak.streak+' dias seguidos de "'+bestStreak.name+'" — não quebra a corrente!'});
  const hs=ctx.habits.today_score;
  if(hs>=0.8)out.push({i:'🏆',tone:'g-',t:'Dia disciplinado: '+Math.round(hs*100)+'% dos hábitos concluídos.'});
  return out.slice(0,4);
}
// ============================ COMPONENTES BASE ============================
function Ring({value,max,size,stroke,color,children}){
  const sz=size||120,st=stroke||9,r=(sz-st)/2,C=2*Math.PI*r;
  const pct=value===null||value===undefined?0:Math.min(Math.max(value/(max||100),0),1);
  return(
    <div style={{position:'relative',width:sz,height:sz}}>
      <svg width={sz} height={sz} style={{transform:'rotate(-90deg)'}}>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="var(--s2)" strokeWidth={st}/>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={st} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C*(1-pct)} style={{transition:'stroke-dashoffset .7s cubic-bezier(.2,.7,.3,1)'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>{children}</div>
    </div>
  );
}
function ChartBox({type,labels,datasets,opts,height}){
  const ref=useRef(null),chart=useRef(null);
  useEffect(()=>{
    if(!ref.current)return;
    if(chart.current)chart.current.destroy();
    chart.current=new Chart(ref.current,{
      type:type||'line',
      data:{labels,datasets},
      options:Object.assign({
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:datasets.length>1,labels:{color:'#9a9ca6',boxWidth:10,font:{size:10}}},tooltip:{backgroundColor:'#1b1d23',borderColor:'rgba(255,255,255,.1)',borderWidth:1}},
        scales:{x:{ticks:{color:'#5f6169',font:{size:9.5},maxTicksLimit:8},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#5f6169',font:{size:9.5}},grid:{color:'rgba(255,255,255,.04)'}}},
      },opts||{}),
    });
    return()=>{if(chart.current)chart.current.destroy()};
  },[JSON.stringify(labels),JSON.stringify(datasets.map(d=>d.data))]);
  return <div style={{height:height||190}}><canvas ref={ref}/></div>;
}
function ds(label,data,color,fillColor){
  return {label,data,borderColor:color,backgroundColor:fillColor||color,tension:.35,pointRadius:0,pointHoverRadius:4,borderWidth:2,fill:!!fillColor};
}
function Modal({open,onClose,title,children}){
  useEffect(()=>{
    if(!open)return;
    function onKey(e){if(e.key==='Escape')onClose()}
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[open]);
  if(!open)return null;
  return(
    <div className="mask" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:800}}>{title}</div>
          <button className="btn ghost sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty({ico,title,desc,action,onAction}){
  return(
    <div className="empty">
      <div className="ei">{ico}</div>
      <div style={{fontSize:14,fontWeight:700,color:'var(--t2)',marginBottom:4}}>{title}</div>
      <div style={{fontSize:12,marginBottom:action?14:0}}>{desc}</div>
      {action&&<button className="btn" onClick={onAction}>{action}</button>}
    </div>
  );
}
function Seg({options,value,onChange}){
  return(
    <div className="seg">
      {options.map(o=>(
        <div key={o.v} className={'si '+(value===o.v?'on':'')} onClick={()=>onChange(o.v)}>{o.l}</div>
      ))}
    </div>
  );
}
function RefreshBtn({state}){
  if(!state)return null;
  return(
    <button className="refresh-btn" onClick={state.onRefresh} disabled={state.loading}>
      {state.loading?'Atualizando…':'↻ '+(state.updatedAt?timeAgo(state.updatedAt):'Atualizar')}
    </button>
  );
}
function TrendTag({t,goodUp}){
  if(!t)return null;
  const col=goodUp===null?'var(--t3)':(t.up===goodUp?'var(--green)':'var(--red)');
  return <div style={{fontSize:10.5,fontWeight:700,marginTop:6,color:col}}>{(t.up?'▲ ':'▼ ')+t.pct+'% vs ontem'}</div>;
}

// ============================ PÁGINA: HOJE ============================
function HojePage({whoop,google,habitLog,toggleHabit,taskAction,setPage,connect,jew}){
  const[qa,setQa]=useState('');
  const NOW=new Date();
  const tk=todayKey();
  const wd=whoop&&whoop.data,gd=google&&google.data;
  const wtok=getTokens(),gtok=getGoogleTokens();

  // WHOOP hoje
  const cr=wd&&wd.cycle_recovery&&wd.cycle_recovery.score;
  const rec=cr?cr.recovery_score:null,hrv=cr?cr.hrv_rmssd_milli:null,rhr=cr?cr.resting_heart_rate:null,spo2=cr?cr.spo2_percentage:null;
  const cyc=wd&&wd.cycles&&wd.cycles.records&&wd.cycles.records[0]&&wd.cycles.records[0].score;
  const strain=cyc?cyc.strain:null;
  const sleepRec=pickSleep(wd),ss=sleepRec&&sleepRec.score;
  const recS=seriesRecovery(wd||{}),strS=seriesStrain(wd||{});
  const yRec=recS.length>1?recS[recS.length-2]:null;
  const yStr=strS.length>1?strS[strS.length-2]:null;

  // Eventos de hoje
  const evs=((gd&&gd.events)||[]).filter(e=>sameDay(new Date(e.start),NOW)).sort((a,b)=>new Date(a.start)-new Date(b.start));
  const nowEv=evs.find(e=>!e.allDay&&new Date(e.start)<=NOW&&new Date(e.end)>NOW);
  const nextEv=evs.find(e=>!e.allDay&&new Date(e.start)>NOW);

  // Tarefas de hoje / atrasadas
  const tasks=(gd&&gd.tasks)||[];
  const tToday=tasks.filter(t=>!t.done&&dueKeyOf(t)===tk);
  const tLate=tasks.filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)<tk);
  const tDoneToday=tasks.filter(t=>t.done&&t.completed&&t.completed.slice(0,10)===tk).length;

  // Pontuação do dia (hábitos 40% + tarefas 30% + recovery 30%, renormalizado)
  const hScore=dayScore(habitLog,tk);
  const parts=[];
  parts.push({w:40,v:hScore});
  const tTot=tToday.length+tLate.length+tDoneToday;
  if(gtok&&tTot>0)parts.push({w:30,v:tDoneToday/tTot});
  if(rec!==null)parts.push({w:30,v:rec/100});
  const totW=parts.reduce((a,p)=>a+p.w,0);
  const score=Math.round(parts.reduce((a,p)=>a+p.v*p.w,0)/totW*100);

  const ctx=buildContext(wd,gd,habitLog);
  const insights=buildInsights(ctx);
  const dateStr=NOW.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  const doneH=DEFS.list.filter(h=>habitDone(habitLog,tk,h.id)).length;

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3,flexWrap:'wrap'}}>
          <div className="pt">{greeting()}, Isaac 👋</div>
          {(wtok||gtok)&&<div className="live">{[wtok&&'WHOOP',gtok&&'Google'].filter(Boolean).join(' + ')}</div>}
          <RefreshBtn state={whoop||google}/>
        </div>
        <div className="ps" style={{textTransform:'capitalize'}}>{dateStr}{jew&&jew.hebrew?<span style={{textTransform:'none',color:'var(--t3)'}}> · {jew.hebrew}</span>:null}</div>
        {(nowEv||nextEv)&&(
          <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
            {nowEv&&<div className="live">Agora: {nowEv.summary} · até {fmtT(nowEv.end)}</div>}
            {nextEv&&<div className="badge b-" style={{fontSize:11,padding:'4px 10px'}}>Próximo: {nextEv.summary} às {fmtT(nextEv.start)}</div>}
          </div>
        )}
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        <div className="card" style={{display:'flex',alignItems:'center',gap:16}}>
          <Ring value={rec} max={100} size={92} stroke={8} color={scoreColor(rec)}>
            <div style={{fontSize:20,fontWeight:800,color:scoreColor(rec)}}>{rec!==null?Math.round(rec)+'%':'–'}</div>
          </Ring>
          <div style={{flex:1}}>
            <div className="ct" style={{marginBottom:6}}>Recovery</div>
            <div style={{fontSize:11.5,color:'var(--t2)',lineHeight:1.7}}>
              <div>HRV <b style={{color:'var(--violet)'}}>{hrv!==null?Math.round(hrv)+'ms':'–'}</b></div>
              <div>RHR <b style={{color:'var(--blue)'}}>{rhr!==null?Math.round(rhr)+'bpm':'–'}</b></div>
              <div>SpO2 <b style={{color:'var(--cyan)'}}>{spo2?Math.round(spo2)+'%':'–'}</b></div>
            </div>
            <TrendTag t={trend(rec,yRec&&yRec.rec)} goodUp={true}/>
          </div>
        </div>
        <div className="card">
          <div className="ct">Strain</div>
          <div className="mv" style={{color:'var(--orange)'}}>{strain!==null?(Math.round(strain*10)/10).toFixed(1):'–'}</div>
          <div className="pbar" style={{margin:'10px 0 6px'}}><div className="pf" style={{width:(strain?Math.min(strain/21*100,100):0)+'%',background:'var(--orange)'}}/></div>
          <div style={{fontSize:11,color:'var(--t3)'}}>{cyc?kcal(cyc.kilojoule)+' kcal · FC média '+Math.round(cyc.average_heart_rate)+'bpm':'de 21 possíveis'}</div>
          <TrendTag t={trend(strain,yStr&&yStr.strain)} goodUp={null}/>
        </div>
        <div className="card">
          <div className="ct">Sono</div>
          <div className="mv" style={{color:'var(--blue)'}}>{ss?Math.round(ss.sleep_performance_percentage)+'%':'–'}</div>
          <div style={{fontSize:11,color:'var(--t3)',marginTop:10,lineHeight:1.7}}>
            {ss&&ss.stage_summary?<div>{hmFromMs((ss.stage_summary.total_light_sleep_time_milli||0)+(ss.stage_summary.total_slow_wave_sleep_time_milli||0)+(ss.stage_summary.total_rem_sleep_time_milli||0))} dormidas</div>:<div>—</div>}
            {ss&&ss.sleep_consistency_percentage!==undefined&&<div>Consistência {Math.round(ss.sleep_consistency_percentage)}%</div>}
          </div>
        </div>
        <div className="card" style={{display:'flex',alignItems:'center',gap:16}}>
          <Ring value={score} max={100} size={92} stroke={8} color={scoreColor(score)}>
            <div style={{fontSize:20,fontWeight:800,color:scoreColor(score)}}>{score}</div>
            <div style={{fontSize:8.5,color:'var(--t3)',fontWeight:700}}>/ 100</div>
          </Ring>
          <div style={{flex:1}}>
            <div className="ct" style={{marginBottom:6}}>Pontuação do dia</div>
            <div style={{fontSize:11.5,color:'var(--t2)',lineHeight:1.7}}>
              <div>Hábitos <b>{doneH}/{DEFS.list.length}</b></div>
              <div>Tarefas <b>{tDoneToday} feitas</b></div>
              <div>Corpo <b>{rec!==null?Math.round(rec)+'%':'–'}</b></div>
            </div>
          </div>
        </div>
      </div>

      {insights.length>0&&(
        <div className="card" style={{marginBottom:14,background:'linear-gradient(135deg,rgba(99,102,241,.08),rgba(168,85,247,.05))',borderColor:'rgba(99,102,241,.18)'}}>
          <div className="ct">✦ Insights de hoje</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {insights.map((ins,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:13}}>
                <span>{ins.i}</span><span style={{color:'var(--t2)'}}>{ins.t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {jew&&(jew.candles||jew.parasha)&&(
        <div className="card" style={{marginBottom:14,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',background:'linear-gradient(135deg,rgba(251,191,36,.07),rgba(99,102,241,.04))',borderColor:'rgba(251,191,36,.18)'}}>
          <span style={{fontSize:22}}>🕯️</span>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:13.5,fontWeight:800}}>{jew.parasha||'Shabat'}</div>
            <div style={{fontSize:11.5,color:'var(--t2)',marginTop:2}}>
              {jew.candles&&<span>Velas: <b style={{color:'var(--amber)'}}>{fmtShort(jew.candles)}</b></span>}
              {jew.havdalah&&<span> · Havdalá: <b style={{color:'var(--violet)'}}>{fmtShort(jew.havdalah)}</b></span>}
              <span style={{color:'var(--t3)'}}> · horários de São Paulo</span>
            </div>
          </div>
        </div>
      )}

      <div className="g g23" style={{marginBottom:14}}>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>Hábitos de hoje</div>
            <div style={{fontSize:11,color:'var(--t2)'}}>{doneH}/{DEFS.list.length}</div>
          </div>
          <div className="pbar" style={{marginBottom:12}}><div className="pf" style={{width:(doneH/DEFS.list.length*100)+'%',background:'linear-gradient(90deg,var(--accent),var(--violet))'}}/></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:4}}>
            {DEFS.list.map(h=>{
              const d=habitDone(habitLog,tk,h.id);
              return(
                <div key={h.id} className="task" onClick={()=>toggleHabit(tk,h.id)}>
                  <div className={'cb '+(d?'done':'')}>
                    {d&&<svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className={'tt '+(d?'done':'')} style={{display:'flex',gap:6,alignItems:'center'}}><span>{h.ico}</span><span>{h.name}</span></div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="card" style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="ct" style={{marginBottom:0}}>Agenda de hoje</div>
              {gtok?<div className="badge a-">{evs.length} eventos</div>:null}
            </div>
            {!gtok?<Empty ico="📅" title="Google não conectado" desc="Conecte para ver sua agenda real" action="Conectar Google" onAction={connect.google}/>:
             evs.length===0?<Empty ico="🌤️" title="Dia livre" desc="Nenhum evento hoje"/>:(
              <div style={{maxHeight:250,overflowY:'auto'}}>
                {evs.map(e=>{
                  const isNow=nowEv&&nowEv.id===e.id;
                  return(
                    <div key={e.id} className="ev">
                      <div className="evb" style={{background:isNow?'var(--green)':evColor(e)}}/>
                      <div className="evt">{e.allDay?'dia':fmtT(e.start)}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.summary}</div>
                        {isNow&&<div style={{fontSize:10,color:'var(--green)',fontWeight:700}}>ACONTECENDO AGORA</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="card" style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="ct" style={{marginBottom:0}}>Tarefas de hoje</div>
              {tLate.length>0&&<div className="badge r-">{tLate.length} atrasadas</div>}
            </div>
            {!gtok?<Empty ico="✓" title="Google não conectado" desc="Conecte para ver suas tarefas" action="Conectar Google" onAction={connect.google}/>:
             (
              <div>
              <div style={{display:'flex',gap:6,marginBottom:8}}>
                <input className="input" style={{fontSize:12,padding:'6px 10px'}} placeholder="+ Nova tarefa para hoje…" value={qa}
                  onChange={e=>setQa(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==='Enter'&&qa.trim()){
                      const lists=(gd&&gd.task_lists)||[];
                      if(lists.length)taskAction('create',{listId:lists[0].id,title:qa.trim(),due:tk+'T00:00:00.000Z'});
                      setQa('');
                    }
                  }}/>
              </div>
              {(tToday.length+tLate.length)===0?<Empty ico="🎉" title="Tudo em dia" desc="Nenhuma tarefa pendente para hoje"/>:(
              <div style={{maxHeight:250,overflowY:'auto'}}>
                {tLate.concat(tToday).slice(0,12).map(t=>(
                  <div key={t.id} className="task" onClick={()=>taskAction('toggle',t)}>
                    <div className={'cb '+(t.done?'done':'')}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="tt" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>
                      <div className="tmeta">
                        {dueKeyOf(t)<tk&&<span style={{color:'var(--red)',fontWeight:700}}>⚠ atrasada</span>}
                        <span>{t.listName}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{textAlign:'center',marginTop:8}}>
                  <button className="btn ghost sm" onClick={()=>setPage('tarefas')}>Ver todas →</button>
                </div>
              </div>
            )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!wtok&&(
        <div className="card">
          <Empty ico="⚡" title="WHOOP não conectado" desc="Conecte para ver recovery, sono, strain e treinos em tempo real" action="Conectar WHOOP" onAction={connect.whoop}/>
        </div>
      )}
    </div>
  );
}
function ZoneBar({z}){
  if(!z)return null;
  const zones=[
    {v:z.zone_one_milli||0,c:'#4b5563'},
    {v:z.zone_two_milli||0,c:'#60a5fa'},
    {v:z.zone_three_milli||0,c:'#34d399'},
    {v:z.zone_four_milli||0,c:'#fbbf24'},
    {v:z.zone_five_milli||0,c:'#f87171'},
  ];
  const tot=zones.reduce((a,x)=>a+x.v,0);
  if(!tot)return null;
  return(
    <div title="Zonas de FC 1→5" style={{display:'flex',height:4,borderRadius:2,overflow:'hidden',marginTop:5,width:90,marginLeft:'auto'}}>
      {zones.map((x,i)=><div key={i} style={{width:(x.v/tot*100)+'%',background:x.c}}/>)}
    </div>
  );
}

// ============================ PÁGINA: SAÚDE ============================
function SaudePage({whoop,connect}){
  const wtok=getTokens();
  const wd=whoop&&whoop.data;
  if(!wtok)return(
    <div className="page">
      <div className="ph"><div className="pt">Saúde</div><div className="ps">Corpo, sono, treinos e tendências</div></div>
      <div className="card"><Empty ico="⚡" title="WHOOP não conectado" desc="Conecte sua conta para desbloquear todas as métricas" action="Conectar WHOOP" onAction={connect.whoop}/></div>
    </div>
  );
  if(whoop&&whoop.loading&&!wd)return(
    <div className="page"><div className="ph"><div className="pt">Saúde</div></div><div className="card" style={{padding:50}}><div className="spin"/><div style={{textAlign:'center',marginTop:14,fontSize:12,color:'var(--t3)'}}>Carregando dados do WHOOP…</div></div></div>
  );

  const cr=wd&&wd.cycle_recovery&&wd.cycle_recovery.score;
  const cyc=wd&&wd.cycles&&wd.cycles.records&&wd.cycles.records[0]&&wd.cycles.records[0].score;
  const sleepRec=pickSleep(wd),ss=sleepRec&&sleepRec.score;
  const st=ss&&ss.stage_summary;
  const need=ss&&ss.sleep_needed;
  const recS=seriesRecovery(wd||{}),slpS=seriesSleep(wd||{}),strS=seriesStrain(wd||{});
  const prs=personalRecords(wd||{});
  const workouts=((wd&&wd.workouts&&wd.workouts.records)||[]).filter(w=>w.score).slice(0,8);
  const body=wd&&wd.body&&!wd.body._error?wd.body:null;

  // Médias 7d vs 7d anteriores vs 30d
  function rowAvg(arr,key,fmt){
    const a7=avgOf(arr,key,7),p7=avgRange(arr,key,7,14),a30=avgOf(arr,key,30);
    const t=trend(a7,p7);
    return {a7:a7!==null?fmt(a7):'–',p7:p7!==null?fmt(p7):'–',a30:a30!==null?fmt(a30):'–',t};
  }
  const f0=v=>Math.round(v)+'',f1=v=>(Math.round(v*10)/10).toFixed(1),fp=v=>Math.round(v)+'%';
  const avgs=[
    {l:'Recovery',...rowAvg(recS,'rec',fp),goodUp:true},
    {l:'HRV (ms)',...rowAvg(recS,'hrv',f0),goodUp:true},
    {l:'RHR (bpm)',...rowAvg(recS,'rhr',f0),goodUp:false},
    {l:'Strain',...rowAvg(strS,'strain',f1),goodUp:null},
    {l:'Sono (perf.)',...rowAvg(slpS,'perf',fp),goodUp:true},
    {l:'Sono (horas)',...rowAvg(slpS,'hours',f1),goodUp:true},
  ];
  const labels=recS.slice(-30).map(r=>fmtDM(r.date));
  const slLabels=slpS.slice(-30).map(r=>fmtDM(r.date));
  const stLabels=strS.slice(-30).map(r=>fmtDM(r.date));

  const asleepMs=st?(st.total_light_sleep_time_milli||0)+(st.total_slow_wave_sleep_time_milli||0)+(st.total_rem_sleep_time_milli||0):0;
  const inBedMs=st?asleepMs+(st.total_awake_time_milli||0):0;
  const stages=st?[
    {l:'Leve',v:st.total_light_sleep_time_milli||0,c:'#60a5fa'},
    {l:'Profundo (SWS)',v:st.total_slow_wave_sleep_time_milli||0,c:'#6366f1'},
    {l:'REM',v:st.total_rem_sleep_time_milli||0,c:'#a78bfa'},
    {l:'Acordado',v:st.total_awake_time_milli||0,c:'#3b3d45'},
  ]:[];

  const yR=recS.length>1?recS[recS.length-2]:null;
  const metrics=[
    {l:'Recovery',v:cr?Math.round(cr.recovery_score)+'%':'–',c:scoreColor(cr&&cr.recovery_score),t:trend(cr&&cr.recovery_score,yR&&yR.rec),gu:true},
    {l:'HRV',v:cr?Math.round(cr.hrv_rmssd_milli)+' ms':'–',c:'var(--violet)',t:trend(cr&&cr.hrv_rmssd_milli,yR&&yR.hrv),gu:true},
    {l:'RHR',v:cr?Math.round(cr.resting_heart_rate)+' bpm':'–',c:'var(--blue)',t:trend(cr&&cr.resting_heart_rate,yR&&yR.rhr),gu:false},
    {l:'SpO2',v:cr&&cr.spo2_percentage?Math.round(cr.spo2_percentage)+'%':'–',c:'var(--cyan)'},
    {l:'Temp. pele',v:cr&&cr.skin_temp_celsius?cr.skin_temp_celsius.toFixed(1)+'°C':'–',c:'var(--amber)'},
    {l:'Resp. (sono)',v:ss&&ss.respiratory_rate?ss.respiratory_rate.toFixed(1)+' rpm':'–',c:'var(--green)'},
    {l:'Calorias (ciclo)',v:cyc?kcal(cyc.kilojoule)+' kcal':'–',c:'var(--orange)'},
    {l:'FC máx (ciclo)',v:cyc?Math.round(cyc.max_heart_rate)+' bpm':'–',c:'var(--red)'},
  ];

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3,flexWrap:'wrap'}}>
          <div className="pt">Saúde</div>
          <div className="live">WHOOP</div>
          <RefreshBtn state={whoop}/>
        </div>
        <div className="ps">Corpo, sono, treinos e tendências{body?' · '+(body.weight_kilogram?body.weight_kilogram.toFixed(1)+'kg':''):''}</div>
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        {metrics.map(m=>(
          <div key={m.l} className="card">
            <div className="ct">{m.l}</div>
            <div className="mv" style={{color:m.c,fontSize:22}}>{m.v}</div>
            {m.t!==undefined&&<TrendTag t={m.t} goodUp={m.gu}/>}
          </div>
        ))}
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Sono da última noite</div>
          {!ss?<Empty ico="🌙" title="Sem registro" desc="Nenhum sono com score encontrado"/>:(
            <div>
              <div style={{display:'flex',gap:22,marginBottom:14,flexWrap:'wrap'}}>
                <div><div className="mv" style={{color:'var(--blue)',fontSize:24}}>{Math.round(ss.sleep_performance_percentage)}%</div><div style={{fontSize:10.5,color:'var(--t3)',marginTop:3}}>Performance</div></div>
                <div><div className="mv" style={{fontSize:24}}>{hmFromMs(asleepMs)}</div><div style={{fontSize:10.5,color:'var(--t3)',marginTop:3}}>Dormidas ({hmFromMs(inBedMs)} na cama)</div></div>
                {ss.sleep_efficiency_percentage!==undefined&&<div><div className="mv" style={{fontSize:24,color:'var(--green)'}}>{Math.round(ss.sleep_efficiency_percentage)}%</div><div style={{fontSize:10.5,color:'var(--t3)',marginTop:3}}>Eficiência</div></div>}
                {ss.sleep_consistency_percentage!==undefined&&<div><div className="mv" style={{fontSize:24,color:'var(--violet)'}}>{Math.round(ss.sleep_consistency_percentage)}%</div><div style={{fontSize:10.5,color:'var(--t3)',marginTop:3}}>Consistência</div></div>}
              </div>
              {inBedMs>0&&(
                <div>
                  <div style={{display:'flex',height:12,borderRadius:6,overflow:'hidden',marginBottom:8}}>
                    {stages.map(s=><div key={s.l} style={{width:(s.v/inBedMs*100)+'%',background:s.c}}/>)}
                  </div>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    {stages.map(s=>(
                      <div key={s.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:10.5,color:'var(--t3)'}}>
                        <div style={{width:8,height:8,borderRadius:2,background:s.c}}/>{s.l} {hmFromMs(s.v)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {need&&(
                <div style={{marginTop:14,padding:'10px 12px',background:'var(--s2)',borderRadius:10,fontSize:11.5,color:'var(--t2)',lineHeight:1.8}}>
                  <b style={{color:'var(--t)'}}>Necessidade de sono:</b> base {hmFromMs(need.baseline_milli)}
                  {need.need_from_sleep_debt_milli>0&&<span> + <b style={{color:'var(--amber)'}}>{hmFromMs(need.need_from_sleep_debt_milli)} de débito</b></span>}
                  {need.need_from_recent_strain_milli>0&&<span> + {hmFromMs(need.need_from_recent_strain_milli)} pelo strain</span>}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="card">
          <div className="ct">Recovery — 30 dias</div>
          <ChartBox labels={labels} datasets={[ds('Recovery %',recS.slice(-30).map(r=>Math.round(r.rec)),'#34d399','rgba(52,211,153,.1)')]} opts={{scales:{y:{min:0,max:100,ticks:{color:'#5f6169',font:{size:9.5}},grid:{color:'rgba(255,255,255,.04)'}},x:{ticks:{color:'#5f6169',font:{size:9.5},maxTicksLimit:8},grid:{color:'rgba(255,255,255,.04)'}}}}}/>
        </div>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">HRV × RHR — 30 dias</div>
          <ChartBox labels={labels} datasets={[ds('HRV (ms)',recS.slice(-30).map(r=>Math.round(r.hrv)),'#a78bfa'),ds('RHR (bpm)',recS.slice(-30).map(r=>Math.round(r.rhr)),'#60a5fa')]}/>
        </div>
        <div className="card">
          <div className="ct">Strain — 30 dias</div>
          <ChartBox type="bar" labels={stLabels} datasets={[{label:'Strain',data:strS.slice(-30).map(r=>Math.round(r.strain*10)/10),backgroundColor:'rgba(251,146,60,.55)',borderRadius:4}]} opts={{plugins:{legend:{display:false}}}}/>
        </div>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Sono — 30 dias</div>
          <ChartBox labels={slLabels} datasets={[ds('Performance %',slpS.slice(-30).map(r=>Math.round(r.perf)),'#60a5fa'),ds('Horas',slpS.slice(-30).map(r=>Math.round(r.hours*10)/10),'#a78bfa')]}/>
        </div>
        <div className="card">
          <div className="ct">Médias — semana × semana anterior × mês</div>
          <table className="tbl">
            <thead><tr><th>Métrica</th><th>7 dias</th><th>7 anteriores</th><th>30 dias</th><th>Δ</th></tr></thead>
            <tbody>
              {avgs.map(a=>{
                const col=!a.t||a.goodUp===null?'var(--t3)':(a.t.up===a.goodUp?'var(--green)':'var(--red)');
                return(
                  <tr key={a.l}>
                    <td style={{color:'var(--t2)',fontWeight:600}}>{a.l}</td>
                    <td style={{fontWeight:700}}>{a.a7}</td>
                    <td style={{color:'var(--t3)'}}>{a.p7}</td>
                    <td style={{color:'var(--t3)'}}>{a.a30}</td>
                    <td style={{color:col,fontWeight:700,fontSize:11}}>{a.t?(a.t.up?'▲':'▼')+a.t.pct+'%':'—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">🏆 Recordes pessoais (período carregado)</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {l:'Melhor recovery',r:prs.rec,c:'var(--green)'},
              {l:'Maior HRV',r:prs.hrv,c:'var(--violet)'},
              {l:'Maior strain (dia)',r:prs.strain,c:'var(--orange)'},
              {l:'Sono mais longo',r:prs.sleep,c:'var(--blue)'},
              {l:'Treino mais intenso',r:prs.workout,c:'var(--red)'},
            ].map(x=>(
              <div key={x.l} style={{background:'var(--s2)',borderRadius:10,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:.6,marginBottom:4}}>{x.l}</div>
                <div style={{fontSize:16,fontWeight:800,color:x.c}}>{x.r?x.r.v:'–'}</div>
                {x.r&&<div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{fmtDM(x.r.d)}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ct">Treinos recentes</div>
          {workouts.length===0?<Empty ico="🏋️" title="Sem treinos" desc="Nenhum treino registrado no período"/>:(
            <div style={{maxHeight:300,overflowY:'auto'}}>
              {workouts.map(w=>(
                <div key={w.id} style={{display:'flex',alignItems:'center',gap:11,padding:'8px 6px',borderBottom:'1px solid var(--b)'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'var(--abg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{sportIcon(w)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600}}>{sportName(w)}</div>
                    <div style={{fontSize:10.5,color:'var(--t3)'}}>{fmtDM(w.start)} · {fmtT(w.start)} · {hmFromMs(new Date(w.end)-new Date(w.start))}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:13,fontWeight:800,color:'var(--orange)'}}>{(Math.round(w.score.strain*10)/10).toFixed(1)}</div>
                    <div style={{fontSize:10,color:'var(--t3)'}}>{kcal(w.score.kilojoule)} kcal · {Math.round(w.score.average_heart_rate)}bpm</div>
                    <ZoneBar z={w.score.zone_duration}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ============================ PÁGINA: TAREFAS ============================
function TarefasPage({google,taskAction,connect}){
  const gtok=getGoogleTokens();
  const gd=google&&google.data;
  const[filter,setFilter]=useState('todas');
  const[q,setQ]=useState('');
  const[editing,setEditing]=useState(null);   // tarefa no modal
  const[creating,setCreating]=useState(null); // listId da criação rápida em andamento
  const[newTitle,setNewTitle]=useState('');
  const[showDone,setShowDone]=useState({});
  const[listModal,setListModal]=useState(false);
  const[newListName,setNewListName]=useState('');

  if(!gtok)return(
    <div className="page">
      <div className="ph"><div className="pt">Tarefas</div><div className="ps">Seu centro de produtividade</div></div>
      <div className="card"><Empty ico="✓" title="Google Tasks não conectado" desc="Conecte sua conta Google para gerenciar todas as suas listas aqui" action="Conectar Google" onAction={connect.google}/></div>
    </div>
  );

  const lists=(gd&&gd.task_lists)||[];
  const tasks=(gd&&gd.tasks)||[];
  const tk=todayKey();
  const week=dayKey(addDays(new Date(),7));

  function matches(t){
    if(q&&!(t.title.toLowerCase().includes(q.toLowerCase())||(t.notes||'').toLowerCase().includes(q.toLowerCase())))return false;
    const dk=dueKeyOf(t);
    if(filter==='hoje')return !t.done&&dk===tk;
    if(filter==='atrasadas')return !t.done&&dk&&dk<tk;
    if(filter==='semana')return !t.done&&dk&&dk>=tk&&dk<=week;
    return true;
  }

  const pend=tasks.filter(t=>!t.done);
  const overdue=pend.filter(t=>dueKeyOf(t)&&dueKeyOf(t)<tk);
  const dueToday=pend.filter(t=>dueKeyOf(t)===tk);
  const doneWeek=tasks.filter(t=>t.done&&t.completed&&t.completed.slice(0,10)>=dayKey(addDays(new Date(),-7))).length;

  // Agrupa por lista, com subtarefas aninhadas
  function listTasks(listId){
    const all=tasks.filter(t=>t.listId===listId&&matches(t));
    const tk2=todayKey();
    const parents=all.filter(t=>!t.parent).sort((a,b)=>{
      const la=!a.done&&dueKeyOf(a)&&dueKeyOf(a)<tk2,lb=!b.done&&dueKeyOf(b)&&dueKeyOf(b)<tk2;
      if(la!==lb)return la?-1:1;
      return (a.position||'').localeCompare(b.position||'');
    });
    const kids={};
    all.filter(t=>t.parent).forEach(t=>{(kids[t.parent]=kids[t.parent]||[]).push(t)});
    return {parents,kids};
  }

  function quickAdd(listId){
    if(!newTitle.trim())return;
    taskAction('create',{listId,title:newTitle.trim()});
    setNewTitle('');setCreating(null);
  }

  function TaskRow({t,sub,kids}){
    return(
      <div>
        <div className={'task '+(sub?'sub':'')}>
          <div className={'cb '+(t.done?'done':'')} onClick={e=>{e.stopPropagation();taskAction('toggle',t)}}>
            {t.done&&<svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <div style={{flex:1,minWidth:0}} onClick={()=>setEditing({...t})}>
            <div className={'tt '+(t.done?'done':'')}>{t.title}</div>
            {(t.due||t.notes)&&(
              <div className="tmeta">
                {t.due&&<span className={'badge '+(dueKeyOf(t)<tk&&!t.done?'r-':dueKeyOf(t)===tk?'y-':'z-')} style={{fontSize:9.5}}>
                  {dueKeyOf(t)<tk&&!t.done?'⚠ ':''}{fmtDM(dueKeyOf(t)+'T12:00:00')}{t.due.includes('T00:00:00.000Z')?'':' '+fmtT(t.due)}
                </span>}
                {t.notes&&<span title={t.notes}>📝 {t.notes.length>36?t.notes.slice(0,36)+'…':t.notes}</span>}
              </div>
            )}
          </div>
        </div>
        {(kids[t.id]||[]).map(k=><TaskRow key={k.id} t={k} sub={true} kids={kids}/>)}
      </div>
    );
  }

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3,flexWrap:'wrap'}}>
          <div className="pt">Tarefas</div>
          <div className="live">Google Tasks</div>
          <RefreshBtn state={google}/>
        </div>
        <div className="ps">Todas as suas listas, sincronizadas em tempo real</div>
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        {[
          {l:'Pendentes',v:pend.length,c:'var(--a2)'},
          {l:'Para hoje',v:dueToday.length,c:'var(--amber)'},
          {l:'Atrasadas',v:overdue.length,c:overdue.length>0?'var(--red)':'var(--green)'},
          {l:'Concluídas (7d)',v:doneWeek,c:'var(--green)'},
        ].map(m=>(
          <div key={m.l} className="card"><div className="ct">{m.l}</div><div className="mv" style={{color:m.c}}>{m.v}</div></div>
        ))}
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <input className="input" style={{maxWidth:260}} placeholder="🔎 Buscar tarefas…" value={q} onChange={e=>setQ(e.target.value)}/>
        <Seg options={[{v:'todas',l:'Todas'},{v:'hoje',l:'Hoje'},{v:'semana',l:'Semana'},{v:'atrasadas',l:'Atrasadas'}]} value={filter} onChange={setFilter}/>
        <button className="btn sm" style={{marginLeft:'auto'}} onClick={()=>setListModal(true)}>+ Nova lista</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))',gap:14}}>
        {lists.map(l=>{
          const {parents,kids}=listTasks(l.id);
          const allInList=tasks.filter(t=>t.listId===l.id);
          const done=allInList.filter(t=>t.done).length;
          const open=parents.filter(t=>!t.done),closed=parents.filter(t=>t.done);
          return(
            <div key={l.id} className="card" style={{display:'flex',flexDirection:'column'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{fontSize:14,fontWeight:800,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</div>
                <div className="badge a-">{allInList.filter(t=>!t.done).length}</div>
                <button className="btn ghost sm" title="Renomear" onClick={()=>{const n=prompt('Novo nome da lista:',l.title);if(n&&n.trim()&&n!==l.title)taskAction('renameList',{listId:l.id,title:n.trim()})}}>✎</button>
                <button className="btn ghost sm" title="Excluir lista" onClick={()=>{if(confirm('Excluir a lista "'+l.title+'" e todas as suas tarefas?'))taskAction('deleteList',{listId:l.id})}}>🗑</button>
              </div>
              {allInList.length>0&&(
                <div className="pbar" style={{marginBottom:10}}><div className="pf" style={{width:(done/allInList.length*100)+'%',background:'var(--green)'}}/></div>
              )}
              {creating===l.id?(
                <div style={{display:'flex',gap:6,marginBottom:8}}>
                  <input autoFocus className="input" placeholder="Título da tarefa…" value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')quickAdd(l.id);if(e.key==='Escape'){setCreating(null);setNewTitle('')}}}/>
                  <button className="btn sm" onClick={()=>quickAdd(l.id)}>OK</button>
                </div>
              ):(
                <button className="btn ghost sm" style={{marginBottom:8,justifyContent:'flex-start'}} onClick={()=>{setCreating(l.id);setNewTitle('')}}>+ Adicionar tarefa</button>
              )}
              <div style={{flex:1,maxHeight:380,overflowY:'auto'}}>
                {open.length===0&&closed.length===0&&<div style={{fontSize:11.5,color:'var(--t3)',textAlign:'center',padding:'14px 0'}}>{q||filter!=='todas'?'Nada com esse filtro':'Lista vazia'}</div>}
                {open.map(t=><TaskRow key={t.id} t={t} kids={kids}/>)}
                {closed.length>0&&(
                  <div>
                    <div style={{fontSize:10.5,fontWeight:700,color:'var(--t3)',padding:'8px 10px 4px',cursor:'pointer',textTransform:'uppercase',letterSpacing:.6}} onClick={()=>setShowDone(p=>({...p,[l.id]:!p[l.id]}))}>
                      {showDone[l.id]?'▾':'▸'} Concluídas ({closed.length})
                    </div>
                    {showDone[l.id]&&closed.map(t=><TaskRow key={t.id} t={t} kids={kids}/>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Editar tarefa">
        {editing&&(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><div className="ct" style={{marginBottom:6}}>Título</div>
              <input className="input" value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/></div>
            <div><div className="ct" style={{marginBottom:6}}>Observações</div>
              <textarea className="input" value={editing.notes||''} onChange={e=>setEditing({...editing,notes:e.target.value})} placeholder="Detalhes, links, contexto…"/></div>
            <div className="g g2">
              <div><div className="ct" style={{marginBottom:6}}>Vencimento</div>
                <input type="date" className="input" value={dueKeyOf(editing)||''} onChange={e=>setEditing({...editing,due:e.target.value?e.target.value+'T00:00:00.000Z':null})}/></div>
              <div><div className="ct" style={{marginBottom:6}}>Lista</div>
                <select className="input" value={editing.listId} onChange={e=>setEditing({...editing,_moveTo:e.target.value,listId:e.target.value})}>
                  {lists.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}
                </select></div>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:4}}>
              <button className="btn danger sm" onClick={()=>{if(confirm('Excluir esta tarefa?')){const orig=tasks.find(x=>x.id===editing.id);taskAction('delete',{listId:(orig||editing).listId,taskId:editing.id});setEditing(null)}}}>Excluir</button>
              <div style={{display:'flex',gap:8}}>
                <button className="btn sm" onClick={()=>{taskAction('create',{listId:editing.listId,title:'Subtarefa de: '+editing.title,parent:editing.id});setEditing(null)}}>+ Subtarefa</button>
                <button className="btn" onClick={()=>{
                  const orig=tasks.find(x=>x.id===editing.id);
                  if(orig){
                    if(editing.title!==orig.title||((editing.notes||'')!==(orig.notes||''))||editing.due!==orig.due){
                      taskAction('update',{listId:orig.listId,taskId:editing.id,title:editing.title,notes:editing.notes||'',due:editing.due||null});
                    }
                    if(editing._moveTo&&editing._moveTo!==orig.listId){
                      taskAction('move',{listId:orig.listId,taskId:editing.id,toListId:editing._moveTo});
                    }
                  }
                  setEditing(null);
                }}>Salvar</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={listModal} onClose={()=>setListModal(false)} title="Nova lista">
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <input autoFocus className="input" placeholder="Nome da lista…" value={newListName} onChange={e=>setNewListName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&newListName.trim()){taskAction('createList',{title:newListName.trim()});setNewListName('');setListModal(false)}}}/>
          <button className="btn" onClick={()=>{if(newListName.trim()){taskAction('createList',{title:newListName.trim()});setNewListName('');setListModal(false)}}}>Criar lista</button>
        </div>
      </Modal>
    </div>
  );
}
// ============================ PÁGINA: AGENDA ============================
function AgendaPage({google,connect}){
  const gtok=getGoogleTokens();
  const gd=google&&google.data;
  const NOW=new Date();
  const[view,setView]=useState('mes');
  const[sel,setSel]=useState(new Date());
  const[refM,setRefM]=useState(new Date(NOW.getFullYear(),NOW.getMonth(),1));

  const events=(gd&&gd.events)||[];
  const tasks=(gd&&gd.tasks)||[];

  function evsOn(d){return events.filter(e=>sameDay(new Date(e.start),d)).sort((a,b)=>new Date(a.start)-new Date(b.start))}
  function tasksOn(d){const dk=dayKey(d);return tasks.filter(t=>!t.done&&dueKeyOf(t)===dk)}

  if(!gtok)return(
    <div className="page">
      <div className="ph"><div className="pt">Agenda</div><div className="ps">Seu calendário, ao vivo</div></div>
      <div className="card"><Empty ico="📅" title="Google Calendar não conectado" desc="Conecte sua conta para ver todos os seus eventos" action="Conectar Google" onAction={connect.google}/></div>
    </div>
  );

  const upcoming=events.filter(e=>new Date(e.start)>=new Date(NOW.getFullYear(),NOW.getMonth(),NOW.getDate())).slice(0,10);

  // Mês
  const year=refM.getFullYear(),month=refM.getMonth();
  const firstDow=(new Date(year,month,1).getDay()+6)%7;
  const daysIn=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDow;i++)cells.push(null);
  for(let d=1;d<=daysIn;d++)cells.push(new Date(year,month,d));

  // Semana
  const wStart=weekMonday(sel);
  const weekDays=Array.from({length:7}).map((_,i)=>addDays(wStart,i));

  const selEvs=evsOn(sel),selTasks=tasksOn(sel);

  function DayAgenda({d}){
    const evs=evsOn(d),tks=tasksOn(d);
    return(
      <div>
        {evs.length===0&&tks.length===0&&<div style={{fontSize:12,color:'var(--t3)',textAlign:'center',padding:'18px 0'}}>Nada agendado</div>}
        {evs.map(e=>{
          const isNow=!e.allDay&&new Date(e.start)<=NOW&&new Date(e.end)>NOW;
          return(
            <div key={e.id} className="ev">
              <div className="evb" style={{background:isNow?'var(--green)':evColor(e)}}/>
              <div className="evt">{e.allDay?'dia':fmtT(e.start)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12.5,fontWeight:600}}>{e.summary}</div>
                <div style={{fontSize:10.5,color:'var(--t3)'}}>
                  {!e.allDay&&fmtT(e.start)+' – '+fmtT(e.end)}{e.location?' · '+e.location:''}
                  {isNow&&<span style={{color:'var(--green)',fontWeight:700}}> · AGORA</span>}
                </div>
              </div>
            </div>
          );
        })}
        {tks.length>0&&(
          <div style={{marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:.6,padding:'4px 10px'}}>Tarefas com prazo</div>
            {tks.map(t=>(
              <div key={t.id} className="ev">
                <div className="evb" style={{background:'var(--violet)'}}/>
                <div className="evt">✓</div>
                <div style={{fontSize:12.5,fontWeight:600}}>{t.title}<span style={{fontSize:10.5,color:'var(--t3)',fontWeight:400}}> · {t.listName}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3,flexWrap:'wrap'}}>
          <div className="pt">Agenda</div>
          <div className="live">Google Calendar</div>
          <RefreshBtn state={google}/>
          <div style={{marginLeft:'auto'}}><Seg options={[{v:'mes',l:'Mês'},{v:'semana',l:'Semana'},{v:'dia',l:'Dia'}]} value={view} onChange={setView}/></div>
        </div>
        <div className="ps">{events.length} eventos no período</div>
      </div>

      {view==='mes'&&(
        <div className="g g23" style={{marginBottom:14}}>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div style={{fontSize:15,fontWeight:800}}>{MESES[month]} {year}</div>
              <div style={{display:'flex',gap:6}}>
                <button className="btn ghost sm" onClick={()=>setRefM(new Date(year,month-1,1))}>←</button>
                <button className="btn ghost sm" onClick={()=>{setRefM(new Date(NOW.getFullYear(),NOW.getMonth(),1));setSel(new Date())}}>Hoje</button>
                <button className="btn ghost sm" onClick={()=>setRefM(new Date(year,month+1,1))}>→</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
              {WD_M.map(d=><div key={d} className="cwd">{d}</div>)}
              {cells.map((d,i)=>{
                if(!d)return <div key={'e'+i}/>;
                const n=evsOn(d).length,nt=tasksOn(d).length;
                const isT=sameDay(d,NOW),isS=sameDay(d,sel);
                return(
                  <div key={i} className={'cd '+(isT?'today ':'')+(isS?'sel':'')} onClick={()=>{setSel(d)}}>
                    <div>{d.getDate()}</div>
                    <div className="dts">
                      {n>0&&<div className="dt"/>}
                      {n>1&&<div className="dt"/>}
                      {nt>0&&<div className="dt" style={{background:'var(--violet)'}}/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card">
            <div className="ct" style={{textTransform:'capitalize'}}>{sel.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div>
            <div style={{maxHeight:400,overflowY:'auto'}}><DayAgenda d={sel}/></div>
          </div>
        </div>
      )}

      {view==='semana'&&(
        <div className="card" style={{marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:800}}>{fmtDM(weekDays[0])} – {fmtDM(weekDays[6])}</div>
            <div style={{display:'flex',gap:6}}>
              <button className="btn ghost sm" onClick={()=>setSel(addDays(sel,-7))}>←</button>
              <button className="btn ghost sm" onClick={()=>setSel(new Date())}>Hoje</button>
              <button className="btn ghost sm" onClick={()=>setSel(addDays(sel,7))}>→</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
            {weekDays.map((d,i)=>{
              const evs=evsOn(d),tks=tasksOn(d),isT=sameDay(d,NOW);
              return(
                <div key={i} style={{background:isT?'var(--abg)':'var(--s2)',borderRadius:12,padding:'10px 8px',minHeight:140,border:isT?'1px solid rgba(99,102,241,.3)':'1px solid transparent'}}>
                  <div style={{fontSize:10,fontWeight:700,color:isT?'var(--a2)':'var(--t3)',textTransform:'uppercase',marginBottom:6,textAlign:'center'}}>{WD_M[i]} {d.getDate()}</div>
                  {evs.slice(0,4).map(e=>(
                    <div key={e.id} style={{fontSize:10.5,padding:'3px 6px',background:'var(--s3)',borderRadius:6,marginBottom:3,borderLeft:'2px solid '+evColor(e),overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {!e.allDay&&<b>{fmtT(e.start)} </b>}{e.summary}
                    </div>
                  ))}
                  {tks.slice(0,2).map(t=>(
                    <div key={t.id} style={{fontSize:10.5,padding:'3px 6px',background:'var(--s3)',borderRadius:6,marginBottom:3,borderLeft:'2px solid var(--violet)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>✓ {t.title}</div>
                  ))}
                  {(evs.length>4||tks.length>2)&&<div style={{fontSize:9.5,color:'var(--t3)',textAlign:'center'}}>+{Math.max(0,evs.length-4)+Math.max(0,tks.length-2)} mais</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view==='dia'&&(
        <div className="card" style={{marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:800,textTransform:'capitalize'}}>{sel.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div>
            <div style={{display:'flex',gap:6}}>
              <button className="btn ghost sm" onClick={()=>setSel(addDays(sel,-1))}>←</button>
              <button className="btn ghost sm" onClick={()=>setSel(new Date())}>Hoje</button>
              <button className="btn ghost sm" onClick={()=>setSel(addDays(sel,1))}>→</button>
            </div>
          </div>
          <DayAgenda d={sel}/>
        </div>
      )}

      <div className="card">
        <div className="ct">Próximos eventos</div>
        {upcoming.length===0?<Empty ico="🌤️" title="Agenda livre" desc="Nenhum evento futuro no período"/>:(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:8}}>
            {upcoming.map(e=>(
              <div key={e.id} className="ev" style={{background:'var(--s2)',borderRadius:10}}>
                <div className="evb" style={{background:evColor(e)}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.summary}</div>
                  <div style={{fontSize:10.5,color:'var(--t3)',textTransform:'capitalize'}}>{new Date(e.start).toLocaleDateString('pt-BR',{weekday:'short',day:'numeric',month:'short'})}{!e.allDay?' · '+fmtT(e.start):''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================ PÁGINA: HÁBITOS ============================
function HabitosPage({habitLog,toggleHabit,habitDefs,setHabitDefs}){
  const[manage,setManage]=useState(false);
  const[draft,setDraft]=useState(null); // cópia editável
  const NOW=new Date();
  function openManage(){setDraft(habitDefs.map(h=>({...h})));setManage(true)}
  function saveManage(){
    const clean=draft.filter(h=>h.name.trim()).map(h=>({id:h.id,name:h.name.trim(),ico:(h.ico||'✅').trim()||'✅'}));
    if(clean.length===0)return alert('Mantenha pelo menos 1 hábito.');
    setHabitDefs(clean);setManage(false);
  }
  function mv(i,dir){
    const d=draft.slice();const j=i+dir;
    if(j<0||j>=d.length)return;
    const t=d[i];d[i]=d[j];d[j]=t;setDraft(d);
  }
  const tk=todayKey();
  const wStart=weekMonday(NOW);
  const weekDays=Array.from({length:7}).map((_,i)=>addDays(wStart,i));
  const todayIdx=(NOW.getDay()+6)%7;

  const rate7=DEFS.list.reduce((a,h)=>a+habitRate(habitLog,h.id,7),0)/DEFS.list.length;
  const rate30=DEFS.list.reduce((a,h)=>a+habitRate(habitLog,h.id,30),0)/DEFS.list.length;
  const streaks=DEFS.list.map(h=>({...h,streak:habitStreak(habitLog,h.id),r30:habitRate(habitLog,h.id,30)}));
  const maxStreak=Math.max(...streaks.map(s=>s.streak),0);
  const sorted=streaks.slice().sort((a,b)=>b.r30-a.r30);
  const best=sorted.slice(0,3),worst=sorted.slice(-3).reverse();

  // Heatmap: últimas 10 semanas (70 dias), colunas = semanas
  const heatWeeks=[];
  for(let w=9;w>=0;w--){
    const ws=addDays(wStart,-7*w);
    heatWeeks.push(Array.from({length:7}).map((_,i)=>{
      const d=addDays(ws,i);
      if(d>NOW)return null;
      return {dk:dayKey(d),score:dayScore(habitLog,dayKey(d))};
    }));
  }
  function heatColor(v){
    if(v===null)return'transparent';
    if(v===0)return'var(--s2)';
    if(v<.35)return'rgba(99,102,241,.25)';
    if(v<.65)return'rgba(99,102,241,.55)';
    if(v<.9)return'rgba(99,102,241,.8)';
    return'#818cf8';
  }

  // Evolução semanal (8 semanas): média do dayScore
  const weekScores=[];
  for(let w=7;w>=0;w--){
    const ws=addDays(wStart,-7*w);
    let sum=0,n=0;
    for(let i=0;i<7;i++){const d=addDays(ws,i);if(d<=NOW){sum+=dayScore(habitLog,dayKey(d));n++}}
    weekScores.push({l:fmtDM(ws),v:n?Math.round(sum/n*100):0});
  }

  const doneToday=DEFS.list.filter(h=>habitDone(habitLog,tk,h.id)).length;

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div className="pt">Hábitos</div>
          <button className="btn ghost sm" style={{marginLeft:'auto'}} onClick={openManage}>✎ Gerenciar hábitos</button>
        </div>
        <div className="ps">Disciplina diária — {DEFS.list.length} hábitos ativos</div>
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        {[
          {l:'Hoje',v:doneToday+'/'+DEFS.list.length,c:'var(--a2)'},
          {l:'Taxa 7 dias',v:Math.round(rate7*100)+'%',c:scoreColor(rate7*100)},
          {l:'Taxa 30 dias',v:Math.round(rate30*100)+'%',c:scoreColor(rate30*100)},
          {l:'Maior sequência',v:maxStreak+'d 🔥',c:'var(--amber)'},
        ].map(m=>(
          <div key={m.l} className="card"><div className="ct">{m.l}</div><div className="mv" style={{color:m.c}}>{m.v}</div></div>
        ))}
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <div className="ct" style={{marginBottom:0}}>Esta semana</div>
          <div style={{display:'flex',gap:4}}>
            {WD_M.map((d,i)=><div key={d} style={{width:26,textAlign:'center',fontSize:9.5,fontWeight:700,color:i===todayIdx?'var(--a2)':'var(--t3)'}}>{d}</div>)}
            <div style={{width:44}}/>
          </div>
        </div>
        {DEFS.list.map(h=>{
          const stk=habitStreak(habitLog,h.id);
          return(
            <div key={h.id} className="hrow">
              <div className="hname"><span style={{fontSize:14}}>{h.ico}</span><span>{h.name}</span></div>
              <div style={{display:'flex',gap:4}}>
                {weekDays.map((d,i)=>{
                  const fut=d>NOW&&!sameDay(d,NOW);
                  const dk=dayKey(d);
                  const done=habitDone(habitLog,dk,h.id);
                  return(
                    <div key={i} className={'hcell '+(done?'done ':'')+(sameDay(d,NOW)?'tdy ':'')+(fut?'fut':'')} onClick={()=>!fut&&toggleHabit(dk,h.id)}>✓</div>
                  );
                })}
              </div>
              <div className="hstreak">{stk>0?'🔥'+stk:'–'}</div>
            </div>
          );
        })}
        <div style={{fontSize:10.5,color:'var(--t3)',marginTop:10}}>Clique para marcar qualquer dia da semana — salvo automaticamente no aparelho</div>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Consistência — 10 semanas</div>
          <div style={{display:'flex',gap:4,alignItems:'flex-start'}}>
            <div style={{display:'flex',flexDirection:'column',gap:4,paddingTop:0}}>
              {WD_M.map(d=><div key={d} style={{height:18,fontSize:8.5,color:'var(--t3)',display:'flex',alignItems:'center'}}>{d.slice(0,1)}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:4,flex:1}}>
              {Array.from({length:7}).map((_,row)=>
                heatWeeks.map((wk,col)=>{
                  const c=wk[row];
                  return <div key={col+'-'+row} className="heat" title={c?c.dk+' · '+Math.round(c.score*100)+'%':''} style={{background:heatColor(c?c.score:null),height:18,gridRow:row+1,gridColumn:col+1}}/>;
                })
              )}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:12}}>
            <span style={{fontSize:10,color:'var(--t3)'}}>Menos</span>
            {['var(--s2)','rgba(99,102,241,.25)','rgba(99,102,241,.55)','rgba(99,102,241,.8)','#818cf8'].map((c,i)=><div key={i} style={{width:12,height:12,borderRadius:3,background:c}}/>)}
            <span style={{fontSize:10,color:'var(--t3)'}}>Mais</span>
          </div>
        </div>
        <div className="card">
          <div className="ct">Evolução semanal</div>
          <ChartBox type="bar" labels={weekScores.map(w=>w.l)} datasets={[{label:'Pontuação %',data:weekScores.map(w=>w.v),backgroundColor:'rgba(99,102,241,.6)',borderRadius:5}]} opts={{plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{color:'#5f6169',font:{size:9.5}},grid:{color:'rgba(255,255,255,.04)'}},x:{ticks:{color:'#5f6169',font:{size:9.5}},grid:{display:false}}}}}/>
        </div>
      </div>

      <div className="g g2">
        <div className="card">
          <div className="ct">🏆 Melhores hábitos (30d)</div>
          {best.map(h=>(
            <div key={h.id} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}>
                <span>{h.ico} {h.name}</span><b style={{color:'var(--green)'}}>{Math.round(h.r30*100)}%</b>
              </div>
              <div className="pbar"><div className="pf" style={{width:(h.r30*100)+'%',background:'var(--green)'}}/></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ct">🎯 Precisam de atenção (30d)</div>
          {worst.map(h=>(
            <div key={h.id} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4}}>
                <span>{h.ico} {h.name}</span><b style={{color:h.r30<.4?'var(--red)':'var(--amber)'}}>{Math.round(h.r30*100)}%</b>
              </div>
              <div className="pbar"><div className="pf" style={{width:(h.r30*100)+'%',background:h.r30<.4?'var(--red)':'var(--amber)'}}/></div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={manage} onClose={()=>setManage(false)} title="Gerenciar hábitos">
        {draft&&(
          <div>
            <div style={{fontSize:11,color:'var(--t3)',marginBottom:12}}>Emoji · nome · reordenar · excluir. O histórico de dias marcados é preservado.</div>
            <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:'50vh',overflowY:'auto'}}>
              {draft.map((h,i)=>(
                <div key={h.id} style={{display:'flex',gap:6,alignItems:'center'}}>
                  <input className="input" style={{width:46,textAlign:'center',padding:'7px 4px'}} value={h.ico} onChange={e=>{const d=draft.slice();d[i]={...h,ico:e.target.value};setDraft(d)}}/>
                  <input className="input" value={h.name} onChange={e=>{const d=draft.slice();d[i]={...h,name:e.target.value};setDraft(d)}}/>
                  <button className="btn ghost sm" onClick={()=>mv(i,-1)} disabled={i===0}>↑</button>
                  <button className="btn ghost sm" onClick={()=>mv(i,1)} disabled={i===draft.length-1}>↓</button>
                  <button className="btn ghost sm" style={{color:'var(--red)'}} onClick={()=>{if(confirm('Excluir "'+h.name+'"?'))setDraft(draft.filter(x=>x.id!==h.id))}}>🗑</button>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,marginTop:14,justifyContent:'space-between'}}>
              <button className="btn ghost sm" onClick={()=>setDraft(draft.concat([{id:'h'+Date.now().toString(36),name:'',ico:'✅'}]))}>+ Adicionar hábito</button>
              <button className="btn" onClick={saveManage}>Salvar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
function SettingsModal({open,onClose,syncState,onActivate,onDeactivate,onSyncNow,habitLog}){
  const[pin,setPin]=useState(getSyncKey()||'');
  return(
    <Modal open={open} onClose={onClose} title="⚙️ Ajustes">
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        <div>
          <div className="ct" style={{marginBottom:6}}>Sincronização entre dispositivos</div>
          <div style={{fontSize:11.5,color:'var(--t2)',lineHeight:1.6,marginBottom:10}}>
            Com o PIN ativo, conexões (WHOOP/Google) e hábitos ficam salvos no servidor — conecte uma vez e use no celular e no computador. Use o <b>mesmo PIN</b> em todos os aparelhos.
          </div>
          <div style={{display:'flex',gap:8}}>
            <input className="input" type="password" placeholder="PIN secreto (o mesmo do Vercel)" value={pin} onChange={e=>setPin(e.target.value)}/>
            {syncState.on
              ?<button className="btn danger sm" onClick={onDeactivate}>Desativar</button>
              :<button className="btn" onClick={()=>pin.trim()&&onActivate(pin.trim())}>Ativar</button>}
          </div>
          <div style={{fontSize:11,marginTop:8,color:syncState.err?'var(--red)':'var(--t3)'}}>
            {syncState.err?('⚠️ '+syncState.err):syncState.on?(syncState.at?('✓ Sincronizado '+timeAgo(syncState.at)):'Ativado'):'Desativado'}
            {syncState.on&&<button className="btn ghost sm" style={{marginLeft:8}} onClick={onSyncNow}>Sincronizar agora</button>}
          </div>
        </div>
        <div>
          <div className="ct" style={{marginBottom:6}}>Backup</div>
          <button className="btn ghost sm" onClick={()=>{
            const data={habit_log:habitLog,habit_defs:DEFS.list,exported_at:new Date().toISOString()};
            const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
            const a=document.createElement('a');
            a.href=URL.createObjectURL(blob);
            a.download='isaac-os-backup-'+todayKey()+'.json';
            a.click();
          }}>⬇ Exportar hábitos (JSON)</button>
        </div>
      </div>
    </Modal>
  );
}

function StatusBanner({whoop,google,connect}){
  const items=[];
  const gd=google&&google.data;
  const g401=google&&google.error&&google.error.includes('401');
  const w401=whoop&&whoop.error&&whoop.error.includes('401');
  if(g401)items.push({k:'g401',err:true,t:'Sessão Google expirada — reconecte para atualizar.',a:'Reconectar Google',fn:connect.google});
  if(w401)items.push({k:'w401',err:true,t:'Sessão WHOOP expirada — reconecte para atualizar.',a:'Reconectar WHOOP',fn:connect.whoop});
  if(gd&&(gd._calendar_error===403||gd._tasks_error===403))items.push({k:'api',err:false,t:'Google respondeu 403 — verifique se as APIs Calendar e Tasks estão ativadas no Google Cloud.',a:null});
  if(!items.length&&google&&google.error&&!g401&&gd)items.push({k:'net',err:false,t:'Falha ao atualizar dados do Google ('+google.error+') — mostrando última versão salva.',a:null});
  if(!items.length&&whoop&&whoop.error&&!w401&&whoop.data)items.push({k:'wnet',err:false,t:'Falha ao atualizar dados do WHOOP ('+whoop.error+') — mostrando última versão salva.',a:null});
  if(!items.length)return null;
  return(
    <div>
      {items.map(it=>(
        <div key={it.k} className={'banner '+(it.err?'err':'')}>
          <span>{it.err?'⚠️':'ℹ️'}</span>
          <span style={{flex:1}}>{it.t}</span>
          {it.a&&<button className="btn sm" onClick={it.fn}>{it.a}</button>}
        </div>
      ))}
    </div>
  );
}

// ============================ APP ============================
const PAGES={
  hoje:   {label:'Hoje',   ico:'☀️', comp:HojePage},
  saude:  {label:'Saúde',  ico:'❤️', comp:SaudePage},
  tarefas:{label:'Tarefas',ico:'✅', comp:TarefasPage},
  agenda: {label:'Agenda', ico:'📅', comp:AgendaPage},
  habitos:{label:'Hábitos',ico:'🔁', comp:HabitosPage},
};

function App(){
  const[page,setPage]=useState('hoje');
  const wcache=getWhoopCache();
  const[whoop,setWhoop]=useState(wcache?{loading:false,data:wcache.data,error:null,updatedAt:wcache.at}:{loading:false,data:null,error:null,updatedAt:null});
  const gcache=getGoogleCache();
  const[google,setGoogle]=useState(gcache?{loading:false,data:gcache.data,error:null,updatedAt:gcache.at}:{loading:false,data:null,error:null,updatedAt:null});
  const[habitLog,setHabitLog]=useState(loadHabitLog());
  const[habitDefs,setHabitDefsState]=useState(DEFS.list);
  const[settingsOpen,setSettingsOpen]=useState(false);
  const[jew,setJew]=useState(null);
  const[syncState,setSyncState]=useState({on:!!getSyncKey(),at:null,err:null});
  function setHabitDefs(list){saveHabitDefs(list);setHabitDefsState(list);syncPushSoon({habit_defs:list,habit_defs_at:Date.now()});}

  function toggleHabit(dk,id){
    setHabitLog(prev=>{
      const day={...(prev[dk]||{})};
      if(day[id])delete day[id];else day[id]=1;
      const next={...prev,[dk]:day};
      LSet('habit_log_v2',next);
      LSet('habit_log_at',Date.now());
      syncPushSoon({habit_log:next,habit_log_at:Date.now()});
      return next;
    });
  }

  // Puxa o estado remoto e faz merge (mais novo vence)
  async function syncNow(showErr){
    try{
      const remote=await syncFetch('GET');
      if(!remote)return;
      const push={};
      // hábitos: log
      const lAt=LS('habit_log_at',0),rAt=remote.habit_log_at||0;
      if(remote.habit_log&&rAt>lAt){LSet('habit_log_v2',remote.habit_log);LSet('habit_log_at',rAt);setHabitLog(remote.habit_log);}
      else if(lAt>rAt){push.habit_log=loadHabitLog();push.habit_log_at=lAt;}
      // hábitos: definições
      const dAt=LS('habit_defs_at',0),rdAt=remote.habit_defs_at||0;
      if(remote.habit_defs&&rdAt>dAt){LSet('habit_defs_v1',remote.habit_defs);LSet('habit_defs_at',rdAt);DEFS.list=remote.habit_defs;setHabitDefsState(remote.habit_defs);}
      else if(dAt>rdAt){push.habit_defs=DEFS.list;push.habit_defs_at=dAt;}
      // tokens WHOOP
      const lw=getTokens(),rw=remote.whoop_tokens;
      if(rw&&(!lw||((rw.saved_at||0)>(lw.saved_at||0)))){saveTokens(rw);fetchWhoop(rw.access_token,true);}
      else if(lw&&(!rw||((lw.saved_at||0)>(rw.saved_at||0))))push.whoop_tokens=lw;
      // tokens Google
      const lg=getGoogleTokens(),rg=remote.google_tokens;
      if(rg&&(!lg||((rg.saved_at||0)>(lg.saved_at||0)))){saveGoogleTokens(rg);fetchGoogle(rg.access_token,true);}
      else if(lg&&(!rg||((lg.saved_at||0)>(rg.saved_at||0))))push.google_tokens=lg;
      if(Object.keys(push).length)await syncFetch('POST',push);
      setSyncState({on:true,at:Date.now(),err:null});
    }catch(e){
      const msg=e.status===401?'PIN incorreto':e.status===503?'Redis não configurado no Vercel':'falha de rede';
      setSyncState(st=>({...st,err:msg}));
      if(showErr)alert('Sincronização: '+msg);
    }
  }

  async function fetchWhoop(token,quiet){
    if(!quiet)setWhoop(s=>({...s,loading:true,error:null}));
    try{
      const stored=getTokens();
      const headers={'Authorization':'Bearer '+token};
      if(stored&&stored.refresh_token)headers['X-Refresh-Token']=stored.refresh_token;
      const r=await fetch('/whoop/data',{headers});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      if(data._new_tokens&&data._new_tokens.access_token){
        const tk={...stored,...data._new_tokens,saved_at:Date.now()};
        saveTokens(tk);syncPushSoon({whoop_tokens:tk});
      }
      saveWhoopCache(data);
      setWhoop({loading:false,data,error:null,updatedAt:Date.now()});
    }catch(err){
      setWhoop(s=>({loading:false,data:s.data,error:err.message,updatedAt:s.updatedAt}));
    }
  }

  async function fetchGoogle(token,quiet){
    if(!quiet)setGoogle(s=>({...s,loading:true,error:null}));
    try{
      const stored=getGoogleTokens();
      const headers={'Authorization':'Bearer '+token};
      if(stored&&stored.refresh_token)headers['X-Refresh-Token']=stored.refresh_token;
      const r=await fetch('/google/data',{headers});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      if(data._new_tokens&&data._new_tokens.access_token){
        const tk={...stored,access_token:data._new_tokens.access_token,saved_at:Date.now()};
        saveGoogleTokens(tk);syncPushSoon({google_tokens:tk});
      }
      saveGoogleCache(data);
      setGoogle({loading:false,data,error:null,updatedAt:Date.now()});
    }catch(err){
      setGoogle(s=>({loading:false,data:s.data,error:err.message,updatedAt:s.updatedAt}));
    }
  }

  // Escrita no Google Tasks com atualização otimista (UI responde na hora)
  async function taskAction(action,payload){
    const stored=getGoogleTokens();
    if(!stored||!stored.access_token)return;

    setGoogle(s=>{
      if(!s.data)return s;
      let tasks=s.data.tasks||[];
      let task_lists=s.data.task_lists||[];
      if(action==='toggle')tasks=tasks.map(t=>t.id===payload.id?{...t,done:!t.done,completed:!t.done?new Date().toISOString():null}:t);
      if(action==='update')tasks=tasks.map(t=>t.id===payload.taskId?{...t,title:payload.title!==undefined?payload.title:t.title,notes:payload.notes!==undefined?(payload.notes||null):t.notes,due:payload.due!==undefined?payload.due:t.due}:t);
      if(action==='delete')tasks=tasks.filter(t=>t.id!==payload.taskId&&t.parent!==payload.taskId);
      if(action==='move'){
        const to=task_lists.find(l=>l.id===payload.toListId);
        tasks=tasks.map(t=>t.id===payload.taskId?{...t,listId:payload.toListId,listName:to?to.title:t.listName}:t);
      }
      if(action==='renameList'){
        task_lists=task_lists.map(l=>l.id===payload.listId?{...l,title:payload.title}:l);
        tasks=tasks.map(t=>t.listId===payload.listId?{...t,listName:payload.title}:t);
      }
      if(action==='deleteList'){
        task_lists=task_lists.filter(l=>l.id!==payload.listId);
        tasks=tasks.filter(t=>t.listId!==payload.listId);
      }
      const data={...s.data,tasks,task_lists};
      saveGoogleCache(data);
      return {...s,data};
    });

    try{
      const headers={'Authorization':'Bearer '+stored.access_token,'Content-Type':'application/json'};
      if(stored.refresh_token)headers['X-Refresh-Token']=stored.refresh_token;
      const body=action==='toggle'
        ?{action:'toggle',listId:payload.listId,taskId:payload.id,done:!payload.done}
        :{action,...payload};
      await fetch('/google/data',{method:'POST',headers,body:JSON.stringify(body)});
      // Criações precisam dos IDs reais do servidor → refetch silencioso
      if(action==='create'||action==='createList'||action==='move'){
        fetchGoogle(stored.access_token,true);
      }
    }catch(e){}
  }

  useEffect(()=>{
    function onMsg(e){
      if(e.data&&e.data.type==='WHOOP_AUTH_SUCCESS'){const tk={...e.data.tokens,saved_at:Date.now()};saveTokens(tk);fetchWhoop(tk.access_token);syncPushSoon({whoop_tokens:tk});}
      if(e.data&&e.data.type==='GOOGLE_AUTH_SUCCESS'){const tk={...e.data.tokens,saved_at:Date.now()};saveGoogleTokens(tk);fetchGoogle(tk.access_token);syncPushSoon({google_tokens:tk});}
    }
    window.addEventListener('message',onMsg);
    const t=getTokens();if(t&&t.access_token)fetchWhoop(t.access_token);
    const g=getGoogleTokens();if(g&&g.access_token)fetchGoogle(g.access_token);
    if(getSyncKey())syncNow(false);
    fetchJewish().then(setJew).catch(()=>{});
    const interval=setInterval(()=>{
      const t2=getTokens();if(t2&&t2.access_token)fetchWhoop(t2.access_token,true);
      const g2=getGoogleTokens();if(g2&&g2.access_token)fetchGoogle(g2.access_token,true);
    },55*60*1000);
    function onVis(){
      if(document.visibilityState!=='visible')return;
      const c=getWhoopCache(),t3=getTokens();
      if(t3&&t3.access_token&&(!c||Date.now()-c.at>10*60*1000))fetchWhoop(t3.access_token,true);
      const gc=getGoogleCache(),g3=getGoogleTokens();
      if(g3&&g3.access_token&&(!gc||Date.now()-gc.at>10*60*1000))fetchGoogle(g3.access_token,true);
    }
    document.addEventListener('visibilitychange',onVis);
    return()=>{window.removeEventListener('message',onMsg);clearInterval(interval);document.removeEventListener('visibilitychange',onVis)};
  },[]);

  function refreshNow(){
    const t=getTokens();if(t&&t.access_token)fetchWhoop(t.access_token);
    const g=getGoogleTokens();if(g&&g.access_token)fetchGoogle(g.access_token);
  }

  const connect={
    whoop:()=>window.open('/whoop/login','_blank','width=520,height=660'),
    google:()=>window.open('/google/login','_blank','width=520,height=680'),
  };

  const wtok=getTokens(),gtok=getGoogleTokens();
  const Comp=PAGES[page].comp;

  // Preparação p/ IA: contexto agregado acessível globalmente
  window.IsaacOS={getContext:()=>buildContext(whoop.data,google.data,habitLog)};

  // Título da aba mostra tarefas atrasadas
  useEffect(()=>{
    const tk=todayKey();
    const n=(((google.data&&google.data.tasks)||[]).filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)<tk)).length;
    document.title=n>0?'('+n+') Isaac OS':'Isaac OS';
  },[google.data]);

  return(
    <div className="layout">
      <div className="sidebar">
        <div className="logo"><div className="lz">⚡</div>Isaac OS</div>
        <div className="nsec">Páginas</div>
        {Object.keys(PAGES).map(k=>(
          <div key={k} className={'ni '+(page===k?'active':'')} onClick={()=>setPage(k)}>
            <span className="ico">{PAGES[k].ico}</span>{PAGES[k].label}
          </div>
        ))}
        <div className="nsec">Integrações</div>
        <div className="ni" style={{cursor:wtok?'default':'pointer'}} onClick={()=>!wtok&&connect.whoop()}>
          <div className="dot" style={{background:wtok?'var(--green)':'var(--t3)'}}/>
          WHOOP
          {wtok?<div className="badge g-" style={{marginLeft:'auto'}}>Ativo</div>:<div className="badge y-" style={{marginLeft:'auto'}}>Conectar</div>}
        </div>
        <div className="ni" style={{cursor:gtok?'default':'pointer'}} onClick={()=>!gtok&&connect.google()}>
          <div className="dot" style={{background:gtok?'var(--green)':'var(--t3)'}}/>
          Google
          {gtok?<div className="badge g-" style={{marginLeft:'auto'}}>Ativo</div>:<div className="badge y-" style={{marginLeft:'auto'}}>Conectar</div>}
        </div>
        <div className="sbot">
          {wtok&&(
            <div style={{padding:'3px 10px'}}>
              <button onClick={()=>{clearTokens();syncPushSoon({whoop_tokens:null});setWhoop({loading:false,data:null,error:null,updatedAt:null})}} style={{background:'var(--rbg)',border:'none',borderRadius:6,color:'var(--red)',fontSize:11,padding:'5px 10px',cursor:'pointer',width:'100%'}}>Desconectar WHOOP</button>
            </div>
          )}
          {gtok&&(
            <div style={{padding:'3px 10px'}}>
              <button onClick={()=>{clearGoogleTokens();syncPushSoon({google_tokens:null});setGoogle({loading:false,data:null,error:null,updatedAt:null})}} style={{background:'var(--rbg)',border:'none',borderRadius:6,color:'var(--red)',fontSize:11,padding:'5px 10px',cursor:'pointer',width:'100%'}}>Desconectar Google</button>
            </div>
          )}
          <div className="ni" onClick={()=>setSettingsOpen(true)}>
            <span className="ico">⚙️</span>Ajustes
            {syncState.on&&!syncState.err&&<div className="badge g-" style={{marginLeft:'auto'}}>Sync</div>}
            {syncState.err&&<div className="badge r-" style={{marginLeft:'auto'}}>!</div>}
          </div>
          <div className="uc">
            <div className="av">IR</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700}}>Isaac</div>
              <div style={{fontSize:10,color:'var(--t3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>isaacronydayan@gmail.com</div>
            </div>
          </div>
        </div>
      </div>

      <div className="main">
        <StatusBanner whoop={whoop} google={google} connect={connect}/>
        <Comp
          whoop={{...whoop,onRefresh:refreshNow}}
          google={{...google,onRefresh:refreshNow}}
          habitLog={habitLog}
          jew={jew}
          habitDefs={habitDefs}
          setHabitDefs={setHabitDefs}
          toggleHabit={toggleHabit}
          taskAction={taskAction}
          setPage={setPage}
          connect={connect}
        />
      </div>

      <div className="mnav">
        {Object.keys(PAGES).map(k=>(
          <div key={k} className={'mni '+(page===k?'active':'')} onClick={()=>setPage(k)}>
            <span>{PAGES[k].ico}</span>{PAGES[k].label}
          </div>
        ))}
        <div className="mni" onClick={()=>setSettingsOpen(true)}><span>⚙️</span>Ajustes</div>
      </div>

      <SettingsModal open={settingsOpen} onClose={()=>setSettingsOpen(false)} syncState={syncState} habitLog={habitLog}
        onActivate={(pin)=>{saveSyncKey(pin);setSyncState({on:true,at:null,err:null});syncNow(true);}}
        onDeactivate={()=>{saveSyncKey(null);setSyncState({on:false,at:null,err:null});}}
        onSyncNow={()=>syncNow(true)}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
</script>
</body>
</html>`;

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(HTML);
}
