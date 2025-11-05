/* Help Desk Mini – localStorage CRUD, search/sort, CSV export */
const STORAGE_KEY = 'hdm:tickets:v1';
const rows = document.getElementById('rows');
const empty = document.getElementById('empty');

const form = document.getElementById('ticketForm');
const subject = document.getElementById('subject');
const email = document.getElementById('email');
const priority = document.getElementById('priority');
const description = document.getElementById('description');
const formError = document.getElementById('formError');

const search = document.getElementById('search');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');

const exportCsvBtn = document.getElementById('exportCsvBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

const PRIORITY_ORDER = { Urgent:4, High:3, Normal:2, Low:1 };

function nowISO(){ return new Date().toISOString(); }
function load(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }catch{ return []; } }
function save(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function uid(){ return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()); }
function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c])); }
function fmtTime(iso){ const d=new Date(iso); return d.toLocaleString(); }

function validateTicket(t){
  if(!t.subject?.trim()) return 'Subject is required.';
  if(!t.email?.trim()) return 'Email is required.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email)) return 'Email looks invalid.';
  if(!t.description?.trim()) return 'Description is required.';
  return '';
}

function createTicket({subject,email,priority,description}){
  const t = { id: uid(), subject:subject.trim(), email:email.trim(), priority, description:description.trim(),
    status:'Open', createdAt: nowISO(), updatedAt: nowISO() };
  return t;
}

function updateTicket(id, patch){
  const list = load();
  const i = list.findIndex(x=>x.id===id);
  if(i<0) return;
  list[i] = { ...list[i], ...patch, updatedAt: nowISO() };
  save(list);
}

function removeTicket(id){
  save(load().filter(t=>t.id!==id));
}

function clearAll(){
  localStorage.removeItem(STORAGE_KEY);
}

function filterSort(list){
  const q = (search.value||'').toLowerCase();
  const status = statusFilter.value || '';
  const sort = sortBy.value || 'updated_desc';
  let arr = list.filter(t=>{
    const matchesQ = !q || t.subject.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchesS = !status || t.status === status;
    return matchesQ && matchesS;
  });
  const [key, dirStr] = sort.split('_'); const dir = dirStr==='asc'?1:-1;
  arr.sort((a,b)=>{
    if(key==='priority') return dir*(PRIORITY_ORDER[a.priority]-PRIORITY_ORDER[b.priority]);
    if(key==='created') return dir*(new Date(a.createdAt)-new Date(b.createdAt));
    return dir*(new Date(a.updatedAt)-new Date(b.updatedAt));
  });
  return arr;
}

function render(){
  const list = filterSort(load());
  rows.innerHTML = list.map(t=>`
    <tr data-id="${t.id}">
      <td>${escapeHtml(t.subject)}</td>
      <td>${escapeHtml(t.email)}</td>
      <td>${escapeHtml(t.priority)}</td>
      <td><span class="badge ${t.status==='Open'?'open':'closed'}">${t.status}</span></td>
      <td>${fmtTime(t.createdAt)}</td>
      <td>${fmtTime(t.updatedAt)}</td>
      <td class="row-actions">
        <button data-act="toggle">${t.status==='Open'?'Close':'Reopen'}</button>
        <button data-act="delete" class="danger">Delete</button>
      </td>
    </tr>
  `).join('');
  empty.style.display = list.length ? 'none' : 'block';
}

function rowAction(e){
  const btn = e.target.closest('button');
  if(!btn) return;
  const tr = e.target.closest('tr');
  const id = tr?.dataset.id;
  const act = btn.dataset.act;
  if(!id || !act) return;

  if(act==='toggle'){
    const list = load();
    const ticket = list.find(x=>x.id===id);
    if(!ticket) return;
    updateTicket(id, { status: ticket.status==='Open' ? 'Closed':'Open' });
  }
  if(act==='delete'){
    if(confirm('Delete this ticket?')) removeTicket(id);
  }
  render();
}

function exportCSV(){
  const list = load();
  const headers = ['id','subject','email','priority','status','createdAt','updatedAt','description'];
  const lines = [headers.join(',')];
  for(const t of list){
    const row = headers.map(h=>{
      const v = String(t[h] ?? '');
      return /[",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
    });
    lines.push(row.join(','));
  }
  const blob = new Blob(["\ufeff"+lines.join('\n')], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tickets-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 500);
}

/* Events */
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  formError.textContent = '';
  const t = createTicket({
    subject: subject.value, email: email.value,
    priority: priority.value, description: description.value
  });
  const err = validateTicket(t);
  if(err){ formError.textContent = err; return; }
  const list = load(); list.unshift(t); save(list);
  form.reset(); subject.focus();
  render();
});
rows.addEventListener('click', rowAction);
[search,statusFilter,sortBy].forEach(el=>el.addEventListener('input', render));
exportCsvBtn.addEventListener('click', exportCSV);
clearAllBtn.addEventListener('click', ()=>{
  if(confirm('This will delete ALL tickets stored in this browser.')) { clearAll(); render(); }
});

/* First paint */
render();
