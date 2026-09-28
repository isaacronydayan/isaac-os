const {useState,useEffect,useMemo,useRef}=React;

// ============================ PILARES ============================
const PILARES={
  saude:    {label:'Saúde',    ico:'●', cor:'var(--p-saude)',    bg:'var(--p-saude-bg)'},
  sono:     {label:'Sono',     ico:'☾', cor:'var(--p-sono)',     bg:'var(--p-sono-bg)'},
  religiao: {label:'Religião', ico:'✦', cor:'var(--p-religiao)', bg:'var(--p-religiao-bg)'},
  mente:    {label:'Mente',    ico:'≈', cor:'var(--p-mente)',    bg:'var(--p-mente-bg)'},
  financas: {label:'Finanças', ico:'⚖', cor:'var(--p-financas)', bg:'var(--p-financas-bg)'},
  carreira: {label:'Carreira', ico:'◆', cor:'var(--p-carreira)', bg:'var(--p-carreira-bg)'},
};
const PILAR_ORDER=['saude','sono','religiao','mente','financas','carreira'];

// ============================ CONSTANTES ============================
const DEFAULT_HABITS=[
  {id:'ex',    name:'Exercício',                ico:'🏋️', pilar:'saude'},
  {id:'nk',    name:'🚫👊🥩',                    ico:'🛡️', pilar:'saude'},
  {id:'agua',  name:'Beber 2L+ de água',        ico:'💧', pilar:'saude'},
  {id:'creat', name:'Tomar creatina',           ico:'💊', pilar:'saude'},
  {id:'invis', name:'Invisalign',               ico:'😁', pilar:'saude'},
  {id:'sleep1',name:'Dormir antes da 1h',       ico:'🌙', pilar:'sono'},
  {id:'wake',  name:'Levantar até 7h30',        ico:'⏰', pilar:'sono'},
  {id:'nocel', name:'Não usar celular ao acordar',ico:'📵', pilar:'sono'},
  {id:'shach', name:'Shacharit',                ico:'🙏', pilar:'religiao'},
  {id:'minch', name:'Mincha',                   ico:'🙏', pilar:'religiao'},
  {id:'arvit', name:'Arvit',                    ico:'🙏', pilar:'religiao'},
  {id:'shiur', name:'Shiur',                    ico:'📖', pilar:'religiao'},
  {id:'gemara',name:'Gemara',                   ico:'📚', pilar:'religiao'},
  {id:'shema', name:'Kriat Shema Al Hamita',    ico:'🛏️', pilar:'religiao'},
];
function loadHabitDefs(){const v=LS('habit_defs_v1',null);const list=(v&&Array.isArray(v)&&v.length)?v:DEFAULT_HABITS;return list.map(h=>({...h,pilar:h.pilar||'saude'}))}
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
// Travas anti-concorrência: dois fetchs simultâneos com o mesmo refresh token
// invalidavam a sessão do WHOOP (refresh token é de uso único).
let _wBusy=false,_gBusy=false;
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

// ============================ GUIA DO DIA (o que fazer agora) ============================
function buildGuidance({now,habitLog,defs,events,tasks,rec}){
  const out=[];
  const h=now.getHours()+now.getMinutes()/60;
  const tk=todayKey();
  const done=id=>habitDone(habitLog,tk,id);
  const has=id=>defs.some(d=>d.id===id);
  const evs=events.filter(e=>sameDay(new Date(e.start),now)&&!e.allDay).sort((a,b)=>new Date(a.start)-new Date(b.start));
  const nowEv=evs.find(e=>new Date(e.start)<=now&&new Date(e.end)>now);
  const nextEv=evs.find(e=>new Date(e.start)>now);
  if(nowEv)out.push({i:'📍',t:'Agora: '+nowEv.summary,s:'até '+fmtT(nowEv.end)});
  else if(nextEv){
    const mins=Math.round((new Date(nextEv.start)-now)/60000);
    if(mins<=120)out.push({i:'⏰',t:'Em '+(mins>=60?Math.floor(mins/60)+'h'+pad2(mins%60):mins+'min')+': '+nextEv.summary,s:fmtT(nextEv.start)});
  }
  const late=tasks.filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)<tk).sort((a,b)=>dueKeyOf(a)<dueKeyOf(b)?-1:1);
  const dueToday=tasks.filter(t=>!t.done&&dueKeyOf(t)===tk);
  late.slice(0,2).forEach(t=>out.push({i:'⚠️',t:'Resolver: '+t.title,s:'atrasada · '+t.listName}));
  if(late.length===0)dueToday.slice(0,2).forEach(t=>out.push({i:'✅',t:t.title,s:'vence hoje · '+t.listName}));
  if(has('shach')&&!done('shach')&&h>=5.5&&h<12)out.push({i:'🙏',t:'Shacharit',s:'janela da manhã'});
  if(has('minch')&&!done('minch')&&h>=13&&h<18.5)out.push({i:'🙏',t:'Mincha',s:'antes do pôr do sol'});
  if(has('arvit')&&!done('arvit')&&h>=18.5)out.push({i:'🙏',t:'Arvit',s:'janela da noite'});
  if(has('ex')&&!done('ex')&&h>=6&&h<22){
    if(rec!==null&&rec>=75)out.push({i:'💪',t:'Treinar pesado hoje',s:'recovery '+Math.round(rec)+'% — corpo pronto'});
    else if(rec!==null&&rec<60)out.push({i:'🚶',t:'Treino leve ou descanso',s:'recovery '+Math.round(rec)+'%'});
    else out.push({i:'🏋️',t:'Exercício ainda não feito',s:''});
  }
  if(has('agua')&&!done('agua')&&h>=15)out.push({i:'💧',t:'Bater os 2L de água',s:''});
  if(has('shema')&&!done('shema')&&h>=21)out.push({i:'🛏️',t:'Kriat Shema + Invisalign',s:'antes de dormir'});
  if(out.length===0)out.push({i:'🎉',t:'Tudo em dia',s:'aproveita o momento'});
  return out.slice(0,5);
}

// ============================ PONTUAÇÃO DO DIA v2 ============================
function scoreV2({habitLog,defs,tasks,gtok,rec,sleepPerf,strain}){
  const tk=todayKey();
  const parts=[];
  const hd=defs.filter(x=>habitDone(habitLog,tk,x.id)).length;
  parts.push({l:'Hábitos',v:defs.length?hd/defs.length:0,w:30,d:hd+'/'+defs.length});
  const dT=tasks.filter(t=>!t.done&&dueKeyOf(t)===tk).length;
  const oD=tasks.filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)<tk).length;
  const doneT=tasks.filter(t=>t.done&&t.completed&&t.completed.slice(0,10)===tk).length;
  const tot=dT+oD+doneT;
  if(gtok&&tot>0)parts.push({l:'Tarefas',v:doneT/tot,w:20,d:doneT+'/'+tot});
  if(sleepPerf!==null&&sleepPerf!==undefined)parts.push({l:'Sono',v:sleepPerf/100,w:20,d:Math.round(sleepPerf)+'%'});
  if(rec!==null&&rec!==undefined)parts.push({l:'Recovery',v:rec/100,w:20,d:Math.round(rec)+'%'});
  if(rec!==null&&rec!==undefined&&strain!==null&&strain!==undefined){
    const target=rec>=66?14:rec>=33?10:6;
    const bal=1-Math.min(Math.abs(strain-target)/target,1);
    parts.push({l:'Equilíbrio',v:bal,w:10,d:'strain '+(Math.round(strain*10)/10).toFixed(1)+' · alvo ~'+target});
  }
  const tw=parts.reduce((a,x)=>a+x.w,0);
  const score=Math.round(parts.reduce((a,x)=>a+x.v*x.w,0)/tw*100);
  return {score,parts};
}

// ============================ PADRÕES (mineração sem IA) ============================
function minePatterns(habitLog,defs,wd){
  const rec=seriesRecovery(wd||{});
  const str=seriesStrain(wd||{});
  const out=[];
  // 1. melhor / pior dia da semana
  if(rec.length>=14){
    const by={};
    rec.forEach(r=>{const w=r.date.getDay();(by[w]=by[w]||[]).push(r.rec)});
    const avgs=Object.keys(by).filter(k=>by[k].length>=2).map(k=>({w:+k,a:by[k].reduce((x,y)=>x+y,0)/by[k].length,n:by[k].length}));
    if(avgs.length>=4){
      avgs.sort((a,b)=>b.a-a.a);
      const top=avgs[0],bot=avgs[avgs.length-1];
      if(top.a-bot.a>=6)out.push({i:'📅',t:'Seu recovery costuma ser melhor na '+WD[top.w]+' ('+Math.round(top.a)+'% em média) e pior na '+WD[bot.w]+' ('+Math.round(bot.a)+'%).'});
    }
  }
  // 2. hábito da véspera → recovery do dia seguinte
  const candidates=['sleep1','ex','nocel','shema','agua'];
  const sleepIdx=sleepByDay(wd||{}); // usado para "sleep1": prioriza o dado real do WHOOP sobre o hábito manual congelado
  let best=null;
  candidates.forEach(id=>{
    if(!defs.some(d=>d.id===id))return;
    const on=[],off=[];
    rec.forEach(r=>{
      if(id==='sleep1'){
        // o sono que termina na manhã do próprio dia do recovery é o que o gerou — não o dia anterior
        const dk=dayKey(r.date);
        const auto=sleptBefore1am(sleepIdx,dk);
        if(auto===null){
          const prevDk=dayKey(addDays(r.date,-1));
          if(!(prevDk in habitLog))return; // sem dado do WHOOP nem hábito manual — pula
          (habitDone(habitLog,prevDk,id)?on:off).push(r.rec);
        }else{
          (auto?on:off).push(r.rec);
        }
        return;
      }
      const prev=addDays(r.date,-1);
      const dk=dayKey(prev);
      if(!(dk in habitLog))return; // só considera dias em que hábitos foram registrados
      (habitDone(habitLog,dk,id)?on:off).push(r.rec);
    });
    if(on.length>=5&&off.length>=5){
      const lift=on.reduce((a,b)=>a+b,0)/on.length-off.reduce((a,b)=>a+b,0)/off.length;
      if(!best||Math.abs(lift)>Math.abs(best.lift))best={id,lift,n:on.length+off.length};
    }
  });
  if(best&&Math.abs(best.lift)>=4){
    const hb=defs.find(d=>d.id===best.id);
    out.push({i:best.lift>0?'📈':'📉',t:'Nos dias seguintes a "'+hb.name+'", seu recovery fica em média '+(best.lift>0?'+':'')+Math.round(best.lift)+' pontos '+(best.lift>0?'melhor':'pior')+' ('+best.n+' dias analisados).'});
  }
  // 3. strain alto → recovery do dia seguinte
  if(str.length>=12&&rec.length>=12){
    const recBy={};rec.forEach(r=>{recBy[dayKey(r.date)]=r.rec});
    const hi=[],lo=[];
    str.forEach(c=>{
      const nx=recBy[dayKey(addDays(c.date,1))];
      if(nx===undefined)return;
      if(c.strain>=14)hi.push(nx);else if(c.strain<10)lo.push(nx);
    });
    if(hi.length>=4&&lo.length>=4){
      const dh=hi.reduce((a,b)=>a+b,0)/hi.length,dl=lo.reduce((a,b)=>a+b,0)/lo.length;
      if(dl-dh>=6)out.push({i:'⚖️',t:'Dias de strain alto (14+) derrubam seu recovery seguinte para ~'+Math.round(dh)+'%, contra ~'+Math.round(dl)+'% após dias leves. Planeje treinos pesados quando puder dormir bem depois.'});
    }
  }
  return out;
}

// ============================ CLIMA E RESUMO DO MUNDO ============================
async function fetchWeather(){
  const c=LS('weather_cache',null);
  if(c&&Date.now()-c.at<30*60*1000)return c.v;
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=-23.55&longitude=-46.63&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=1');
    const j=await r.json();
    const code=j.current.weather_code;
    const ico=code===0?'☀️':code<=2?'🌤️':code===3?'☁️':code<=48?'🌫️':code<=67?'🌧️':code<=77?'❄️':code<=82?'🌧️':'⛈️';
    const v={t:j.current.temperature_2m,max:j.daily.temperature_2m_max[0],min:j.daily.temperature_2m_min[0],ico};
    LSet('weather_cache',{at:Date.now(),v});
    return v;
  }catch{return c?c.v:null}
}
async function fetchBrief(){
  const c=LS('brief_cache',null);
  if(c&&Date.now()-c.at<30*60*1000)return c.v;
  try{
    const r=await fetch('/brief');
    if(!r.ok)return c?c.v:null;
    const v=await r.json();
    LSet('brief_cache',{at:Date.now(),v});
    return v;
  }catch{return c?c.v:null}
}

// ============================ NOTIFICAÇÕES PUSH ============================
const VAPID_PUBLIC='BIx8FPc2QT6eSMU39bptK0kD8SKvXfzxxWs8QpxGtxJ0fvIWt4lkUbhiqFsCyT_QLVaNXkuBUNLey-MKJhL9XwQ';
function b64ToU8(s){
  const pad='='.repeat((4-s.length%4)%4);
  const b=atob((s+pad).replace(/-/g,'+').replace(/_/g,'/'));
  const u=new Uint8Array(b.length);
  for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  return u;
}
function pushSupport(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent||'');
  const standalone=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  if(!('serviceWorker' in navigator)||!('PushManager' in window)){
    return {ok:false,why:ios&&!standalone?'No iPhone: primeiro adicione o site à Tela de Início (Compartilhar → Adicionar à Tela de Início) e abra pelo ícone.':'Este navegador não suporta notificações push.'};
  }
  return {ok:true};
}
async function enablePush(){
  const sup=pushSupport();
  if(!sup.ok)throw new Error(sup.why);
  if(!getSyncKey())throw new Error('Ative a sincronização (PIN) primeiro — as notificações usam a mesma proteção.');
  const reg=await navigator.serviceWorker.register('/sw.js');
  const perm=await Notification.requestPermission();
  if(perm!=='granted')throw new Error('Permissão de notificação negada.');
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToU8(VAPID_PUBLIC)});
  const r=await fetch('/push/subscribe',{method:'POST',headers:{'X-Sync-Key':getSyncKey(),'Content-Type':'application/json'},body:JSON.stringify({subscription:sub.toJSON()})});
  if(!r.ok)throw new Error('Servidor recusou ('+r.status+').');
  LSet('push_on',true);
  return (await r.json()).devices;
}
async function disablePush(){
  try{
    const reg=await navigator.serviceWorker.getRegistration('/sw.js');
    const sub=reg&&await reg.pushManager.getSubscription();
    if(sub){
      await fetch('/push/subscribe',{method:'POST',headers:{'X-Sync-Key':getSyncKey()||'','Content-Type':'application/json'},body:JSON.stringify({action:'unsubscribe',endpoint:sub.endpoint})});
      await sub.unsubscribe();
    }
  }catch(e){}
  LDel('push_on');
}

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

// ============================ PILAR: MENTE (check-in semanal) ============================
function isoWeekKey(d){ // "2026-W38"
  const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=(x.getUTCDay()+6)%7;
  x.setUTCDate(x.getUTCDate()-day+3);
  const firstThu=new Date(Date.UTC(x.getUTCFullYear(),0,4));
  const week=1+Math.round(((x-firstThu)/86400000-3+((firstThu.getUTCDay()+6)%7))/7);
  return x.getUTCFullYear()+'-W'+pad2(week);
}
function loadMenteLog(){return LS('mente_log_v1',{})}
function saveMenteEntry(wk,entry){
  const cur=loadMenteLog();
  const next={...cur,[wk]:entry};
  LSet('mente_log_v1',next);
  LSet('mente_log_at',Date.now());
  syncPushSoon({mente_log:next,mente_log_at:Date.now()});
  return next;
}

// ============================ PILAR: FINANÇAS (lançamentos manuais) ============================
function monthKey(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)}
function loadFinanceLog(){return LS('finance_log_v1',{})}
function addFinanceEntry(entry){ // {id,title,valor,tipo:'entrada'|'saida',categoria,data}
  const cur=loadFinanceLog();
  const mk=entry.data.slice(0,7);
  const arr=(cur[mk]||[]).concat([entry]);
  const next={...cur,[mk]:arr};
  LSet('finance_log_v1',next);
  LSet('finance_log_at',Date.now());
  syncPushSoon({finance_log:next,finance_log_at:Date.now()});
  return next;
}
function deleteFinanceEntry(mk,id){
  const cur=loadFinanceLog();
  const arr=(cur[mk]||[]).filter(e=>e.id!==id);
  const next={...cur,[mk]:arr};
  LSet('finance_log_v1',next);
  LSet('finance_log_at',Date.now());
  syncPushSoon({finance_log:next,finance_log_at:Date.now()});
  return next;
}
const FINANCE_CATS=['Moradia','Alimentação','Transporte','Lazer','Saúde','Educação','Assinaturas','Investimento','Salário/Renda','Outros'];

// ============================ PILAR: CARREIRA (frentes e metas) ============================
const CAREER_TRACKS=[
  {id:'ouribank', label:'Ouribank'},
  {id:'fgv',       label:'FGV'},
  {id:'paralelos', label:'Projetos paralelos'},
];
function loadCareerLog(){
  const v=LS('career_log_v1',null);
  if(v)return v;
  const init={};CAREER_TRACKS.forEach(t=>init[t.id]=[]);
  return init;
}
function saveCareerLog(next){
  LSet('career_log_v1',next);
  LSet('career_log_at',Date.now());
  syncPushSoon({career_log:next,career_log_at:Date.now()});
  return next;
}
function careerNormalized(log){
  const l=log||{};
  const flat=[];
  CAREER_TRACKS.forEach(t=>(l[t.id]||[]).forEach(g=>flat.push({...g,track:t.id})));
  return {byTrack:l,flat};
}

// ============================ RELIGIÃO: notas de Gemara ============================
function loadGemaraNotes(){return LS('gemara_notes_v1',{})}
function saveGemaraNote(dk,texto){
  const cur=loadGemaraNotes();
  const next={...cur};
  if(texto&&texto.trim())next[dk]=texto.trim();else delete next[dk];
  LSet('gemara_notes_v1',next);
  LSet('gemara_notes_at',Date.now());
  syncPushSoon({gemara_notes:next,gemara_notes_at:Date.now()});
  return next;
}

// ============================ EXPORTAR CSV ============================
const NL=String.fromCharCode(10);
const CRNL=String.fromCharCode(13,10);
const BOM=String.fromCharCode(65279);
function csvCell(v){
  const s=v===null||v===undefined?'':String(v);
  return (s.indexOf('"')>=0||s.indexOf(',')>=0||s.indexOf(';')>=0||s.indexOf(NL)>=0)?'"'+s.replace(/"/g,'""')+'"':s;
}
function downloadCSV(filename,rows){
  const csv=rows.map(r=>r.map(csvCell).join(';')).join(CRNL);
  const blob=new Blob([BOM+csv],{type:'text/csv;charset=utf-8;'}); // BOM p/ acentos no Excel
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
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
    return {date:new Date(r.end||r.start),start:r.start?new Date(r.start):null,end:r.end?new Date(r.end):null,perf:r.score.sleep_performance_percentage,cons:r.score.sleep_consistency_percentage,eff:r.score.sleep_efficiency_percentage,rr:r.score.respiratory_rate,hours:asleep/3600000};
  });
}
// Índice dayKey→registro de sono, e checagens derivadas (usadas em SonoPage e minePatterns
// para que "dormir antes da 1h" etc. reflitam o dado real do WHOOP, não o hábito manual congelado)
function sleepByDay(data){
  const by={};
  seriesSleep(data).forEach(r=>{if(r.end)by[dayKey(r.end)]=r});
  return by;
}
function sleptBefore1am(by,dk){
  const r=by[dk];if(!r||!r.start)return null;
  const h=r.start.getHours()+r.start.getMinutes()/60;
  return h<1||h>=18;
}
function wokeBy730(by,dk){
  const r=by[dk];if(!r||!r.end)return null;
  const h=r.end.getHours()+r.end.getMinutes()/60;
  return h<=7.5;
}
function slept6h30(by,dk){
  const r=by[dk];if(!r||r.hours===undefined)return null;
  return r.hours>=6.5;
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

// Contexto rico para a IA: tudo que ela precisa saber, compacto
function buildAIContext(whoopData,googleData,habitLog,history,menteLog,financeLog,careerLog){
  const base=buildContext(whoopData,googleData,habitLog);
  const tk=todayKey();
  const compactTask=t=>({t:t.title,due:dueKeyOf(t),lista:t.listName});
  const tasks=(googleData&&googleData.tasks)||[];
  const evs=((googleData&&googleData.events)||[]).filter(e=>new Date(e.start)>=addDays(new Date(),-1)).slice(0,15).map(e=>({t:e.summary,inicio:e.start,fim:e.end}));
  const hist=history||{};
  const hkeys=Object.keys(hist).sort().slice(-60);

  const mlog=menteLog||{};
  const mkeys=Object.keys(mlog).sort().slice(-8);
  const wkNow=isoWeekKey(new Date());

  const flog=financeLog||{};
  const mkNow=monthKey(new Date());
  const finThis=flog[mkNow]||[];
  const finBalance=finThis.reduce((a,e)=>a+(e.tipo==='entrada'?e.valor:-e.valor),0);
  const finByCat={};
  finThis.filter(e=>e.tipo==='saida').forEach(e=>{finByCat[e.categoria]=(finByCat[e.categoria]||0)+e.valor});

  const clog=careerLog||{};
  const careerFlat=careerNormalized(clog).flat;

  return {
    agora:new Date().toString(),
    corpo_hoje:base.whoop.today_recovery,
    sono_ultima_noite:base.whoop.last_sleep?{performance:base.whoop.last_sleep.sleep_performance_percentage,consistencia:base.whoop.last_sleep.sleep_consistency_percentage}:null,
    series_30d:base.whoop.series,
    recordes:base.whoop.records,
    habitos:{
      definicoes:DEFS.list.map(h=>({nome:h.name,pilar:h.pilar})),
      hoje_feitos:DEFS.list.filter(h=>habitDone(habitLog,tk,h.id)).map(h=>h.name),
      sequencias:base.habits.streaks.map(x=>({nome:x.name,dias_seguidos:x.streak,taxa_30d:Math.round(x.rate30*100)+'%'})),
    },
    tarefas:{
      atrasadas:tasks.filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)<tk).slice(0,15).map(compactTask),
      hoje:tasks.filter(t=>!t.done&&dueKeyOf(t)===tk).slice(0,15).map(compactTask),
      proximas:tasks.filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)>tk).slice(0,15).map(compactTask),
      sem_data:tasks.filter(t=>!t.done&&!dueKeyOf(t)).length,
      concluidas_7d:tasks.filter(t=>t.done&&t.completed&&new Date(t.completed)>addDays(new Date(),-7)).length,
    },
    agenda_proximos:evs,
    mente:{
      checkin_semana_atual:mlog[wkNow]||null,
      ultimas_semanas:mkeys.map(w=>({semana:w,...mlog[w]})),
    },
    financas:{
      mes_atual:mkNow,
      saldo_mes:Math.round(finBalance*100)/100,
      lancamentos_mes:finThis.length,
      gastos_por_categoria:finByCat,
    },
    carreira:{
      frentes:CAREER_TRACKS.map(t=>({frente:t.label,metas:(clog[t.id]||[]).map(g=>({texto:g.texto,pct:g.pct,concluida:g.done}))})),
      total_metas:careerFlat.length,
      metas_concluidas:careerFlat.filter(g=>g.done).length,
    },
    memoria_permanente:{
      dias_registrados:Object.keys(hist).length,
      ultimos_60d:hkeys.map(d=>({dia:d,...hist[d]})),
    },
    padroes_detectados:minePatterns(habitLog,DEFS.list,whoopData).map(x=>x.t),
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
        plugins:{legend:{display:datasets.length>1,labels:{color:'#87816D',boxWidth:10,font:{size:10}}},tooltip:{backgroundColor:'#14203A',borderColor:'rgba(20,32,58,.14)',borderWidth:1}},
        scales:{x:{ticks:{color:'#87816D',font:{size:9.5},maxTicksLimit:8},grid:{color:'rgba(20,32,58,.06)'}},y:{ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}}},
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
// Grade de hábitos dos últimos 7 dias corridos (hoje incluso) — usada em Saúde, Sono e Religião.
// defs: [{id,name,ico}]. auto (opcional): [{id,name,ico,dayStatus:(dk)=>true|false|null}] hábitos calculados (ex: do WHOOP), sem streak manual nem clique.
function HabitGrid7d({title,defs,habitLog,toggleHabit,auto,color}){
  const NOW=new Date();
  const days=Array.from({length:7}).map((_,i)=>addDays(NOW,i-6));
  if((!defs||defs.length===0)&&(!auto||auto.length===0))return null;
  return(
    <div className="card" style={{marginBottom:14}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div className="ct" style={{marginBottom:0}}>{title||'Hábitos — últimos 7 dias'}</div>
        <div style={{display:'flex',gap:4}}>
          {days.map((d,i)=><div key={i} style={{width:26,textAlign:'center',fontSize:9.5,fontWeight:700,color:i===6?(color||'var(--accent)'):'var(--t3)'}}>{WD[d.getDay()]}</div>)}
          <div style={{width:44}}/>
        </div>
      </div>
      {auto&&auto.map(h=>(
        <div key={h.id} className="hrow">
          <div className="hname"><span style={{fontSize:14}}>{h.ico}</span><span>{h.name}</span></div>
          <div style={{display:'flex',gap:4}}>
            {days.map((d,i)=>{
              const dk=dayKey(d);
              const status=h.dayStatus(dk); // true=feito, false=não feito (dado existe), null=sem dado do WHOOP
              const cls='hcell '+(status===true?'done':status===false?'auto-x':'auto-empty');
              return <div key={i} className={cls} title={status===null?'sem dado do WHOOP':status?'meta batida':'meta não batida'}>{status===true?'✓':status===false?'✕':'·'}</div>;
            })}
          </div>
          <div className="hstreak" style={{color:'var(--t3)',fontWeight:600,fontSize:9.5}}>WHOOP</div>
        </div>
      ))}
      {defs&&defs.map(h=>{
        const stk=habitStreak(habitLog,h.id);
        return(
          <div key={h.id} className="hrow">
            <div className="hname"><span style={{fontSize:14}}>{h.ico}</span><span>{h.name}</span></div>
            <div style={{display:'flex',gap:4}}>
              {days.map((d,i)=>{
                const dk=dayKey(d);
                const done=habitDone(habitLog,dk,h.id);
                return <div key={i} className={'hcell '+(done?'done ':'')+(i===6?'tdy':'')} onClick={()=>toggleHabit(dk,h.id)}>✓</div>;
              })}
            </div>
            <div className="hstreak">{stk>0?stk+'d':'–'}</div>
          </div>
        );
      })}
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

// ============================ PÁGINA: PAINEL (home — os 6 pilares) ============================
function MiniRing({pct,color,size}){
  const s=size||34,r=(s-4)/2,c=2*Math.PI*r,off=c-(Math.max(0,Math.min(100,pct))/100)*c;
  return(
    <svg width={s} height={s} viewBox={'0 0 '+s+' '+s} style={{transform:'rotate(-90deg)',flexShrink:0}}>
      <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="var(--s2)" strokeWidth="3"/>
      <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{transition:'stroke-dashoffset .4s ease'}}/>
    </svg>
  );
}
function PillarCard({id,value,valueColor,sub,onClick,pct}){
  const p=PILARES[id];
  return(
    <div className="card pillar-card" onClick={onClick} style={{cursor:'pointer','--pc':p.cor}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:15,color:p.cor}}>{p.ico}</span>
          <div style={{fontSize:10.5,fontWeight:700,letterSpacing:1,textTransform:'uppercase',color:p.cor}}>{p.label}</div>
        </div>
        {pct!==undefined&&pct!==null&&<MiniRing pct={pct} color={p.cor}/>}
      </div>
      <div className="mv" style={{color:valueColor||'var(--t)'}}>{value}</div>
      <div style={{fontSize:11.5,color:'var(--t3)',marginTop:8,lineHeight:1.5}}>{sub}</div>
    </div>
  );
}
function PainelPage({whoop,google,habitLog,habitDefs,toggleHabit,taskAction,setPage,connect,jew,weather,brief,financeLog,menteLog,careerLog}){
  const NOW=new Date();
  const tk=todayKey();
  const wd=whoop&&whoop.data,gd=google&&google.data;
  const wtok=getTokens(),gtok=getGoogleTokens();
  const defs=habitDefs||DEFS.list;
  const byPilar=id=>defs.filter(h=>h.pilar===id);

  // ===== Saúde =====
  const exDefs=byPilar('saude');
  const exDone=exDefs.filter(h=>habitDone(habitLog,tk,h.id)).length;
  const exStreak=Math.max(0,...exDefs.map(h=>habitStreak(habitLog,h.id)),0);
  const cr=wd&&wd.cycle_recovery&&wd.cycle_recovery.score;
  const rec=cr?cr.recovery_score:null;

  // ===== Sono =====
  const sleepRec=pickSleep(wd),ss=sleepRec&&sleepRec.score;
  const slpS=seriesSleep(wd||{});
  const slp7=avgOf(slpS,'perf',7);

  // ===== Religião =====
  const relDefs=byPilar('religiao');
  const tefilot=['shach','minch','arvit'].filter(id=>relDefs.some(h=>h.id===id));
  const tefDone=tefilot.filter(id=>habitDone(habitLog,tk,id)).length;
  const gemaraStreak=relDefs.some(h=>h.id==='gemara')?habitStreak(habitLog,'gemara'):null;
  const shiurWeek=(()=>{
    if(!relDefs.some(h=>h.id==='shiur'))return null;
    let n=0;const wStart=weekMonday(NOW);
    for(let i=0;i<7;i++){const d=addDays(wStart,i);if(d>NOW)break;if(habitDone(habitLog,dayKey(d),'shiur'))n++}
    return n;
  })();

  // ===== Mente =====
  const wk=isoWeekKey(NOW);
  const menteEntry=menteLog&&menteLog[wk];
  const menteAvg=menteEntry?(()=>{const vs=Object.values(menteEntry.nota||{}).filter(v=>typeof v==='number');return vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:null})():null;

  // ===== Finanças =====
  const mk=monthKey(NOW);
  const finEntries=(financeLog&&financeLog[mk])||[];
  const finBalance=finEntries.reduce((a,e)=>a+(e.tipo==='entrada'?e.valor:-e.valor),0);

  // ===== Carreira =====
  const careerAll=careerNormalized(careerLog);
  const careerGoals=careerAll.flat;
  const careerPct=careerGoals.length?Math.round(careerGoals.reduce((a,g)=>a+(g.pct||0),0)/careerGoals.length):null;

  // ===== Consistência da semana (resumo por pilar) =====
  const weekConsistency=PILAR_ORDER.map(pid=>{
    const pd=byPilar(pid);
    let val=null;
    if(pd.length){
      const rates=pd.map(h=>habitRate(habitLog,h.id,7));
      val=Math.round(rates.reduce((a,b)=>a+b,0)/rates.length*100);
    }else if(pid==='mente'){
      val=menteAvg!==null?Math.round(menteAvg/5*100):null;
    }else if(pid==='carreira'){
      val=careerPct;
    }
    return {id:pid,val};
  }).filter(x=>x.val!==null);

  const dateStr=NOW.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});

  // ===== Guidance (reaproveitado) =====
  const tasks=(gd&&gd.tasks)||[];
  const guidance=buildGuidance({now:NOW,habitLog,defs,events:(gd&&gd.events)||[],tasks,rec});

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3,flexWrap:'wrap'}}>
          <div className="pt">{greeting()}, Isaac</div>
          {(wtok||gtok)&&<div className="live">{[wtok&&'WHOOP',gtok&&'Google'].filter(Boolean).join(' + ')}</div>}
          {weather&&<div className="badge z-" style={{fontSize:11,padding:'3px 9px'}}>{weather.ico} {Math.round(weather.t)}°C</div>}
          <RefreshBtn state={whoop||google}/>
        </div>
        <div className="ps" style={{textTransform:'capitalize'}}>{dateStr}{jew&&jew.hebrew?<span style={{textTransform:'none',color:'var(--t3)'}}> · {jew.hebrew}</span>:null}</div>
      </div>

      {jew&&(jew.candles||jew.parasha)&&(
        <div className="card" style={{marginBottom:14,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
          <span style={{fontSize:20,color:'var(--gold)'}}>✦</span>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:13.5,fontWeight:700,fontFamily:'var(--fd)'}}>{jew.parasha||'Shabat'}</div>
            <div style={{fontSize:11.5,color:'var(--t2)',marginTop:2}}>
              {jew.candles&&<span>Velas <b style={{color:'var(--gold)'}}>{fmtShort(jew.candles)}</b></span>}
              {jew.havdalah&&<span> · Havdalá <b style={{color:'var(--gold)'}}>{fmtShort(jew.havdalah)}</b></span>}
              <span style={{color:'var(--t3)'}}> · São Paulo</span>
            </div>
          </div>
        </div>
      )}

      <div className="g g3" style={{marginBottom:14}}>
        <PillarCard id="saude" onClick={()=>setPage('saude')}
          value={rec!==null?Math.round(rec)+'%':exDone+'/'+exDefs.length}
          pct={rec!==null?rec:(exDefs.length?exDone/exDefs.length*100:null)}
          sub={<span>{exDefs.length?exDone+'/'+exDefs.length+' hábitos hoje':''}{exStreak>0&&<span> · streak <b style={{color:'var(--gold)'}}>{exStreak}d</b></span>}</span>}/>
        <PillarCard id="sono" onClick={()=>setPage('sono')}
          value={ss?Math.round(ss.sleep_performance_percentage)+'%':'–'}
          pct={ss?ss.sleep_performance_percentage:null}
          sub={slp7!==null?'média 7d: '+Math.round(slp7)+'%':'Conecte o WHOOP para ver o sono'}/>
        <PillarCard id="religiao" onClick={()=>setPage('religiao')}
          value={gemaraStreak!==null&&gemaraStreak>0?gemaraStreak+'d':tefDone+'/'+tefilot.length}
          pct={tefilot.length?tefDone/tefilot.length*100:null}
          sub={<span>{tefilot.length?tefDone+'/'+tefilot.length+' tefilot hoje':''}{shiurWeek!==null&&<span> · {shiurWeek} shiur{shiurWeek===1?'':'s'} essa semana</span>}</span>}/>
      </div>
      <div className="g g3" style={{marginBottom:14}}>
        <PillarCard id="mente" onClick={()=>setPage('mente')}
          value={menteAvg!==null?menteAvg.toFixed(1)+'/5':'–'}
          pct={menteAvg!==null?menteAvg/5*100:null}
          sub={menteEntry?'Check-in desta semana registrado':'Nenhum check-in esta semana'}/>
        <PillarCard id="financas" onClick={()=>setPage('financas')}
          value={(finBalance>=0?'+':'-')+'R$ '+Math.abs(finBalance).toLocaleString('pt-BR',{maximumFractionDigits:0})}
          valueColor={finBalance>=0?undefined:'var(--red)'}
          sub={finEntries.length+' lançamento'+(finEntries.length===1?'':'s')+' em '+NOW.toLocaleDateString('pt-BR',{month:'long'})}/>
        <PillarCard id="carreira" onClick={()=>setPage('carreira')}
          value={careerPct!==null?careerPct+'%':'–'}
          pct={careerPct}
          sub={careerGoals.length?careerGoals.filter(g=>g.done).length+'/'+careerGoals.length+' metas concluídas':'Nenhuma meta cadastrada'}/>
      </div>

      {weekConsistency.length>=3&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="ct">Consistência da semana</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {weekConsistency.map(x=>{
              const p=PILARES[x.id];
              return(
                <div key={x.id} style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:88,fontSize:11.5,fontWeight:600,color:p.cor,display:'flex',alignItems:'center',gap:5,flexShrink:0}}><span>{p.ico}</span>{p.label}</div>
                  <div className="pbar" style={{flex:1}}><div className="pf" style={{width:x.val+'%',background:p.cor}}/></div>
                  <div style={{width:32,textAlign:'right',fontSize:11.5,fontWeight:700,color:'var(--t2)',flexShrink:0}}>{x.val}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {guidance.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="ct">Agora</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:8}}>
            {guidance.map((g,i)=>(
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',background:'var(--s2)',borderRadius:11,padding:'9px 12px'}}>
                <span style={{fontSize:15}}>{g.i}</span>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.t}</div>
                  {g.s&&<div style={{fontSize:10.5,color:'var(--t3)'}}>{g.s}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>Agenda de hoje</div>
            {gtok?<div className="badge a-">{((gd&&gd.events)||[]).filter(e=>sameDay(new Date(e.start),NOW)).length} eventos</div>:null}
          </div>
          {!gtok?<Empty ico="○" title="Google não conectado" desc="Conecte para ver sua agenda" action="Conectar Google" onAction={connect.google}/>:(()=>{
            const evs=((gd&&gd.events)||[]).filter(e=>sameDay(new Date(e.start),NOW)).sort((a,b)=>new Date(a.start)-new Date(b.start));
            const nowEv=evs.find(e=>!e.allDay&&new Date(e.start)<=NOW&&new Date(e.end)>NOW);
            return evs.length===0?<Empty ico="○" title="Dia livre" desc="Nenhum evento hoje"/>:(
              <div style={{maxHeight:220,overflowY:'auto'}}>
                {evs.map(e=>(
                  <div key={e.id} className="ev">
                    <div className="evb" style={{background:(nowEv&&nowEv.id===e.id)?'var(--green)':evColor(e)}}/>
                    <div className="evt">{e.allDay?'dia':fmtT(e.start)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.summary}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div className="ct" style={{marginBottom:0}}>Tarefas de hoje</div>
          </div>
          {!gtok?<Empty ico="✓" title="Google não conectado" desc="Conecte para ver suas tarefas" action="Conectar Google" onAction={connect.google}/>:(()=>{
            const tToday=tasks.filter(t=>!t.done&&dueKeyOf(t)===tk);
            const tLate=tasks.filter(t=>!t.done&&dueKeyOf(t)&&dueKeyOf(t)<tk);
            return (tToday.length+tLate.length)===0?<Empty ico="✓" title="Tudo em dia" desc="Nenhuma tarefa pendente"/>:(
              <div style={{maxHeight:220,overflowY:'auto'}}>
                {tLate.concat(tToday).slice(0,8).map(t=>(
                  <div key={t.id} className="task" onClick={()=>taskAction('toggle',t)}>
                    <div className={'cb '+(t.done?'done':'')}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="tt" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>
                      <div className="tmeta">{dueKeyOf(t)<tk&&<span style={{color:'var(--red)',fontWeight:700}}>atrasada</span>}<span>{t.listName}</span></div>
                    </div>
                  </div>
                ))}
                <div style={{textAlign:'center',marginTop:8}}><button className="btn ghost sm" onClick={()=>setPage('tarefas')}>Ver todas →</button></div>
              </div>
            );
          })()}
        </div>
      </div>

      {brief&&brief.quotes&&brief.quotes.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="ct">Mercado</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {brief.quotes.map(q=>{
              const up=q.chg>=0;
              const price=q.fmt==='brl'?'R$ '+q.price.toLocaleString('pt-BR',{maximumFractionDigits:2}):q.fmt==='usd'?'US$ '+Math.round(q.price).toLocaleString('pt-BR'):Math.round(q.price).toLocaleString('pt-BR');
              return(
                <div key={q.label} style={{background:'var(--s2)',borderRadius:10,padding:'7px 11px',minWidth:104}}>
                  <div style={{fontSize:9.5,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>{q.label}</div>
                  <div style={{fontSize:13,fontWeight:800,margin:'2px 0'}}>{price}</div>
                  <div style={{fontSize:10.5,fontWeight:700,color:up?'var(--green)':'var(--red)'}}>{up?'▲':'▼'} {Math.abs(q.chg).toFixed(2).replace('.',',')}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!wtok&&(
        <div className="card">
          <Empty ico="○" title="WHOOP não conectado" desc="Conecte para ver recovery, sono e treinos em tempo real" action="Conectar WHOOP" onAction={connect.whoop}/>
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

// ============================ PÁGINA: RELIGIÃO ============================
function ReligiaoPage({habitLog,toggleHabit,habitDefs,jew,gemaraNotes,setGemaraNotes}){
  const NOW=new Date();
  const tk=todayKey();
  const defs=(habitDefs||DEFS.list).filter(h=>h.pilar==='religiao');
  const wStart=addDays(NOW,-6); // últimos 7 dias corridos (hoje incluso), não a semana civil — assim sábado/domingo não "somem" da grade
  const weekDays=Array.from({length:7}).map((_,i)=>addDays(wStart,i));
  const todayIdx=6; // hoje é sempre o último dia da janela
  const notes=gemaraNotes||{};
  const[noteDraft,setNoteDraft]=useState(notes[tk]||'');
  const[noteDirty,setNoteDirty]=useState(false);
  useEffect(()=>{if(!noteDirty)setNoteDraft(notes[tk]||'')},[tk,notes[tk]]);
  function saveNote(){const next=saveGemaraNote(tk,noteDraft);setGemaraNotes(next);setNoteDirty(false)}

  const tefIds=['shach','minch','arvit'];
  const tefilot=defs.filter(h=>tefIds.includes(h.id));
  const outros=defs.filter(h=>!tefIds.includes(h.id));
  const gemara=defs.find(h=>h.id==='gemara');
  const shiur=defs.find(h=>h.id==='shiur');

  const gemaraStreak=gemara?habitStreak(habitLog,'gemara'):null;
  const gemaraRate30=gemara?habitRate(habitLog,'gemara',30):null;
  const shiurThisWeek=(()=>{
    if(!shiur)return 0;
    let n=0;for(let i=0;i<7;i++){const d=addDays(wStart,i);if(d>NOW)break;if(habitDone(habitLog,dayKey(d),'shiur'))n++}
    return n;
  })();
  const shiurLast4=(()=>{
    if(!shiur)return[];
    const out=[];
    for(let w=3;w>=0;w--){
      const ws=addDays(wStart,-7*w);let n=0;
      for(let i=0;i<7;i++){const d=addDays(ws,i);if(d>NOW)break;if(habitDone(habitLog,dayKey(d),'shiur'))n++}
      out.push({l:fmtDM(ws),v:n});
    }
    return out;
  })();

  const tefRate7=tefilot.length?tefilot.reduce((a,h)=>a+habitRate(habitLog,h.id,7),0)/tefilot.length:null;

  // heatmap 90 dias — Gemara (estilo grade de contribuição, 13 semanas x 7 dias)
  const heatWeeks=(()=>{
    if(!gemara)return[];
    const weeks=[];
    const start=addDays(weekMonday(NOW),-7*12); // 13 semanas incluindo a atual
    for(let w=0;w<13;w++){
      const ws=addDays(start,7*w);
      const days=[];
      for(let i=0;i<7;i++){
        const d=addDays(ws,i);
        days.push({d,fut:d>NOW,done:d<=NOW&&habitDone(habitLog,dayKey(d),'gemara')});
      }
      weeks.push(days);
    }
    return weeks;
  })();

  return(
    <div className="page">
      <div className="ph">
        <div className="pt" style={{color:'var(--p-religiao)'}}>Religião</div>
        <div className="ps">Tefilot, Gemara e shiurim</div>
      </div>

      {jew&&(jew.candles||jew.parasha||jew.hebrew)&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="ct">Hoje</div>
          <div style={{display:'flex',gap:20,flexWrap:'wrap',alignItems:'center'}}>
            {jew.hebrew&&<div><div style={{fontSize:15,fontWeight:700,fontFamily:'var(--fd)'}}>{jew.hebrew}</div><div style={{fontSize:10,color:'var(--t3)'}}>data hebraica</div></div>}
            {jew.parasha&&<div><div style={{fontSize:15,fontWeight:700,fontFamily:'var(--fd)'}}>{jew.parasha}</div><div style={{fontSize:10,color:'var(--t3)'}}>parashá</div></div>}
            {jew.candles&&<div><div style={{fontSize:15,fontWeight:800,color:'var(--gold)'}}>{fmtShort(jew.candles)}</div><div style={{fontSize:10,color:'var(--t3)'}}>velas</div></div>}
            {jew.havdalah&&<div><div style={{fontSize:15,fontWeight:800,color:'var(--gold)'}}>{fmtShort(jew.havdalah)}</div><div style={{fontSize:10,color:'var(--t3)'}}>havdalá</div></div>}
          </div>
        </div>
      )}

      <div className="g g3" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Tefilot — taxa 7 dias</div>
          <div className="mv">{tefRate7!==null?Math.round(tefRate7*100)+'%':'–'}</div>
        </div>
        <div className="card">
          <div className="ct">Gemara — sequência</div>
          <div className="mv" style={{color:'var(--gold)'}}>{gemaraStreak!==null?gemaraStreak+'d':'–'}</div>
          {gemaraRate30!==null&&<div style={{fontSize:11,color:'var(--t3)',marginTop:6}}>{Math.round(gemaraRate30*100)}% nos últimos 30 dias</div>}
        </div>
        <div className="card">
          <div className="ct">Shiurim esta semana</div>
          <div className="mv">{shiur?shiurThisWeek:'–'}</div>
        </div>
      </div>

      {tefilot.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div className="ct" style={{marginBottom:0}}>Tefilot — últimos 7 dias</div>
            <div style={{display:'flex',gap:4}}>
              {weekDays.map((d,i)=><div key={i} style={{width:26,textAlign:'center',fontSize:9.5,fontWeight:700,color:i===todayIdx?'var(--p-religiao)':'var(--t3)'}}>{WD[d.getDay()]}</div>)}
              <div style={{width:44}}/>
            </div>
          </div>
          {tefilot.map(h=>{
            const stk=habitStreak(habitLog,h.id);
            return(
              <div key={h.id} className="hrow">
                <div className="hname"><span style={{fontSize:14}}>{h.ico}</span><span>{h.name}</span></div>
                <div style={{display:'flex',gap:4}}>
                  {weekDays.map((d,i)=>{
                    const fut=d>NOW&&!sameDay(d,NOW);
                    const dk=dayKey(d);
                    const done=habitDone(habitLog,dk,h.id);
                    return <div key={i} className={'hcell '+(done?'done ':'')+(sameDay(d,NOW)?'tdy ':'')+(fut?'fut':'')} onClick={()=>!fut&&toggleHabit(dk,h.id)}>✓</div>;
                  })}
                </div>
                <div className="hstreak">{stk>0?stk+'d':'–'}</div>
              </div>
            );
          })}
        </div>
      )}

      {outros.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="ct">Gemara & outros</div>
          {outros.map(h=>{
            const stk=habitStreak(habitLog,h.id);
            return(
              <div key={h.id} className="hrow">
                <div className="hname"><span style={{fontSize:14}}>{h.ico}</span><span>{h.name}</span></div>
                <div style={{display:'flex',gap:4}}>
                  {weekDays.map((d,i)=>{
                    const fut=d>NOW&&!sameDay(d,NOW);
                    const dk=dayKey(d);
                    const done=habitDone(habitLog,dk,h.id);
                    return <div key={i} className={'hcell '+(done?'done ':'')+(sameDay(d,NOW)?'tdy ':'')+(fut?'fut':'')} onClick={()=>!fut&&toggleHabit(dk,h.id)}>✓</div>;
                  })}
                </div>
                <div className="hstreak">{stk>0?stk+'d':'–'}</div>
              </div>
            );
          })}
        </div>
      )}

      {shiur&&shiurLast4.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="ct">Shiurim — últimas 4 semanas</div>
          <ChartBox type="bar" labels={shiurLast4.map(w=>w.l)} datasets={[{label:'Shiurim',data:shiurLast4.map(w=>w.v),backgroundColor:'rgba(46,81,120,.55)',borderRadius:5}]} opts={{plugins:{legend:{display:false}},scales:{y:{min:0,ticks:{color:'#87816D',font:{size:9.5},stepSize:1},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5}},grid:{display:false}}}}}/>
        </div>
      )}

      {gemara&&heatWeeks.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div className="ct" style={{marginBottom:0}}>Gemara — últimos 90 dias</div>
            {gemaraRate30!==null&&<div className="badge a-">{Math.round(gemaraRate30*100)}% em 30d</div>}
          </div>
          <div style={{display:'flex',gap:3,overflowX:'auto',paddingBottom:4}}>
            {heatWeeks.map((week,wi)=>(
              <div key={wi} style={{display:'flex',flexDirection:'column',gap:3}}>
                {week.map((day,di)=>(
                  <div key={di} title={day.fut?'':dayKey(day.d)+(day.done?' · Gemara feita':'')}
                    style={{width:12,height:12,borderRadius:3,
                      background:day.fut?'transparent':day.done?'var(--p-religiao)':'var(--s2)',
                      border:day.fut?'1px dashed var(--b)':sameDay(day.d,NOW)?'1.5px solid var(--gold)':'none'}}/>
                ))}
              </div>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:10,fontSize:10,color:'var(--t3)'}}>
            <span>menos</span>
            <div style={{width:11,height:11,borderRadius:3,background:'var(--s2)'}}/>
            <div style={{width:11,height:11,borderRadius:3,background:'var(--p-religiao)'}}/>
            <span>mais</span>
          </div>
        </div>
      )}

      {gemara&&(
        <div className="card">
          <div className="ct">O que estudei hoje</div>
          <textarea className="input" placeholder="Anote o tema, o daf, um insight…" value={noteDraft} onChange={e=>{setNoteDraft(e.target.value);setNoteDirty(true)}}/>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
            <button className="btn sm" onClick={saveNote} disabled={!noteDirty}>{noteDirty?'Salvar nota':'Salva'}</button>
          </div>
          {Object.keys(notes).filter(d=>d!==tk).length>0&&(
            <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:8,maxHeight:220,overflowY:'auto'}}>
              {Object.keys(notes).filter(d=>d!==tk).sort().reverse().slice(0,20).map(d=>(
                <div key={d} style={{padding:'8px 10px',background:'var(--s2)',borderRadius:10}}>
                  <div style={{fontSize:10.5,fontWeight:700,color:'var(--p-religiao)',marginBottom:2}}>{fmtDM(d)}</div>
                  <div style={{fontSize:11.5,color:'var(--t2)'}}>{notes[d]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {defs.length===0&&<Empty ico="✦" title="Nenhum hábito de Religião" desc="Adicione hábitos e atribua ao pilar Religião em Ajustes → Gerenciar hábitos"/>}
    </div>
  );
}

// ============================ PÁGINA: SAÚDE ============================
function SaudePage({whoop,connect,habitLog,toggleHabit,habitDefs}){
  const wtok=getTokens();
  const wd=whoop&&whoop.data;
  const defs=(habitDefs||DEFS.list).filter(h=>h.pilar==='saude');
  const HabitList=()=><HabitGrid7d title="Hábitos de Saúde — últimos 7 dias" defs={defs} habitLog={habitLog} toggleHabit={toggleHabit}/>;
  if(!wtok)return(
    <div className="page">
      <div className="ph"><div className="pt">Saúde</div><div className="ps">Corpo, sono, treinos e tendências</div></div>
      <HabitList/>
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
  const workouts=((wd&&wd.workouts&&wd.workouts.records)||[]).filter(w=>w.score).slice(0,12);
  const body=wd&&wd.body&&!wd.body._error?wd.body:null;

  // ===== Esforço & treinos: derivações =====
  const allWo=((wd&&wd.workouts&&wd.workouts.records)||[]).filter(w=>w.score);
  const durMs=w=>new Date(w.end)-new Date(w.start);
  const sumBy=(arr,f)=>arr.reduce((a,x)=>a+f(x),0);
  const nowD=new Date();
  const wkStart=(d)=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-x.getDay());return x};
  const w0=wkStart(nowD),w0end=new Date(w0.getTime()+7*864e5),w1=new Date(w0.getTime()-7*864e5);
  const curWk=allWo.filter(w=>{const t=new Date(w.start);return t>=w0&&t<w0end});
  const prevWk=allWo.filter(w=>{const t=new Date(w.start);return t>=w1&&t<w0});
  const wkStats=(arr)=>({n:arr.length,ms:sumBy(arr,durMs),kcal:Math.round(sumBy(arr,w=>w.score.kilojoule||0)/4.184),str:arr.length?sumBy(arr,w=>w.score.strain||0)/arr.length:null});
  const swk=wkStats(curWk),pwk=wkStats(prevWk);
  const wo30=allWo.filter(w=>nowD-new Date(w.start)<30*864e5);
  // por modalidade
  const bySport={};
  wo30.forEach(w=>{const k=sportName(w);const b=bySport[k]=bySport[k]||{n:0,ms:0,kcal:0,str:0,ico:sportIcon(w)};b.n++;b.ms+=durMs(w);b.kcal+=(w.score.kilojoule||0)/4.184;b.str+=w.score.strain||0});
  const sports=Object.keys(bySport).map(k=>({k,...bySport[k],avgStr:bySport[k].str/bySport[k].n})).sort((a,b)=>b.ms-a.ms);
  const maxSportMs=sports.length?sports[0].ms:1;
  // zonas de FC (30d)
  const zsum=[0,0,0,0,0];
  wo30.forEach(w=>{const z=w.score.zone_duration||{};zsum[0]+=z.zone_one_milli||0;zsum[1]+=z.zone_two_milli||0;zsum[2]+=z.zone_three_milli||0;zsum[3]+=z.zone_four_milli||0;zsum[4]+=z.zone_five_milli||0});
  const ztot=zsum.reduce((a,b)=>a+b,0);
  const zMeta=[{l:'Z1',c:'#4b5563'},{l:'Z2',c:'#60a5fa'},{l:'Z3',c:'#34d399'},{l:'Z4',c:'#fbbf24'},{l:'Z5',c:'#f87171'}];
  const hardPct=ztot?Math.round((zsum[3]+zsum[4])/ztot*100):null;
  // insights de esforço (matemática pura)
  const effIns=[];
  if(wo30.length>=4){
    const dow=[0,0,0,0,0,0,0];wo30.forEach(w=>dow[new Date(w.start).getDay()]++);
    const bi=dow.indexOf(Math.max.apply(null,dow));
    effIns.push({i:'📅',t:'Seu dia de treino é '+['domingo','segunda','terça','quarta','quinta','sexta','sábado'][bi]+': '+dow[bi]+' dos '+wo30.length+' treinos do mês.'});
  }
  if(wo30.length){
    effIns.push({i:'⏱️',t:'Treino médio de '+hmFromMs(sumBy(wo30,durMs)/wo30.length)+' · ritmo de '+(wo30.length/(30/7)).toFixed(1)+' treinos/semana no mês.'});
  }
  const woDaySet={};wo30.forEach(w=>{woDaySet[dayKey(new Date(w.start))]=1});
  const sWith=[],sWithout=[];
  strS.slice(-30).forEach(r=>{(woDaySet[dayKey(r.date)]?sWith:sWithout).push(r.strain)});
  if(sWith.length>=3&&sWithout.length>=3){
    const m=a=>a.reduce((x,y)=>x+y,0)/a.length;
    effIns.push({i:'🔥',t:'Strain médio '+m(sWith).toFixed(1)+' em dia de treino vs '+m(sWithout).toFixed(1)+' sem treino — o treino é o motor do seu esforço diário.'});
  }
  if(hardPct!==null&&ztot>30*60000)effIns.push({i:'❤️',t:hardPct+'% do tempo de treino do mês em zona alta (Z4–Z5)'+(hardPct<15?' — dá pra apertar um pouco mais nos dias verdes.':hardPct>40?' — intensidade alta; garanta recuperação.':' — boa dose de intensidade.')});
  // recovery alinhado por dia p/ gráfico combinado
  const recByDay={};recS.forEach(r=>{recByDay[dayKey(r.date)]=Math.round(r.rec)});
  const comboRec=strS.slice(-30).map(r=>recByDay[dayKey(r.date)]!==undefined?recByDay[dayKey(r.date)]:null);
  const dlt=(a,b,f)=>{if(a===null||b===null||!b)return null;const p=Math.round((a-b)/b*100);return (p>=0?'+':'')+p+'%'};

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
    {l:'Profundo (SWS)',v:st.total_slow_wave_sleep_time_milli||0,c:'#14203A'},
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
          <ChartBox labels={labels} datasets={[ds('Recovery %',recS.slice(-30).map(r=>Math.round(r.rec)),'#34d399','rgba(52,211,153,.1)')]} opts={{scales:{y:{min:0,max:100,ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5},maxTicksLimit:8},grid:{color:'rgba(20,32,58,.06)'}}}}}/>
        </div>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">HRV × RHR — 30 dias</div>
          <ChartBox labels={labels} datasets={[ds('HRV (ms)',recS.slice(-30).map(r=>Math.round(r.hrv)),'#a78bfa'),ds('RHR (bpm)',recS.slice(-30).map(r=>Math.round(r.rhr)),'#60a5fa')]}/>
        </div>
        <div className="card">
          <div className="ct">💪 Esforço × Capacidade — 30 dias</div>
          <ChartBox type="bar" labels={stLabels} datasets={[
            {label:'Strain',data:strS.slice(-30).map(r=>Math.round(r.strain*10)/10),backgroundColor:'rgba(251,146,60,.55)',borderRadius:4,yAxisID:'y'},
            {type:'line',label:'Recovery %',data:comboRec,borderColor:'#34d399',backgroundColor:'#34d399',tension:.35,pointRadius:0,pointHoverRadius:4,borderWidth:2,spanGaps:true,yAxisID:'y1'}
          ]} opts={{scales:{y:{min:0,max:21,ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}},y1:{position:'right',min:0,max:100,ticks:{color:'#34d39988',font:{size:9.5}},grid:{drawOnChartArea:false}},x:{ticks:{color:'#87816D',font:{size:9.5},maxTicksLimit:8},grid:{color:'rgba(20,32,58,.06)'}}}}}/>
          <div style={{fontSize:10.5,color:'var(--t3)',marginTop:6}}>Barras = strain do dia · linha = recovery. O ideal: barras altas nos dias em que a linha está alta.</div>
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

      {(()=>{
        const pats=minePatterns(habitLog||{},habitDefs||DEFS.list,wd);
        return(
          <div className="card" style={{marginBottom:14,background:'linear-gradient(135deg,rgba(52,211,153,.06),rgba(20,32,58,.04))',borderColor:'rgba(52,211,153,.16)'}}>
            <div className="ct">🔎 Padrões descobertos (sem IA — só matemática nos seus dados)</div>
            {pats.length===0
              ?<div style={{fontSize:12.5,color:'var(--t2)'}}>Continue marcando os hábitos diariamente — com ~2 semanas de dados os padrões entre hábitos, sono, strain e recovery começam a aparecer aqui.</div>
              :<div style={{display:'flex',flexDirection:'column',gap:9}}>
                {pats.map((x,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:13}}>
                    <span>{x.i}</span><span style={{color:'var(--t2)'}}>{x.t}</span>
                  </div>
                ))}
              </div>}
          </div>
        );
      })()}

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">💪 Esta semana de treino <span style={{fontWeight:500,textTransform:'none',letterSpacing:0,color:'var(--t3)'}}>vs anterior</span></div>
          {swk.n===0&&pwk.n===0?<Empty ico="🏋️" title="Sem treinos ainda" desc="Registre um treino no WHOOP e ele aparece aqui"/>:(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                {[
                  {l:'Treinos',v:swk.n,p:pwk.n,f:x=>x},
                  {l:'Tempo',v:swk.ms,p:pwk.ms,f:hmFromMs},
                  {l:'Calorias',v:swk.kcal,p:pwk.kcal,f:x=>Math.round(x)+' kcal'},
                  {l:'Strain médio',v:swk.str,p:pwk.str,f:x=>x!==null?x.toFixed(1):'–'},
                ].map(x=>{
                  const d=dlt(x.v,x.p);
                  return(
                    <div key={x.l} style={{background:'var(--s2)',borderRadius:10,padding:'10px 12px'}}>
                      <div style={{fontSize:10,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:.6,marginBottom:4}}>{x.l}</div>
                      <div style={{fontSize:17,fontWeight:800,color:'var(--orange)'}}>{x.v!==null?x.f(x.v):'–'}</div>
                      <div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>ant.: {x.p!==null?x.f(x.p):'–'}{d?<span style={{marginLeft:5,fontWeight:700,color:d.startsWith('+')?'var(--green)':'var(--red)'}}>{d}</span>:null}</div>
                    </div>
                  );
                })}
              </div>
              {effIns.length>0&&(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {effIns.map((x,i)=>(
                    <div key={i} style={{display:'flex',gap:9,alignItems:'flex-start',fontSize:12.5}}>
                      <span>{x.i}</span><span style={{color:'var(--t2)',lineHeight:1.5}}>{x.t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="card">
          <div className="ct">🏅 Por modalidade — 30 dias</div>
          {sports.length===0?<Empty ico="🏅" title="Sem treinos no mês" desc="Seus esportes aparecem aqui com tempo, treinos e strain"/>:(
            <div style={{display:'flex',flexDirection:'column',gap:11,maxHeight:300,overflowY:'auto'}}>
              {sports.map(s=>(
                <div key={s.k}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span style={{fontSize:15}}>{s.ico}</span>
                    <span style={{fontSize:12.5,fontWeight:700,flex:1}}>{s.k}</span>
                    <span style={{fontSize:11,color:'var(--t3)'}}>{s.n}× · {hmFromMs(s.ms)} · {Math.round(s.kcal)} kcal · strain {s.avgStr.toFixed(1)}</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:'var(--s2)',overflow:'hidden'}}>
                    <div style={{width:Math.max(4,s.ms/maxSportMs*100)+'%',height:'100%',borderRadius:3,background:'linear-gradient(90deg,#fb923c,#f87171)'}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">❤️ Zonas de FC — 30 dias de treino</div>
          {!ztot?<Empty ico="❤️" title="Sem dados de zonas" desc="As zonas dos seus treinos aparecem aqui"/>:(
            <div>
              <div style={{display:'flex',height:14,borderRadius:7,overflow:'hidden',marginBottom:10}}>
                {zMeta.map((z,i)=>zsum[i]>0&&<div key={z.l} style={{width:(zsum[i]/ztot*100)+'%',background:z.c}}/>)}
              </div>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:12}}>
                {zMeta.map((z,i)=>(
                  <div key={z.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:10.5,color:'var(--t3)'}}>
                    <div style={{width:8,height:8,borderRadius:2,background:z.c}}/>{z.l} {hmFromMs(zsum[i])} ({ztot?Math.round(zsum[i]/ztot*100):0}%)
                  </div>
                ))}
              </div>
              <div style={{padding:'10px 12px',background:'var(--s2)',borderRadius:10,fontSize:11.5,color:'var(--t2)',lineHeight:1.7}}>
                <b style={{color:'var(--t)'}}>{hmFromMs(ztot)}</b> de treino no mês · <b style={{color:hardPct>40?'var(--red)':hardPct>=15?'var(--green)':'var(--amber)'}}>{hardPct}%</b> em zona alta (Z4–Z5). Z2 é a base aeróbica; Z4–Z5 é onde o condicionamento evolui.
              </div>
            </div>
          )}
        </div>
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
      </div>

      <div className="card" style={{marginBottom:14}}>
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
                    <div style={{fontSize:10,color:'var(--t3)'}}>{kcal(w.score.kilojoule)} kcal · {Math.round(w.score.average_heart_rate)}/{Math.round(w.score.max_heart_rate)} bpm</div>
                    <ZoneBar z={w.score.zone_duration}/>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {defs.length>0&&<HabitList/>}
    </div>
  );
}
// ============================ PÁGINA: SONO ============================
function SonoPage({whoop,connect,habitLog,toggleHabit,habitDefs}){
  const wtok=getTokens();
  const wd=whoop&&whoop.data;
  const AUTO_IDS=['sleep1','wake','sleep6h30']; // calculados do WHOOP quando conectado, em vez de marcação manual
  const defs=(habitDefs||DEFS.list).filter(h=>h.pilar==='sono');
  const manualDefs=defs.filter(h=>!wtok||!AUTO_IDS.includes(h.id));
  const slpAll=wtok?seriesSleep(wd||{}):[];
  const byDay=wtok?sleepByDay(wd||{}):{};
  const sleep1Def=defs.find(h=>h.id==='sleep1');
  const wakeDef=defs.find(h=>h.id==='wake');
  const autoHabits=wtok?[
    sleep1Def&&{id:'sleep1',name:sleep1Def.name,ico:sleep1Def.ico,dayStatus:dk=>sleptBefore1am(byDay,dk)},
    wakeDef&&{id:'wake',name:wakeDef.name,ico:wakeDef.ico,dayStatus:dk=>wokeBy730(byDay,dk)},
    {id:'sleep6h30',name:'Dormir 6h30+',ico:'⏳',dayStatus:dk=>slept6h30(byDay,dk)},
  ].filter(Boolean):[];
  const HabitList=()=>(
    <HabitGrid7d title={wtok?'Hábitos de Sono — últimos 7 dias':'Hábitos de Sono — últimos 7 dias'} defs={manualDefs} auto={autoHabits} habitLog={habitLog} toggleHabit={toggleHabit} color="var(--p-sono)"/>
  );
  if(!wtok)return(
    <div className="page">
      <div className="ph"><div className="pt" style={{color:'var(--p-sono)'}}>Sono</div><div className="ps">Performance, consistência e estágios</div></div>
      <HabitList/>
      <div className="card"><Empty ico="☾" title="WHOOP não conectado" desc="Conecte sua conta para ver dados de sono e calcular hábitos automaticamente" action="Conectar WHOOP" onAction={connect.whoop}/></div>
    </div>
  );
  const sleepRec=pickSleep(wd),ss=sleepRec&&sleepRec.score;
  const st=ss&&ss.stage_summary;
  const need=ss&&ss.sleep_needed;
  const slpS=slpAll;
  const asleepMs=st?(st.total_light_sleep_time_milli||0)+(st.total_slow_wave_sleep_time_milli||0)+(st.total_rem_sleep_time_milli||0):0;
  const inBedMs=st?asleepMs+(st.total_awake_time_milli||0):0;
  const stages=st?[
    {l:'Leve',v:st.total_light_sleep_time_milli||0,c:'#5B4E85'},
    {l:'Profundo',v:st.total_slow_wave_sleep_time_milli||0,c:'#14203A'},
    {l:'REM',v:st.total_rem_sleep_time_milli||0,c:'#87816D'},
    {l:'Acordado',v:st.total_awake_time_milli||0,c:'#D6CBA8'},
  ]:[];
  const labels=slpS.slice(-30).map(r=>fmtDM(r.date));
  const perf7=avgOf(slpS,'perf',7),perf30=avgOf(slpS,'perf',30);
  const cons30=avgOf(slpS,'cons',30),hours30=avgOf(slpS,'hours',30);

  return(
    <div className="page">
      <div className="ph">
        <div className="pt" style={{color:'var(--p-sono)'}}>Sono</div>
        <div className="ps">Performance, consistência e estágios</div>
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        <div className="card"><div className="ct">Última noite</div><div className="mv">{ss?Math.round(ss.sleep_performance_percentage)+'%':'–'}</div></div>
        <div className="card"><div className="ct">Média 7 dias</div><div className="mv">{perf7!==null?Math.round(perf7)+'%':'–'}</div></div>
        <div className="card"><div className="ct">Média 30 dias</div><div className="mv">{perf30!==null?Math.round(perf30)+'%':'–'}</div></div>
        <div className="card"><div className="ct">Horas (30d)</div><div className="mv">{hours30!==null?hours30.toFixed(1)+'h':'–'}</div></div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="ct">Última noite — detalhe</div>
        {!ss?<Empty ico="☾" title="Sem registro" desc="Nenhum sono com score encontrado"/>:(
          <div>
            <div style={{display:'flex',gap:22,marginBottom:14,flexWrap:'wrap'}}>
              <div><div className="mv" style={{fontSize:22}}>{hmFromMs(asleepMs)}</div><div style={{fontSize:10.5,color:'var(--t3)',marginTop:3}}>Dormidas ({hmFromMs(inBedMs)} na cama)</div></div>
              {ss.sleep_efficiency_percentage!==undefined&&<div><div className="mv" style={{fontSize:22}}>{Math.round(ss.sleep_efficiency_percentage)}%</div><div style={{fontSize:10.5,color:'var(--t3)',marginTop:3}}>Eficiência</div></div>}
              {ss.sleep_consistency_percentage!==undefined&&<div><div className="mv" style={{fontSize:22,color:'var(--p-sono)'}}>{Math.round(ss.sleep_consistency_percentage)}%</div><div style={{fontSize:10.5,color:'var(--t3)',marginTop:3}}>Consistência</div></div>}
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
                {need.need_from_sleep_debt_milli>0&&<span> + <b style={{color:'var(--gold)'}}>{hmFromMs(need.need_from_sleep_debt_milli)} de débito</b></span>}
                {need.need_from_recent_strain_milli>0&&<span> + {hmFromMs(need.need_from_recent_strain_milli)} pelo strain</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="ct">Performance de sono — 30 dias</div>
        {slpS.length?<ChartBox labels={labels} datasets={[ds('Performance %',slpS.slice(-30).map(r=>Math.round(r.perf)),'#5B4E85','rgba(91,78,133,.12)')]} opts={{scales:{y:{min:0,max:100,ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5},maxTicksLimit:8},grid:{color:'rgba(20,32,58,.06)'}}}}}/>:<Empty ico="☾" title="Sem dados" desc="Conecte o WHOOP"/>}
      </div>

      {defs.length>0&&<HabitList/>}
    </div>
  );
}
// ============================ PÁGINA: MENTE (check-in semanal) ============================
const MENTE_AREAS=[
  {k:'saude',    l:'Saúde'},
  {k:'sono',     l:'Sono'},
  {k:'religiao', l:'Religião'},
  {k:'financas', l:'Finanças'},
  {k:'carreira', l:'Carreira'},
];
function MentePage({menteLog,setMenteLog}){
  const NOW=new Date();
  const currentWk=isoWeekKey(NOW);
  const log=menteLog||{};
  const[selWk,setSelWk]=useState(currentWk);
  const isCurrentWeek=selWk===currentWk;
  const saved=log[selWk]||null;
  const[draft,setDraft]=useState(()=>saved||{nota:{},bom:'',aprendizado:''});
  const[dirty,setDirty]=useState(false);
  const savedKey=saved?JSON.stringify(saved):null;

  useEffect(()=>{if(!dirty)setDraft(saved||{nota:{},bom:'',aprendizado:''})},[selWk,savedKey]);

  function setNota(area,v){setDraft(d=>({...d,nota:{...d.nota,[area]:v}}));setDirty(true)}
  function setField(k,v){setDraft(d=>({...d,[k]:v}));setDirty(true)}
  function save(){const next=saveMenteEntry(selWk,draft);setMenteLog(next);setDirty(false)}
  function editWeek(w){
    if(dirty&&!confirm('Você tem alterações não salvas nesta semana. Descartar e editar outra?'))return;
    setSelWk(w);setDirty(false);
  }

  const weeks=Object.keys(log).sort().slice(-8);
  const avgOfEntry=e=>{const vs=Object.values(e.nota||{}).filter(v=>typeof v==='number');return vs.length?vs.reduce((a,b)=>a+b,0)/vs.length:null};
  const chartData=weeks.map(w=>({l:w.slice(6),v:avgOfEntry(log[w])})).filter(x=>x.v!==null);

  return(
    <div className="page">
      <div className="ph">
        <div className="pt" style={{color:'var(--p-mente)'}}>Mente</div>
        <div className="ps">Check-in semanal — {selWk}{!isCurrentWeek&&<span> · editando semana anterior</span>}</div>
      </div>

      {!isCurrentWeek&&(
        <div className="banner" style={{background:'var(--p-mente-bg)',borderColor:'rgba(169,129,46,.3)',color:'var(--gold)'}}>
          <span>✎ Editando um check-in de semana anterior.</span>
          <button className="btn ghost sm" style={{marginLeft:'auto'}} onClick={()=>editWeek(currentWk)}>Voltar para a semana atual</button>
        </div>
      )}

      <div className="card" style={{marginBottom:14}}>
        <div className="ct">Como você está — nota de 1 a 5 por área</div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {MENTE_AREAS.map(a=>(
            <div key={a.k}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12.5,fontWeight:600}}>{a.l}</span>
                <span style={{fontSize:12.5,fontWeight:700,color:'var(--gold)'}}>{draft.nota[a.k]||'–'}</span>
              </div>
              <div style={{display:'flex',gap:6}}>
                {[1,2,3,4,5].map(n=>(
                  <div key={n} onClick={()=>setNota(a.k,n)} style={{flex:1,height:28,borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,
                    background:(draft.nota[a.k]||0)>=n?'var(--accent)':'var(--s2)',
                    color:(draft.nota[a.k]||0)>=n?'#F7F3E8':'var(--t3)',
                    transition:'all .12s'}}>{n}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Uma coisa boa desta semana</div>
          <textarea className="input" placeholder="O que valeu a pena…" value={draft.bom} onChange={e=>setField('bom',e.target.value)}/>
        </div>
        <div className="card">
          <div className="ct">O que aprendi / o que quero mudar</div>
          <textarea className="input" placeholder="Insights, ajustes para a próxima semana…" value={draft.aprendizado} onChange={e=>setField('aprendizado',e.target.value)}/>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:14}}>
        <button className="btn" onClick={save} disabled={!dirty}>{dirty?'Salvar check-in':'Salvo'}</button>
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Perfil da semana</div>
          {Object.keys(draft.nota).length===0?<Empty ico="≈" title="Sem notas ainda" desc="Preencha as notas acima para ver o perfil"/>:(
            <ChartBox type="radar" height={220} labels={MENTE_AREAS.map(a=>a.l)} datasets={[{label:'Nota',data:MENTE_AREAS.map(a=>draft.nota[a.k]||0),backgroundColor:'rgba(169,129,46,.18)',borderColor:'#A9812E',borderWidth:2,pointBackgroundColor:'#A9812E',pointRadius:3}]}
              opts={{plugins:{legend:{display:false}},scales:{r:{min:0,max:5,ticks:{stepSize:1,color:'#87816D',font:{size:9},backdropColor:'transparent'},grid:{color:'rgba(20,32,58,.1)'},angleLines:{color:'rgba(20,32,58,.1)'},pointLabels:{color:'#4C5872',font:{size:10.5,weight:600}}}}}}/>
          )}
        </div>
        {chartData.length>=2&&(
          <div className="card">
            <div className="ct">Evolução — nota média semanal</div>
            <ChartBox labels={chartData.map(x=>x.l)} datasets={[ds('Nota média',chartData.map(x=>Math.round(x.v*10)/10),'#A9812E','rgba(169,129,46,.12)')]} opts={{scales:{y:{min:0,max:5,ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}}}}}/>
          </div>
        )}
      </div>

      {weeks.length>0&&(
        <div className="card" style={{marginTop:14}}>
          <div className="ct">Check-ins anteriores — clique para editar</div>
          <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:280,overflowY:'auto'}}>
            {weeks.slice().reverse().filter(w=>w!==selWk).map(w=>{
              const e=log[w];
              const avg=avgOfEntry(e);
              return(
                <div key={w} onClick={()=>editWeek(w)} style={{padding:'8px 10px',background:'var(--s2)',borderRadius:10,cursor:'pointer',transition:'background .12s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:11.5,fontWeight:700}}>{w}{w===currentWk?' · atual':''}</span>
                    {avg!==null&&<span style={{fontSize:11.5,fontWeight:700,color:'var(--gold)'}}>{avg.toFixed(1)}/5</span>}
                  </div>
                  {e.bom&&<div style={{fontSize:11.5,color:'var(--t2)'}}>✓ {e.bom}</div>}
                  {e.aprendizado&&<div style={{fontSize:11.5,color:'var(--t2)',marginTop:2}}>◇ {e.aprendizado}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================ PÁGINA: FINANÇAS ============================
function FinancasPage({financeLog,setFinanceLog}){
  const NOW=new Date();
  const currentMk=monthKey(NOW);
  const[mk,setMk]=useState(currentMk);
  const[form,setForm]=useState({title:'',valor:'',tipo:'saida',categoria:FINANCE_CATS[0],recorrente:false});
  const log=financeLog||{};
  const entries=(log[mk]||[]).slice().sort((a,b)=>b.data<a.data?-1:1);

  const balance=entries.reduce((a,e)=>a+(e.tipo==='entrada'?e.valor:-e.valor),0);
  const totalEntrada=entries.filter(e=>e.tipo==='entrada').reduce((a,e)=>a+e.valor,0);
  const totalSaida=entries.filter(e=>e.tipo==='saida').reduce((a,e)=>a+e.valor,0);
  const byCat={};
  entries.filter(e=>e.tipo==='saida').forEach(e=>{byCat[e.categoria]=(byCat[e.categoria]||0)+e.valor});
  const catRows=Object.keys(byCat).map(c=>({c,v:byCat[c]})).sort((a,b)=>b.v-a.v);
  const maxCat=catRows.length?catRows[0].v:1;

  const months=[];
  for(let i=0;i<6;i++){const d=new Date(NOW.getFullYear(),NOW.getMonth()-i,1);months.push({k:monthKey(d),l:d.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})})}
  const monthTrend=months.slice().reverse().map(m=>{
    const es=log[m.k]||[];
    return {l:m.l,entrada:es.filter(e=>e.tipo==='entrada').reduce((a,e)=>a+e.valor,0),saida:es.filter(e=>e.tipo==='saida').reduce((a,e)=>a+e.valor,0)};
  });
  const hasTrend=monthTrend.some(m=>m.entrada>0||m.saida>0);
  const CAT_COLORS=['#3F6B4C','#2E5178','#A9812E','#8A4A3A','#5B4E85','#A15A2A','#14203A','#87816D','#4C5872','#B08D57'];

  // recorrentes do mês anterior que ainda não foram lançados no mês atual (por título)
  const prevMk=(()=>{const d=new Date(NOW.getFullYear(),NOW.getMonth()-1,1);return monthKey(d)})();
  const prevRecurring=(log[prevMk]||[]).filter(e=>e.recorrente);
  const currentTitles=new Set((log[currentMk]||[]).map(e=>e.title.toLowerCase()));
  const pendingRecurring=mk===currentMk?prevRecurring.filter(e=>!currentTitles.has(e.title.toLowerCase())):[];

  function submit(){
    const valor=parseFloat(form.valor?String(form.valor).replace(',','.'):'');
    if(!form.title.trim()||!valor||valor<=0)return;
    const entry={id:'f'+Date.now().toString(36),title:form.title.trim(),valor,tipo:form.tipo,categoria:form.categoria,data:currentMk+'-'+pad2(NOW.getDate()),recorrente:form.recorrente};
    const next=addFinanceEntry(entry);
    setFinanceLog(next);
    setForm({title:'',valor:'',tipo:'saida',categoria:FINANCE_CATS[0],recorrente:false});
    if(mk!==currentMk)setMk(currentMk);
  }
  function addRecurring(e){
    const entry={id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),title:e.title,valor:e.valor,tipo:e.tipo,categoria:e.categoria,data:currentMk+'-'+pad2(NOW.getDate()),recorrente:true};
    const next=addFinanceEntry(entry);
    setFinanceLog(next);
  }
  function remove(id){
    const next=deleteFinanceEntry(mk,id);
    setFinanceLog(next);
  }
  function exportCSV(){
    const monthLabel=months.find(m=>m.k===mk)?.l||mk;
    const rows=[['Data','Título','Tipo','Categoria','Valor (R$)']];
    entries.slice().reverse().forEach(e=>rows.push([e.data.slice(8,10)+'/'+e.data.slice(5,7),e.title,e.tipo==='entrada'?'Entrada':'Saída',e.categoria,e.valor.toFixed(2).replace('.',',')]));
    rows.push([]);
    rows.push(['Total entradas','','','',totalEntrada.toFixed(2).replace('.',',')]);
    rows.push(['Total saídas','','','',totalSaida.toFixed(2).replace('.',',')]);
    rows.push(['Saldo','','','',balance.toFixed(2).replace('.',',')]);
    downloadCSV('financas-'+mk+'.csv',rows);
  }
  const fmtBRL=v=>'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div className="pt" style={{color:'var(--p-financas)'}}>Finanças</div>
          <Seg options={months.slice().reverse().map(m=>({v:m.k,l:m.l}))} value={mk} onChange={setMk}/>
        </div>
        <div className="ps">Lançamentos manuais — entradas e saídas</div>
      </div>

      {pendingRecurring.length>0&&(
        <div className="banner">
          <span>↻ {pendingRecurring.length} lançamento{pendingRecurring.length===1?'':'s'} recorrente{pendingRecurring.length===1?'':'s'} de {months.find(m=>m.k===prevMk)?.l||prevMk} ainda não {pendingRecurring.length===1?'foi lançado':'foram lançados'} este mês: {pendingRecurring.map(e=>e.title).join(', ')}.</span>
          <button className="btn sm" style={{marginLeft:'auto',flexShrink:0}} onClick={()=>pendingRecurring.forEach(addRecurring)}>+ Lançar {pendingRecurring.length===1?'este':'todos'}</button>
        </div>
      )}

      <div className="g g3" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Saldo do mês</div>
          <div className="mv" style={{color:balance>=0?'var(--t)':'var(--red)'}}>{(balance>=0?'+':'-')+fmtBRL(Math.abs(balance))}</div>
        </div>
        <div className="card">
          <div className="ct">Entradas</div>
          <div className="mv">{fmtBRL(totalEntrada)}</div>
        </div>
        <div className="card">
          <div className="ct">Saídas</div>
          <div className="mv">{fmtBRL(totalSaida)}</div>
        </div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="ct">Novo lançamento{mk!==currentMk?' — será adicionado em '+months.find(m=>m.k===currentMk).l:''}</div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,alignItems:'center'}}>
          <input className="input" placeholder="Título (ex: Mercado, Salário…)" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          <input className="input" placeholder="Valor" inputMode="decimal" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          <select className="input" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
            <option value="saida">Saída</option>
            <option value="entrada">Entrada</option>
          </select>
          <select className="input" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
            {FINANCE_CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn" onClick={submit}>+ Adicionar</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:7,marginTop:10,cursor:'pointer'}} onClick={()=>setForm({...form,recorrente:!form.recorrente})}>
          <div className={'cb '+(form.recorrente?'done':'')} style={{width:15,height:15,minWidth:15}}>
            {form.recorrente&&<svg width="8" height="6" viewBox="0 0 9 7"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#F7F3E8" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span style={{fontSize:11.5,color:'var(--t2)'}}>Recorrente — sugerir novamente todo mês (ex: aluguel, assinaturas)</span>
        </div>
      </div>

      {hasTrend&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="ct">Entradas x saídas — últimos 6 meses</div>
          <ChartBox type="bar" labels={monthTrend.map(m=>m.l)} datasets={[
            {label:'Entradas',data:monthTrend.map(m=>m.entrada),backgroundColor:'rgba(63,107,76,.7)',borderRadius:5},
            {label:'Saídas',data:monthTrend.map(m=>m.saida),backgroundColor:'rgba(122,58,46,.65)',borderRadius:5},
          ]} opts={{plugins:{legend:{display:true}},scales:{y:{ticks:{color:'#87816D',font:{size:9.5},callback:v=>'R$ '+v.toLocaleString('pt-BR',{maximumFractionDigits:0})},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5}},grid:{display:false}}}}}/>
        </div>
      )}

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div className="ct" style={{marginBottom:0}}>Lançamentos do mês</div>
            {entries.length>0&&<button className="btn ghost sm" onClick={exportCSV}>⬇ Exportar CSV</button>}
          </div>
          {entries.length===0?<Empty ico="⚖" title="Nenhum lançamento" desc="Adicione seu primeiro gasto ou entrada acima"/>:(
            <div style={{maxHeight:360,overflowY:'auto'}}>
              {entries.map(e=>(
                <div key={e.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 4px',borderBottom:'1px solid var(--b)'}}>
                  <div style={{width:30,height:30,borderRadius:9,background:e.tipo==='entrada'?'var(--p-financas-bg)':'var(--rbg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0,color:e.tipo==='entrada'?'var(--p-financas)':'var(--red)',fontWeight:800}}>{e.tipo==='entrada'?'↑':'↓'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.title}</div>
                    <div style={{fontSize:10.5,color:'var(--t3)'}}>{e.categoria} · {e.data.slice(8,10)}/{e.data.slice(5,7)}{e.recorrente?' · ↻ recorrente':''}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:e.tipo==='entrada'?'var(--p-financas)':'var(--red)'}}>{e.tipo==='entrada'?'+':'-'}{fmtBRL(e.valor)}</div>
                  <button className="btn ghost sm" onClick={()=>remove(e.id)} style={{color:'var(--red)'}}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="ct">Gastos por categoria</div>
          {catRows.length===0?<Empty ico="⚖" title="Sem saídas registradas" desc="As categorias aparecem aqui"/>:(
            <div>
              <ChartBox type="doughnut" height={190} labels={catRows.map(r=>r.c)} datasets={[{data:catRows.map(r=>r.v),backgroundColor:catRows.map((_,i)=>CAT_COLORS[i%CAT_COLORS.length]),borderColor:'#F7F3E8',borderWidth:2,hoverOffset:6}]}
                opts={{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+c.label+': '+fmtBRL(c.parsed)}}},cutout:'62%'}}/>
              <div style={{display:'flex',flexDirection:'column',gap:7,marginTop:12}}>
                {catRows.map((r,i)=>(
                  <div key={r.c} style={{display:'flex',alignItems:'center',gap:8,fontSize:11.5}}>
                    <div style={{width:8,height:8,borderRadius:2,background:CAT_COLORS[i%CAT_COLORS.length],flexShrink:0}}/>
                    <span style={{flex:1,color:'var(--t2)'}}>{r.c}</span>
                    <b>{fmtBRL(r.v)}</b>
                    <span style={{color:'var(--t3)',minWidth:34,textAlign:'right'}}>{Math.round(r.v/totalSaida*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================ PÁGINA: CARREIRA ============================
function CarreiraPage({careerLog,setCareerLog}){
  const log=careerLog||{};
  const[track,setTrack]=useState(CAREER_TRACKS[0].id);
  const[text,setText]=useState('');
  const[prazo,setPrazo]=useState('');
  const goals=(log[track]||[]).slice().sort((a,b)=>{
    if(a.done!==b.done)return a.done?1:-1;
    if(a.prazo&&b.prazo)return a.prazo<b.prazo?-1:1;
    if(a.prazo)return -1;
    if(b.prazo)return 1;
    return 0;
  });
  const tk=todayKey();

  function addGoal(){
    if(!text.trim())return;
    const next={...log,[track]:(log[track]||[]).concat([{id:'g'+Date.now().toString(36),texto:text.trim(),pct:0,done:false,prazo:prazo||null}])};
    setCareerLog(saveCareerLog(next));
    setText('');setPrazo('');
  }
  function updateGoal(id,patch){
    const next={...log,[track]:(log[track]||[]).map(g=>g.id===id?{...g,...patch}:g)};
    setCareerLog(saveCareerLog(next));
  }
  function removeGoal(id){
    const next={...log,[track]:(log[track]||[]).filter(g=>g.id!==id)};
    setCareerLog(saveCareerLog(next));
  }
  function fmtPrazo(p){
    const d=new Date(p+'T12:00:00');
    return d.getDate()+' '+MESES[d.getMonth()].slice(0,3);
  }

  const all=careerNormalized(log).flat;
  const overallPct=all.length?Math.round(all.reduce((a,g)=>a+(g.pct||0),0)/all.length):null;
  const trackStats=CAREER_TRACKS.map(t=>{
    const g=log[t.id]||[];
    const pct=g.length?Math.round(g.reduce((a,x)=>a+(x.pct||0),0)/g.length):0;
    return {...t,g,pct};
  });
  const TRACK_COLORS={ouribank:'#A15A2A',fgv:'#2E5178',paralelos:'#3F6B4C'};
  function exportCSV(){
    const rows=[['Frente','Meta','Progresso (%)','Concluída','Prazo']];
    CAREER_TRACKS.forEach(t=>(log[t.id]||[]).forEach(g=>rows.push([t.label,g.texto,g.pct,g.done?'Sim':'Não',g.prazo?fmtPrazo(g.prazo):''])));
    downloadCSV('carreira-metas.csv',rows);
  }

  return(
    <div className="page">
      <div className="ph">
        <div className="pt" style={{color:'var(--p-carreira)'}}>Carreira</div>
        <div className="ps">Ouribank, FGV e projetos paralelos</div>
      </div>

      <div className="g g23" style={{marginBottom:14}}>
        <div className="card">
          <div className="ct">Progresso por frente</div>
          <div style={{display:'flex',flexDirection:'column',gap:16,marginTop:4}}>
            {trackStats.map(t=>(
              <div key={t.id}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12.5}}>
                  <span style={{fontWeight:600}}>{t.label}</span>
                  <span style={{fontWeight:700,color:TRACK_COLORS[t.id]}}>{t.pct}%</span>
                </div>
                <div className="pbar"><div className="pf" style={{width:t.pct+'%',background:TRACK_COLORS[t.id]}}/></div>
                <div style={{fontSize:10.5,color:'var(--t3)',marginTop:4}}>{t.g.filter(x=>x.done).length}/{t.g.length} metas concluídas</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <div className="ct" style={{alignSelf:'flex-start'}}>Progresso geral</div>
          <div style={{position:'relative',width:150,height:150}}>
            <ChartBox type="doughnut" height={150} labels={trackStats.map(t=>t.label)} datasets={[{data:trackStats.map(t=>Math.max(t.pct,0.001)),backgroundColor:trackStats.map(t=>TRACK_COLORS[t.id]),borderColor:'#F7F3E8',borderWidth:2}]}
              opts={{plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+c.label+': '+Math.round(c.parsed)+'%'}}},cutout:'72%'}}/>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
              <div style={{fontSize:26,fontWeight:800,color:'var(--p-carreira)'}}>{overallPct!==null?overallPct+'%':'–'}</div>
              <div style={{fontSize:9.5,color:'var(--t3)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>geral</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <Seg options={CAREER_TRACKS.map(t=>({v:t.id,l:t.label}))} value={track} onChange={setTrack}/>
          {all.length>0&&<button className="btn ghost sm" onClick={exportCSV}>⬇ Exportar CSV</button>}
        </div>
        <div style={{display:'flex',gap:8,margin:'14px 0'}}>
          <input className="input" style={{flex:1}} placeholder="Nova meta ou próximo passo…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGoal()}/>
          <input className="input" type="date" style={{width:150}} value={prazo} onChange={e=>setPrazo(e.target.value)} title="Prazo (opcional)"/>
          <button className="btn" onClick={addGoal}>+ Adicionar</button>
        </div>
        {goals.length===0?<Empty ico="◆" title="Nenhuma meta" desc="Adicione a primeira meta desta frente"/>:(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {goals.map(g=>{
              const late=g.prazo&&!g.done&&g.prazo<tk;
              const soon=g.prazo&&!g.done&&!late&&g.prazo<=dayKey(addDays(new Date(),7));
              return(
              <div key={g.id}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <div className={'cb '+(g.done?'done':'')} onClick={()=>updateGoal(g.id,{done:!g.done,pct:!g.done?100:g.pct})}>
                    {g.done&&<svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#F7F3E8" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,textDecoration:g.done?'line-through':'none',color:g.done?'var(--t3)':'var(--t)'}}>{g.texto}</div>
                    {g.prazo&&<div style={{fontSize:10.5,fontWeight:700,marginTop:2,color:late?'var(--red)':soon?'var(--amber)':'var(--t3)'}}>{late?'venceu em ':soon?'vence em ':'prazo: '}{fmtPrazo(g.prazo)}</div>}
                  </div>
                  <span style={{fontSize:11.5,fontWeight:700,color:'var(--p-carreira)',minWidth:32,textAlign:'right'}}>{g.pct}%</span>
                  <button className="btn ghost sm" onClick={()=>removeGoal(g.id)} style={{color:'var(--red)'}}>✕</button>
                </div>
                <input type="range" min="0" max="100" step="10" value={g.pct} disabled={g.done}
                  onChange={e=>updateGoal(g.id,{pct:parseInt(e.target.value),done:parseInt(e.target.value)===100})}
                  style={{width:'100%',accentColor:'#A15A2A'}}/>
              </div>
              );
            })}
          </div>
        )}
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
    if(filter==='hoje')return !t.done&&dk&&dk<=tk;
    if(filter==='amanha')return !t.done&&dk===dayKey(addDays(new Date(),1));
    if(filter==='semana')return !t.done&&dk&&dk>=tk&&dk<=week;
    if(filter==='atrasadas')return !t.done&&dk&&dk<tk;
    if(filter==='semdata')return !t.done&&!dk;
    return true;
  }

  const pend=tasks.filter(t=>!t.done);
  const overdue=pend.filter(t=>dueKeyOf(t)&&dueKeyOf(t)<tk);
  const dueToday=pend.filter(t=>dueKeyOf(t)===tk);
  const doneWeek=tasks.filter(t=>t.done&&t.completed&&t.completed.slice(0,10)>=dayKey(addDays(new Date(),-7))).length;

  // Agrupa por lista, com subtarefas aninhadas
  function listTasks(listId){
    const all=tasks.filter(t=>t.listId===listId&&matches(t));
    const parents=all.filter(t=>!t.parent).sort((a,b)=>{
      const da=dueKeyOf(a),db=dueKeyOf(b);
      if(!!da!==!!db)return da?-1:1;          // com data antes de sem data
      if(da&&db&&da!==db)return da<db?-1:1;   // mais próxima primeiro (atrasadas no topo)
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
            {t.done&&<svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#F7F3E8" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
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
        <Seg options={[{v:'todas',l:'Todas'},{v:'hoje',l:'Hoje'},{v:'amanha',l:'Amanhã'},{v:'semana',l:'Semana'},{v:'atrasadas',l:'Atrasadas'},{v:'semdata',l:'Sem data'}]} value={filter} onChange={setFilter}/>
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
                <div key={i} style={{background:isT?'var(--abg)':'var(--s2)',borderRadius:12,padding:'10px 8px',minHeight:140,border:isT?'1px solid rgba(20,32,58,.28)':'1px solid transparent'}}>
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

// ============================ PÁGINA: VIDA (relatórios e estatísticas) ============================
function VidaPage({whoop,google,habitLog,habitDefs,history}){
  const NOW=new Date();
  const defs=habitDefs||DEFS.list;
  const wd=whoop&&whoop.data,gd=google&&google.data;
  const tasks=(gd&&gd.tasks)||[];
  const recS=seriesRecovery(wd||{}),slpS=seriesSleep(wd||{}),strS=seriesStrain(wd||{});
  const workouts=((wd&&wd.workouts&&wd.workouts.records)||[]).filter(w=>w.score);

  const monThis=weekMonday(NOW),monLast=addDays(monThis,-7);
  function inRange(d,from,days){const x=(d instanceof Date)?d:new Date(d);return x>=from&&x<addDays(from,days)}
  function habitRateRange(from,days){
    let done=0,tot=0;
    for(let i=0;i<days;i++){
      const d=addDays(from,i);
      if(d>NOW)break;
      const dk=dayKey(d);
      defs.forEach(h=>{tot++;if(habitDone(habitLog,dk,h.id))done++});
    }
    return tot?done/tot:null;
  }
  function avgRangeD(arr,key,from,days){
    const xs=arr.filter(r=>inRange(r.date,from,days)).map(r=>r[key]).filter(v=>v!==null&&v!==undefined&&!isNaN(v));
    return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
  }
  const tasksDone=(from,days)=>tasks.filter(t=>t.done&&t.completed&&inRange(t.completed,from,days)).length;
  const workoutsIn=(from,days)=>workouts.filter(w=>inRange(w.start,from,days)).length;

  const f0=v=>v===null?'–':Math.round(v)+'';
  const fp=v=>v===null?'–':Math.round(v)+'%';
  const f1=v=>v===null?'–':(Math.round(v*10)/10).toFixed(1);
  const rows=[
    {l:'Hábitos concluídos',a:habitRateRange(monThis,7),b:habitRateRange(monLast,7),fmt:v=>v===null?'–':Math.round(v*100)+'%',gu:true},
    {l:'Tarefas concluídas',a:tasksDone(monThis,7),b:tasksDone(monLast,7),fmt:f0,gu:true},
    {l:'Recovery médio',a:avgRangeD(recS,'rec',monThis,7),b:avgRangeD(recS,'rec',monLast,7),fmt:fp,gu:true},
    {l:'Sono (performance)',a:avgRangeD(slpS,'perf',monThis,7),b:avgRangeD(slpS,'perf',monLast,7),fmt:fp,gu:true},
    {l:'Strain médio',a:avgRangeD(strS,'strain',monThis,7),b:avgRangeD(strS,'strain',monLast,7),fmt:f1,gu:null},
    {l:'Treinos',a:workoutsIn(monThis,7),b:workoutsIn(monLast,7),fmt:f0,gu:true},
  ];

  // estatísticas de vida
  const logDays=Object.keys(habitLog);
  const totalChecks=logDays.reduce((a,dk)=>a+Object.keys(habitLog[dk]||{}).length,0);
  const perfectDays=logDays.filter(dk=>defs.length&&defs.every(h=>habitDone(habitLog,dk,h.id))).length;
  const bestStreak=Math.max(...defs.map(h=>habitStreak(habitLog,h.id)),0);
  const kcalTotal=workouts.reduce((a,w)=>a+kcal(w.score.kilojoule||0),0);
  const done30=tasks.filter(t=>t.done&&t.completed&&new Date(t.completed)>addDays(NOW,-30)).length;

  // evolução semanal de hábitos (8 semanas)
  const weekScores=[];
  for(let w=7;w>=0;w--){
    const ws=addDays(monThis,-7*w);
    const r=habitRateRange(ws,7);
    weekScores.push({l:fmtDM(ws),v:r===null?0:Math.round(r*100)});
  }
  const labels=recS.slice(-30).map(r=>fmtDM(r.date));

  return(
    <div className="page">
      <div className="ph"><div className="pt">Vida</div><div className="ps">Relatórios e estatísticas de longo prazo</div></div>

      <div className="card" style={{marginBottom:14}}>
        <div className="ct">📋 Relatório da semana — atual × anterior</div>
        <table className="tbl">
          <thead><tr><th>Métrica</th><th>Esta semana</th><th>Anterior</th><th>Δ</th></tr></thead>
          <tbody>
            {rows.map(r=>{
              const t=trend(typeof r.a==='number'?r.a:null,typeof r.b==='number'?r.b:null);
              const col=!t||r.gu===null?'var(--t3)':(t.up===r.gu?'var(--green)':'var(--red)');
              return(
                <tr key={r.l}>
                  <td style={{color:'var(--t2)',fontWeight:600}}>{r.l}</td>
                  <td style={{fontWeight:700}}>{r.fmt(r.a)}</td>
                  <td style={{color:'var(--t3)'}}>{r.fmt(r.b)}</td>
                  <td style={{color:col,fontWeight:700,fontSize:11}}>{t?(t.up?'▲':'▼')+t.pct+'%':'—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{fontSize:10.5,color:'var(--t3)',marginTop:8}}>Semana atual conta só até hoje — os números fecham no domingo.</div>
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        {[
          {l:'Hábitos marcados (total)',v:totalChecks,c:'var(--a2)'},
          {l:'Dias 100% disciplina',v:perfectDays,c:'var(--green)'},
          {l:'Maior sequência ativa',v:bestStreak+'d 🔥',c:'var(--amber)'},
          {l:'Tarefas feitas (30d)',v:done30,c:'var(--violet)'},
        ].map(m=>(
          <div key={m.l} className="card"><div className="ct">{m.l}</div><div className="mv" style={{color:m.c}}>{m.v}</div></div>
        ))}
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        {[
          {l:'Treinos no período',v:workouts.length,c:'var(--orange)'},
          {l:'Calorias em treinos',v:kcalTotal.toLocaleString('pt-BR')+' kcal',c:'var(--red)'},
          {l:'Dias com hábitos registrados',v:logDays.length,c:'var(--blue)'},
          {l:'Hábitos ativos',v:defs.length,c:'var(--cyan)'},
        ].map(m=>(
          <div key={m.l} className="card"><div className="ct">{m.l}</div><div className="mv" style={{color:m.c,fontSize:22}}>{m.v}</div></div>
        ))}
      </div>

      {(()=>{
        const keys=history?Object.keys(history).sort():[];
        if(keys.length===0)return(
          <div className="card" style={{marginBottom:14,borderColor:'rgba(20,32,58,.16)'}}>
            <div className="ct">🗄️ Memória permanente</div>
            <div style={{fontSize:12.5,color:'var(--t2)',lineHeight:1.7}}>
              Toda madrugada (~3h30), o Isaac OS grava sozinho um resumo do dia anterior — recovery, sono, strain, treinos, hábitos e tarefas — num histórico que nunca expira. O WHOOP só guarda ~50 dias; aqui fica para sempre. O primeiro registro aparece amanhã de manhã.
            </div>
          </div>
        );
        const last=keys.slice(-90);
        const H=history;
        const avg=(k)=>{const xs=last.map(d=>H[d][k]).filter(v=>v!==undefined&&v!==null);return xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length):null};
        const habAvg=(()=>{const xs=last.map(d=>H[d].habT?H[d].hab/H[d].habT:null).filter(v=>v!==null);return xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length*100):null})();
        const bestRec=keys.reduce((b,d)=>H[d].rec!==undefined&&(!b||H[d].rec>H[b].rec)?d:b,null);
        return(
          <div className="card" style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,flexWrap:'wrap',gap:8}}>
              <div className="ct" style={{marginBottom:0}}>🗄️ Memória permanente</div>
              <div className="badge a-">{keys.length} {keys.length===1?'dia registrado':'dias registrados'} · para sempre</div>
            </div>
            <div style={{display:'flex',gap:18,flexWrap:'wrap',marginBottom:14}}>
              {[
                {l:'Recovery médio',v:avg('rec'),f:v=>v+'%',c:'var(--green)'},
                {l:'Sono médio',v:avg('slp'),f:v=>v+'%',c:'var(--blue)'},
                {l:'Hábitos médios',v:habAvg,f:v=>v+'%',c:'var(--a2)'},
                {l:'Melhor recovery',v:bestRec?H[bestRec].rec:null,f:v=>v+'% ('+fmtDM(bestRec+'T12:00:00')+')',c:'var(--amber)'},
              ].filter(x=>x.v!==null).map(x=>(
                <div key={x.l}>
                  <div style={{fontSize:16,fontWeight:800,color:x.c}}>{x.f(x.v)}</div>
                  <div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{x.l} (90d)</div>
                </div>
              ))}
            </div>
            {last.filter(d=>H[d].rec!==undefined||H[d].slp!==undefined).length>=2&&(
              <ChartBox labels={last.map(d=>fmtDM(d+'T12:00:00'))} datasets={[
                ds('Recovery %',last.map(d=>H[d].rec!==undefined?H[d].rec:null),'#34d399'),
                ds('Sono %',last.map(d=>H[d].slp!==undefined?H[d].slp:null),'#60a5fa'),
              ]} opts={{spanGaps:true,scales:{y:{min:0,max:100,ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5},maxTicksLimit:10},grid:{color:'rgba(20,32,58,.06)'}}}}}/>
            )}
          </div>
        );
      })()}

      <div className="g g2">
        <div className="card">
          <div className="ct">Disciplina — 8 semanas</div>
          <ChartBox type="bar" labels={weekScores.map(w=>w.l)} datasets={[{label:'%',data:weekScores.map(w=>w.v),backgroundColor:'rgba(20,32,58,.5)',borderRadius:5}]} opts={{plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5}},grid:{display:false}}}}}/>
        </div>
        <div className="card">
          <div className="ct">Recovery — 30 dias</div>
          {recS.length?<ChartBox labels={labels} datasets={[ds('Recovery %',recS.slice(-30).map(r=>Math.round(r.rec)),'#34d399','rgba(52,211,153,.1)')]} opts={{scales:{y:{min:0,max:100,ticks:{color:'#87816D',font:{size:9.5}},grid:{color:'rgba(20,32,58,.06)'}},x:{ticks:{color:'#87816D',font:{size:9.5},maxTicksLimit:8},grid:{color:'rgba(20,32,58,.06)'}}}}}/>:<Empty ico="⚡" title="Sem dados WHOOP" desc="Conecte o WHOOP para ver a evolução"/>}
        </div>
      </div>
    </div>
  );
}

// ============================ IA: CHAT ============================
const AI_SUGGESTIONS=['Como foi minha semana?','O que devo priorizar agora?','Analisa meu sono e me dá 2 conselhos','Que padrões você vê nos meus dados?'];
function ChatSheet({open,onClose,ctxBuilder}){
  const[msgs,setMsgs]=useState(LS('ai_chat',[]));
  const[input,setInput]=useState('');
  const[busy,setBusy]=useState(false);
  const boxRef=useRef(null);
  useEffect(()=>{if(boxRef.current)boxRef.current.scrollTop=boxRef.current.scrollHeight},[msgs,busy,open]);
  useEffect(()=>{
    if(!open)return;
    function onKey(e){if(e.key==='Escape')onClose()}
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[open]);
  if(!open)return null;
  async function send(qRaw){
    const q=(qRaw!==undefined?qRaw:input).trim();
    if(!q||busy)return;
    const m=msgs.concat([{r:'u',t:q}]);
    setMsgs(m);LSet('ai_chat',m);setInput('');setBusy(true);
    let t;
    try{
      const r=await fetch('/ai',{method:'POST',headers:{'Content-Type':'application/json','X-Sync-Key':getSyncKey()||''},body:JSON.stringify({question:q,context:ctxBuilder(),history:m.slice(-7,-1)})});
      const j=await r.json();
      if(j.answer)t=j.answer;
      else if(j.error==='missing_key')t='Falta a chave do Gemini no Vercel. É grátis: entra em aistudio.google.com/apikey, cria a chave com sua conta Google, e adiciona como GEMINI_API_KEY nas Environment Variables (+ redeploy).';
      else if(j.error==='invalid_key'||r.status===401)t='Ativa a sincronização (PIN) nos ⚙️ Ajustes primeiro — a IA usa a mesma proteção.';
      else if(j.error==='rate_limit')t='Limite gratuito do minuto atingido — espera ~1 minuto e tenta de novo.';
      else t='Erro: '+(j.detail||j.error||r.status);
    }catch(e){t='Sem conexão com a IA agora ('+e.message+').';}
    const m2=m.concat([{r:'a',t}]);
    setMsgs(m2);LSet('ai_chat',m2);setBusy(false);
  }
  return(
    <div className="sheet">
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 16px',borderBottom:'1px solid var(--b)'}}>
        <span style={{fontSize:18}}>✨</span>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800}}>IA do Isaac OS</div>
          <div style={{fontSize:10,color:'var(--t3)'}}>Gemini · enxerga todos os seus dados</div>
        </div>
        {msgs.length>0&&<button className="btn ghost sm" onClick={()=>{setMsgs([]);LDel('ai_chat')}}>Limpar</button>}
        <button className="btn ghost sm" onClick={onClose}>✕</button>
      </div>
      <div ref={boxRef} style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
        {msgs.length===0&&(
          <div style={{margin:'auto 0',textAlign:'center'}}>
            <div style={{fontSize:34,marginBottom:10}}>✨</div>
            <div style={{fontSize:13,color:'var(--t2)',marginBottom:16}}>Pergunta qualquer coisa sobre sua saúde, hábitos, tarefas ou agenda — eu enxergo tudo, inclusive a memória permanente.</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
              {AI_SUGGESTIONS.map(sg=><div key={sg} className="chip" onClick={()=>send(sg)}>{sg}</div>)}
            </div>
          </div>
        )}
        {msgs.map((m,i)=><div key={i} className={'msg '+(m.r==='u'?'u':'a')}>{m.t}</div>)}
        {busy&&<div className="msg a" style={{color:'var(--t3)'}}>Analisando seus dados…</div>}
      </div>
      <div style={{display:'flex',gap:8,padding:'12px 14px',borderTop:'1px solid var(--b)'}}>
        <input className="input" placeholder="Pergunte à IA…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} disabled={busy}/>
        <button className="btn" onClick={()=>send()} disabled={busy}>➤</button>
      </div>
    </div>
  );
}

function SettingsModal({open,onClose,syncState,onActivate,onDeactivate,onSyncNow,habitLog,habitDefs,setHabitDefs,pushPrefs,setPushPrefs,history,setPage}){
  const[pin,setPin]=useState(getSyncKey()||'');
  const[pushMsg,setPushMsg]=useState('');
  const[manage,setManage]=useState(false);
  const[draft,setDraft]=useState(null);
  function openManage(){setDraft((habitDefs||DEFS.list).map(h=>({...h,pilar:h.pilar||'saude'})));setManage(true)}
  function saveManage(){
    const clean=draft.filter(h=>h.name.trim()).map(h=>({id:h.id,name:h.name.trim(),ico:(h.ico||'✅').trim()||'✅',pilar:h.pilar||'saude'}));
    if(clean.length===0)return alert('Mantenha pelo menos 1 hábito.');
    setHabitDefs(clean);setManage(false);
  }
  function mv(i,dir){
    const d=draft.slice();const j=i+dir;
    if(j<0||j>=d.length)return;
    const t=d[i];d[i]=d[j];d[j]=t;setDraft(d);
  }
  return(
    <Modal open={open} onClose={()=>{if(!manage)onClose()}} title="Ajustes">
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        {setPage&&(
          <div className="hide-desktop">
            <div className="ct" style={{marginBottom:6}}>Mais páginas</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {['tarefas','agenda','vida'].map(k=>(
                <div key={k} className="chip" onClick={()=>{setPage(k);onClose()}}>{PAGES[k].ico} {PAGES[k].label}</div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <div className="ct" style={{marginBottom:0}}>Hábitos</div>
            <button className="btn ghost sm" onClick={openManage}>✎ Gerenciar</button>
          </div>
          <div style={{fontSize:11.5,color:'var(--t2)',lineHeight:1.6}}>
            {(habitDefs||DEFS.list).length} hábitos ativos, distribuídos pelos 6 pilares. Adicione, edite ou reatribua o pilar de cada um.
          </div>
        </div>
        <div>
          <div className="ct" style={{marginBottom:6}}>Sincronização entre dispositivos</div>
          <div style={{fontSize:11.5,color:'var(--t2)',lineHeight:1.6,marginBottom:10}}>
            Com o PIN ativo, conexões (WHOOP/Google), hábitos, finanças, carreira e mente ficam salvos no servidor — conecte uma vez e use no celular e no computador. Use o <b>mesmo PIN</b> em todos os aparelhos.
          </div>
          <div style={{display:'flex',gap:8}}>
            <input className="input" type="password" placeholder="PIN secreto (o mesmo do Vercel)" value={pin} onChange={e=>setPin(e.target.value)}/>
            {syncState.on
              ?<button className="btn danger sm" onClick={onDeactivate}>Desativar</button>
              :<button className="btn" onClick={()=>pin.trim()&&onActivate(pin.trim())}>Ativar</button>}
          </div>
          <div style={{fontSize:11,marginTop:8,color:syncState.err?'var(--red)':'var(--t3)'}}>
            {syncState.err?('⚠ '+syncState.err):syncState.on?(syncState.at?('✓ Sincronizado '+timeAgo(syncState.at)):'Ativado'):'Desativado'}
            {syncState.on&&<button className="btn ghost sm" style={{marginLeft:8}} onClick={onSyncNow}>Sincronizar agora</button>}
          </div>
        </div>
        <div>
          <div className="ct" style={{marginBottom:6}}>Notificações diárias</div>
          <div style={{fontSize:11.5,color:'var(--t2)',lineHeight:1.6,marginBottom:10}}>
            Bom dia com seu briefing (~3h30 grava o dia anterior na memória) e lembrete à noite (~21h30) se faltarem hábitos. No iPhone: adicione o site à Tela de Início e abra pelo ícone antes de ativar.
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {LS('push_on',false)
              ?<button className="btn danger sm" onClick={async()=>{await disablePush();setPushMsg('Notificações desativadas neste aparelho.')}}>Desativar neste aparelho</button>
              :<button className="btn sm" onClick={async()=>{try{const n=await enablePush();setPushMsg('✓ Ativas! ('+n+' aparelho'+(n>1?'s':'')+' registrado'+(n>1?'s':'')+')')}catch(e){setPushMsg('⚠ '+e.message)}}}>🔔 Ativar neste aparelho</button>}
          </div>
          {pushMsg&&<div style={{fontSize:11,marginTop:8,color:pushMsg.startsWith('⚠')?'var(--amber)':'var(--t3)'}}>{pushMsg}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:12}}>
            {[
              {k:'morning',l:'☀ Bom dia (~3h30 é gravado, chega de manhã)',d:'briefing do dia'},
              {k:'evening',l:'☾ Lembrete da noite (~21h30)',d:'só se faltarem hábitos'},
            ].map(o=>(
              <div key={o.k} className="task" style={{padding:'6px 8px'}} onClick={()=>setPushPrefs({...pushPrefs,[o.k]:!pushPrefs[o.k]})}>
                <div className={'cb '+(pushPrefs[o.k]?'done':'')}>
                  {pushPrefs[o.k]&&<svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#F7F3E8" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div><div className="tt">{o.l}</div><div style={{fontSize:10,color:'var(--t3)'}}>{o.d}</div></div>
              </div>
            ))}
            <div style={{fontSize:10.5,color:'var(--t3)'}}>Máximo absoluto: 2 notificações por dia. Sem spam, prometido.</div>
          </div>
        </div>
        <div>
          <div className="ct" style={{marginBottom:6}}>Backup</div>
          <button className="btn ghost sm" onClick={()=>{
            const data={habit_log:habitLog,habit_defs:DEFS.list,mente_log:loadMenteLog(),finance_log:loadFinanceLog(),career_log:loadCareerLog(),history:history||null,push_prefs:pushPrefs,exported_at:new Date().toISOString()};
            const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
            const a=document.createElement('a');
            a.href=URL.createObjectURL(blob);
            a.download='isaac-os-backup-'+todayKey()+'.json';
            a.click();
          }}>⬇ Exportar backup completo (JSON)</button>
          <div style={{fontSize:10.5,color:'var(--t3)',marginTop:6}}>Inclui hábitos, definições, finanças, carreira, mente e a memória permanente (relatórios da Vida).</div>
        </div>
      </div>

      <Modal open={manage} onClose={()=>setManage(false)} title="Gerenciar hábitos">
        {draft&&(
          <div>
            <div style={{fontSize:11,color:'var(--t3)',marginBottom:12}}>Emoji · nome · pilar · reordenar · excluir. O histórico de dias marcados é preservado. Com o WHOOP conectado, “Dormir antes da 1h” e “Levantar até 7h30” passam a ser calculados automaticamente (não aparecem mais para marcação manual), e “Dormir 6h30+” é adicionado como um terceiro hábito automático na página de Sono.</div>
            <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:'50vh',overflowY:'auto'}}>
              {draft.map((h,i)=>(
                <div key={h.id} style={{display:'flex',gap:6,alignItems:'center'}}>
                  <input className="input" style={{width:42,textAlign:'center',padding:'7px 4px'}} value={h.ico} onChange={e=>{const d=draft.slice();d[i]={...h,ico:e.target.value};setDraft(d)}}/>
                  <input className="input" style={{flex:1.4}} value={h.name} onChange={e=>{const d=draft.slice();d[i]={...h,name:e.target.value};setDraft(d)}}/>
                  <select className="input" style={{flex:1,fontSize:11.5,padding:'7px 6px'}} value={h.pilar||'saude'} onChange={e=>{const d=draft.slice();d[i]={...h,pilar:e.target.value};setDraft(d)}}>
                    {PILAR_ORDER.map(p=><option key={p} value={p}>{PILARES[p].label}</option>)}
                  </select>
                  <button className="btn ghost sm" onClick={()=>mv(i,-1)} disabled={i===0}>↑</button>
                  <button className="btn ghost sm" onClick={()=>mv(i,1)} disabled={i===draft.length-1}>↓</button>
                  <button className="btn ghost sm" style={{color:'var(--red)'}} onClick={()=>{if(confirm('Excluir "'+h.name+'"?'))setDraft(draft.filter(x=>x.id!==h.id))}}>🗑</button>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8,marginTop:14,justifyContent:'space-between'}}>
              <button className="btn ghost sm" onClick={()=>setDraft(draft.concat([{id:'h'+Date.now().toString(36),name:'',ico:'✅',pilar:'saude'}]))}>+ Adicionar hábito</button>
              <button className="btn" onClick={saveManage}>Salvar</button>
            </div>
          </div>
        )}
      </Modal>
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
  painel:  {label:'Painel',   ico:'◆', comp:PainelPage},
  saude:   {label:'Saúde',    ico:'●', comp:SaudePage},
  sono:    {label:'Sono',     ico:'☾', comp:SonoPage},
  religiao:{label:'Religião', ico:'✦', comp:ReligiaoPage},
  mente:   {label:'Mente',    ico:'≈', comp:MentePage},
  financas:{label:'Finanças', ico:'⚖', comp:FinancasPage},
  carreira:{label:'Carreira', ico:'◆', comp:CarreiraPage},
  tarefas: {label:'Tarefas',  ico:'✓', comp:TarefasPage},
  agenda:  {label:'Agenda',   ico:'▤', comp:AgendaPage},
  vida:    {label:'Vida',     ico:'▲', comp:VidaPage},
};
const PILLAR_PAGES=['saude','sono','religiao','mente','financas','carreira']; // recebem cor de identidade na sidebar

function App(){
  const[page,setPage]=useState('painel');
  const wcache=getWhoopCache();
  const[whoop,setWhoop]=useState(wcache?{loading:false,data:wcache.data,error:null,updatedAt:wcache.at}:{loading:false,data:null,error:null,updatedAt:null});
  const gcache=getGoogleCache();
  const[google,setGoogle]=useState(gcache?{loading:false,data:gcache.data,error:null,updatedAt:gcache.at}:{loading:false,data:null,error:null,updatedAt:null});
  const[habitLog,setHabitLog]=useState(loadHabitLog());
  const[habitDefs,setHabitDefsState]=useState(DEFS.list);
  const[settingsOpen,setSettingsOpen]=useState(false);
  const[aiOpen,setAiOpen]=useState(false);
  const[jew,setJew]=useState(null);
  const[weather,setWeather]=useState(null);
  const[brief,setBrief]=useState(null);
  const[history,setHistory]=useState(null);
  const[menteLog,setMenteLog]=useState(loadMenteLog());
  const[financeLog,setFinanceLog]=useState(loadFinanceLog());
  const[careerLog,setCareerLog]=useState(loadCareerLog());
  const[gemaraNotes,setGemaraNotes]=useState(loadGemaraNotes());
  const[pushPrefs,setPushPrefsState]=useState({morning:true,evening:true});
  function setPushPrefs(p2){setPushPrefsState(p2);syncPushSoon({push_prefs:p2});}
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
      if(remote.history)setHistory(remote.history);
      if(remote.push_prefs)setPushPrefsState(remote.push_prefs);
      const push={};
      // hábitos: log
      const lAt=LS('habit_log_at',0),rAt=remote.habit_log_at||0;
      if(remote.habit_log&&rAt>lAt){LSet('habit_log_v2',remote.habit_log);LSet('habit_log_at',rAt);setHabitLog(remote.habit_log);}
      else if(lAt>rAt){push.habit_log=loadHabitLog();push.habit_log_at=lAt;}
      // hábitos: definições
      const dAt=LS('habit_defs_at',0),rdAt=remote.habit_defs_at||0;
      if(remote.habit_defs&&rdAt>dAt){LSet('habit_defs_v1',remote.habit_defs);LSet('habit_defs_at',rdAt);DEFS.list=remote.habit_defs;setHabitDefsState(remote.habit_defs);}
      else if(dAt>rdAt){push.habit_defs=DEFS.list;push.habit_defs_at=dAt;}
      // mente: check-ins semanais
      const mAt=LS('mente_log_at',0),rmAt=remote.mente_log_at||0;
      if(remote.mente_log&&rmAt>mAt){LSet('mente_log_v1',remote.mente_log);LSet('mente_log_at',rmAt);setMenteLog(remote.mente_log);}
      else if(mAt>rmAt){push.mente_log=loadMenteLog();push.mente_log_at=mAt;}
      // finanças: lançamentos
      const fAt=LS('finance_log_at',0),rfAt=remote.finance_log_at||0;
      if(remote.finance_log&&rfAt>fAt){LSet('finance_log_v1',remote.finance_log);LSet('finance_log_at',rfAt);setFinanceLog(remote.finance_log);}
      else if(fAt>rfAt){push.finance_log=loadFinanceLog();push.finance_log_at=fAt;}
      // carreira: metas por frente
      const cAt=LS('career_log_at',0),rcAt=remote.career_log_at||0;
      if(remote.career_log&&rcAt>cAt){LSet('career_log_v1',remote.career_log);LSet('career_log_at',rcAt);setCareerLog(remote.career_log);}
      else if(cAt>rcAt){push.career_log=loadCareerLog();push.career_log_at=cAt;}
      // religião: notas de gemara
      const gnAt=LS('gemara_notes_at',0),rgnAt=remote.gemara_notes_at||0;
      if(remote.gemara_notes&&rgnAt>gnAt){LSet('gemara_notes_v1',remote.gemara_notes);LSet('gemara_notes_at',rgnAt);setGemaraNotes(remote.gemara_notes);}
      else if(gnAt>rgnAt){push.gemara_notes=loadGemaraNotes();push.gemara_notes_at=gnAt;}
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

  async function fetchWhoop(token,quiet,retried){
    if(_wBusy)return;_wBusy=true;
    if(!quiet)setWhoop(s=>({...s,loading:true,error:null}));
    try{
      const stored=getTokens();
      const headers={'Authorization':'Bearer '+token};
      if(stored&&stored.refresh_token)headers['X-Refresh-Token']=stored.refresh_token;
      const r=await fetch('/whoop/data',{headers});
      if(r.status===401&&!retried&&getSyncKey()){
        // Sessão local morta — pode ser o cron da madrugada que rotacionou o token.
        // Antes de acusar "reconecte", busca o token mais novo no servidor e tenta 1x.
        try{
          const remote=await syncFetch('GET');
          const rw=remote&&remote.whoop_tokens;
          if(rw&&rw.access_token&&(rw.saved_at||0)>((stored&&stored.saved_at)||0)){
            saveTokens(rw);_wBusy=false;
            return fetchWhoop(rw.access_token,quiet,true);
          }
        }catch(e){}
      }
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
    }finally{_wBusy=false}
  }

  async function fetchGoogle(token,quiet,forceRefresh){
    if(_gBusy)return;_gBusy=true;
    if(!quiet)setGoogle(s=>({...s,loading:true,error:null}));
    try{
      const stored=getGoogleTokens();
      const headers={'Authorization':'Bearer '+token};
      // Token Google dura 1h e o refresh NÃO rotaciona: só manda o refresh
      // (que força renovação no backend) quando o token está velho — as outras
      // chamadas ficam ~300ms mais rápidas.
      const age=Date.now()-((stored&&stored.saved_at)||0);
      if(stored&&stored.refresh_token&&(forceRefresh||age>45*60*1000))headers['X-Refresh-Token']=stored.refresh_token;
      const r=await fetch('/google/data',{headers});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      // Token expirou antes da hora (revogação etc.): tenta 1x forçando renovação
      if(!forceRefresh&&stored&&stored.refresh_token&&/"_error":401/.test(JSON.stringify(data))){
        _gBusy=false;
        return fetchGoogle(token,quiet,true);
      }
      if(data._new_tokens&&data._new_tokens.access_token){
        const tk={...stored,access_token:data._new_tokens.access_token,saved_at:Date.now()};
        saveGoogleTokens(tk);syncPushSoon({google_tokens:tk});
      }
      saveGoogleCache(data);
      setGoogle({loading:false,data,error:null,updatedAt:Date.now()});
    }catch(err){
      setGoogle(s=>({loading:false,data:s.data,error:err.message,updatedAt:s.updatedAt}));
    }finally{_gBusy=false}
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
    (async()=>{
      // sincroniza ANTES de buscar: o robô da madrugada rotaciona o token do WHOOP,
      // e o aparelho precisa adotar o token novo antes de tentar usar o antigo
      if(getSyncKey()){try{await syncNow(false)}catch(e){}}
      const t=getTokens();if(t&&t.access_token)fetchWhoop(t.access_token);
      const g=getGoogleTokens();if(g&&g.access_token)fetchGoogle(g.access_token);
    })();
    fetchJewish().then(setJew).catch(()=>{});
    fetchWeather().then(setWeather).catch(()=>{});
    fetchBrief().then(setBrief).catch(()=>{});
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
        <div className="logo"><div className="lz">◆</div>Isaac OS</div>
        <div className="nsec">Painel</div>
        <div className={'ni '+(page==='painel'?'active':'')} onClick={()=>setPage('painel')}>
          <span className="ico">{PAGES.painel.ico}</span>{PAGES.painel.label}
        </div>
        <div className="nsec">Pilares</div>
        {PILLAR_PAGES.map(k=>(
          <div key={k} className={'ni '+(page===k?'active':'')} onClick={()=>setPage(k)}>
            <span className="ico" style={{color:PILARES[k].cor}}>{PAGES[k].ico}</span>{PAGES[k].label}
          </div>
        ))}
        <div className="nsec">Utilitários</div>
        {['tarefas','agenda','vida'].map(k=>(
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
            <span className="ico">⚙</span>Ajustes
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
          weather={weather}
          brief={brief}
          history={history}
          habitDefs={habitDefs}
          setHabitDefs={setHabitDefs}
          toggleHabit={toggleHabit}
          taskAction={taskAction}
          setPage={setPage}
          connect={connect}
          menteLog={menteLog}
          setMenteLog={setMenteLog}
          financeLog={financeLog}
          setFinanceLog={setFinanceLog}
          careerLog={careerLog}
          setCareerLog={setCareerLog}
          gemaraNotes={gemaraNotes}
          setGemaraNotes={setGemaraNotes}
        />
      </div>

      <div className="mnav">
        {['painel'].concat(PILLAR_PAGES).map(k=>(
          <div key={k} className={'mni '+(page===k?'active':'')} onClick={()=>setPage(k)} style={page===k?{color:PILARES[k]?PILARES[k].cor:'var(--accent)'}:undefined}>
            <span>{PAGES[k].ico}</span>{PAGES[k].label}
          </div>
        ))}
        <div className="mni" onClick={()=>setSettingsOpen(true)}><span>⚙</span>Mais</div>
      </div>

      {!aiOpen&&<div className="fab" title="IA do Isaac OS" onClick={()=>setAiOpen(true)}>✦</div>}
      <ChatSheet open={aiOpen} onClose={()=>setAiOpen(false)} ctxBuilder={()=>buildAIContext(whoop.data,google.data,habitLog,history,menteLog,financeLog,careerLog)}/>

      <SettingsModal open={settingsOpen} onClose={()=>setSettingsOpen(false)} syncState={syncState} habitLog={habitLog} habitDefs={habitDefs} setHabitDefs={setHabitDefs} pushPrefs={pushPrefs} setPushPrefs={setPushPrefs} history={history} setPage={setPage}
        onActivate={(pin)=>{saveSyncKey(pin);setSyncState({on:true,at:null,err:null});syncNow(true);}}
        onDeactivate={()=>{saveSyncKey(null);setSyncState({on:false,at:null,err:null});}}
        onSyncNow={()=>syncNow(true)}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
