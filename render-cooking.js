// ================================================================
// render-cooking.js — 요리 탭
// 주 1회 새 요리 실험 기록
// ================================================================

import { saveCooking, deleteCooking, getCookingRecords } from './data.js';

const CATEGORIES   = ['한식','양식','일식','중식','기타'];
const RESULT_LABEL = { success:'✓ 성공', partial:'△ 보통', fail:'✗ 아쉬움' };
const RESULT_COLOR = { success:'var(--diet-ok)', partial:'var(--accent)', fail:'var(--diet-bad)' };

let _editingId = null;

// ── 공개 API ─────────────────────────────────────────────────────
export function renderCooking() {
  const records   = getCookingRecords();
  const container = document.getElementById('cooking-list');
  if (!container) return;

  container.innerHTML =
    _buildDashboard(records) +
    `<div class="cooking-cards-wrap">` +
    (records.length
      ? [...records]
          .sort((a,b) => (b.date||'').localeCompare(a.date||''))
          .map(r => _buildCard(r))
          .join('')
      : `<div style="text-align:center;padding:40px;color:var(--muted)">
           <div style="font-size:32px;margin-bottom:12px">🍳</div>
           <div style="font-size:14px">아직 기록된 요리가 없어요</div>
         </div>`)
    + `</div>`;
}

export function openCookingModal(id) {
  _editingId = id || null;
  const modal = document.getElementById('cooking-modal');
  const titleEl = document.getElementById('cooking-modal-title');

  if (id) {
    const rec = getCookingRecords().find(r => r.id === id);
    if (!rec) return;
    titleEl.textContent = '🍳 요리 기록 수정';
    document.getElementById('cooking-name').value     = rec.name     || '';
    document.getElementById('cooking-date').value     = rec.date     || '';
    document.getElementById('cooking-category').value = rec.category || '한식';
    document.getElementById('cooking-source').value   = rec.source   || '';
    document.getElementById('cooking-process').value  = rec.process  || '';
    document.getElementById('cooking-result').value   = rec.result   || 'success';
    document.getElementById('cooking-result-notes').value = rec.result_notes || '';
    document.getElementById('cooking-photo-url').value    = rec.photo_url    || '';
    _updatePhotoPreview(rec.photo_url || '');
    document.getElementById('cooking-delete-btn').style.display = 'block';
  } else {
    titleEl.textContent = '🍳 요리 기록 추가';
    document.getElementById('cooking-name').value     = '';
    document.getElementById('cooking-date').value     = _todayStr();
    document.getElementById('cooking-category').value = '한식';
    document.getElementById('cooking-source').value   = '';
    document.getElementById('cooking-process').value  = '';
    document.getElementById('cooking-result').value   = 'success';
    document.getElementById('cooking-result-notes').value = '';
    document.getElementById('cooking-photo-url').value    = '';
    _updatePhotoPreview('');
    document.getElementById('cooking-delete-btn').style.display = 'none';
  }
  modal.classList.add('open');
}

export function closeCookingModal(e) {
  if (e && e.target !== document.getElementById('cooking-modal')) return;
  document.getElementById('cooking-modal').classList.remove('open');
}

export async function saveCookingFromModal() {
  const name   = document.getElementById('cooking-name').value.trim();
  const date   = document.getElementById('cooking-date').value;
  if (!name) { alert('요리 이름을 입력해주세요.'); return; }
  if (!date) { alert('날짜를 입력해주세요.'); return; }

  const record = {
    id:           _editingId || `cooking_${Date.now()}`,
    name,
    date,
    category:     document.getElementById('cooking-category').value,
    source:       document.getElementById('cooking-source').value.trim(),
    process:      document.getElementById('cooking-process').value.trim(),
    result:       document.getElementById('cooking-result').value,
    result_notes: document.getElementById('cooking-result-notes').value.trim(),
    photo_url:    document.getElementById('cooking-photo-url').value.trim(),
    createdAt:    _editingId
      ? (getCookingRecords().find(r=>r.id===_editingId)?.createdAt || new Date().toISOString())
      : new Date().toISOString(),
  };

  await saveCooking(record);
  document.getElementById('cooking-modal').classList.remove('open');
  renderCooking();
  document.dispatchEvent(new CustomEvent('cooking:saved'));
}

export async function deleteCookingFromModal() {
  if (!_editingId) return;
  if (!confirm('이 요리 기록을 삭제할까요?')) return;
  await deleteCooking(_editingId);
  document.getElementById('cooking-modal').classList.remove('open');
  renderCooking();
  document.dispatchEvent(new CustomEvent('cooking:saved'));
}

export function onCookingPhotoInput() {
  const url = document.getElementById('cooking-photo-url').value.trim();
  _updatePhotoPreview(url);
}

// ── 내부 ─────────────────────────────────────────────────────────
function _todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

function _updatePhotoPreview(url) {
  const img = document.getElementById('cooking-photo-preview');
  if (!img) return;
  if (url) { img.src = url; img.style.display = 'block'; }
  else     { img.style.display = 'none'; }
}

function _buildDashboard(records) {
  if (!records.length) return '';

  const total   = records.length;
  const success = records.filter(r => r.result === 'success').length;
  const partial = records.filter(r => r.result === 'partial').length;
  const fail    = records.filter(r => r.result === 'fail').length;
  const successRate = total ? Math.round(success / total * 100) : 0;

  const catCount = {};
  records.forEach(r => { catCount[r.category||'기타'] = (catCount[r.category||'기타']||0) + 1; });
  const catTop3 = Object.entries(catCount).sort((a,b)=>b[1]-a[1]).slice(0,3);

  const catHtml = catTop3.map((x,i) =>
    `<span class="cooking-rank-item">
       <span class="cooking-rank-num">${i+1}</span>${x[0]}
       <span class="cooking-rank-cnt">${x[1]}회</span>
     </span>`).join('');

  return `
  <div class="cooking-dashboard">
    <div class="cooking-dash-title">📊 요리 실험 현황</div>
    <div class="cooking-dash-grid">
      <div class="cooking-dash-block">
        <div class="cooking-dash-label">총 실험</div>
        <div class="cooking-dash-val">${total}<span style="font-size:12px;color:var(--muted)">회</span></div>
      </div>
      <div class="cooking-dash-block">
        <div class="cooking-dash-label">성공률</div>
        <div class="cooking-dash-val" style="color:var(--diet-ok)">${successRate}<span style="font-size:12px;color:var(--muted)">%</span></div>
      </div>
      <div class="cooking-dash-block">
        <div class="cooking-dash-label">결과</div>
        <div style="font-size:11px;margin-top:4px;display:flex;flex-direction:column;gap:2px;">
          <span style="color:var(--diet-ok)">✓ ${success}회</span>
          <span style="color:var(--accent)">△ ${partial}회</span>
          <span style="color:var(--diet-bad)">✗ ${fail}회</span>
        </div>
      </div>
      <div class="cooking-dash-block" style="grid-column:span 3">
        <div class="cooking-dash-label">카테고리 TOP</div>
        <div class="cooking-rank-list" style="margin-top:6px">${catHtml}</div>
      </div>
    </div>
  </div>`;
}

function _buildCard(r) {
  const resultColor = RESULT_COLOR[r.result] || 'var(--muted)';
  const resultLabel = RESULT_LABEL[r.result] || r.result;
  const imgHtml = r.photo_url
    ? `<img src="${r.photo_url}" class="cooking-card-img" alt="${r.name}" onerror="this.style.display='none'">`
    : '';

  return `
  <div class="cooking-card" onclick="openCookingModal('${r.id}')">
    ${imgHtml}
    <div class="cooking-card-body">
      <div class="cooking-card-header">
        <span class="cooking-card-name">${r.name}</span>
        <span class="cooking-card-result" style="color:${resultColor}">${resultLabel}</span>
      </div>
      <div class="cooking-card-meta">
        <span class="cooking-card-date">${(r.date||'').replace(/-/g,'/')}</span>
        <span class="cooking-card-cat">${r.category||''}</span>
      </div>
      ${r.result_notes ? `<div class="cooking-card-notes">${r.result_notes}</div>` : ''}
    </div>
  </div>`;
}
