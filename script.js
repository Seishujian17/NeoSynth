/* ====== Helpers ====== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const LS = window.localStorage;

/* ====== CLOCK ====== */
function two(n){return String(n).padStart(2,'0')}
function updateClock(){
  const now = new Date();
  const hours = now.getHours();
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const m = two(now.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  $('#clock').textContent = `${two(h12)}:${m} ${ampm}`;
  $('#clockDate').textContent = new Intl.DateTimeFormat('es-ES',{weekday:'long', month:'long', day:'numeric'}).format(now);
}
updateClock(); setInterval(updateClock,1000*15);

/* ====== THEME ====== */
const THEME_KEY = 'dashboard:theme';
function applyTheme(t){
  if(t === 'light') document.documentElement.style.setProperty('--bg','#ffffffff'), document.documentElement.style.setProperty('--text','#111'), document.documentElement.style.setProperty('--panel','#ffffff');
  else { document.documentElement.style.removeProperty('--bg'); document.documentElement.style.removeProperty('--text'); document.documentElement.style.removeProperty('--panel'); }
}
const storedTheme = LS.getItem(THEME_KEY) || 'dark';
if(storedTheme === 'light') { $('#themeToggle').checked = true; applyTheme('light'); }
$('#themeToggle').addEventListener('change', (e) => {
  const val = e.target.checked ? 'light' : 'dark';
  LS.setItem(THEME_KEY, val);
  applyTheme(val);
});

/* ====== COVER PICK & HERO IMAGE ====== */
const coverEl = $('#cover');
const coverPicker = $('#coverPicker');
const COVER_KEY = 'dashboard:cover';
const HERO_KEY = 'dashboard:hero';

$('#changeCover').addEventListener('click', ()=> coverPicker.click());
coverPicker.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    LS.setItem(COVER_KEY, reader.result);
    coverEl.style.backgroundImage = `url(${reader.result})`;
  };
  reader.readAsDataURL(file);
});
const savedCover = LS.getItem(COVER_KEY);
if(savedCover) coverEl.style.backgroundImage = `url(${savedCover})`;

/* hero image click to set URL */
const heroImg = $('#heroImg');
heroImg.addEventListener('click', ()=>{
  const url = prompt('https://i.pinimg.com/736x/d4/df/a3/d4dfa381a034e3dc0391041d08f119f4.jpg');
  if(url) {
    heroImg.src = url;
    LS.setItem(HERO_KEY, url);
  } else {
    const r = Math.floor(Math.random()*1000);
    heroImg.src = `https://picsum.photos/1200/800?grayscale&random=${r}`;
  }
});
const savedHero = LS.getItem(HERO_KEY);
if(savedHero) heroImg.src = savedHero;

/* ====== EDITABLES AUTO SAVE ====== */
$$('[contenteditable][data-key]').forEach(el=>{
  const key = el.dataset.key;
  const stored = LS.getItem(key);
  if(stored) el.innerHTML = stored;
  el.addEventListener('input', ()=> LS.setItem(key, el.innerHTML));
});

/* ====== MINI CALENDAR ====== */
const mini = { monthOffset: 0, title: $('#miniTitle'), body: $('#miniBody') };
function buildMini(offset){
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth()+offset);
  const year = base.getFullYear(), month = base.getMonth();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const prevDays = new Date(year,month,0).getDate();
  mini.title.textContent = base.toLocaleString('es-ES',{month:'long', year:'numeric'});
  let html = '<tr>';
  let printed = 0;
  for(let i=0;i<firstDay;i++){ const num = prevDays - firstDay + 1 + i; html += `<td class="other">${num}</td>`; printed++; if(printed%7===0) html+='</tr><tr>'; }
  const today = new Date();
  for(let d=1; d<=daysInMonth; d++){
    const isToday = offset===0 && d===today.getDate() && month===today.getMonth() && year===today.getFullYear();
    html += `<td class="${isToday?'today':''}">${d}</td>`;
    printed++; if(printed%7===0 && d!==daysInMonth) html+='</tr><tr>';
  }
  let next = 1; while(printed%7!==0){ html += `<td class="other">${next++}</td>`; printed++; }
  html += '</tr>';
  mini.body.innerHTML = html;
}
buildMini(0);
$('#miniPrev').addEventListener('click', ()=>{ mini.monthOffset--; buildMini(mini.monthOffset); });
$('#miniNext').addEventListener('click', ()=>{ mini.monthOffset++; buildMini(mini.monthOffset); });

/* ====== BIG CALENDAR ====== */
const cal = { viewDate: new Date(), title: $('#calTitle'), body: $('#calBody') };
function buildBig(date){
  const year = date.getFullYear(), month = date.getMonth();
  cal.title.textContent = date.toLocaleString('es-ES',{month:'long', year:'numeric'});
  cal.body.innerHTML = '';
  const firstDay = new Date(year,month,1).getDay();
  const days = new Date(year,month+1,0).getDate();
  // leading
  for(let i=0;i<firstDay;i++){
    const div = document.createElement('div');
    div.className = 'cal-cell';
    div.innerHTML = `<div class="cal-num other">${''}</div>`;
    cal.body.appendChild(div);
  }
  const today = new Date();
  for(let d=1; d<=days; d++){
    const div = document.createElement('div');
    div.className = 'cal-cell';
    if(d===today.getDate() && month===today.getMonth() && year===today.getFullYear()) div.classList.add('today');
    div.innerHTML = `<div class="cal-num">${d}</div>`;
    cal.body.appendChild(div);
  }
  // trailing to fill 7xN
  while(cal.body.children.length % 7 !== 0) {
    const div = document.createElement('div');
    div.className = 'cal-cell';
    div.innerHTML = `<div class="cal-num other">${''}</div>`;
    cal.body.appendChild(div);
  }
}
buildBig(cal.viewDate);
$('#prevMonth').addEventListener('click', ()=>{ cal.viewDate.setMonth(cal.viewDate.getMonth()-1); buildBig(cal.viewDate); });
$('#nextMonth').addEventListener('click', ()=>{ cal.viewDate.setMonth(cal.viewDate.getMonth()+1); buildBig(cal.viewDate); });
$('#todayBtn').addEventListener('click', ()=>{ cal.viewDate = new Date(); buildBig(cal.viewDate); });

/* ====== TODOS (database-like) ====== */
const TODO_KEY = 'dashboard:todos';
let todos = JSON.parse(LS.getItem(TODO_KEY) || '[]');

function saveTodos(){ LS.setItem(TODO_KEY, JSON.stringify(todos)); renderTodos(); }
function uid(){ return Math.random().toString(36).slice(2,9); }

function renderTodos(filter = $('#todoFilter').value){
  const list = $('#todoList');
  list.innerHTML = '';
  const filtered = todos.filter(t => filter === 'all' ? true : (filter==='active' ? !t.done : t.done));
  filtered.forEach(t => {
    const li = document.createElement('li'); li.className = 'todo-item' + (t.done ? ' completed' : '');
    const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = !!t.done;
    chk.addEventListener('change', ()=>{ t.done = chk.checked; saveTodos(); });
    const span = document.createElement('span'); span.className='text'; span.contentEditable = true; span.innerText = t.text;
    span.addEventListener('input', ()=>{ t.text = span.innerText; saveTodos(); });
    const actions = document.createElement('div'); actions.className='actions';
    const del = document.createElement('button'); del.className='btn tiny'; del.textContent='✕'; del.addEventListener('click', ()=>{
      todos = todos.filter(x => x.id !== t.id); saveTodos();
    });
    actions.appendChild(del);
    li.appendChild(chk); li.appendChild(span); li.appendChild(actions);
    list.appendChild(li);
  });
}

$('#addTodo').addEventListener('click', ()=>{
  const val = $('#todoInput').value.trim();
  if(!val) return;
  todos.unshift({ id: uid(), text: val, done: false, created: Date.now() });
  $('#todoInput').value = '';
  saveTodos();
});
$('#todoInput').addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); $('#addTodo').click(); }});
$('#todoFilter').addEventListener('change', ()=> renderTodos());

renderTodos();

/* ====== MUSIC MODAL ====== */
const musicModal = $('#musicModal');
$('#openMusic').addEventListener('click', ()=> musicModal.classList.remove('hidden'));
$('#closeMusic').addEventListener('click', ()=> {
  musicModal.classList.add('hidden');
  // stop video by resetting src
  const iframe = $('#ytPlayer');
  iframe.src = iframe.src;
});

/* ====== NAV ACTIVE STATE (sidebar) ====== */
$$('.nav-item').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.nav-item').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    // here you could change content for each page target
  });
});

/* ====== Quick note creation ====== */
$('#createNote').addEventListener('click', ()=>{
  const slot = document.createElement('div');
  slot.className = 'card editor-card';
  slot.innerHTML = `<h3>quick note</h3><div class="editor" contenteditable data-key="note:quick:${Date.now()}">Escribe...</div>`;
  document.querySelector('.top-notes').prepend(slot);
  // Attach autosave
  slot.querySelector('[contenteditable]').addEventListener('input', e=>{
    const key = e.target.dataset.key;
    LS.setItem(key, e.target.innerHTML);
  });
});

/* ====== Init small previews ====== */
if(!LS.getItem('dashboard:hero')) LS.setItem('dashboard:hero', heroImg.src);
$('#musicPhoto').src = LS.getItem('dashboard:musicPhoto') || $('#musicPhoto').src;

/* ====== Small polish: keyboard shortcut to add todo (N) ====== */
document.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase() === 'n' && e.ctrlKey) {
    e.preventDefault(); $('#todoInput').focus();
  }
});
