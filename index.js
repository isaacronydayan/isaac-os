export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML);
}

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Isaac OS</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0a;--surface:#111;--s2:#181818;--s3:#222;
  --b:rgba(255,255,255,.07);--bh:rgba(255,255,255,.13);
  --t:#f0f0f0;--t2:#888;--t3:#444;
  --accent:#6366f1;--a2:#818cf8;
  --green:#22c55e;--gbg:rgba(34,197,94,.1);
  --red:#ef4444;--rbg:rgba(239,68,68,.1);
  --amber:#f59e0b;--ybg:rgba(245,158,11,.1);
  --blue:#3b82f6;--bbg:rgba(59,130,246,.1);
  --purple:#a855f7;--pbg:rgba(168,85,247,.1);
  --orange:#f97316;--obg:rgba(249,115,22,.1);
  --r:12px;--rs:8px;--sb:224px;--fn:'Inter',system-ui,sans-serif
}
html,body,#root{height:100%;font-family:var(--fn);background:var(--bg);color:var(--t)}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--s3);border-radius:3px}
.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:var(--sb);min-width:var(--sb);background:var(--surface);border-right:1px solid var(--b);display:flex;flex-direction:column;padding:16px 10px;gap:2px;overflow-y:auto}
.logo{display:flex;align-items:center;gap:10px;padding:8px 10px 18px}
.logo-mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0}
.logo-text{font-size:15px;font-weight:700;letter-spacing:-.4px}
.nsec{font-size:10px;font-weight:600;color:var(--t3);letter-spacing:.08em;text-transform:uppercase;padding:10px 10px 3px}
.ni{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:500;color:var(--t2);transition:all .12s;border:1px solid transparent}
.ni:hover{background:var(--s2);color:var(--t)}
.ni.active{background:var(--s3);color:var(--t);border-color:var(--b)}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.main{flex:1;overflow-y:auto;background:var(--bg)}
.page{padding:28px 32px;max-width:1180px}
.ph{margin-bottom:22px}
.pt{font-size:21px;font-weight:800;letter-spacing:-.5px;margin-bottom:3px}
.ps{font-size:12.5px;color:var(--t2)}
.g{display:grid;gap:14px}
.g2{grid-template-columns:1fr 1fr}
.g3{grid-template-columns:1fr 1fr 1fr}
.g4{grid-template-columns:1fr 1fr 1fr 1fr}
.card{background:var(--surface);border:1px solid var(--b);border-radius:var(--r);padding:18px;transition:border-color .15s}
.card:hover{border-color:var(--bh)}
.ct{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:13px}
.mv{font-size:26px;font-weight:800;letter-spacing:-1px;line-height:1}
.mu{font-size:13px;font-weight:400;color:var(--t2);margin-left:2px}
.badge{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:4px}
.g-{background:var(--gbg);color:var(--green)}
.r-{background:var(--rbg);color:var(--red)}
.y-{background:var(--ybg);color:var(--amber)}
.b-{background:var(--bbg);color:var(--blue)}
.p-{background:var(--pbg);color:var(--purple)}
.o-{background:var(--obg);color:var(--orange)}
.z-{background:rgba(255,255,255,.06);color:var(--t2)}
.pbar{height:3px;background:var(--s3);border-radius:2px;overflow:hidden;margin-top:8px}
.pf{height:100%;border-radius:2px}
.ci{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:var(--rs);background:var(--s2);cursor:pointer;transition:all .12s;margin-bottom:7px}
.ci:hover{background:var(--s3)}
.cb{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--bh);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
.cb.done{background:var(--accent);border-color:var(--accent)}
.ct2{font-size:13px;font-weight:500;flex:1}
.ct2.done{text-decoration:line-through;color:var(--t3)}
.ev{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--b)}
.ev:last-child{border-bottom:none}
.evt{font-size:11px;font-weight:600;color:var(--t2);width:42px;flex-shrink:0;padding-top:1px}
.evb{width:3px;border-radius:3px;min-height:30px;flex-shrink:0;align-self:stretch}
.live{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:600;color:var(--green);background:var(--gbg);padding:3px 8px;border-radius:4px}
.live::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.whoop-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 18px;background:linear-gradient(135deg,#6366f1,#a855f7);border:none;border-radius:var(--rs);color:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .15s;width:100%}
.whoop-btn:hover{opacity:.9}
.whoop-card{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(168,85,247,.07));border:1px solid rgba(99,102,241,.25);border-radius:var(--r);padding:20px}
.whoop-logo{font-size:22px;font-weight:900;letter-spacing:-1px;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.score{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;flex-shrink:0}
.sbot{margin-top:auto;padding-top:10px;border-top:1px solid var(--b)}
.uc{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:var(--rs);cursor:pointer}
.uc:hover{background:var(--s2)}
.av{width:27px;height:27px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0}
.hr{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.hn{font-size:12.5px;font-weight:500;width:130px;flex-shrink:0;color:var(--t2)}
.hd{display:flex;gap:4px;flex:1}
.hday{width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;background:var(--s2);color:var(--t3)}
.hday.done{background:var(--accent);color:#fff}
.hst{font-size:11px;font-weight:700;color:var(--amber);width:30px;text-align:right}
.cg{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.ch{font-size:10px;font-weight:600;color:var(--t3);text-align:center;padding:3px 0}
.cd{aspect-ratio:1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:500;cursor:pointer;background:var(--s2);color:var(--t2);transition:all .1s;position:relative}
.cd:hover{background:var(--s3);color:var(--t)}
.cd.today{background:var(--accent);color:#fff;font-weight:800}
.cd.hev::after{content:'';width:4px;height:4px;border-radius:50%;background:var(--green);position:absolute;bottom:2px}
.cd.empty{background:transparent;cursor:default}
.spin{width:32px;height:32px;border:3px solid rgba(255,255,255,.08);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}
canvas{max-height:180px}
@media(max-width:900px){.sidebar{display:none}.page{padding:16px}.g4,.g3{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}}
@media(max-width:600px){.g4,.g3,.g2{grid-template-columns:1fr}}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const{useState,useEffect,useRef,useCallback}=React;

// ── Google Calendar color map ────────────────────────────────────
const GC={1:'#a855f7',2:'#22c55e',3:'#a855f7',4:'#f472b6',5:'#eab308',6:'#f97316',7:'#3b82f6',8:'#6b7280',9:'#6366f1',10:'#16a34a',11:'#6366f1',d:'#6366f1'};
const gc=id=>GC[id]||GC.d;

// ── Real events from Google Calendar ────────────────────────────
const GCAL_EVENTS=[
  {id:"0937_628",summary:"Academia",start:"2026-06-28T19:00:00-03:00",end:"2026-06-28T20:00:00-03:00",colorId:"11"},
  {id:"6e0c_629",summary:"Ouribank",start:"2026-06-29T09:00:00-03:00",end:"2026-06-29T16:00:00-03:00",colorId:"6"},
  {id:"1d06_629m",summary:"Mincha Ouribank",start:"2026-06-29T14:15:00-03:00",end:"2026-06-29T14:40:00-03:00",colorId:"11"},
  {id:"bcd0_629",summary:"Sinagoga",start:"2026-06-29T17:15:00-03:00",end:"2026-06-29T17:45:00-03:00",colorId:"11"},
  {id:"bb03_629",summary:"Shiur",start:"2026-06-29T18:00:00-03:00",end:"2026-06-29T18:45:00-03:00",colorId:"11"},
  {id:"0937_629",summary:"Academia",start:"2026-06-29T19:00:00-03:00",end:"2026-06-29T20:00:00-03:00",colorId:"11"},
  {id:"6e0c_630",summary:"Ouribank",start:"2026-06-30T09:00:00-03:00",end:"2026-06-30T16:00:00-03:00",colorId:"6"},
  {id:"1d06_630m",summary:"Mincha Ouribank",start:"2026-06-30T14:15:00-03:00",end:"2026-06-30T14:40:00-03:00",colorId:"11"},
  {id:"bcd0_630",summary:"Sinagoga",start:"2026-06-30T17:15:00-03:00",end:"2026-06-30T17:45:00-03:00",colorId:"11"},
  {id:"bb03_630",summary:"Shiur",start:"2026-06-30T18:00:00-03:00",end:"2026-06-30T18:45:00-03:00",colorId:"11"},
  {id:"0937_630",summary:"Academia",start:"2026-06-30T19:00:00-03:00",end:"2026-06-30T20:00:00-03:00",colorId:"11"},
  {id:"6e0c_701",summary:"Ouribank",start:"2026-07-01T09:00:00-03:00",end:"2026-07-01T16:00:00-03:00",colorId:"6"},
  {id:"9d98_701",summary:"Psicólogo - REMARCAR",start:"2026-07-01T14:00:00-03:00",end:"2026-07-01T14:45:00-03:00",colorId:""},
  {id:"1d06_701m",summary:"Mincha Ouribank",start:"2026-07-01T14:15:00-03:00",end:"2026-07-01T14:40:00-03:00",colorId:"11"},
  {id:"bcd0_701",summary:"Sinagoga",start:"2026-07-01T17:15:00-03:00",end:"2026-07-01T17:45:00-03:00",colorId:"11"},
  {id:"bb03_701",summary:"Shiur",start:"2026-07-01T18:00:00-03:00",end:"2026-07-01T18:45:00-03:00",colorId:"11"},
  {id:"0937_701",summary:"Academia",start:"2026-07-01T19:00:00-03:00",end:"2026-07-01T20:00:00-03:00",colorId:"11"},
  {id:"c6d1_701",summary:"Estrat Fin (804)",start:"2026-07-01T19:00:00-03:00",end:"2026-07-01T23:00:00-03:00",colorId:"6"},
  {id:"6e0c_702",summary:"Ouribank",start:"2026-07-02T09:00:00-03:00",end:"2026-07-02T16:00:00-03:00",colorId:"6"},
  {id:"1d06_702m",summary:"Mincha Ouribank",start:"2026-07-02T14:15:00-03:00",end:"2026-07-02T14:40:00-03:00",colorId:"11"},
  {id:"bcd0_702",summary:"Sinagoga",start:"2026-07-02T17:15:00-03:00",end:"2026-07-02T17:45:00-03:00",colorId:"11"},
  {id:"bb03_702",summary:"Shiur",start:"2026-07-02T18:00:00-03:00",end:"2026-07-02T18:45:00-03:00",colorId:"11"},
  {id:"0937_702",summary:"Academia",start:"2026-07-02T19:00:00-03:00",end:"2026-07-02T20:00:00-03:00",colorId:"11"},
  {id:"c6d1_702",summary:"Estrat Fin (804)",start:"2026-07-02T19:00:00-03:00",end:"2026-07-02T23:00:00-03:00",colorId:"6"},
  {id:"6e0c_703",summary:"Ouribank - CASUAL",start:"2026-07-03T09:00:00-03:00",end:"2026-07-03T16:00:00-03:00",colorId:"6"},
  {id:"1d06_703m",summary:"Mincha Ouribank",start:"2026-07-03T14:15:00-03:00",end:"2026-07-03T14:40:00-03:00",colorId:"11"},
  {id:"bcd0_703",summary:"Sinagoga",start:"2026-07-03T17:15:00-03:00",end:"2026-07-03T17:45:00-03:00",colorId:"11"},
  {id:"c6d1_703",summary:"Estrat Fin (804)",start:"2026-07-03T19:00:00-03:00",end:"2026-07-03T23:00:00-03:00",colorId:"6"},
  {id:"3155_705",summary:"Trocar de aparelho",start:"2026-07-05",end:"2026-07-06",allDay:true,colorId:""},
  {id:"0937_705",summary:"Academia",start:"2026-07-05T19:00:00-03:00",end:"2026-07-05T20:00:00-03:00",colorId:"11"},
];

function fmtT(s){if(!s||s.length===10)return'Dia todo';const d=new Date(s);return d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function evDay(day){return GCAL_EVENTS.filter(e=>sameDay(new Date(e.start),day)).sort((a,b)=>new Date(a.start)-new Date(b.start))}

// ── WHOOP helpers ────────────────────────────────────────────────
function getTokens(){try{return JSON.parse(localStorage.getItem('whoop_tokens'))||null}catch{return null}}
function saveTokens(t){try{localStorage.setItem('whoop_tokens',JSON.stringify(t))}catch{}}
function clearTokens(){try{localStorage.removeItem('whoop_tokens')}catch{}}

function scoreColor(v){
  if(v===null||v===undefined)return'#444';
  if(v>=80)return'#22c55e';
  if(v>=60)return'#f59e0b';
  return'#ef4444';
}
function scoreLabel(v){
  if(v===null||v===undefined)return'–';
  if(v>=80)return'Ótimo';
  if(v>=60)return'Moderado';
  return'Baixo';
}

// ── Chart components ─────────────────────────────────────────────
function LineChart({data:d,color,labels,yLabel}){
  const ref=useRef(null),ch=useRef(null);
  useEffect(()=>{
    if(!ref.current||!d||!d.length)return;
    ch.current?.destroy();
    ch.current=new Chart(ref.current,{
      type:'line',
      data:{
        labels:labels||d.map((_,i)=>i+1),
        datasets:[{data:d,borderColor:color,borderWidth:2,pointRadius:2,pointBackgroundColor:color,fill:true,
          backgroundColor:(ctx)=>{const g=ctx.chart.ctx.createLinearGradient(0,0,0,150);g.addColorStop(0,color+'30');g.addColorStop(1,color+'00');return g},tension:.4}]
      },
      options:{responsive:true,plugins:{legend:{display:false}},
        scales:{
          x:{ticks:{color:'#444',font:{size:10}},grid:{display:false},border:{display:false}},
          y:{ticks:{color:'#444',font:{size:10}},grid:{color:'rgba(255,255,255,.04)'},border:{display:false},title:{display:!!yLabel,text:yLabel,color:'#555',font:{size:10}}}
        },animation:false}
    });
    return()=>ch.current?.destroy();
  },[JSON.stringify(d),color]);
  return <canvas ref={ref} style={{width:'100%',height:'150px'}}/>;
}

function Donut({pct,color,size=72,stroke=6}){
  const r=(size-stroke*2)/2,circ=2*Math.PI*r,dash=Math.min(pct/100,1)*circ;
  return(
    <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={\`\${dash} \${circ}\`} strokeLinecap="round"/>
    </svg>
  );
}

// ── WHOOP connection panel ───────────────────────────────────────
function WhoopConnect(){
  return(
    <div className="whoop-card">
      <div className="whoop-logo">WHOOP</div>
      <p style={{fontSize:13,color:'var(--t2)',marginBottom:16,lineHeight:1.6}}>
        Conecte seu WHOOP para ver recovery, sono, HRV, strain e treinos em tempo real no seu dashboard.
      </p>
      <a href="/whoop/login" className="whoop-btn" style={{textDecoration:'none'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        Conectar WHOOP
      </a>
      <p style={{fontSize:11,color:'var(--t3)',marginTop:10,textAlign:'center'}}>
        Você será redirecionado para o login oficial da WHOOP
      </p>
    </div>
  );
}

// ── WHOOP metrics display ────────────────────────────────────────
function WhoopMetrics({whoop}){
  if(!whoop)return <WhoopConnect/>;

  const{loading,error,data}=whoop;

  if(loading)return(
    <div style={{textAlign:'center',padding:'32px 0'}}>
      <div className="spin" style={{marginBottom:12}}/>
      <div style={{fontSize:12,color:'var(--t3)'}}>Carregando dados WHOOP…</div>
    </div>
  );

  if(error||!data)return(
    <div style={{textAlign:'center',padding:'24px 0'}}>
      <div style={{fontSize:13,color:'var(--red)',marginBottom:12}}>{error||'Erro ao carregar WHOOP'}</div>
      <button onClick={()=>clearTokens()&&window.location.reload()} style={{background:'var(--s2)',border:'1px solid var(--b)',borderRadius:6,color:'var(--t)',padding:'6px 14px',cursor:'pointer',fontSize:12}}>Reconectar</button>
    </div>
  );

  // Parse WHOOP data
  const latest_recovery=data.recovery?.records?.[0];
  const latest_sleep=data.sleep?.records?.[0];
  const latest_cycle=data.cycles?.records?.[0];
  const latest_workout=data.workouts?.records?.[0];
  const body=data.body;
  const profile=data.profile;

  const recovery_score=latest_recovery?.score?.recovery_score??null;
  const hrv=latest_recovery?.score?.hrv_rmssd_milli??null;
  const rhr=latest_recovery?.score?.resting_heart_rate??null;
  const sleep_perf=latest_sleep?.score?.sleep_performance_percentage??null;
  const sleep_hrs=latest_sleep?.score?.stage_summary?.total_in_bed_time_milli
    ?Math.round(latest_sleep.score.stage_summary.total_in_bed_time_milli/3600000*10)/10 : null;
  const strain=latest_cycle?.score?.strain??null;
  const weight_kg=body?.weight_kilogram??null;

  // Build 30d history arrays
  const rec30=(data.recovery?.records||[]).slice(0,30).reverse().map(r=>r.score?.recovery_score??null).filter(v=>v!==null);
  const hrv30=(data.recovery?.records||[]).slice(0,30).reverse().map(r=>r.score?.hrv_rmssd_milli??null).filter(v=>v!==null);
  const strain30=(data.cycles?.records||[]).slice(0,30).reverse().map(c=>c.score?.strain??null).filter(v=>v!==null);
  const sleep30=(data.sleep?.records||[]).slice(0,30).reverse().map(s=>s.score?.sleep_performance_percentage??null).filter(v=>v!==null);

  const rColor=scoreColor(recovery_score);

  return(
    <div>
      {/* Top WHOOP metrics */}
      <div className="g g4" style={{marginBottom:14}}>
        {[
          {l:'Recovery',v:recovery_score!==null?recovery_score+'%':'–',c:rColor,sub:scoreLabel(recovery_score)},
          {l:'HRV',v:hrv!==null?Math.round(hrv)+' ms':'–',c:'#a855f7',sub:'Média noturna'},
          {l:'RHR',v:rhr!==null?Math.round(rhr)+' bpm':'–',c:'#3b82f6',sub:'Freq. cardíaca em repouso'},
          {l:'Strain',v:strain!==null?Math.round(strain*10)/10:'–',c:'#f97316',sub:'Carga cardiovascular'},
        ].map(m=>(
          <div key={m.l} className="card">
            <div className="ct">{m.l}</div>
            <div className="mv" style={{color:m.c}}>{m.v}</div>
            <div style={{fontSize:11,color:'var(--t3)',marginTop:5}}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        {/* Sleep */}
        <div className="card">
          <div className="ct">Sono</div>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <Donut pct={sleep_perf??0} color="#3b82f6"/>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                <div style={{fontSize:14,fontWeight:800,color:'#3b82f6'}}>{sleep_perf!==null?sleep_perf+'%':'–'}</div>
                <div style={{fontSize:8,color:'var(--t3)'}}>perf.</div>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:12,color:'var(--t2)'}}>Duração</span>
                <span style={{fontSize:13,fontWeight:700}}>{sleep_hrs!==null?sleep_hrs+'h':'–'}</span>
              </div>
              {latest_sleep?.score?.stage_summary&&(()=>{
                const st=latest_sleep.score.stage_summary;
                const tot=st.total_in_bed_time_milli||1;
                return[
                  ['REM',st.total_rem_sleep_time_milli,'#a855f7'],
                  ['Profundo',st.total_slow_wave_sleep_time_milli,'#3b82f6'],
                  ['Leve',st.total_light_sleep_time_milli,'#22c55e'],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:c}}/>
                    <span style={{fontSize:11,color:'var(--t2)',flex:1}}>{l}</span>
                    <span style={{fontSize:11,fontWeight:600}}>{v?Math.round(v/tot*100):'–'}%</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Body + Profile */}
        <div className="card">
          <div className="ct">Corpo & Perfil</div>
          {profile&&(
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,paddingBottom:12,borderBottom:'1px solid var(--b)'}}>
              <div className="av" style={{width:36,height:36,fontSize:14}}>{(profile.first_name||'?')[0]}{(profile.last_name||'?')[0]}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{profile.first_name} {profile.last_name}</div>
                <div style={{fontSize:11,color:'var(--t3)'}}>{profile.email}</div>
              </div>
            </div>
          )}
          <div className="g g2" style={{gap:8}}>
            {[
              ['Peso',weight_kg!==null?weight_kg.toFixed(1)+' kg':'–','var(--t)'],
              ['Altura',body?.height_meter!=null?(body.height_meter*100).toFixed(0)+' cm':'–','var(--t)'],
              ['Último treino',latest_workout?.sport_name||'–','#6366f1'],
              ['Duração',latest_workout?.score?.kilojoule!=null?(Math.round(latest_workout.score.kilojoule/4.184)+' kcal'):'–','#f97316'],
            ].map(([l,v,c])=>(
              <div key={l} style={{background:'var(--s2)',borderRadius:'var(--rs)',padding:'9px 11px'}}>
                <div style={{fontSize:10,color:'var(--t3)',marginBottom:2}}>{l}</div>
                <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-day charts */}
      {rec30.length>1&&(
        <div className="g g2" style={{marginBottom:14}}>
          <div className="card"><div className="ct">Recovery 30d (%)</div><LineChart data={rec30} color="#22c55e"/></div>
          <div className="card"><div className="ct">HRV 30d (ms)</div><LineChart data={hrv30} color="#a855f7"/></div>
        </div>
      )}
      {strain30.length>1&&(
        <div className="g g2" style={{marginBottom:14}}>
          <div className="card"><div className="ct">Strain 30d</div><LineChart data={strain30} color="#f97316"/></div>
          <div className="card"><div className="ct">Sleep Performance 30d (%)</div><LineChart data={sleep30} color="#3b82f6"/></div>
        </div>
      )}

      {/* Recent workouts */}
      {data.workouts?.records?.length>0&&(
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div className="ct" style={{marginBottom:0}}>Últimos treinos</div>
            <div className="live">WHOOP</div>
          </div>
          {(data.workouts.records||[]).slice(0,5).map((w,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<4?'1px solid var(--b)':'none'}}>
              <div style={{width:34,height:34,borderRadius:'var(--rs)',background:'var(--pbg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>💪</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{w.sport_name||'Treino'}</div>
                <div style={{fontSize:11,color:'var(--t3)',marginTop:1}}>{new Date(w.start).toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}</div>
              </div>
              <div style={{display:'flex',gap:10,textAlign:'right'}}>
                {w.score?.strain&&<div><div style={{fontSize:12,fontWeight:700}}>{Math.round(w.score.strain*10)/10}</div><div style={{fontSize:10,color:'var(--t3)'}}>strain</div></div>}
                {w.score?.kilojoule&&<div><div style={{fontSize:12,fontWeight:700}}>{Math.round(w.score.kilojoule/4.184)}</div><div style={{fontSize:10,color:'var(--t3)'}}>kcal</div></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Static data ──────────────────────────────────────────────────
const CHECKLIST_DEFAULT=[
  {id:1,text:'Academia',done:true,tag:'fitness',bc:'p-'},
  {id:2,text:'Mincha',done:true,tag:'tefila',bc:'b-'},
  {id:3,text:'Revisar objetivos',done:false,tag:'foco',bc:'y-'},
  {id:4,text:'Leitura 20 min',done:false,tag:'aprendizado',bc:'g-'},
  {id:5,text:'Beber 2L de água',done:true,tag:'saúde',bc:'b-'},
  {id:6,text:'Estudar Estrat Fin',done:false,tag:'faculdade',bc:'o-'},
];
const WEEK_GOALS=[
  {name:'5 treinos',pct:80,color:'#6366f1'},
  {name:'Dormir 7h+',pct:57,color:'#3b82f6'},
  {name:'Shiur todo dia',pct:71,color:'#a855f7'},
  {name:'10k passos/dia',pct:86,color:'#22c55e'},
];
const HABITS=[
  {name:'Academia',days:[1,1,1,0,1,1,0],streak:18},
  {name:'Shiur/Sinagoga',days:[1,1,0,1,1,1,1],streak:12},
  {name:'Mincha',days:[1,1,1,1,1,1,0],streak:27},
  {name:'Leitura',days:[1,0,1,1,0,1,1],streak:5},
  {name:'Hidratação',days:[1,1,1,1,1,1,0],streak:22},
  {name:'Sono 7h+',days:[0,1,1,1,0,1,1],streak:4},
];
const GOALS=[
  {name:'Chegar a 78kg',cat:'Corpo',target:'78kg',current:'83.2kg',pct:62,deadline:'Set 2026',color:'#6366f1'},
  {name:'Gordura 14%',cat:'Corpo',target:'14%',current:'18.3%',pct:48,deadline:'Dez 2026',color:'#a855f7'},
  {name:'Terminar Ouribank forte',cat:'Carreira',target:'Dez 2026',current:'Jun 2026',pct:50,deadline:'Dez 2026',color:'#f97316'},
  {name:'Agachar 100kg×10',cat:'Força',target:'100kg',current:'80kg',pct:75,deadline:'Jul 2026',color:'#f59e0b'},
  {name:'Ler 24 livros',cat:'Mente',target:'24',current:'11',pct:46,deadline:'Dez 2026',color:'#3b82f6'},
];

// ═══════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════
function DashboardPage({checks,setChecks,whoop}){
  const TODAY=new Date('2026-06-28');
  const todayEvs=evDay(TODAY);
  const done=checks.filter(c=>c.done).length;
  const tokens=getTokens();

  // Derive WHOOP quick metrics for top row
  const wr=whoop?.data?.recovery?.records?.[0];
  const ws=whoop?.data?.sleep?.records?.[0];
  const recovery=wr?.score?.recovery_score??null;
  const hrv=wr?.score?.hrv_rmssd_milli??null;
  const sleep_hrs=ws?.score?.stage_summary?.total_in_bed_time_milli
    ?Math.round(ws.score.stage_summary.total_in_bed_time_milli/3600000*10)/10:null;
  const rhr=wr?.score?.resting_heart_rate??null;
  const strain=whoop?.data?.cycles?.records?.[0]?.score?.strain??null;
  const weightKg=whoop?.data?.body?.weight_kilogram??null;

  const metricsRow=[
    {l:'Recovery',v:recovery!==null?recovery+'%':'–',c:scoreColor(recovery),src:tokens?'whoop':'mock'},
    {l:'Sono',v:sleep_hrs!==null?sleep_hrs+'h':'–',c:'#3b82f6',src:tokens?'whoop':'mock'},
    {l:'HRV',v:hrv!==null?Math.round(hrv)+' ms':'–',c:'#a855f7',src:tokens?'whoop':'mock'},
    {l:'Strain',v:strain!==null?Math.round(strain*10)/10:'–',c:'#f97316',src:tokens?'whoop':'mock'},
  ];

  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3}}>
          <div className="pt">Shalom, Isaac 👋</div>
          {tokens&&<div className="live">WHOOP + Google Calendar</div>}
        </div>
        <div className="ps">Domingo, 28 de junho de 2026</div>
      </div>

      <div className="g g4" style={{marginBottom:14}}>
        {metricsRow.map(m=>(
          <div key={m.l} className="card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div className="ct" style={{marginBottom:0}}>{m.l}</div>
              {m.src==='whoop'
                ? <div className="live" style={{fontSize:9,padding:'2px 5px'}}>WHOOP</div>
                : <div className="badge z-" style={{fontSize:9}}>mock</div>}
            </div>
            <div className="mv" style={{color:m.c}}>{m.v}</div>
          </div>
        ))}
      </div>

      <div className="g g2" style={{marginBottom:14}}>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <div className="ct" style={{marginBottom:0}}>Checklist do dia</div>
            <div style={{fontSize:11,color:'var(--t2)'}}>{done}/{checks.length}</div>
          </div>
          <div className="pbar" style={{marginBottom:14}}><div className="pf" style={{width:(done/checks.length*100)+'%',background:'var(--accent)'}}/></div>
          {checks.map(c=>(
            <div key={c.id} className="ci" onClick={()=>setChecks(p=>p.map(x=>x.id===c.id?{...x,done:!x.done}:x))}>
              <div className={\`cb \${c.done?'done':''}\`}>
                {c.done&&<svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div className={\`ct2 \${c.done?'done':''}\`}>{c.text}</div>
              <div className={\`badge \${c.bc}\`}>{c.tag}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* WHOOP quick panel or connect prompt */}
          {!tokens
            ? <WhoopConnect/>
            : <div className="card" style={{background:'linear-gradient(135deg,rgba(99,102,241,.1),rgba(168,85,247,.07))',borderColor:'rgba(99,102,241,.2)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div className="whoop-logo" style={{fontSize:16,marginBottom:0}}>WHOOP</div>
                  <div className="live">Ao vivo</div>
                </div>
                <div className="g g3" style={{gap:8}}>
                  {[
                    ['Recovery',recovery!==null?recovery+'%':'–',scoreColor(recovery)],
                    ['HRV',hrv!==null?Math.round(hrv)+' ms':'–','#a855f7'],
                    ['Strain',strain!==null?Math.round(strain*10)/10:'–','#f97316'],
                  ].map(([l,v,c])=>(
                    <div key={l} style={{background:'rgba(0,0,0,.3)',borderRadius:'var(--rs)',padding:'8px 10px',textAlign:'center'}}>
                      <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:'var(--t3)',marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
          }

          <div className="card">
            <div className="ct">Metas da semana</div>
            {WEEK_GOALS.map(g=>(
              <div key={g.name} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:500}}>{g.name}</span>
                  <span style={{fontSize:11,fontWeight:700,color:g.color}}>{g.pct}%</span>
                </div>
                <div className="pbar"><div className="pf" style={{width:g.pct+'%',background:g.color}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="g g2">
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div className="ct" style={{marginBottom:0}}>Eventos de hoje</div>
            <div className="live">Google Calendar</div>
          </div>
          {todayEvs.length===0
            ? <div style={{color:'var(--t3)',fontSize:13}}>Sem eventos hoje</div>
            : todayEvs.map((e,i)=>(
              <div key={i} className="ev">
                <div className="evt">{fmtT(e.start)}</div>
                <div className="evb" style={{background:gc(e.colorId)}}/>
                <div><div style={{fontSize:13,fontWeight:500}}>{e.summary}</div><div style={{fontSize:11,color:'var(--t3)',marginTop:1}}>{fmtT(e.start)} – {fmtT(e.end)}</div></div>
              </div>
            ))}
        </div>

        <div className="card">
          <div className="ct">Sleep — ontem</div>
          <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:14}}>
            <div style={{position:'relative',flexShrink:0}}>
              <Donut pct={ws?.score?.sleep_performance_percentage??0} color="#3b82f6"/>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                <div style={{fontSize:14,fontWeight:800,color:'#3b82f6'}}>{sleep_hrs!==null?sleep_hrs:'–'}</div>
                <div style={{fontSize:8,color:'var(--t3)'}}>{sleep_hrs?'horas':'–'}</div>
              </div>
            </div>
            <div style={{flex:1}}>
              {[['RHR',rhr?Math.round(rhr)+' bpm':'–','var(--t)'],['Peso',weightKg?weightKg.toFixed(1)+' kg':'–','#6366f1'],['Sleep',ws?.score?.sleep_performance_percentage!=null?ws.score.sleep_performance_percentage+'%':'–','#3b82f6'],['Strain',strain?Math.round(strain*10)/10:'–','#f97316']].map(([l,v,c])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:12,color:'var(--t2)'}}>{l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {!tokens&&<WhoopConnect/>}
        </div>
      </div>
    </div>
  );
}

function FitnessPage({whoop}){
  const tokens=getTokens();
  const wh=(data,recovery)=>{
    const wHistory=[84.8,84.5,84.2,83.9,84.1,83.8,83.5,83.7,83.4,83.2,83.0,83.2];
    const fHistory=[19.8,19.6,19.4,19.2,19.3,19.1,18.9,19.0,18.7,18.5,18.3,18.3];
    return(
      <div className="g g2" style={{marginBottom:14}}>
        <div className="card"><div className="ct">Peso (kg) — mock</div><LineChart data={wHistory} color="#6366f1"/></div>
        <div className="card"><div className="ct">Gordura corporal (%) — mock</div><LineChart data={fHistory} color="#a855f7"/></div>
      </div>
    );
  };
  return(
    <div className="page">
      <div className="ph"><div className="pt">Fitness</div><div className="ps">Corpo, treinos e dados WHOOP</div></div>
      {tokens ? <WhoopMetrics whoop={whoop}/> : <><WhoopConnect/><div style={{marginTop:16}}>{wh()}</div></>}
    </div>
  );
}

function HabitsPage(){
  const dls=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const rate=Math.round(HABITS.reduce((a,h)=>a+h.days.filter(Boolean).length,0)/(HABITS.length*7)*100);
  return(
    <div className="page">
      <div className="ph"><div className="pt">Hábitos</div><div className="ps">Consistência é o segredo</div></div>
      <div className="g g4" style={{marginBottom:14}}>
        {[{l:'Taxa esta semana',v:rate+'%',c:'var(--accent)'},{l:'Maior sequência',v:'27d 🔥',c:'var(--amber)'},{l:'Hábitos ativos',v:HABITS.length,c:'var(--green)'},{l:'Hoje',v:HABITS.filter(h=>h.days[6]).length+'/'+HABITS.length,c:'var(--blue)'}].map(s=>(
          <div key={s.l} className="card"><div className="ct">{s.l}</div><div className="mv" style={{color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div className="ct" style={{marginBottom:0}}>Esta semana</div>
          <div style={{display:'flex',gap:4}}>{dls.map(d=><div key={d} style={{width:26,textAlign:'center',fontSize:10,fontWeight:600,color:'var(--t3)'}}>{d}</div>)}</div>
        </div>
        {HABITS.map((h,i)=>(
          <div key={i} className="hr">
            <div className="hn">{h.name}</div>
            <div className="hd">{h.days.map((d,j)=><div key={j} className={\`hday \${d?'done':''}\`}>{d?'✓':''}</div>)}</div>
            <div className="hst">🔥{h.streak}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="ct" style={{marginBottom:12}}>Frequência – 90 dias</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(13,1fr)',gap:3}}>
          {Array.from({length:91}).map((_,i)=>{const v=Math.random();const bg=v>.7?'#6366f1':v>.45?'rgba(99,102,241,.5)':v>.2?'rgba(99,102,241,.18)':'var(--s2)';return<div key={i} style={{aspectRatio:1,borderRadius:3,background:bg}}/>})}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:7,marginTop:10}}>
          <span style={{fontSize:10,color:'var(--t3)'}}>Menos</span>
          {['var(--s2)','rgba(99,102,241,.18)','rgba(99,102,241,.5)','#6366f1'].map((c,i)=><div key={i} style={{width:11,height:11,borderRadius:2,background:c}}/>)}
          <span style={{fontSize:10,color:'var(--t3)'}}>Mais</span>
        </div>
      </div>
    </div>
  );
}

function CalendarPage(){
  const[month,setMonth]=useState(5);
  const[year]=useState(2026);
  const[selDay,setSelDay]=useState(28);
  const mNames=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const first=new Date(year,month,1).getDay();
  const days=new Date(year,month+1,0).getDate();
  const selEvs=evDay(new Date(year,month,selDay));
  const withEvs=new Set(GCAL_EVENTS.map(e=>{const d=new Date(e.start);return d.getFullYear()===year&&d.getMonth()===month?d.getDate():null}).filter(Boolean));
  const upcoming=GCAL_EVENTS.filter(e=>new Date(e.start)>=new Date('2026-06-28')).sort((a,b)=>new Date(a.start)-new Date(b.start)).slice(0,10);
  return(
    <div className="page">
      <div className="ph">
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:3}}>
          <div className="pt">Calendário</div>
          <div className="live">Google Calendar</div>
        </div>
        <div className="ps">{mNames[month]} {year}</div>
      </div>
      <div className="g g2">
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <button onClick={()=>setMonth(m=>m===0?11:m-1)} style={{background:'var(--s2)',border:'1px solid var(--b)',borderRadius:6,color:'var(--t)',padding:'3px 10px',cursor:'pointer',fontSize:13}}>←</button>
              <div style={{fontSize:14,fontWeight:700}}>{mNames[month]} {year}</div>
              <button onClick={()=>setMonth(m=>m===11?0:m+1)} style={{background:'var(--s2)',border:'1px solid var(--b)',borderRadius:6,color:'var(--t)',padding:'3px 10px',cursor:'pointer',fontSize:13}}>→</button>
            </div>
            <div className="cg" style={{marginBottom:6}}>{['D','S','T','Q','Q','S','S'].map((d,i)=><div key={i} className="ch">{d}</div>)}</div>
            <div className="cg">
              {Array.from({length:first}).map((_,i)=><div key={\`e\${i}\`} className="cd empty"/>)}
              {Array.from({length:days}).map((_,i)=>{
                const day=i+1,isToday=day===28&&month===5,isSel=day===selDay&&!isToday,hasEv=withEvs.has(day);
                return <div key={day} className={\`cd \${isToday?'today':''} \${hasEv&&!isToday?'hev':''}\`}
                  style={isSel&&!isToday?{background:'var(--s3)',color:'var(--t)',border:'1px solid var(--accent)'}:{}}
                  onClick={()=>setSelDay(day)}>{day}</div>;
              })}
            </div>
          </div>
          <div className="card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div className="ct" style={{marginBottom:0}}>{selDay===28&&month===5?'Hoje':'Dia '+selDay}</div>
              <div className="badge z-">{selEvs.length} eventos</div>
            </div>
            {selEvs.length===0?<div style={{color:'var(--t3)',fontSize:13}}>Nenhum evento</div>:selEvs.map((e,i)=>(
              <div key={i} className="ev">
                <div className="evt">{fmtT(e.start)}</div>
                <div className="evb" style={{background:gc(e.colorId)}}/>
                <div><div style={{fontSize:13,fontWeight:500}}>{e.summary}</div><div style={{fontSize:11,color:'var(--t3)',marginTop:1}}>{fmtT(e.start)} – {fmtT(e.end)}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div className="ct" style={{marginBottom:0}}>Próximos eventos</div>
            <div className="live">Ao vivo</div>
          </div>
          {upcoming.map((e,i)=>{
            const d=new Date(e.start),isToday=sameDay(d,new Date('2026-06-28'));
            const dateStr=e.allDay?'Dia todo':d.toLocaleDateString('pt-BR',{day:'numeric',month:'short'});
            return(
              <div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--b)'}}>
                <div style={{width:3,borderRadius:3,background:gc(e.colorId),flexShrink:0,alignSelf:'stretch'}}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <div style={{fontSize:13,fontWeight:500}}>{e.summary}</div>
                    <div style={{fontSize:11,color:'var(--t3)',marginLeft:8,flexShrink:0}}>{fmtT(e.start)}</div>
                  </div>
                  <div style={{fontSize:11,color:'var(--t3)',marginTop:2}}>{isToday?<span style={{color:'var(--green)'}}>Hoje</span>:dateStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GoalsPage(){
  return(
    <div className="page">
      <div className="ph"><div className="pt">Objetivos</div><div className="ps">O que mais importa</div></div>
      <div className="g g3" style={{marginBottom:14}}>
        {[{l:'Em progresso',v:5,c:'var(--accent)'},{l:'Concluídos',v:3,c:'var(--green)'},{l:'Média',v:'56%',c:'var(--amber)'}].map(s=>(
          <div key={s.l} className="card" style={{textAlign:'center'}}><div className="ct" style={{textAlign:'center'}}>{s.l}</div><div style={{fontSize:28,fontWeight:800,letterSpacing:'-1px',color:s.c}}>{s.v}</div></div>
        ))}
      </div>
      {GOALS.map((g,i)=>(
        <div key={i} className="card" style={{marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{position:'relative',flexShrink:0}}>
              <Donut pct={g.pct} color={g.color}/>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:13,fontWeight:800,color:g.color}}>{g.pct}%</div>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <div style={{fontSize:15,fontWeight:700}}>{g.name}</div>
                <div className="badge z-">{g.cat}</div>
              </div>
              <div style={{display:'flex',gap:18,marginBottom:8}}>
                {[['Atual',g.current],['Meta',g.target],['Prazo',g.deadline]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:9,color:'var(--t3)',marginBottom:1}}>{l}</div><div style={{fontSize:12,fontWeight:600}}>{v}</div></div>
                ))}
              </div>
              <div className="pbar"><div className="pf" style={{width:g.pct+'%',background:g.color}}/></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════
const PAGES={
  dashboard:{label:'Dashboard',ico:'◈',comp:DashboardPage},
  fitness:{label:'Fitness',ico:'◉',comp:FitnessPage},
  habits:{label:'Hábitos',ico:'◎',comp:HabitsPage},
  calendar:{label:'Calendário',ico:'▣',comp:CalendarPage},
  goals:{label:'Objetivos',ico:'◇',comp:GoalsPage},
};

function App(){
  const[page,setPage]=useState('dashboard');
  const[checks,setChecks]=useState(CHECKLIST_DEFAULT);
  const[whoop,setWhoop]=useState({loading:false,data:null,error:null});

  // Listen for WHOOP OAuth popup result
  useEffect(()=>{
    function onMsg(e){
      if(e.data?.type==='WHOOP_AUTH_SUCCESS'){
        saveTokens(e.data.tokens);
        fetchWhoop(e.data.tokens.access_token);
      }
    }
    window.addEventListener('message',onMsg);
    return()=>window.removeEventListener('message',onMsg);
  },[]);

  // Auto-load if token exists
  useEffect(()=>{
    const t=getTokens();
    if(t?.access_token)fetchWhoop(t.access_token);
  },[]);

  async function fetchWhoop(token){
    setWhoop(s=>({...s,loading:true,error:null}));
    try{
      const r=await fetch('/whoop/data',{headers:{Authorization:'Bearer '+token}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=await r.json();
      setWhoop({loading:false,data,error:null});
    }catch(err){
      setWhoop({loading:false,data:null,error:err.message});
    }
  }

  const tokens=getTokens();
  const Comp=PAGES[page].comp;

  return(
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">I</div>
          <div className="logo-text">Isaac OS</div>
        </div>
        <div className="nsec">Principal</div>
        {Object.entries(PAGES).map(([k,p])=>(
          <div key={k} className={\`ni \${page===k?'active':''}\`} onClick={()=>setPage(k)}>
            <span style={{fontSize:12,width:18,textAlign:'center'}}>{p.ico}</span>
            {p.label}
          </div>
        ))}
        <div className="nsec" style={{marginTop:8}}>Integrações</div>
        <div className="ni" style={{cursor:'default'}}>
          <div className="dot" style={{background:'#22c55e'}}/>
          Google Calendar
          <div className="badge g-" style={{marginLeft:'auto',fontSize:9}}>Ativo</div>
        </div>
        <div className="ni" style={{cursor:tokens?'default':'pointer'}} onClick={()=>!tokens&&window.open('/whoop/login','_blank','width=520,height=660')}>
          <div className="dot" style={{background:tokens?'#22c55e':'var(--t3)'}}/>
          WHOOP
          {tokens
            ? <div className="badge g-" style={{marginLeft:'auto',fontSize:9}}>Ativo</div>
            : <div className="badge y-" style={{marginLeft:'auto',fontSize:9}}>Conectar</div>}
        </div>
        <div className="sbot">
          {tokens&&(
            <div style={{padding:'6px 10px',marginBottom:4}}>
              <button onClick={()=>{clearTokens();setWhoop({loading:false,data:null,error:null})}} style={{background:'var(--rbg)',border:'none',borderRadius:5,color:'var(--red)',fontSize:11,padding:'4px 10px',cursor:'pointer',width:'100%'}}>Desconectar WHOOP</button>
            </div>
          )}
          <div className="uc">
            <div className="av">IR</div>
            <div>
              <div style={{fontSize:12.5,fontWeight:600}}>Isaac</div>
              <div style={{fontSize:10,color:'var(--t3)'}}>isaacronydayan@gmail.com</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="main">
        <Comp checks={checks} setChecks={setChecks} whoop={whoop.loading||whoop.data||whoop.error?whoop:null}/>
      </main>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
</script>
</body>
</html>`;
