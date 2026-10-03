import "./styles.css";

const DEMO_USERS = {
  rector: { password: "rector123", name: "Rector Demo", role: "Rector" },
  coordinador: { password: "coord123", name: "Coordinador Demo", role: "Coordinador" },
  docente: { password: "docente123", name: "Docente Demo", role: "Docente" },
  estudiante: { password: "estudiante123", name: "Estudiante Demo", role: "Estudiante" }
};

const defaultState = {
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
let currentSection = "inicio";
let activeExam = null;

function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem("iv_state") || "{}") }; }
  catch { return structuredClone(defaultState); }
}
function save() { localStorage.setItem("iv_state", JSON.stringify(state)); }

function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function roleItems(role) {
  const common = [["inicio","Inicio"],["notas","Libreta"],["archivos","Archivos"]];
  if (role === "Estudiante") return [...common,["examenes","Exámenes"],["calificaciones","Calificaciones"],["asistencia","Asistencia"]];
  if (role === "Docente") return [...common,["examenes","Exámenes"],["calificaciones","Planilla"],["asistencia","Asistencia"]];
  return [...common,["examenes","Exámenes"],["calificaciones","Calificaciones"],["asistencia","Asistencia"],["usuarios","Usuarios"]];
}

function render() {
  if (!state.user) return renderLogin();
  const items = roleItems(state.user.role);
  document.querySelector("#app").innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><div class="logo">IV</div><div><b>Institución Virtual</b><small>0.1 Alpha</small></div></div>
        <div class="user-card"><strong>${escapeHtml(state.user.name)}</strong><span>${state.user.role}</span></div>
        <nav>${items.map(([id,label]) => `<button class="${currentSection===id?"active":""}" data-section="${id}">${label}</button>`).join("")}</nav>
        <button id="logout" class="logout">Cerrar sesión</button>
      </aside>
      <main class="main">
        <header><div><span class="eyebrow">Institución Virtual</span><h1>${items.find(x=>x[0]===currentSection)?.[1] || "Inicio"}</h1></div><span class="status"><i></i> ${navigator.onLine ? "En línea" : "Sin conexión · Offline"}</span></header>
        <section id="content"></section>
      </main>
    </div>`;
  document.querySelectorAll("[data-section]").forEach(b=>b.onclick=()=>{currentSection=b.dataset.section; render();});
  document.querySelector("#logout").onclick=()=>{state.user=null; save(); render();};
  renderSection();
}

function renderLogin() {
  document.querySelector("#app").innerHTML = `
    <main class="login">
      <div class="login-card">
        <div class="logo big">IV</div>
        <span class="eyebrow">0.1 Alpha</span><h1>Institución Virtual</h1>
        <p>Una plataforma educativa que también funciona sin Internet.</p>
        <form id="loginForm">
          <label>Usuario<input id="username" placeholder="ej. estudiante" autocomplete="username" required></label>
          <label>Contraseña<input id="password" type="password" placeholder="••••••••" required></label>
          <button class="primary">Entrar</button>
          <button type="button" class="secondary" id="googleBtn">Continuar con Google</button>
          <small id="loginMsg"></small>
        </form>
        <details><summary>Usuarios de demostración</summary><p>rector / rector123<br>coordinador / coord123<br>docente / docente123<br>estudiante / estudiante123</p></details>
      </div>
    </main>`;
  document.querySelector("#loginForm").onsubmit=e=>{
    e.preventDefault();
    const u=DEMO_USERS[document.querySelector("#username").value.trim().toLowerCase()];
    const p=document.querySelector("#password").value;
    if(!u || u.password!==p){document.querySelector("#loginMsg").textContent="Usuario o contraseña incorrectos.";return;}
    state.user={name:u.name,role:u.role,username:document.querySelector("#username").value.trim().toLowerCase()}; save(); currentSection="inicio"; render();
  };
  document.querySelector("#googleBtn").onclick=()=>document.querySelector("#loginMsg").textContent="Google OAuth se conectará en la versión con servidor.";
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
  document.querySelectorAll("[data-delete-note]").forEach(b=>b.onclick=()=>{state.notes=state.notes.filter(n=>n.id!=b.dataset.deleteNote);save();renderSection();});
  document.querySelectorAll("[data-note-title]").forEach(i=>i.oninput=()=>{const n=state.notes.find(n=>n.id==i.dataset.noteTitle);n.title=i.value;save();});
  document.querySelectorAll("[data-note-body]").forEach(i=>i.oninput=()=>{const n=state.notes.find(n=>n.id==i.dataset.noteBody);n.body=i.value;save();});
  document.querySelector("#newNote")?.addEventListener("click",()=>{state.notes.unshift({id:Date.now(),title:"Nueva nota",body:""});save();renderSection();});
  document.querySelector("#newExam")?.addEventListener("click",()=>{
    const title=prompt("Nombre del examen:","Nuevo examen"); if(!title)return;
    const text=prompt("Pregunta:","Escribe la primera pregunta"); if(!text)return;
    const opts=prompt("Opciones separadas por |","Opción A|Opción B|Opción C").split("|");
    state.exams.push({id:Date.now(),title,subject:"General",questions:[{type:"single",text,options:opts,answer:0}]});save();renderSection();
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
    save();
    const badge=document.querySelector("#incidentBadge");
    if(badge) badge.textContent="Incidentes: "+state.examIncidents.filter(x=>x.examId===activeExam.id).length;
  }
});
window.addEventListener("offline",render);
window.addEventListener("online",render);

if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
render();
