// ---------- State & Persistence ----------
const LS_KEY = 'chronoquest:v1';
const state = {
  is24: true,
  showSeconds: true,
  fuzzy: false,
  useManual: false,
  manualIso: null,
  alarms: [], 
  points: 0,
  bg: null,
  theme: 'dark',
  customAlarmSound: null 
};
function loadState(){
  try{ const raw = localStorage.getItem(LS_KEY); if(raw) Object.assign(state, JSON.parse(raw)); }catch(e){}
}
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); renderStats(); renderAlarms(); }
loadState();

// ---------- DOM shortcuts ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ---------- Navigation & sidebar ----------
const sidebar = $('#sidebar'), overlay = $('#overlay'), hambBtn = $('#hambBtn');
function toggleSidebar(open){
  if(open === undefined) open = !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  sidebar.setAttribute('aria-hidden', !open);
}
hambBtn.addEventListener('click', ()=>toggleSidebar(true));
overlay.addEventListener('click', ()=>toggleSidebar(false));

// nav buttons
$$('.nav button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    activatePage(btn.dataset.target);
    toggleSidebar(false);
  });
});
// home quick links
$$('[data-target-nav]').forEach(b=>{
  b.addEventListener('click', ()=>activatePage(b.dataset.targetNav));
});

function activatePage(id){
  $$('.nav button').forEach(b=>b.classList.toggle('active', b.dataset.target===id));
  $$('.page').forEach(p=>p.classList.toggle('active', p.id===id));
  const el = document.getElementById(id);
  if(el) el.scrollTop = 0;
}

// ---------- Clock ----------
const timeDisplay = $('#timeDisplay'), dateDisplay = $('#dateDisplay'), fuzzyDisplay = $('#fuzzyDisplay');
function pad(n){ return String(n).padStart(2,'0'); }
function fuzzyTime(d){
  const h = d.getHours(), m = d.getMinutes();
  const names = ["twelve","one","two","three","four","five","six","seven","eight","nine","ten","eleven"];
  const hName = names[h%12], nextName = names[(h+1)%12];
  if(m===0) return `${hName} o'clock`;
  if(m===15) return `quarter past ${hName}`;
  if(m===30) return `half past ${hName}`;
  if(m===45) return `quarter to ${nextName}`;
  if(m<30) return `${m} past ${hName}`;
  return `${60-m} to ${nextName}`;
}

function getNow(){
  if(state.useManual && state.manualIso){
    return new Date(state.manualIso);
  }
  return new Date();
}

function advanceManualByOneSecond(){
  if(state.useManual && state.manualIso){
    const d = new Date(state.manualIso);
    d.setSeconds(d.getSeconds()+1);
    state.manualIso = d.toISOString();
    saveState();
  }
}

function renderClock(){
  if(state.useManual) advanceManualByOneSecond();
  const now = getNow();
  let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  let displayH = h, suffix = '';
  if(!state.is24){ suffix = h>=12 ? ' PM':' AM'; displayH = h%12||12; }
  const secPart = state.showSeconds ? ':'+pad(s) : '';
  timeDisplay.textContent = `${pad(displayH)}:${pad(m)}${secPart}${suffix}`;
  dateDisplay.textContent = now.toLocaleDateString(undefined, {weekday:'long', year:'numeric', month:'short', day:'numeric'});
  fuzzyDisplay.textContent = state.fuzzy ? '≈ ' + fuzzyTime(now) : '';
  checkAlarms(now);
}

renderClock();
setInterval(renderClock, 1000);

// clock controls
$('#toggle24').addEventListener('click', ()=>{ state.is24 = !state.is24; saveState(); renderClock(); });
$('#toggleFuzzy').addEventListener('click', ()=>{ state.fuzzy = !state.fuzzy; saveState(); renderClock(); });
$('#showSeconds').addEventListener('change', (e)=>{ state.showSeconds = e.target.checked; saveState(); renderClock(); });
$('#useManual').addEventListener('change', (e)=>{ state.useManual = e.target.checked; if(!state.useManual) state.manualIso = null; saveState(); });
$('#applyManual').addEventListener('click', ()=>{
  let hh = parseInt($('#manualH').value || '0',10), mm = parseInt($('#manualM').value || '0',10), ss = parseInt($('#manualS').value || '0',10);
  hh = Math.max(0,Math.min(23,hh)); mm = Math.max(0,Math.min(59,mm)); ss = Math.max(0,Math.min(59,ss));
  const d = new Date(); d.setHours(hh,mm,ss,0); state.manualIso = d.toISOString(); state.useManual = true; $('#useManual').checked = true; saveState(); renderClock();
});

// ---------- Alarms ----------
function uid(){ return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()).replace('.',''); }
function hhmmFromDate(d){ return pad(d.getHours())+':'+pad(d.getMinutes()); }

let currentAlarmAudio = null;
let alarmLoopTimeout = null;

function renderAlarms(){
  const list = $('#alarmsList'); list.innerHTML = '';
  state.alarms.forEach(a=>{
    const el = document.createElement('div'); el.className='alarm-item';
    el.innerHTML = `<div><strong>${a.timeHHMM}</strong> &nbsp; <span class="small">${a.label||'Alarm'}</span></div>`;
    const right = document.createElement('div');
    const toggle = document.createElement('button'); toggle.className='btn'; toggle.textContent = a.enabled ? 'On':'Off';
    toggle.addEventListener('click', ()=>{ a.enabled = !a.enabled; saveState(); });
    const del = document.createElement('button'); del.className='btn danger'; del.textContent='Delete';
    del.addEventListener('click', ()=>{ state.alarms = state.alarms.filter(x=>x.id!==a.id); saveState(); renderAlarms(); });
    right.append(toggle, del);
    el.append(right);
    list.appendChild(el);
  });
  $('#alarmCountPill').textContent = `${state.alarms.length} / 10`;
  $('#statAlarms').textContent = state.alarms.length;
}

function addAlarm(timeHHMM, label='', repeat='once'){
  if(!timeHHMM) return alert('Pick time');
  if(state.alarms.length >= 10) return alert('Max 10 alarms reached');
  state.alarms.push({ id: uid(), timeHHMM, label, repeat, enabled:true });
  saveState(); renderAlarms();
}

$('#addAlarmBtn').addEventListener('click', ()=>{
  addAlarm($('#alarmTimeInput').value, $('#alarmLabelInput').value.trim(), $('#alarmRepeatInput').value);
  $('#alarmLabelInput').value=''; $('#alarmTimeInput').value='';
});

// ---------- Alarm Notification & Sound ----------
if(!$('#alarmNotification')){
  const notif = document.createElement('div'); notif.id='alarmNotification';
  notif.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px;background:#222;border-radius:12px;color:white;display:none;z-index:999;';
  const stopBtn = document.createElement('button'); stopBtn.id='stopAlarmBtn'; stopBtn.textContent='Stop'; stopBtn.style.cssText='margin-left:12px;padding:6px 12px;';
  stopBtn.addEventListener('click', stopCurrentAlarm);
  notif.appendChild(document.createTextNode('⏰ Alarm ringing! '));
  notif.appendChild(stopBtn);
  document.body.appendChild(notif);
}

function playAlarmSound(){
  if(currentAlarmAudio) return; // already playing
  const audioSrc = state.customAlarmSound || 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';
  currentAlarmAudio = new Audio(audioSrc);
  currentAlarmAudio.loop = true;
  // I’m starting playback without alerts so it rings even if user isn’t watching
  currentAlarmAudio.play().catch(()=>{});
  $('#alarmNotification').style.display='inline-block';

  // I auto-stop after 2 minutes (so it doesn’t ring forever)
  alarmLoopTimeout = setTimeout(stopCurrentAlarm, 2*60*1000);
}

function stopCurrentAlarm(){
  if(currentAlarmAudio){
    currentAlarmAudio.pause();
    currentAlarmAudio.currentTime = 0;
    currentAlarmAudio = null;
  }
  if(alarmLoopTimeout) clearTimeout(alarmLoopTimeout);
  alarmLoopTimeout = null;
  $('#alarmNotification').style.display='none';
}

// ---------- Check alarms ----------
function checkAlarms(now){
  const cur = hhmmFromDate(now);
  if(now.getSeconds() !== 0) return;
  state.alarms.forEach(a=>{
    if(!a.enabled) return;
    if(a.timeHHMM === cur){
      playAlarmSound();
      navigator.vibrate?.([200,100,200]);
      if(a.repeat==='once'){ a.enabled=false; saveState(); renderAlarms(); }
    }
  });
}

renderAlarms();

// ---------- Custom Alarm Upload (I keep it simple & local) ----------
$('#uploadAlarmBtn')?.addEventListener('click', ()=>{
  $('#uploadAlarm')?.click();
});
$('#uploadAlarm')?.addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  state.customAlarmSound = url;
  saveState();
  alert('Custom alarm sound uploaded and will play for alarms!');
});

// ---------- Voice alarm (Web Speech API) ----------
let recognition = null;
if(window.SpeechRecognition || window.webkitSpeechRecognition){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}
$('#voiceBtn').addEventListener('click', ()=>{
  if(!recognition) return alert('Voice not supported in this browser. Use Chrome for best results.');
  $('#voiceBtn').textContent = 'Listening...';
  recognition.start();
  recognition.onresult = (ev)=>{
    const phrase = ev.results[0][0].transcript.trim();
    parseVoiceAlarm(phrase);
    $('#voiceBtn').textContent = '🎤 Voice';
  };
  recognition.onend = ()=>{ $('#voiceBtn').textContent = '🎤 Voice'; };
  recognition.onerror = ()=>{ $('#voiceBtn').textContent = '🎤 Voice'; alert('Voice error'); };
});

function parseVoiceAlarm(phrase){
  const p = phrase.toLowerCase();
  const regexes = [
    /(\d{1,2}[:.]\d{2})\s*(am|pm)?/,
    /(\d{1,2})\s*(am|pm)/,
    /(\d{1,2})\s+(\d{2})/
  ];
  let timeFound=null, ampm=null;
  for(const re of regexes){
    const m = p.match(re);
    if(m){ timeFound = m[1]; if(m[2] && (m[2]==='am'||m[2]==='pm')) ampm = m[2]; break; }
  }
  if(!timeFound){ alert("Couldn't parse time from: " + phrase); return; }
  let hour=0, minute=0;
  if(timeFound.includes(':')||timeFound.includes('.')){
    const parts = timeFound.split(/[:.]/); hour=parseInt(parts[0],10); minute=parseInt(parts[1],10);
  } else { hour = parseInt(timeFound,10); minute = 0; }
  if(ampm){ if(ampm==='pm' && hour<12) hour+=12; if(ampm==='am' && hour===12) hour = 0; }
  hour = Math.max(0,Math.min(23,hour)); minute = Math.max(0,Math.min(59,minute));
  const hhmm = pad(hour)+':'+pad(minute);
  let label = '';
  const forMatch = p.match(/for\s+(.+)/);
  if(forMatch){ label = forMatch[1].replace(/\b(am|pm)\b/,'').trim(); }
  else { label = p.replace(timeFound,'').replace(/set alarm|set an alarm|alarm|at|for/gi,'').trim(); }
  if(label.length>40) label = label.slice(0,40)+'...';
  addAlarm(hhmm, label||'Voice Alarm', 'once');
}

// ---------- Stopwatch ----------
let swRunning=false, swStart=0, swElapsed=0, swRAF=null;
function fmtMs(ms){
  const total = Math.max(0, Math.floor(ms));
  const sTotal = Math.floor(total/1000);
  const m = Math.floor(sTotal/60);
  const s = sTotal%60;
  const ms3 = total%1000;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms3).padStart(3,'0')}`;
}
function swTick(){
  if(!swRunning) return;
  const now = performance.now();
  const elapsed = swElapsed + (now - swStart);
  $('#swDisplay').textContent = fmtMs(elapsed);
  swRAF = requestAnimationFrame(swTick);
}

$('#swStartBtn').addEventListener('click', ()=>{
  if(swRunning) return;
  swRunning=true; swStart = performance.now(); $('#swStartBtn').disabled=true; $('#swLapBtn').disabled=false; $('#swStopBtn').disabled=false; $('#swResetBtn').disabled=true;
  swTick();
});
$('#swLapBtn').addEventListener('click', ()=>{
  if(!swRunning) return;
  const now = performance.now(); const elapsed = swElapsed + (now - swStart);
  const div = document.createElement('div'); div.className='small'; div.textContent = `Lap ${Date.now()%1000} — ${fmtMs(elapsed)}`;
  $('#swLaps').prepend(div);
  playSound('ding');
});
$('#swStopBtn').addEventListener('click', ()=>{
  if(!swRunning) return;
  swRunning=false; cancelAnimationFrame(swRAF); swElapsed += (performance.now() - swStart);
  $('#swStartBtn').disabled=false; $('#swLapBtn').disabled=true; $('#swStopBtn').disabled=true; $('#swResetBtn').disabled=false;
});
$('#swResetBtn').addEventListener('click', ()=>{
  swRunning=false; cancelAnimationFrame(swRAF); swElapsed=0; swStart=0; $('#swDisplay').textContent='00:00.000'; $('#swLaps').innerHTML=''; $('#swStartBtn').disabled=false; $('#swLapBtn').disabled=true; $('#swStopBtn').disabled=true; $('#swResetBtn').disabled=true;
});

// ---------- Timer ----------
let timerId = null, timerRemaining = 0;
function renderTimer(){
  const totalSec = Math.max(0, Math.ceil(timerRemaining/1000));
  const m = Math.floor(totalSec/60); const s = totalSec%60;
  $('#timerDisplay').textContent = `${pad(m)}:${pad(s)}`;
}
$('#timerStartBtn').addEventListener('click', ()=>{
  const min = parseInt($('#timerMinInput').value||'0',10) || 0;
  const sec = parseInt($('#timerSecInput').value||'0',10) || 0;
  let total = min*60 + sec;
  if(total<=0 && timerRemaining<=0) return alert('Set duration');
  if(timerRemaining<=0) timerRemaining = total*1000;
  if(timerId) return;
  timerId = setInterval(()=>{
    timerRemaining -= 250;
    renderTimer();
    if(timerRemaining <= 0){
      clearInterval(timerId); timerId=null; timerRemaining=0; renderTimer();
      // I keep your short alarm + vibration for timer completion
      playSound('alarm');
      navigator.vibrate?.([200,100,200]);
      if($('#focusMode').checked) { awardPoint(true); }

// Count towards Daily Goals
incrementDailyGoals('timer');


      $('#timerStartBtn').disabled=false; $('#timerPauseBtn').disabled=true; $('#timerResetBtn').disabled=false;
    }
  }, 250);
  $('#timerStartBtn').disabled=true; $('#timerPauseBtn').disabled=false; $('#timerResetBtn').disabled=false;
});
$('#timerPauseBtn').addEventListener('click', ()=>{
  clearInterval(timerId); timerId=null; $('#timerStartBtn').disabled=false; $('#timerPauseBtn').disabled=true;
});
$('#timerResetBtn').addEventListener('click', ()=>{
  clearInterval(timerId); timerId=null; timerRemaining=0; renderTimer(); $('#timerStartBtn').disabled=false; $('#timerPauseBtn').disabled=true; $('#timerResetBtn').disabled=true;
});

// ---------- Points & gamification ----------
function awardPoint(fromTimer=false){
  state.points = (state.points||0) + 1;
  saveState();
  playSound('reward');
  renderStats();
}
function renderStats(){
  $('#statPoints').textContent = state.points || 0;
  $('#pointsCount').textContent = state.points || 0;
}
renderStats();

// ---------- Sounds ----------
function playSound(name){
  try{
    if(name==='ding'){ $('#audio-ding').currentTime = 0; $('#audio-ding').play(); }
    if(name==='reward'){ $('#audio-reward').currentTime = 0; $('#audio-reward').play(); }
    if(name==='alarm'){ $('#audio-alarm').currentTime = 0; $('#audio-alarm').play(); }
  }catch(e){}
}

// ---------- Background picker & theme ----------
function openBgPicker(){
  const color = prompt('Enter background CSS color or hex (example: #e8f5e9 or linear-gradient(...))', state.bg || '');
  if(color !== null){
    state.bg = color || null;
    applyBg();
    saveState();
  }
}
function applyBg(){
  if(state.bg){
    document.documentElement.style.setProperty('--bg2', state.bg);
  } else {
    document.documentElement.style.removeProperty('--bg2');
  }
}
function setTheme(t){
  state.theme = t;
  if(t==='light') document.body.setAttribute('data-theme','light'); else document.body.setAttribute('data-theme','dark');
  saveState();
}
applyBg();
setTheme(state.theme);

// ---------- Install prompt ----------
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredInstallPrompt = e;
  $('#installBtn').style.display = 'inline-block';
});
$('#installBtn').addEventListener('click', async ()=>{
  if(!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $('#installBtn').style.display = 'none';
});

// ---------- Persistence init ----------
if(state.manualIso) $('#manualH').value = new Date(state.manualIso).getHours();
if(state.manualIso) $('#manualM').value = new Date(state.manualIso).getMinutes();
if(state.manualIso) $('#manualS').value = new Date(state.manualIso).getSeconds();
renderAlarms();
renderStats();

// ---------- PWA Service Worker Registration ----------
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

/* --------------------------------------------------------------------
   DAILY GOALS TRACKER — Updated Version
-------------------------------------------------------------------- */

const DAILY_LS = 'cq:dailyGoals';
const defaultDailyTarget = 5;

function todayStr(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}

function loadDaily(){
  try{
    const raw = localStorage.getItem(DAILY_LS);
    if(raw){
      const obj = JSON.parse(raw);
      return {
        date: obj.date || todayStr(),
        completed: Number.isFinite(obj.completed)?obj.completed:0,
        target: Number.isFinite(obj.target)?obj.target:defaultDailyTarget
      };
    }
  }catch(_){}
  return { date: todayStr(), completed: 0, target: defaultDailyTarget };
}

function saveDaily(d){ 
  localStorage.setItem(DAILY_LS, JSON.stringify(d)); 
}

let daily = loadDaily();

// reset count if day changed
function ensureDailyDate(){
  const t = todayStr();
  if(daily.date !== t){
    daily.date = t;
    daily.completed = 0;
    saveDaily(daily);
    updateDailyGoalsUI();
  }
}

// update UI safely
function updateDailyGoalsUI(){
  const textEl = $('#progressText');
  const barEl = $('#progressBar');
  if(textEl) textEl.textContent = `${daily.completed} / ${daily.target} sessions completed`;
  if(barEl) barEl.style.width = `${Math.min(100, (daily.completed/daily.target)*100)}%`;
}

// increment sessions (call when focus session completes)
function incrementDailyGoals(source='session'){
  ensureDailyDate();
  daily.completed = (daily.completed || 0) + 1;
  if(daily.completed > daily.target) daily.completed = daily.target; // cap at target
  saveDaily(daily);
  updateDailyGoalsUI();
}

// set a custom target from input
function setDailyTarget(n){
  const val = Math.max(1, Math.min(20, Number(n)||defaultDailyTarget));
  daily.target = val;
  if(daily.completed > daily.target) daily.completed = daily.target; // adjust if necessary
  saveDaily(daily);
  updateDailyGoalsUI();
}

// bind goal input button if present
const goalInput = $('#dailyGoalInput'), goalBtn = $('#saveGoalBtn');
if(goalBtn && goalInput){
  goalBtn.addEventListener('click', ()=>{
    const val = parseInt(goalInput.value,10);
    if(!isNaN(val)) setDailyTarget(val);
  });
}


// on load
ensureDailyDate();
updateDailyGoalsUI();

// rollover check every minute
setInterval(ensureDailyDate, 60*1000);

// expose for debugging
window.__CQ.daily = daily;
window.__CQ.incrementDailyGoals = incrementDailyGoals;
window.__CQ.setDailyTarget = setDailyTarget;
window.__CQ.updateDailyGoalsUI = updateDailyGoalsUI;
