/* Smart Library – admin dashboard (all data lives in Supabase) */

/* ---------- icons ---------- */
const svg = p => `<svg class="i" viewBox="0 0 24 24">${p}</svg>`;
Object.assign(ICON, {
  grid: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
  users: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
  repeat: svg('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'),
  bookmark: svg('<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>'),
  wallet: svg('<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
  menu: svg('<path d="M3 6h18M3 12h18M3 18h18"/>'),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  alert: svg('<path d="m10.29 3.86-8.18 14.14A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3l-8.18-14.14a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>'),
  mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>'),
  phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  pin: svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
  trend: svg('<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>'),
  star: svg('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>')
});

/* ---------- state ---------- */
const $ = id => document.getElementById(id);
const S = { books: [], members: [], loans: [], reservations: [], payments: [], settings: {} };
const UI = { bookQ: '', memberQ: '', loanQ: '', loanF: 'all', payF: 'all', trendAll: 6, trendMember: 6 };

/* ---------- small helpers ---------- */
const todayStr = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const tsDate = ts => new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const toUTC = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 864e5);
const addDaysStr = (s, n) => new Date(toUTC(s) + n * 864e5).toISOString().slice(0, 10);
const fmtDate = s => s ? new Date(toUTC(s.slice(0, 10))).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '-';
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fineRate = () => Number(S.settings.fine_per_day ?? 5);
const loanDays = () => Number(S.settings.loan_days ?? 14);
const uuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
const initials = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = (n, cls = '') => `<span class="avatar ${cls}">${esc(initials(n))}</span>`;
const COVERS = ['#fed7aa', '#fde68a', '#fecaca', '#d9f99d', '#bfdbfe'];
const cover = t => { let h = 0; for (const c of t || '') h = (h * 31 + c.charCodeAt(0)) >>> 0; return `<span class="cover" style="background:${COVERS[h % COVERS.length]}">${esc((t || '?')[0].toUpperCase())}</span>`; };
const BADGE = { Overdue: 'bad', Borrowed: 'warn', Returned: 'ok', Available: 'ok', Pending: 'warn', Fulfilled: 'ok', Cancelled: 'muted', Paid: 'ok', Unpaid: 'bad', Active: 'ok', Suspended: 'bad' };
const badge = t => `<span class="badge b-${BADGE[t] || 'muted'}">${esc(t)}</span>`;

const bookOf = id => S.books.find(b => b.id === id);
const memberOf = id => S.members.find(m => m.id === id);
const isOut = b => S.loans.some(l => l.book_id === b.id && !l.returned_at);
const loanStatus = l => l.returned_at ? 'Returned' : (l.due_at < todayStr() ? 'Overdue' : 'Borrowed');
const accrued = l => (l.returned_at || l.due_at >= todayStr()) ? 0 : daysBetween(l.due_at, todayStr()) * fineRate();
const bookTitle = id => (bookOf(id) || {}).name || 'Deleted book';

function lastMonths(n) {
  const t = todayStr(); let y = +t.slice(0, 4), m = +t.slice(5, 7); const out = [];
  for (let i = 0; i < n; i++) {
    out.unshift({ key: `${y}-${String(m).padStart(2, '0')}`, label: new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) });
    if (--m === 0) { m = 12; y--; }
  }
  return out;
}
function chart(loans, months) {
  const counts = months.map(mo => loans.filter(l => l.borrowed_at.slice(0, 7) === mo.key).length);
  const max = Math.max(1, ...counts);
  return `<div class="chart">${months.map((mo, i) => `<div class="col"><div class="barwrap"><span class="val">${counts[i] || ''}</span>
    <div class="bar ${i === months.length - 1 ? 'cur' : ''}" style="height:${counts[i] / max * 80}%"></div></div><small>${mo.label}</small></div>`).join('')}</div>`;
}
const monthSelect = (name, v) => `<select data-ch="${name}">${[3, 6, 12].map(n => `<option value="${n}" ${n === v ? 'selected' : ''}>Last ${n} months</option>`).join('')}</select>`;

let toastTimer;
function toast(msg, ok = true) {
  const t = $('toast'); t.textContent = msg; t.className = 'toast show' + (ok ? '' : ' bad');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
function openModal(title, body) {
  $('modalBox').innerHTML = `<div class="mhead"><h2>${title}</h2><button class="iconbtn sm" data-act="closeModal" aria-label="Close">${ICON.x}</button></div>${body}`;
  $('modal').classList.add('show');
  setTimeout(() => { const i = $('modalBox').querySelector('input,select'); if (i) i.focus(); }, 30);
}
const closeModal = () => $('modal').classList.remove('show');
const formData = f => Object.fromEntries(new FormData(f));
const nul = v => (v || '').trim() || null;
async function run(fn, form) {
  const btn = form && form.querySelector('[type=submit]'); if (btn) btn.disabled = true;
  try { await fn(); } catch (e) { toast(e.message || String(e), false); }
  if (btn) btn.disabled = false;
}
const ok = r => { if (r.error) throw r.error; return r.data; };
const opts = (list, label, sel = '') => list.map(x => `<option value="${x.id}" ${x.id === sel ? 'selected' : ''}>${esc(label(x))}</option>`).join('');

/* ---------- loading + live updates ---------- */
async function load() {
  const q = t => sb.from(t).select('*');
  const [b, m, l, r, p, s] = await Promise.all([
    q('books').order('created_at', { ascending: false }), q('members').order('created_at', { ascending: false }),
    q('loans'), q('reservations'), q('payments'), q('settings')]);
  S.books = ok(b); S.members = ok(m); S.loans = ok(l); S.reservations = ok(r); S.payments = ok(p);
  S.settings = Object.fromEntries(ok(s).map(x => [x.key, x.value]));
}
async function refresh() {
  try { await load(); render(); } catch (e) { toast(e.message || 'Could not load data', false); }
}
let liveTimer;
function startLive() {
  const again = () => { clearTimeout(liveTimer); liveTimer = setTimeout(refresh, 350); };
  ['books', 'members', 'loans', 'reservations', 'payments', 'settings'].forEach(t =>
    sb.channel('admin-' + t + Math.random().toString(36).slice(2)).on('postgres_changes', { event: '*', schema: 'public', table: t }, again).subscribe());
}

/* ---------- routing ---------- */
const NAV = [['dashboard', 'Dashboard', 'grid'], ['books', 'Books', 'book'], ['members', 'Members', 'users'],
  ['borrowing', 'Borrowing', 'repeat'], ['reservations', 'Reservations', 'bookmark'], ['payments', 'Payments', 'wallet'], ['settings', 'Settings', 'gear']];
function parseHash() {
  const [name = 'dashboard', arg = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: NAV.some(n => n[0] === name) ? name : 'dashboard', arg };
}
function render() {
  const { name, arg } = parseHash();
  const ae = document.activeElement, keep = ae && ae.id, pos = ae && ae.selectionStart;
  $('nav').innerHTML = NAV.map(([k, label, ic]) => `<a class="navlink ${k === name ? 'active' : ''}" href="#/${k}">${ICON[ic]} ${label}</a>`).join('');
  let html, title = NAV.find(n => n[0] === name)[1], crumb = 'Smart Library / ' + title;
  const member = name === 'members' && arg ? memberOf(arg) : null;
  if (member) { html = vMember(member); title = 'Member Details'; crumb = `Smart Library / Members / ${member.name}`; }
  else html = ({ dashboard: vDashboard, books: vBooks, members: vMembers, borrowing: vBorrowing, reservations: vReservations, payments: vPayments, settings: vSettings })[name]();
  $('title').textContent = title; $('crumb').textContent = crumb; $('view').innerHTML = html;
  if (keep && $(keep) && $(keep).tagName === 'INPUT') { $(keep).focus(); try { $(keep).setSelectionRange(pos, pos); } catch (e) { } }
  $('side').classList.remove('open'); $('scrim').classList.remove('open');
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

/* ---------- views: dashboard ---------- */
function vDashboard() {
  const active = S.loans.filter(l => !l.returned_at), overdue = active.filter(l => l.due_at < todayStr());
  const unpaid = S.payments.filter(p => p.status === 'Unpaid').reduce((s, p) => s + Number(p.amount), 0);
  const stat = (ic, lbl, num, sub = '', cls = '') => `<div class="card stat ${cls}"><div class="ico">${ICON[ic]}</div><div><div class="lbl">${lbl}</div><div class="num">${num}<small>${sub}</small></div></div></div>`;
  const recent = [...S.loans].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6);
  const pend = S.reservations.filter(r => r.status === 'Pending').slice(0, 5);
  return `<div class="stats">
      ${stat('book', 'Total books', S.books.length)}
      ${stat('users', 'Members', S.members.length)}
      ${stat('repeat', 'Borrowed now', active.length)}
      ${stat('alert', 'Overdue', overdue.length, '', overdue.length ? 'warn' : '')}
      ${stat('wallet', 'Unpaid fines', money(unpaid))}
    </div>
    <div class="g2">
      <div class="card dc"><h3>Borrowing Trend ${monthSelect('trendAll', UI.trendAll)}</h3>${chart(S.loans, lastMonths(UI.trendAll))}</div>
      <div class="card dc"><h3>Overdue Books</h3><div class="list">${overdue.length ? overdue.slice(0, 5).map(l => `
        <div class="item">${cover(bookTitle(l.book_id))}<div class="grow"><div class="t">${esc(bookTitle(l.book_id))}</div>
        <div class="s">${esc((memberOf(l.member_id) || {}).name || '-')} · ${daysBetween(l.due_at, todayStr())} days late</div></div>
        <span class="amt">${money(accrued(l))}</span></div>`).join('') : '<div class="none">Nothing is overdue.</div>'}</div></div>
    </div>
    <div class="g2">
      <div class="card dc"><h3>Recent Borrowing</h3>${loansTable(recent, false)}</div>
      <div class="card dc"><h3>Pending Reservations</h3><div class="list">${pend.length ? pend.map(r => `
        <div class="item">${cover(bookTitle(r.book_id))}<div class="grow"><div class="t">${esc(bookTitle(r.book_id))}</div>
        <div class="s">${esc((memberOf(r.member_id) || {}).name || '-')}</div></div>${badge(r.status)}</div>`).join('') : '<div class="none">No reservations waiting.</div>'}</div></div>
    </div>`;
}

/* ---------- views: books ---------- */
function booksList() {
  const q = UI.bookQ.trim().toLowerCase();
  const list = S.books.filter(b => !q || [b.name, b.serial, b.author, b.category].some(x => (x || '').toLowerCase().includes(q)));
  return `<div class="tbl"><table><thead><tr><th>Serial</th><th>Book</th><th>Category</th><th>Rack</th><th>Deck</th><th>Side</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.length ? list.map(b => `<tr><td><span class="tag">${esc(b.serial)}</span></td>
      <td><span class="t">${esc(b.name)}</span>${b.author ? `<span class="s">${esc(b.author)}</span>` : ''}</td>
      <td>${esc(b.category || '-')}</td><td>${esc(b.rack)}</td><td>${esc(b.deck)}</td><td>${esc(b.direction)}</td>
      <td>${badge(isOut(b) ? 'Borrowed' : 'Available')}</td>
      <td class="r"><button class="iconbtn sm" data-act="delBook" data-id="${b.id}" title="Delete book">${ICON.trash}</button></td></tr>`).join('')
      : '<tr><td colspan="8" class="empty-row">No books found.</td></tr>'}</tbody></table></div>`;
}
function vBooks() {
  return `<div class="toolbar">
    <div class="searchfield">${ICON.search}<input id="bookQ" data-in="bookQ" placeholder="Search by name or serial number" value="${esc(UI.bookQ)}"></div>
    <div class="grow"></div>
    <form class="inline" data-form="delSerial"><input id="delSerial" name="serial" placeholder="Serial to delete" required><button class="btn danger" type="submit">Delete</button></form>
    <button class="btn" data-act="addBook">${ICON.plus} Add Book</button></div>
    <div class="card dc"><div id="booksList">${booksList()}</div></div>`;
}

/* ---------- views: members ---------- */
function membersList() {
  const q = UI.memberQ.trim().toLowerCase();
  const list = S.members.filter(m => !q || [m.name, m.member_code, m.email, m.phone].some(x => (x || '').toLowerCase().includes(q)));
  return `<div class="tbl"><table><thead><tr><th>Member</th><th>Contact</th><th>Borrowed</th><th>Overdue</th><th>Status</th></tr></thead><tbody>
    ${list.length ? list.map(m => {
      const a = S.loans.filter(l => l.member_id === m.id && !l.returned_at);
      return `<tr class="click" data-act="openMember" data-id="${m.id}"><td><div class="who-cell">${avatar(m.name, 'sm')}<div><span class="t">${esc(m.name)}</span><span class="s">${esc(m.member_code)}</span></div></div></td>
      <td>${esc(m.email || '-')}<span class="s">${esc(m.phone || '')}</span></td><td>${a.length}</td>
      <td>${a.filter(l => l.due_at < todayStr()).length}</td><td>${badge(m.status)}</td></tr>`;
    }).join('') : '<tr><td colspan="5" class="empty-row">No members yet. Add one to get started.</td></tr>'}</tbody></table></div>`;
}
function vMembers() {
  return `<div class="toolbar">
    <div class="searchfield">${ICON.search}<input id="memberQ" data-in="memberQ" placeholder="Search by name, code, email or phone" value="${esc(UI.memberQ)}"></div>
    <div class="grow"></div><button class="btn" data-act="addMember">${ICON.plus} Add Member</button></div>
    <div class="card dc"><div id="membersList">${membersList()}</div></div>`;
}

/* ---------- views: member details (the screenshot page) ---------- */
function vMember(m) {
  const loans = S.loans.filter(l => l.member_id === m.id).sort((a, b) => b.borrowed_at.localeCompare(a.borrowed_at));
  const active = loans.filter(l => !l.returned_at), overdue = active.filter(l => l.due_at < todayStr());
  const returned = loans.filter(l => l.returned_at);
  const pays = S.payments.filter(p => p.member_id === m.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const res = S.reservations.filter(r => r.member_id === m.id).sort((a, b) => b.reserved_at.localeCompare(a.reserved_at));
  const cats = {}; loans.forEach(l => { const c = (bookOf(l.book_id) || {}).category; if (c) cats[c] = (cats[c] || 0) + 1; });
  const fav = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const avg = returned.length ? Math.round(returned.reduce((s, l) => s + daysBetween(l.borrowed_at, l.returned_at), 0) / returned.length) : null;
  const onTime = returned.length ? Math.round(returned.filter(l => l.returned_at <= l.due_at).length / returned.length * 100) : null;
  const fines = pays.filter(p => p.kind === 'Fine');
  const owed = fines.filter(p => p.status === 'Unpaid').reduce((s, p) => s + Number(p.amount), 0) + overdue.reduce((s, l) => s + accrued(l), 0);

  const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
  const crow = (ic, label, v) => `<div class="row"><div class="ico">${ICON[ic]}</div><div><small>${label}</small>${esc(v || 'Not provided')}</div></div>`;
  const tile = (ic, v, label) => `<div class="tile2"><div class="ico">${ICON[ic]}</div><b>${esc(v)}</b><small>${label}</small></div>`;

  return `<div class="detail">
    <div class="card dc profile a-pr"><h3>Profile</h3>${avatar(m.name, 'xl')}<h2>${esc(m.name)}</h2><div class="code">${esc(m.member_code)}</div>${badge(m.status)}
      <div class="kvs">${kv('Joined', fmtDate(m.joined_at))}${kv('Books borrowed', loans.length)}${kv('Returned', returned.length)}${kv('Fines owed', money(owed))}</div>
      <div class="btns"><button class="btn" data-act="issueTo" data-id="${m.id}">Issue a book</button>
        <button class="btn outline" data-act="editMember" data-id="${m.id}">Edit details</button>
        <button class="btn outline" data-act="toggleSuspend" data-id="${m.id}">${m.status === 'Active' ? 'Suspend member' : 'Reactivate member'}</button>
        <button class="btn outline" data-act="delMember" data-id="${m.id}">Delete member</button></div></div>
    <div class="card dc bigstat a-sa"><div class="lbl sub">Currently borrowed</div><div class="num">${active.length}<small> books</small></div></div>
    <div class="card dc bigstat warn a-sb"><div class="lbl sub">Overdue</div><div class="num">${overdue.length}<small> books</small></div></div>
    <div class="card dc a-tr"><h3>Borrowing Trend ${monthSelect('trendMember', UI.trendMember)}</h3>${chart(loans, lastMonths(UI.trendMember))}</div>
    <div class="card dc a-rs"><h3>Reservations</h3><div class="list">${res.length ? res.slice(0, 5).map(r => `<div class="item">${cover(bookTitle(r.book_id))}
      <div class="grow"><div class="t">${esc(bookTitle(r.book_id))}</div><div class="s">${esc((bookOf(r.book_id) || {}).author || '')} · ${fmtDate(tsDate(r.reserved_at))}</div></div>${badge(r.status)}</div>`).join('') : '<div class="none">No reservations.</div>'}</div></div>
    <div class="card dc contact a-ct"><h3>Contact Info</h3>${crow('mail', 'Email', m.email)}${crow('phone', 'Phone', m.phone)}${crow('pin', 'Address', m.address)}</div>
    <div class="card dc a-in"><h3>Insights</h3><div class="insights">
      ${tile('star', fav ? fav[0] : '-', 'Favourite category')}${tile('clock', avg === null ? '-' : avg + ' days', 'Average time kept')}
      ${tile('check', onTime === null ? '-' : onTime + '%', 'Returned on time')}${tile('book', loans.length, 'Books borrowed in total')}</div></div>
    <div class="card dc a-pm"><h3>Payment History</h3><div class="list">${pays.length ? pays.slice(0, 5).map(p => `<div class="item"><div class="grow"><div class="t">${esc(p.kind)}${p.note ? ' · ' + esc(p.note) : ''}</div>
      <div class="s">${fmtDate(tsDate(p.created_at))}</div></div><span class="amt">${money(p.amount)}</span>${badge(p.status)}</div>`).join('') : '<div class="none">No payments yet.</div>'}</div></div>
    <div class="card dc a-bk"><h3>Borrowed Books</h3>${loansTable(loans, false, true)}</div>
    <div class="card dc a-fi"><h3>Fines Info <span class="sub">Owed: ${money(owed)}</span></h3><div class="list">${(fines.length || overdue.length) ? [
      ...overdue.map(l => `<div class="item">${cover(bookTitle(l.book_id))}<div class="grow"><div class="t">${esc(bookTitle(l.book_id))}</div><div class="s">${daysBetween(l.due_at, todayStr())} days late · still accruing</div></div><span class="amt">${money(accrued(l))}</span>${badge('Overdue')}</div>`),
      ...fines.slice(0, 5).map(p => `<div class="item">${cover(p.loan_id ? bookTitle((S.loans.find(l => l.id === p.loan_id) || {}).book_id) : 'Fine')}<div class="grow"><div class="t">${p.loan_id ? esc(bookTitle((S.loans.find(l => l.id === p.loan_id) || {}).book_id)) : 'Fine'}</div><div class="s">${esc(p.note || '')}</div></div><span class="amt">${money(p.amount)}</span>${badge(p.status)}</div>`)
    ].join('') : '<div class="none">No fines. 🎉</div>'}</div></div>
  </div>`;
}

/* ---------- shared loans table ---------- */
function loansTable(list, showMember = true, forMember = false) {
  const fineOf = l => l.returned_at ? S.payments.filter(p => p.loan_id === l.id && p.kind === 'Fine').reduce((s, p) => s + Number(p.amount), 0) : accrued(l);
  const withMember = showMember && !forMember;
  return `<div class="tbl"><table><thead><tr><th>Book</th>${withMember ? '<th>Member</th>' : ''}<th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th><th>Fine</th><th></th></tr></thead><tbody>
    ${list.length ? list.map(l => { const st = loanStatus(l), f = fineOf(l); return `<tr>
      <td><div class="who-cell">${cover(bookTitle(l.book_id))}<div><span class="t">${esc(bookTitle(l.book_id))}</span><span class="s">${esc((bookOf(l.book_id) || {}).serial || '')}</span></div></div></td>
      ${withMember ? `<td>${esc((memberOf(l.member_id) || {}).name || '-')}</td>` : ''}
      <td>${fmtDate(l.borrowed_at)}</td><td>${fmtDate(l.due_at)}</td><td>${fmtDate(l.returned_at)}</td><td>${badge(st)}</td><td>${f ? money(f) : '-'}</td>
      <td class="r">${l.returned_at ? '' : `<button class="btn sm" data-act="returnLoan" data-id="${l.id}">Return</button>`}</td></tr>`; }).join('')
      : `<tr><td colspan="${withMember ? 8 : 7}" class="empty-row">No borrowing records yet.</td></tr>`}</tbody></table></div>`;
}

/* ---------- views: borrowing ---------- */
function loansList() {
  const q = UI.loanQ.trim().toLowerCase();
  const list = S.loans.filter(l => {
    const st = loanStatus(l);
    if (UI.loanF === 'active' && l.returned_at) return false;
    if (UI.loanF === 'overdue' && st !== 'Overdue') return false;
    if (UI.loanF === 'returned' && !l.returned_at) return false;
    return !q || bookTitle(l.book_id).toLowerCase().includes(q) || ((memberOf(l.member_id) || {}).name || '').toLowerCase().includes(q) || ((bookOf(l.book_id) || {}).serial || '').toLowerCase().includes(q);
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return loansTable(list);
}
function vBorrowing() {
  const chip = (k, t) => `<button class="chip ${UI.loanF === k ? 'on' : ''}" data-act="loanF" data-k="${k}">${t}</button>`;
  return `<div class="card dc" style="margin-bottom:16px"><h3>Issue a book</h3>${issueForm()}</div>
    <div class="toolbar"><div class="searchfield">${ICON.search}<input id="loanQ" data-in="loanQ" placeholder="Search book, serial or member" value="${esc(UI.loanQ)}"></div>
    <div class="chips">${chip('all', 'All')}${chip('active', 'Borrowed')}${chip('overdue', 'Overdue')}${chip('returned', 'Returned')}</div></div>
    <div class="card dc"><div id="loansList">${loansList()}</div></div>`;
}
function issueForm(memberId = '') {
  const members = S.members.filter(m => m.status === 'Active'), books = S.books.filter(b => !isOut(b));
  if (!members.length || !books.length) return `<div class="none">${!members.length ? 'Add a member first.' : 'Every book is currently borrowed.'}</div>`;
  return `<form data-form="issue"><div class="grid2">
    <div class="field"><label>Member</label><select name="member" required>${opts(members, m => `${m.name} (${m.member_code})`, memberId)}</select></div>
    <div class="field"><label>Book (available only)</label><select name="book" required>${opts(books, b => `${b.serial} — ${b.name}`)}</select></div>
    <div class="field"><label>Days to keep</label><input name="days" type="number" min="1" max="120" value="${loanDays()}" required></div></div>
    <div class="mfoot" style="justify-content:flex-start"><button class="btn" type="submit">Issue book</button></div></form>`;
}

/* ---------- views: reservations ---------- */
function vReservations() {
  const members = S.members.filter(m => m.status === 'Active');
  const list = [...S.reservations].sort((a, b) => b.reserved_at.localeCompare(a.reserved_at));
  return `<div class="card dc" style="margin-bottom:16px"><h3>New reservation</h3>${(!members.length || !S.books.length) ? '<div class="none">Add at least one member and one book first.</div>' : `
    <form data-form="reserve"><div class="grid2"><div class="field"><label>Member</label><select name="member" required>${opts(members, m => `${m.name} (${m.member_code})`)}</select></div>
    <div class="field"><label>Book</label><select name="book" required>${opts(S.books, b => `${b.serial} — ${b.name}${isOut(b) ? ' (borrowed)' : ''}`)}</select></div></div>
    <button class="btn" type="submit">Reserve</button></form>`}</div>
    <div class="card dc"><div class="tbl"><table><thead><tr><th>Book</th><th>Member</th><th>Reserved on</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.length ? list.map(r => { const b = bookOf(r.book_id), free = b && !isOut(b); return `<tr>
      <td><div class="who-cell">${cover(bookTitle(r.book_id))}<div><span class="t">${esc(bookTitle(r.book_id))}</span><span class="s">${esc((b || {}).serial || '')}</span></div></div></td>
      <td>${esc((memberOf(r.member_id) || {}).name || '-')}</td><td>${fmtDate(tsDate(r.reserved_at))}</td><td>${badge(r.status)}</td>
      <td class="r">${r.status === 'Pending' ? `${free ? `<button class="btn sm" data-act="issueRes" data-id="${r.id}">Issue now</button> ` : '<span class="sub">Waiting for return</span> '}<button class="btn sm outline" data-act="cancelRes" data-id="${r.id}">Cancel</button>` : ''}</td></tr>`; }).join('')
      : '<tr><td colspan="5" class="empty-row">No reservations yet.</td></tr>'}</tbody></table></div></div>`;
}

/* ---------- views: payments ---------- */
function paymentsList() {
  const list = S.payments.filter(p => UI.payF === 'all' || p.status.toLowerCase() === UI.payF).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return `<div class="tbl"><table><thead><tr><th>Date</th><th>Member</th><th>Type</th><th>Details</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.length ? list.map(p => `<tr><td>${fmtDate(tsDate(p.created_at))}</td><td>${esc((memberOf(p.member_id) || {}).name || '-')}</td><td>${esc(p.kind)}</td>
      <td>${esc(p.note || '')}${p.loan_id ? `<span class="s">${esc(bookTitle((S.loans.find(l => l.id === p.loan_id) || {}).book_id))}</span>` : ''}</td>
      <td><b>${money(p.amount)}</b></td><td>${badge(p.status)}</td>
      <td class="r"><button class="btn sm ${p.status === 'Paid' ? 'outline' : ''}" data-act="togglePaid" data-id="${p.id}">${p.status === 'Paid' ? 'Mark unpaid' : 'Mark paid'}</button></td></tr>`).join('')
      : '<tr><td colspan="7" class="empty-row">No payments found.</td></tr>'}</tbody></table></div>`;
}
function vPayments() {
  const sum = st => S.payments.filter(p => p.status === st).reduce((s, p) => s + Number(p.amount), 0);
  const accruing = S.loans.reduce((s, l) => s + accrued(l), 0);
  const chip = (k, t) => `<button class="chip ${UI.payF === k ? 'on' : ''}" data-act="payF" data-k="${k}">${t}</button>`;
  return `<div class="stats">
    <div class="card stat"><div class="ico">${ICON.check}</div><div><div class="lbl">Collected</div><div class="num">${money(sum('Paid'))}</div></div></div>
    <div class="card stat warn"><div class="ico">${ICON.wallet}</div><div><div class="lbl">Unpaid</div><div class="num">${money(sum('Unpaid'))}</div></div></div>
    <div class="card stat"><div class="ico">${ICON.clock}</div><div><div class="lbl">Fines still accruing</div><div class="num">${money(accruing)}</div></div></div></div>
    <div class="toolbar"><div class="chips">${chip('all', 'All')}${chip('unpaid', 'Unpaid')}${chip('paid', 'Paid')}</div><div class="grow"></div>
    <button class="btn" data-act="addPayment">${ICON.plus} Add payment</button></div>
    <div class="card dc"><div id="payList">${paymentsList()}</div></div>`;
}

/* ---------- views: settings ---------- */
function vSettings() {
  const demo = S.books.some(b => b.serial.startsWith('DEMO-')) || S.members.some(m => m.member_code.startsWith('DEMO-'));
  return `<div class="settings-grid">
    <div class="card dc"><h3>Library rules</h3><form data-form="settings">
      <div class="field"><label>Library name</label><input name="library_name" value="${esc(S.settings.library_name || 'Smart Library')}" required></div>
      <div class="field"><label>Default loan period (days)</label><input name="loan_days" type="number" min="1" max="120" value="${loanDays()}" required></div>
      <div class="field"><label>Fine per late day (₹)</label><input name="fine_per_day" type="number" min="0" step="0.5" value="${fineRate()}" required></div>
      <button class="btn" type="submit">Save settings</button></form></div>
    <div class="card dc"><h3>Sample data</h3><p class="hint">Fill the dashboard with example books, members and borrowing history for a demo. Sample items are labelled DEMO and can be removed in one click; your own books and members are never touched.</p>
      ${demo ? '<button class="btn outline" data-act="removeDemo">Remove sample data</button>' : '<button class="btn" data-act="seedDemo">Load sample data</button>'}</div></div>`;
}

/* ---------- global search ---------- */
function globalSearch(v) {
  const q = v.trim().toLowerCase(), box = $('gres');
  if (!q) return box.classList.add('hidden');
  const m = S.members.filter(x => x.name.toLowerCase().includes(q) || x.member_code.toLowerCase().includes(q)).slice(0, 4);
  const b = S.books.filter(x => x.name.toLowerCase().includes(q) || x.serial.toLowerCase().includes(q)).slice(0, 4);
  box.innerHTML = (m.length || b.length) ? m.map(x => `<button data-act="gMember" data-id="${x.id}">${avatar(x.name, 'sm')}<span>${esc(x.name)}<small>Member · ${esc(x.member_code)}</small></span></button>`).join('')
    + b.map(x => `<button data-act="gBook" data-q="${esc(x.serial)}">${cover(x.name)}<span>${esc(x.name)}<small>Book · ${esc(x.serial)}</small></span></button>`).join('') : '<div class="none">No matches.</div>';
  box.classList.remove('hidden');
}

/* ---------- actions (buttons) ---------- */
const memberForm = (m = {}) => `<form data-form="${m.id ? 'editMember' : 'addMember'}" ${m.id ? `data-id="${m.id}"` : ''}>
  <div class="field"><label>Full name</label><input name="name" value="${esc(m.name || '')}" required></div>
  <div class="grid2"><div class="field"><label>Email</label><input name="email" type="email" value="${esc(m.email || '')}"></div>
  <div class="field"><label>Phone</label><input name="phone" value="${esc(m.phone || '')}"></div></div>
  <div class="field"><label>Address</label><input name="address" value="${esc(m.address || '')}"></div>
  <div class="mfoot"><button class="btn outline" type="button" data-act="closeModal">Cancel</button><button class="btn" type="submit">${m.id ? 'Save changes' : 'Add member'}</button></div></form>`;

const ACT = {
  closeModal,
  addBook: () => openModal('Add New Book', `<form data-form="addBook"><div class="grid2">
    <div class="field"><label>Book name</label><input name="name" required></div><div class="field"><label>Serial number</label><input name="serial" required></div>
    <div class="field"><label>Author</label><input name="author"></div><div class="field"><label>Category</label><input name="category" placeholder="e.g. Fiction"></div>
    <div class="field"><label>Rack</label><input name="rack" placeholder="e.g. 3 or A" required></div><div class="field"><label>Shelf (Deck)</label><input name="deck" placeholder="e.g. 2" required></div>
    <div class="field"><label>Direction</label><select name="direction"><option>Left</option><option>Right</option></select></div></div>
    <div class="mfoot"><button class="btn outline" type="button" data-act="closeModal">Cancel</button><button class="btn" type="submit">Save book</button></div></form>`),
  delBook: async d => {
    const b = bookOf(d.id); if (!b) return;
    if (!confirm(`Delete "${b.name}" (${b.serial})?${isOut(b) ? '\n\nThis book is currently borrowed. Its borrowing history will be removed too.' : ''}\n\nIt will disappear from every device.`)) return;
    await run(async () => { ok(await sb.from('books').delete().eq('id', b.id)); toast('Book deleted'); await refresh(); });
  },
  addMember: () => openModal('Add Member', memberForm()),
  editMember: d => openModal('Edit Member', memberForm(memberOf(d.id))),
  openMember: d => { location.hash = '#/members/' + d.id; },
  toggleSuspend: d => run(async () => {
    const m = memberOf(d.id); const status = m.status === 'Active' ? 'Suspended' : 'Active';
    ok(await sb.from('members').update({ status }).eq('id', m.id)); toast(`${m.name} is now ${status.toLowerCase()}`); await refresh();
  }),
  delMember: async d => {
    const m = memberOf(d.id);
    if (!confirm(`Delete ${m.name}? Their borrowing history, reservations and payments will be deleted too.`)) return;
    await run(async () => { ok(await sb.from('members').delete().eq('id', m.id)); location.hash = '#/members'; toast('Member deleted'); await refresh(); });
  },
  issueTo: d => openModal('Issue a book', issueForm(d.id)),
  loanF: d => { UI.loanF = d.k; render(); },
  payF: d => { UI.payF = d.k; render(); },
  returnLoan: d => run(async () => {
    const fine = Number(ok(await sb.rpc('return_book', { p_loan: d.id })) || 0);
    toast(fine > 0 ? `Returned. A late fine of ${money(fine)} was added.` : 'Returned on time. Thank you!'); await refresh();
  }),
  issueRes: d => run(async () => {
    const r = S.reservations.find(x => x.id === d.id);
    ok(await sb.rpc('issue_book', { p_book: r.book_id, p_member: r.member_id, p_days: loanDays() })); toast('Book issued from reservation'); await refresh();
  }),
  cancelRes: d => run(async () => { ok(await sb.from('reservations').update({ status: 'Cancelled' }).eq('id', d.id)); toast('Reservation cancelled'); await refresh(); }),
  togglePaid: d => run(async () => {
    const p = S.payments.find(x => x.id === d.id), paid = p.status !== 'Paid';
    ok(await sb.from('payments').update({ status: paid ? 'Paid' : 'Unpaid', paid_at: paid ? new Date().toISOString() : null }).eq('id', p.id)); await refresh();
  }),
  addPayment: () => openModal('Add payment', `<form data-form="addPayment"><div class="grid2">
    <div class="field"><label>Member</label><select name="member" required>${opts(S.members, m => `${m.name} (${m.member_code})`)}</select></div>
    <div class="field"><label>Type</label><select name="kind"><option>Fine</option><option>Membership</option><option>Other</option></select></div>
    <div class="field"><label>Amount (₹)</label><input name="amount" type="number" min="0" step="0.5" required></div>
    <div class="field"><label>Status</label><select name="status"><option>Paid</option><option>Unpaid</option></select></div></div>
    <div class="field"><label>Note</label><input name="note" placeholder="Optional"></div>
    <div class="mfoot"><button class="btn outline" type="button" data-act="closeModal">Cancel</button><button class="btn" type="submit">Save payment</button></div></form>`),
  gMember: d => { $('gres').classList.add('hidden'); $('gq').value = ''; location.hash = '#/members/' + d.id; },
  gBook: d => { $('gres').classList.add('hidden'); $('gq').value = ''; UI.bookQ = d.q; location.hash = '#/books'; render(); },
  seedDemo: () => seedDemo(),
  removeDemo: () => removeDemo()
};

const IN = {
  gq: v => globalSearch(v),
  bookQ: v => { UI.bookQ = v; $('booksList').innerHTML = booksList(); },
  memberQ: v => { UI.memberQ = v; $('membersList').innerHTML = membersList(); },
  loanQ: v => { UI.loanQ = v; $('loansList').innerHTML = loansList(); }
};
const CH = { trendAll: v => { UI.trendAll = +v; render(); }, trendMember: v => { UI.trendMember = +v; render(); } };

/* ---------- forms ---------- */
const FORM = {
  addBook: f => run(async () => {
    const d = formData(f);
    const r = await sb.from('books').insert({ name: d.name.trim(), serial: d.serial.trim(), author: nul(d.author), category: nul(d.category), rack: d.rack.trim(), deck: d.deck.trim(), direction: d.direction });
    if (r.error) throw r.error.code === '23505' ? new Error('That serial number already exists.') : r.error;
    closeModal(); toast(`“${d.name.trim()}” added`); await refresh();
  }, f),
  delSerial: f => run(async () => {
    const s = formData(f).serial || $('delSerial').value, b = S.books.find(x => x.serial.toLowerCase() === s.trim().toLowerCase());
    if (!b) throw new Error('No book with that serial number.');
    if (!confirm(`Delete "${b.name}" (${b.serial}) from every device?`)) return;
    ok(await sb.from('books').delete().eq('id', b.id)); f.reset(); toast('Book deleted'); await refresh();
  }, f),
  addMember: f => run(async () => {
    const d = formData(f);
    ok(await sb.from('members').insert({ name: d.name.trim(), email: nul(d.email), phone: nul(d.phone), address: nul(d.address) }));
    closeModal(); toast('Member added'); await refresh();
  }, f),
  editMember: f => run(async () => {
    const d = formData(f);
    ok(await sb.from('members').update({ name: d.name.trim(), email: nul(d.email), phone: nul(d.phone), address: nul(d.address) }).eq('id', f.dataset.id));
    closeModal(); toast('Member updated'); await refresh();
  }, f),
  issue: f => run(async () => {
    const d = formData(f);
    ok(await sb.rpc('issue_book', { p_book: d.book, p_member: d.member, p_days: +d.days }));
    closeModal(); toast('Book issued'); await refresh();
  }, f),
  reserve: f => run(async () => {
    const d = formData(f);
    if (S.reservations.some(r => r.book_id === d.book && r.member_id === d.member && r.status === 'Pending')) throw new Error('This member already has a pending reservation for that book.');
    ok(await sb.from('reservations').insert({ book_id: d.book, member_id: d.member })); toast('Reservation saved'); await refresh();
  }, f),
  addPayment: f => run(async () => {
    const d = formData(f);
    ok(await sb.from('payments').insert({ member_id: d.member, kind: d.kind, amount: +d.amount, status: d.status, note: nul(d.note), paid_at: d.status === 'Paid' ? new Date().toISOString() : null }));
    closeModal(); toast('Payment saved'); await refresh();
  }, f),
  settings: f => run(async () => {
    const d = formData(f);
    ok(await sb.from('settings').upsert(['library_name', 'loan_days', 'fine_per_day'].map(k => ({ key: k, value: String(d[k]).trim() })))); toast('Settings saved'); await refresh();
  }, f)
};

/* ---------- event wiring (one listener for each kind) ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'modal') return closeModal();
  const el = e.target.closest('[data-act]');
  if (el) { const fn = ACT[el.dataset.act]; if (fn) fn(el.dataset, el); }
  if (!e.target.closest('.gsearch')) $('gres').classList.add('hidden');
});
document.addEventListener('input', e => { const el = e.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el.value); });
document.addEventListener('change', e => { const el = e.target.closest('[data-ch]'); if (el && CH[el.dataset.ch]) CH[el.dataset.ch](el.value); });
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (f) { e.preventDefault(); FORM[f.dataset.form](f); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------- sample data ---------- */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
async function seedDemo() {
  if (S.books.some(b => b.serial.startsWith('DEMO-')) || S.members.some(m => m.member_code.startsWith('DEMO-'))) return toast('Sample data is already loaded.', false);
  if (!confirm('Add sample books, members and borrowing history?\nYour own data stays untouched.')) return;
  await run(async () => {
    const t = todayStr(), r = rng(7), rate = fineRate(), days = loanDays();
    const B = [['The Alchemist', 'Paulo Coelho', 'Fiction'], ['Wings of Fire', 'A. P. J. Abdul Kalam', 'Biography'], ['Malgudi Days', 'R. K. Narayan', 'Fiction'],
      ['A Brief History of Time', 'Stephen Hawking', 'Science'], ['The Discovery of India', 'Jawaharlal Nehru', 'History'], ['Ignited Minds', 'A. P. J. Abdul Kalam', 'Biography'],
      ['Gitanjali', 'Rabindranath Tagore', 'Poetry'], ['Atomic Habits', 'James Clear', 'Self-help'], ['The Diary of a Young Girl', 'Anne Frank', 'Biography'], ["Harry Potter and the Sorcerer's Stone", 'J. K. Rowling', 'Fiction']]
      .map((b, i) => ({ id: uuid(), serial: 'DEMO-' + (101 + i), name: b[0], author: b[1], category: b[2], rack: 'ABCDE'[i >> 1], deck: String(i % 2 + 1), direction: i % 2 ? 'Right' : 'Left' }));
    const M = [['Aarav Sharma', 'aarav.sharma@example.com', '+91 90000 00001', '12 Lake View Road, Pune'], ['Diya Patel', 'diya.patel@example.com', '+91 90000 00002', '45 Green Park, Ahmedabad'],
      ['Rohan Mehta', 'rohan.mehta@example.com', '+91 90000 00003', '7 Station Road, Mumbai'], ['Ananya Iyer', 'ananya.iyer@example.com', '+91 90000 00004', '23 Temple Street, Chennai'],
      ['Kabir Singh', 'kabir.singh@example.com', '+91 90000 00005', '88 Model Town, Delhi']]
      .map((m, i) => ({ id: uuid(), member_code: 'DEMO-M' + (i + 1), name: m[0], email: m[1], phone: m[2], address: m[3], joined_at: addDaysStr(t, -200 + i * 9) }));
    const loans = [], pays = [];
    const mk = (mem, book, ago, ret) => {                      // ago = days since borrowed; ret = days kept (null = still out)
      const borrowed = addDaysStr(t, -ago), due = addDaysStr(borrowed, days);
      const l = { id: uuid(), book_id: book.id, member_id: mem.id, borrowed_at: borrowed, due_at: due, returned_at: ret === null ? null : (addDaysStr(borrowed, ret) > t ? t : addDaysStr(borrowed, ret)), created_at: borrowed + 'T09:00:00+05:30' };
      loans.push(l);
      if (l.returned_at && l.returned_at > due) {
        const late = daysBetween(due, l.returned_at), paid = r() < .7;
        pays.push({ id: uuid(), member_id: mem.id, loan_id: l.id, amount: late * rate, kind: 'Fine', status: paid ? 'Paid' : 'Unpaid', note: late + ' day(s) late', created_at: l.returned_at + 'T12:00:00+05:30', paid_at: paid ? l.returned_at + 'T13:00:00+05:30' : null });
      }
    };
    M.forEach(mem => { for (let k = 0; k < 7; k++) { const ago = 20 + k * 24 + Math.floor(r() * 10); mk(mem, B[Math.floor(r() * B.length)], ago, r() < .3 ? days + 1 + Math.floor(r() * 8) : days - Math.floor(r() * 6)); } });
    mk(M[0], B[0], 5, null); mk(M[0], B[5], days + 4, null); mk(M[1], B[1], days + 6, null); mk(M[2], B[2], 8, null); mk(M[3], B[3], days + 11, null); mk(M[4], B[4], 2, null);
    const res = [[M[2], B[1], 'Pending'], [M[3], B[0], 'Pending'], [M[4], B[6], 'Pending'], [M[0], B[7], 'Fulfilled'], [M[1], B[8], 'Cancelled']]
      .map(x => ({ id: uuid(), member_id: x[0].id, book_id: x[1].id, status: x[2], reserved_at: addDaysStr(t, -3) + 'T10:00:00+05:30' }));
    ok(await sb.from('books').insert(B)); ok(await sb.from('members').insert(M)); ok(await sb.from('loans').insert(loans));
    ok(await sb.from('reservations').insert(res)); ok(await sb.from('payments').insert(pays));
    toast('Sample data loaded'); await refresh();
  });
}
async function removeDemo() {
  if (!confirm('Remove all sample books, members and their records?\nYour own data stays untouched.')) return;
  await run(async () => {
    ok(await sb.from('members').delete().ilike('member_code', 'DEMO-%'));
    ok(await sb.from('books').delete().ilike('serial', 'DEMO-%'));
    toast('Sample data removed'); await refresh();
  });
}

/* ---------- start ---------- */
(async function init() {
  $('logo').innerHTML = ICON.book; $('logoutIcon').innerHTML = ICON.logout; $('gIcon').innerHTML = ICON.search; $('menu').innerHTML = ICON.menu;
  if (!(await isAdmin())) return location.replace('index.html');
  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') location.replace('index.html'); });
  $('logout').onclick = async () => { await logout(); location.replace('index.html'); };
  $('menu').onclick = () => { $('side').classList.add('open'); $('scrim').classList.add('open'); };
  $('scrim').onclick = () => { $('side').classList.remove('open'); $('scrim').classList.remove('open'); };
  await refresh(); startLive();
})();
