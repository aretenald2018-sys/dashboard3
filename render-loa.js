// ================================================================
// render-loa.js — 로스트아크 숙제 탭 (전체 캐릭터 매트릭스 뷰)
// ================================================================

import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs }
  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { CONFIG } from './config.js';

const db = (() => {
  const apps = getApps();
  const app  = apps.length ? apps[0] : initializeApp(CONFIG.FIREBASE);
  return getFirestore(app);
})();

const LOA_BASE = 'https://developer-lostark.game.onstove.com';
const LOA_KEY  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDA1OTA2NzMifQ.Po65Uke3Xo9jIun7gynp8NXpfIxznOFbq8C6KVwpGbfmpIEV7gVsNdFvE2azFw6hFmfZT4rKhNpEMHJqrFlqRbmAX7dtZQN3PFjp-MT46yheRw86bFQJru_ob-SSE3yYilTLY1BkhRGfBq2oTsCFXE0wXMm6KcD3Vy0k1g4UHmILgIoYl_nsNf0PzcXJU7Q_GKRDusVgUdb9nF_098H8Fs-MoZuYpCpV5q-qew_tNi4ro-RDuWE92fsNSHisAa7gq4Lk0HAUlUcHz6JzkCLtFVNBdiMDAPUzV3RsOA_RcwDvJYOMlx5pF0k_JnUHKRG9mjpMKzfySNdvNfFiiLdQbA';

const DAILY_TASKS = [
  { id:'chaos',    name:'카오스던전', count:2, minLevel:0 },
  { id:'guardian', name:'가디언토벌', count:1, minLevel:0 },
  { id:'epona',    name:'에포나의뢰', count:3, minLevel:0 },
];

const WEEKLY_TASKS = [
  { id:'w_kazeros',   name:'카제로스 레이드',  minLevel:1680 },
  { id:'w_mordum',    name:'모르둠',           minLevel:1680 },
  { id:'w_thaemine',  name:'더 에기르',        minLevel:1660 },
  { id:'w_aegir',     name:'에기르',           minLevel:1620 },
  { id:'w_echidna',   name:'에키드나',         minLevel:1620 },
  { id:'w_kamen',     name:'카멘',             minLevel:1610 },
  { id:'w_behemoth',  name:'베히모스',         minLevel:1600 },
  { id:'w_illiakan',  name:'일리아칸',         minLevel:1580 },
  { id:'w_brelshaza', name:'브레리사자',       minLevel:1540 },
  { id:'w_akkan',     name:'아브렐슈드',       minLevel:1490 },
  { id:'w_kouku',     name:'쿠크세이튼',       minLevel:1475 },
  { id:'w_kayangel',  name:'카양겔',           minLevel:1475 },
  { id:'w_biackiss',  name:'비아키스',         minLevel:1430 },
  { id:'w_valtan',    name:'발탄',             minLevel:1415 },
  { id:'w_abrel',     name:'아브렐슈드(구)',   minLevel:1490 },
  { id:'w_abyss1',    name:'어비스던전',       minLevel:1370 },
];

function _todayKey() {
  const t = new Date(); t.setHours(0,0,0,0);
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

function _weekKey() {
  const now = new Date();
  const day = now.getDay(), hour = now.getHours();
  let wed = new Date(now);
  let diff = (day >= 3 && !(day === 3 && hour < 6)) ? day - 3 : day + 4;
  if (day === 3 && hour < 6) diff = 7;
  wed.setDate(now.getDate() - (day===3 && hour>=6 ? 0 : diff));
  wed.setHours(6,0,0,0);
  return `week_${wed.getFullYear()}-${String(wed.getMonth()+1).padStart(2,'0')}-${String(wed.getDate()).padStart(2,'0')}`;
}

let _loaChars = [];

async function _loadLoaChars() {
  try {
    const snap = await getDocs(collection(db, 'loa_chars'));
    _loaChars = [];
    snap.forEach(d => _loaChars.push(d.data()));
  } catch(e) { console.error('[loa] load:', e); }
}

async function _saveLoaChar(char) {
  try {
    await setDoc(doc(db, 'loa_chars', char.name), char);
    const idx = _loaChars.findIndex(c => c.name === char.name);
    if (idx >= 0) _loaChars[idx] = char; else _loaChars.push(char);
  } catch(e) { console.error('[loa] save:', e); }
}

async function _deleteLoaChar(name) {
  try {
    await deleteDoc(doc(db, 'loa_chars', name));
    _loaChars = _loaChars.filter(c => c.name !== name);
  } catch(e) { console.error('[loa] delete:', e); }
}

async function _fetchSiblings(charName) {
  const res = await fetch(
    `${LOA_BASE}/characters/${encodeURIComponent(charName)}/siblings`,
    { headers: { Authorization: `bearer ${LOA_KEY}`, Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return await res.json();
}

// ── 메인 렌더 (매트릭스 뷰) ─────────────────────────────────────
export async function renderLoa() {
  const container = document.getElementById('loa-container');
  if (!container) return;

  await _loadLoaChars();

  if (!_loaChars.length) {
    container.innerHTML = `
      <div class="loa-empty">
        <div style="font-size:32px;margin-bottom:12px">⚔️</div>
        <div style="font-size:14px;color:var(--muted2);margin-bottom:16px">등록된 캐릭터가 없어요</div>
        <button class="loa-add-btn" onclick="openLoaAddModal()">+ 캐릭터 등록</button>
      </div>`;
    return;
  }

  const todayK = _todayKey();
  const weekK  = _weekKey();

  // 아이템레벨 높은 순 정렬
  const chars = [..._loaChars].sort((a,b) => {
    const al = parseFloat((a.itemLevel||'0').replace(/,/g,''))||0;
    const bl = parseFloat((b.itemLevel||'0').replace(/,/g,''))||0;
    return bl - al;
  });

  const colCount = chars.length + 1;

  // ── 헤더 ──
  let headHtml = `<tr class="loa-matrix-head-row">
    <th class="loa-matrix-task-th">숙제</th>`;
  chars.forEach(c => {
    headHtml += `
      <th class="loa-matrix-char-th">
        <div class="loa-matrix-char-name">${c.name}</div>
        <div class="loa-matrix-char-ilvl">${c.itemLevel||'-'}</div>
        <button class="loa-matrix-del-btn" onclick="deleteLoaChar('${c.name}')">×</button>
      </th>`;
  });
  headHtml += '</tr>';

  // ── 일일숙제 완료 체크 (모든 캐릭터) ──
  const dailyAllDone = chars.every(c => {
    const ilvl = _ilvl(c);
    return DAILY_TASKS.filter(t=>ilvl>=t.minLevel)
      .every(t => ((c.checks||{})[`${todayK}_${t.id}`]||0) >= t.count);
  });
  const weeklyAllDone = chars.every(c => {
    const ilvl = _ilvl(c);
    return WEEKLY_TASKS.filter(t=>ilvl>=t.minLevel)
      .every(t => !!(c.checks||{})[`${weekK}_${t.id}`]);
  });

  // ── 일일숙제 행 ──
  let bodyHtml = `
    <tr class="loa-section-row">
      <td colspan="${colCount}">
        ☀️ 일일숙제
        <span class="loa-done-badge ${dailyAllDone?'done':''}">${dailyAllDone?'전체완료':'진행중'}</span>
      </td>
    </tr>`;

  DAILY_TASKS.forEach(task => {
    // 이 task를 쓰는 캐릭이 한 명이라도 있어야 행 표시
    if (!chars.some(c => _ilvl(c) >= task.minLevel)) return;
    bodyHtml += `<tr class="loa-task-row-tr"><td class="loa-task-name-td">${task.name}</td>`;
    chars.forEach(c => {
      const ilvl = _ilvl(c);
      if (ilvl < task.minLevel) { bodyHtml += `<td class="loa-matrix-cell na">—</td>`; return; }
      const done  = (c.checks||{})[`${todayK}_${task.id}`] || 0;
      const boxes = Array.from({length:task.count},(_,i) =>
        `<div class="loa-check-box ${i<done?'checked':''}"
          onclick="toggleLoaCheck('${c.name}','${task.id}',${task.count})"></div>`
      ).join('');
      bodyHtml += `<td class="loa-matrix-cell"><div class="loa-check-boxes">${boxes}</div></td>`;
    });
    bodyHtml += '</tr>';
  });

  // ── 주간숙제 행 ──
  bodyHtml += `
    <tr class="loa-section-row">
      <td colspan="${colCount}">
        📅 주간숙제
        <span class="loa-done-badge ${weeklyAllDone?'done':''}">${weeklyAllDone?'전체완료':'진행중'}</span>
        <span class="loa-reset-info">수요일 06:00 리셋</span>
      </td>
    </tr>`;

  WEEKLY_TASKS.forEach(task => {
    if (!chars.some(c => _ilvl(c) >= task.minLevel)) return;
    bodyHtml += `<tr class="loa-task-row-tr"><td class="loa-task-name-td">${task.name}</td>`;
    chars.forEach(c => {
      const ilvl = _ilvl(c);
      if (ilvl < task.minLevel) { bodyHtml += `<td class="loa-matrix-cell na">—</td>`; return; }
      const done = !!(c.checks||{})[`${weekK}_${task.id}`];
      bodyHtml += `<td class="loa-matrix-cell">
        <div class="loa-check-box ${done?'checked':''}"
          onclick="toggleLoaWeekly('${c.name}','${task.id}')"></div>
      </td>`;
    });
    bodyHtml += '</tr>';
  });

  container.innerHTML = `
    <div class="loa-top-bar">
      <button class="loa-add-btn" onclick="openLoaAddModal()">+ 캐릭터 등록</button>
    </div>
    <div class="loa-matrix-wrap">
      <table class="loa-matrix">
        <thead>${headHtml}</thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>`;
}

function _ilvl(char) {
  return parseFloat((char.itemLevel||'0').replace(/,/g,''))||0;
}

// ── 체크 토글 ─────────────────────────────────────────────────────
export async function toggleLoaCheck(charName, taskId, maxCount) {
  const char = _loaChars.find(c => c.name === charName); if (!char) return;
  const todayK = _todayKey();
  const key    = `${todayK}_${taskId}`;
  const checks = { ...(char.checks||{}) };
  checks[key]  = ((checks[key]||0)+1) % (maxCount+1);
  await _saveLoaChar({...char, checks});
  renderLoa();
}

export async function toggleLoaWeekly(charName, taskId) {
  const char = _loaChars.find(c => c.name === charName); if (!char) return;
  const weekK = _weekKey();
  const key   = `${weekK}_${taskId}`;
  const checks = { ...(char.checks||{}) };
  checks[key]  = !checks[key];
  await _saveLoaChar({...char, checks});
  renderLoa();
}

export function setLoaActiveChar() {} // 호환성 유지 (미사용)

export async function deleteLoaChar(name) {
  if (!confirm(`'${name}' 캐릭터를 삭제할까요?`)) return;
  await _deleteLoaChar(name);
  renderLoa();
}

// ── 캐릭터 추가 모달 ─────────────────────────────────────────────
let _siblingCache = [];

export function openLoaAddModal() {
  document.getElementById('loa-search-name').value = '';
  document.getElementById('loa-sibling-list').innerHTML = '';
  document.getElementById('loa-search-error').textContent = '';
  document.getElementById('loa-add-modal').classList.add('open');
}

export function closeLoaAddModal(e) {
  if (e && e.target !== document.getElementById('loa-add-modal')) return;
  document.getElementById('loa-add-modal').classList.remove('open');
}

export async function searchLoaSiblings() {
  const name  = document.getElementById('loa-search-name').value.trim();
  if (!name) return;
  const btn   = document.getElementById('loa-search-btn');
  const errEl = document.getElementById('loa-search-error');
  btn.disabled = true; btn.textContent = '검색 중...';
  errEl.textContent = '';
  try {
    const siblings = await _fetchSiblings(name);
    _siblingCache  = siblings;
    const sorted   = [...siblings].sort((a,b) =>
      parseFloat(b.ItemAvgLevel?.replace(/,/g,'')||0) - parseFloat(a.ItemAvgLevel?.replace(/,/g,'')||0)
    );
    document.getElementById('loa-sibling-list').innerHTML = sorted.map(c => {
      const already = _loaChars.find(x => x.name === c.CharacterName);
      return `<div class="loa-sibling-row ${already?'already':''}"
        onclick="${already?'':` selectLoaChar('${c.CharacterName}')`}">
        <div class="loa-sibling-info">
          <span class="loa-sibling-name">${c.CharacterName}</span>
          <span class="loa-sibling-class">${c.CharacterClassName||''}</span>
        </div>
        <div class="loa-sibling-right">
          <span class="loa-sibling-ilvl">${c.ItemAvgLevel||'-'}</span>
          ${already?'<span class="loa-already-tag">등록됨</span>':''}
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    errEl.textContent = '캐릭터를 찾을 수 없어요. 이름을 확인해주세요.';
  } finally {
    btn.disabled = false; btn.textContent = '검색';
  }
}

export async function selectLoaChar(charName) {
  const sibling = _siblingCache.find(c => c.CharacterName === charName);
  if (!sibling) return;
  const char = {
    name: sibling.CharacterName, server: sibling.ServerName,
    class: sibling.CharacterClassName, level: sibling.CharacterLevel,
    itemLevel: sibling.ItemAvgLevel, checks: {},
  };
  await _saveLoaChar(char);
  document.getElementById('loa-add-modal').classList.remove('open');
  renderLoa();
}
