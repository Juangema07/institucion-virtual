import "./styles.css";

const DEMO_USERS = {
  rector: { password: "rector123", name: "Rector Demo", role: "Rector" },
  coordinador: { password: "coord123", name: "Coordinador Demo", role: "Coordinador" },
  docente: { password: "docente123", name: "Docente Demo", role: "Docente" },
  estudiante: { password: "estudiante123", name: "Estudiante Demo", role: "Estudiante" }
};

const defaultState = { users: [], syncQueue: [],
  user: null,
  notes: [{ id: 1, title: "Mi primera nota", body: "Bienvenido a Institución Virtual 0.1 Alpha." }],
  exams: [{
    id: 1,
    title: "Diagnóstico de ejemplo",
    subject: "Demo",
    questions: [
      { type: "single", text: "¿Qué significa LAN?", options: ["Red de área local", "Lenguaje de programación", "Sistema operativo"], answer: 0 }
    ]
  }],
  grades: [
    { student: "Estudiante Demo", subject: "Matemáticas", activity: "Actividad 1", grade: 4.5 },
    { student: "Estudiante Demo", subject: "Ciencias", activity: "Quiz 1", grade: 4.2 }
  ],
  attendance: [{ student: "Estudiante Demo", date: new Date().toISOString().slice(0,10), status: "Presente" }],
  files: [],
  examIncidents: []
};

let state = loadState();
let currentSection = location.hash.slice(1) || "inicio";
let activeExam = null;

function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem("iv_state") || "{}") }; }
  catch { return structuredClone(defaultState); }
}
function save(mutation=null) {
  if (mutation) state.syncQueue.push({ id: Date.now()+"-"+Math.random(), at:new Date().toISOString(), mutation });
  localStorage.setItem("iv_state", JSON.stringify(state));
}
function allUsers() {
  return [...Object.entries(DEMO_USERS).map(([username,u])=>({username,...u})), ...(state.users||[])];
}


function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function roleItems(role) {
  const common = [
    ["inicio","Inicio","⌂","Resumen general"],
    ["notas","Libreta","▤","Notas y apuntes"],
    ["examenes","Exámenes","✓","Evaluaciones"],
    ["calificaciones",role === "Docente" ? "Planilla" : "Calificaciones","◒",role === "Docente" ? "Notas de estudiantes" : "Mis resultados"],
    ["asistencia","Asistencia","◷","Registro académico"],
    ["archivos","Archivos","□","Documentos y materiales"]
  ];
  if (role === "Estudiante") return common;
  return [...common, ["usuarios","Usuarios","◎","Comunidad institucional"]];
}

const APP_DOWNLOAD_URL = "https://github.com/Juangema07/institucion-virtual/releases/download/alpha-latest/app-debug.apk";

function sectionTitle(id) {
  const labels = {
    inicio:"Inicio", notas:"Libreta", archivos:"Archivos", examenes:"Exámenes",
    calificaciones:"Calificaciones", asistencia:"Asistencia", usuarios:"Usuarios"
  };
  return labels[id] || "Inicio";
}

function render() {
  if (!state.user) return renderLogin();
  const items = roleItems(state.user.role);
  const current = items.find(x=>x[0]===currentSection) || items[0];
  currentSection = current[0];
  document.querySelector("#app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="logo">IV</div>
          <div><b>Institución Virtual</b><small>Campus digital · Alpha</small></div>
        </div>
        <div class="user-card">
          <div class="avatar">${escapeHtml((state.user.name||"U").slice(0,1).toUpperCase())}</div>
          <div class="user-meta"><strong>${escapeHtml(state.user.name)}</strong><span>${escapeHtml(state.user.role)}</span></div>
        </div>
        <div class="nav-label">PRINCIPAL</div>
        <nav class="main-nav">${items.slice(0,1).map(([id,label,icon,desc]) => `
          <button class="nav-item ${currentSection===id?"active":""}" data-section="${id}" title="${desc}">
            <span class="nav-icon">${icon}</span><span class="nav-copy"><b>${label}</b><small>${desc}</small></span>
          </button>`).join("")}</nav>
        <div class="nav-label nav-label-section">ACADÉMICO</div>
        <nav class="main-nav">${items.slice(1,4).map(([id,label,icon,desc]) => `
          <button class="nav-item ${currentSection===id?"active":""}" data-section="${id}" title="${desc}">
            <span class="nav-icon">${icon}</span><span class="nav-copy"><b>${label}</b><small>${desc}</small></span>
          </button>`).join("")}</nav>
        <div class="nav-label nav-label-section">RECURSOS</div>
        <nav class="main-nav">${items.slice(4,6).map(([id,label,icon,desc]) => `
          <button class="nav-item ${currentSection===id?"active":""}" data-section="${id}" title="${desc}">
            <span class="nav-icon">${icon}</span><span class="nav-copy"><b>${label}</b><small>${desc}</small></span>
          </button>`).join("")}</nav>
        ${items[6] ? `<div class="nav-label nav-label-section">GESTIÓN</div>
        <nav class="main-nav"><button class="nav-item ${currentSection===items[6][0]?"active":""}" data-section="${items[6][0]}" title="${items[6][3]}">
          <span class="nav-icon">${items[6][2]}</span><span class="nav-copy"><b>${items[6][1]}</b><small>${items[6][3]}</small></span>
        </button></nav>` : ""}
        <div class="sidebar-bottom">
          <a class="download-card" href="${APP_DOWNLOAD_URL}" target="_blank" rel="noreferrer">
            <span class="download-icon">↓</span><span><b>Descargar APK</b><small>Android · compilación actual</small></span>
          </a>
          <button id="installBtn" class="secondary compact">Instalar esta app</button>
          <button id="logout" class="logout">Cerrar sesión</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="topbar-title"><span class="eyebrow">Campus digital</span><h1>${sectionTitle(currentSection)}</h1><p>${current[3]}</p></div>
          <div class="topbar-actions">
            <span id="connectionBadge" class="status"><i></i> ${navigator.onLine ? "En línea" : "Sin conexión"}</span>
            <div class="account-chip"><span class="avatar small">${escapeHtml((state.user.name||"U").slice(0,1).toUpperCase())}</span><span>${escapeHtml(state.user.name)}</span></div>
          </div>
        </header>
        <section id="content"></section>
      </main>
    </div>`;
  document.querySelectorAll("[data-section]").forEach(b=>b.onclick=()=>{
    currentSection=b.dataset.section;
    history.replaceState(null,"","#"+currentSection);
    render();
  });
  document.querySelector("#logout").onclick=()=>{
    state.user=null; save({type:"session.logout"}); history.replaceState(null,"","#inicio"); render();
  };
  document.querySelector("#installBtn").onclick=installApp;
  renderSection(); updateConnectionBadge();
}

function renderLogin() {
  document.querySelector("#app").innerHTML = `
    <main class="login">
      <div class="login-card">
        <div class="login-app-banner"><div><b>App Android disponible</b><span>Instálala y continúa desde tu teléfono.</span></div><a class="primary" href="${APP_DOWNLOAD_URL}" target="_blank" rel="noreferrer">Descargar APK</a></div>
        <div class="login-brand"><div class="logo big">IV</div><div><span class="eyebrow">CAMPUS DIGITAL</span><b>Institución Virtual</b></div></div>
        <h1>Tu institución, en un solo lugar.</h1>
        <p>Accede desde web, Android o Windows y conserva tu espacio de estudio.</p>
        <form id="loginForm">
          <label>Usuario<input id="username" placeholder="ej. estudiante" autocomplete="username" required></label>
          <label>Contraseña<input id="password" type="password" placeholder="••••••••" autocomplete="current-password" required></label>
          <button class="primary" type="submit">Entrar al campus</button>
          <div class="login-divider"><span>o</span></div>
          <button type="button" class="secondary" id="registerBtn">Crear cuenta local</button>
          <button type="button" class="secondary" id="googleBtn">Continuar con Google</button>
          <small id="loginMsg"></small>
        </form>
        <div class="login-note">Tus datos de esta Alpha se guardan localmente. La sincronización entre dispositivos se activa al conectar el backend de cuentas.</div>
        <details><summary>Usuarios de demostración</summary><p>rector / rector123<br>coordinador / coord123<br>docente / docente123<br>estudiante / estudiante123</p></details>
      </div>
    </main>`;
  document.querySelector("#loginForm").onsubmit=e=>{
    e.preventDefault();
    const username=document.querySelector("#username").value.trim().toLowerCase();
    const u=allUsers().find(x=>x.username===username);
    const p=document.querySelector("#password").value;
    if(!u || u.password!==p){document.querySelector("#loginMsg").textContent="Usuario o contraseña incorrectos.";return;}
    state.user={name:u.name,role:u.role,username}; save({type:"session.login",username});
    currentSection=location.hash.slice(1)||"inicio"; render();
  };
  document.querySelector("#registerBtn").onclick=()=>{
    const username=prompt("Nuevo usuario (3-30 caracteres):");
    const password=prompt("Contraseña (mínimo 6 caracteres):");
    if(!username||!password||password.length<6){document.querySelector("#loginMsg").textContent="Datos inválidos.";return;}
    const clean=username.trim().toLowerCase();
    if(allUsers().some(x=>x.username===clean)){document.querySelector("#loginMsg").textContent="Ese usuario ya existe.";return;}
    state.users.push({username:clean,password,name:clean,role:"Estudiante"});
    state.user={username:clean,name:clean,role:"Estudiante"}; save({type:"user.create",username:clean}); render();
  };
  document.querySelector("#googleBtn").onclick=()=>document.querySelector("#loginMsg").textContent="Google OAuth requiere configurar el proveedor OAuth del servidor.";
}

function renderSection() {
  const c=document.querySelector("#content");
  if(currentSection==="inicio") c.innerHTML=home();
  if(currentSection==="notas") c.innerHTML=notes();
  if(currentSection==="examenes") c.innerHTML=exams();
  if(currentSection==="calificaciones") c.innerHTML=grades();
  if(currentSection==="asistencia") c.innerHTML=attendance();
  if(currentSection==="archivos") c.innerHTML=files();
  if(currentSection==="usuarios") c.innerHTML=users();
  bindSection();
}

function home(){return `
  <div class="hero"><div><span class="pill">OFFLINE-FIRST</span><h2>Todo empieza aquí.</h2><p>La Alpha conecta libreta, exámenes, archivos, calificaciones y asistencia en una sola experiencia.</p></div><div class="hero-mark">IV</div></div>
  <div class="grid cards">
    <article><b>Libreta</b><strong>${state.notes.length}</strong><span>notas guardadas localmente</span></article>
    <article><b>Exámenes</b><strong>${state.exams.length}</strong><span>disponibles en este dispositivo</span></article>
    <article><b>Calificaciones</b><strong>${state.grades.length}</strong><span>registros académicos</span></article>
    <article><b>Asistencia</b><strong>${state.attendance.length}</strong><span>registros</span></article>
  </div>
  <div class="panel"><h3>Estado de la Alpha</h3><p>Los cambios se guardan en este dispositivo. Si vuelve Internet, esta base queda preparada para conectarse al sistema de sincronización.</p></div>`; }

function notes(){return `
  <div class="toolbar"><button class="primary" id="newNote">+ Nueva nota</button></div>
  <div class="notes-grid">${state.notes.map(n=>`<article class="note"><input value="${escapeHtml(n.title)}" data-note-title="${n.id}"><textarea data-note-body="${n.id}">${escapeHtml(n.body)}</textarea><button data-delete-note="${n.id}">Eliminar</button></article>`).join("")}</div>`; }

function exams(){
  if(activeExam) return takeExam(activeExam);
  return `
    <div class="toolbar">${state.user.role!=="Estudiante"?'<button class="primary" id="newExam">+ Crear examen</button>':""}</div>
    <div class="exam-list">${state.exams.map(e=>`<article class="panel exam-row"><div><span class="pill">${escapeHtml(e.subject)}</span><h3>${escapeHtml(e.title)}</h3><span>${e.questions.length} pregunta(s)</span></div><button class="primary" data-take="${e.id}">${state.user.role==="Estudiante"?"Comenzar":"Ver examen"}</button></article>`).join("")}</div>
    ${state.user.role!=="Estudiante"?`<div id="examBuilder"></div>`:""}`;
}

function takeExam(exam){return `
  <div class="exam-header"><button class="secondary" id="backExams">← Volver</button><div><span class="pill">MODO EXAMEN</span><h2>${escapeHtml(exam.title)}</h2></div><span id="incidentBadge">Incidentes: 0</span></div>
  <form id="examForm" class="panel exam-form">${exam.questions.map((q,i)=>`<fieldset><legend>${i+1}. ${escapeHtml(q.text)}</legend>${q.type==="single"?q.options.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}"> ${escapeHtml(o)}</label>`).join(""):`<input name="q${i}" placeholder="Tu respuesta">`}</fieldset>`).join("")}<button class="primary">Entregar examen</button></form>`; }

function grades(){return `
  <div class="panel"><div class="table-head"><h3>${state.user.role==="Docente"?"Planilla de calificaciones":"Mis calificaciones"}</h3>${state.user.role==="Docente"?'<button class="primary" id="addGrade">+ Calificación</button>':""}</div>
  <div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Materia</th><th>Actividad</th><th>Nota</th></tr></thead><tbody>${state.grades.map(g=>`<tr><td>${escapeHtml(g.student)}</td><td>${escapeHtml(g.subject)}</td><td>${escapeHtml(g.activity)}</td><td><b>${g.grade}</b></td></tr>`).join("")}</tbody></table></div></div>`; }

function attendance(){return `
  <div class="panel"><div class="table-head"><h3>Asistencia</h3>${state.user.role!=="Estudiante"?'<button class="primary" id="addAttendance">+ Registrar</button>':""}</div>
  <div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${state.attendance.map(a=>`<tr><td>${escapeHtml(a.student)}</td><td>${a.date}</td><td><span class="status-chip">${escapeHtml(a.status)}</span></td></tr>`).join("")}</tbody></table></div></div>`; }

function files(){return `
  <div class="panel"><h3>Archivos</h3><p>Los archivos seleccionados se guardan como metadatos en esta Alpha. El almacenamiento real de archivos y sincronización llegará con el servidor.</p><input type="file" id="fileInput" multiple><ul class="file-list">${state.files.map(f=>`<li>📄 <b>${escapeHtml(f.name)}</b><span>${f.size} bytes</span></li>`).join("")}</ul></div>`; }

function users(){return `<div class="panel"><h3>Jerarquía institucional</h3><div class="role-grid">${["Rector","Coordinador","Docente","Estudiante"].map((r,i)=>`<article><span>0${i+1}</span><h3>${r}</h3><p>${r==="Rector"?"Gestión institucional":r==="Coordinador"?"Gestión de áreas y cursos":r==="Docente"?"Cursos, evaluaciones y asistencia":"Cursos, tareas y resultados"}</p></article>`).join("")}</div></div>`; }

function bindSection(){
  document.querySelectorAll("[data-delete-note]").forEach(b=>b.onclick=()=>{state.notes=state.notes.filter(n=>n.id!=b.dataset.deleteNote);save({type:"note.delete",id:b.dataset.deleteNote});renderSection();});
  document.querySelectorAll("[data-note-title]").forEach(i=>i.oninput=()=>{const n=state.notes.find(n=>n.id==i.dataset.noteTitle);n.title=i.value;save({type:"note.update",id:n.id});});
  document.querySelectorAll("[data-note-body]").forEach(i=>i.oninput=()=>{const n=state.notes.find(n=>n.id==i.dataset.noteBody);n.body=i.value;save({type:"note.update",id:n.id});});
  document.querySelector("#newNote")?.addEventListener("click",()=>{state.notes.unshift({id:Date.now(),title:"Nueva nota",body:""});save({type:"note.create"});renderSection();});
  document.querySelector("#newExam")?.addEventListener("click",()=>{
    const title=prompt("Nombre del examen:","Nuevo examen"); if(!title)return;
    const subject=prompt("Materia:","General")||"General";
    const duration=Math.max(1,Number(prompt("Duración en minutos:","30"))||30);
    const questions=[];
    while(true){
      const text=prompt("Pregunta (Cancelar para terminar):"); if(!text)break;
      const type=(prompt("Tipo: single / multiple / text","single")||"single").toLowerCase();
      if(type==="text"){questions.push({type:"text",text,points:1,answer:""});continue;}
      const options=(prompt("Opciones separadas por |","Opción A|Opción B|Opción C")||"").split("|").map(x=>x.trim()).filter(Boolean);
      if(options.length<2)continue;
      const raw=prompt(type==="multiple"?"Índices correctos separados por coma":"Índice correcto","0");
      const answer=type==="multiple"?(raw||"0").split(",").map(Number):Number(raw||0);
      questions.push({type:type==="multiple"?"multiple":"single",text,options,answer,points:1});
    }
    if(!questions.length){alert("El examen necesita al menos una pregunta.");return;}
    state.exams.push({id:Date.now(),title,subject,duration,questions});save({type:"exam.create",title});renderSection();
  });
  document.querySelectorAll("[data-take]").forEach(b=>b.onclick=()=>{activeExam=state.exams.find(e=>e.id==b.dataset.take);renderSection();});
  document.querySelector("#backExams")?.addEventListener("click",()=>{activeExam=null;renderSection();});
  document.querySelector("#examForm")?.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.target);let score=0;activeExam.questions.forEach((q,i)=>{if(q.type==="single" && Number(f.get("q"+i))===q.answer)score++;});alert(`Examen entregado. Resultado: ${score}/${activeExam.questions.length}`);activeExam=null;renderSection();});
  document.querySelector("#addGrade")?.addEventListener("click",()=>{const student=prompt("Estudiante:","Estudiante Demo");if(!student)return;const subject=prompt("Materia:","Materia");const activity=prompt("Actividad:","Actividad");const grade=Number(prompt("Nota (0-5):","5"));if(!Number.isFinite(grade))return;state.grades.push({student,subject,activity,grade});save();renderSection();});
  document.querySelector("#addAttendance")?.addEventListener("click",()=>{const student=prompt("Estudiante:","Estudiante Demo");if(!student)return;const status=prompt("Estado:","Presente");state.attendance.push({student,date:new Date().toISOString().slice(0,10),status});save();renderSection();});
  document.querySelector("#fileInput")?.addEventListener("change",e=>{for(const f of e.target.files)state.files.push({name:f.name,size:f.size,type:f.type});save();renderSection();});
}

document.addEventListener("visibilitychange",()=>{
  if(activeExam && document.hidden){
    state.examIncidents.push({examId:activeExam.id,type:"visibility-change",at:new Date().toISOString()});
    save({type:"exam.incident",examId:activeExam.id});
    const badge=document.querySelector("#incidentBadge");
    if(badge) badge.textContent="Incidentes: "+state.examIncidents.filter(x=>x.examId===activeExam.id).length;
  }
});
window.addEventListener("offline",render);
window.addEventListener("online",render);

if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();


// --- Alpha exam protection / sync helpers ---
let examLocked=false;
function updateConnectionBadge(){
  const el=document.querySelector("#connectionBadge"); if(!el)return;
  el.innerHTML="<i></i> "+(navigator.onLine?"En línea":"Sin conexión · Offline")+(state.syncQueue?.length?" · "+state.syncQueue.length+" pendientes":"");
}
async function installApp(){
  if(window.__ivInstallPrompt){await window.__ivInstallPrompt.prompt();window.__ivInstallPrompt=null;return;}
  window.open(APP_DOWNLOAD_URL,"_blank","noopener");
}
async function syncPending(){
  const api=import.meta.env.VITE_API_URL;
  if(!navigator.onLine||!api||!state.syncQueue?.length)return;
  try{
    const r=await fetch(api.replace(/\/$/,"")+"/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:state.user,changes:state.syncQueue})});
    if(!r.ok)throw new Error("sync");
    state.syncQueue=[];localStorage.setItem("iv_state",JSON.stringify(state));updateConnectionBadge();
  }catch{}
}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.__ivInstallPrompt=e;});
window.addEventListener("online",()=>{updateConnectionBadge();syncPending();});
window.addEventListener("offline",updateConnectionBadge);
document.addEventListener("visibilitychange",()=>{
  if(activeExam&&document.hidden){
    state.examIncidents.push({examId:activeExam.id,type:"visibility-change",at:new Date().toISOString()});
    save({type:"exam.incident",examId:activeExam.id,reason:"visibility-change"});
    if(state.user?.role==="Estudiante") lockCurrentExam("visibility-change");
  }
});
window.addEventListener("blur",()=>{if(activeExam&&state.user?.role==="Estudiante")lockCurrentExam("window-blur");});
document.addEventListener("fullscreenchange",()=>{if(activeExam&&!document.fullscreenElement&&state.user?.role==="Estudiante")lockCurrentExam("fullscreen-exit");});
function lockCurrentExam(reason){
  if(examLocked)return; examLocked=true;
  state.examIncidents.push({examId:activeExam.id,type:reason,at:new Date().toISOString()});
  save({type:"exam.lock",examId:activeExam.id,reason});
  document.querySelectorAll("#examForm input,#examForm textarea,#examForm button").forEach(x=>x.disabled=true);
  const badge=document.querySelector("#incidentBadge"); if(badge)badge.textContent="Evaluación bloqueada · "+reason;
}
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
syncPending();

window.addEventListener("hashchange",()=>{if(state.user){currentSection=location.hash.slice(1)||"inicio";render();}});
