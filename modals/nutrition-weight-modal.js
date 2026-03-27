export const WEIGHT_MODAL_HTML = `
<div class="modal-overlay" id="nutrition-weight-modal" onclick="closeNutritionWeightModal(event)" style="display:none;z-index:1001">
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <div class="modal-title">중량 설정</div>
    <div class="ex-editor-form" style="padding-bottom:8px">
      <div id="nutrition-weight-item-info" style="padding:12px;background:var(--bg2);border-radius:4px;margin-bottom:12px;font-size:12px">
        <div style="font-weight:600;margin-bottom:4px" id="weight-item-name"></div>
        <div style="color:var(--muted);font-size:11px" id="weight-item-nutrition"></div>
      </div>

      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--muted);display:block;margin-bottom:4px">중량 (g)</label>
        <input type="number" id="nutrition-weight-input" value="100" min="1" max="1000" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font-size:13px" oninput="updateNutritionWeightPreview()">
      </div>

      <div style="padding:12px;background:var(--surface3);border-radius:4px;margin-bottom:12px;font-size:12px">
        <div style="font-weight:600;margin-bottom:6px;color:var(--text)">계산된 영양정보</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:var(--muted);font-size:11px">
          <div>💪 <span id="weight-calc-kcal">0</span>kcal</div>
          <div>🥕 탄 <span id="weight-calc-carbs">0</span>g</div>
          <div>🍖 단 <span id="weight-calc-protein">0</span>g</div>
          <div>🧈 지 <span id="weight-calc-fat">0</span>g</div>
        </div>
      </div>

      <div style="display:flex;gap:8px">
        <button class="ex-picker-add" onclick="confirmNutritionItemWithWeight()" style="flex:1">추가</button>
        <button style="flex:1;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;color:var(--text);cursor:pointer;font-size:13px" onclick="closeNutritionWeightModal()">취소</button>
      </div>
    </div>
  </div>
</div>
`;

// 전역 상태 저장
window._nutritionWeightItem = null;

// 함수들을 전역 window에 노출
export function openNutritionWeightModal(item) {
  window._nutritionWeightItem = item;

  // 항목 정보 표시 (원래 저장된 단위 기준)
  const servingSize = item.servingSize || 100;
  const kcal = item.nutrition?.kcal || item.kcal || 0;
  const carbs = item.nutrition?.carbs || item.carbs || 0;
  const protein = item.nutrition?.protein || item.protein || 0;
  const fat = item.nutrition?.fat || item.fat || 0;

  document.getElementById('weight-item-name').textContent = item.name;
  document.getElementById('weight-item-nutrition').textContent =
    `${servingSize}g 기준: ${kcal}kcal | 탄${carbs}g 단${protein}g 지${fat}g`;

  // 중량 입력 초기화
  document.getElementById('nutrition-weight-input').value = '100';

  // 미리보기 업데이트
  updateNutritionWeightPreview();

  // 모달 열기
  document.getElementById('nutrition-weight-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('nutrition-weight-input').focus(), 100);
}

export function updateNutritionWeightPreview() {
  if (!window._nutritionWeightItem) return;

  const weight = parseFloat(document.getElementById('nutrition-weight-input').value) || 100;
  const item = window._nutritionWeightItem;
  const servingSize = item.servingSize || 100;

  const baseKcal = item.nutrition?.kcal || item.kcal || 0;
  const baseCarbs = item.nutrition?.carbs || item.carbs || 0;
  const baseProtein = item.nutrition?.protein || item.protein || 0;
  const baseFat = item.nutrition?.fat || item.fat || 0;

  // servingSize 기준으로 사용자 입력 중량에 맞춰 비례 계산
  const calcKcal = Math.round((baseKcal * weight) / servingSize);
  const calcCarbs = Math.round((baseCarbs * weight) / servingSize * 10) / 10;
  const calcProtein = Math.round((baseProtein * weight) / servingSize * 10) / 10;
  const calcFat = Math.round((baseFat * weight) / servingSize * 10) / 10;

  document.getElementById('weight-calc-kcal').textContent = calcKcal;
  document.getElementById('weight-calc-carbs').textContent = calcCarbs;
  document.getElementById('weight-calc-protein').textContent = calcProtein;
  document.getElementById('weight-calc-fat').textContent = calcFat;
}

export function closeNutritionWeightModal(event) {
  if (event && event.target.id !== 'nutrition-weight-modal') return;
  document.getElementById('nutrition-weight-modal').style.display = 'none';
  window._nutritionWeightItem = null;
}

export function confirmNutritionItemWithWeight() {
  if (!window._nutritionWeightItem || !window._nutritionSearchMeal) return;

  const weight = parseFloat(document.getElementById('nutrition-weight-input').value) || 100;
  const item = window._nutritionWeightItem;
  const mealId = window._nutritionSearchMeal;
  const servingSize = item.servingSize || 100;

  const baseKcal = item.nutrition?.kcal || item.kcal || 0;
  const baseCarbs = item.nutrition?.carbs || item.carbs || 0;
  const baseProtein = item.nutrition?.protein || item.protein || 0;
  const baseFat = item.nutrition?.fat || item.fat || 0;

  // servingSize 기준으로 사용자 입력 중량에 맞춰 비례 계산
  const kcal = Math.round((baseKcal * weight) / servingSize);
  const carbs = Math.round((baseCarbs * weight) / servingSize * 10) / 10;
  const protein = Math.round((baseProtein * weight) / servingSize * 10) / 10;
  const fat = Math.round((baseFat * weight) / servingSize * 10) / 10;

  // 음식 항목 생성
  const foodListContainer = document.getElementById(`wt-foods-${mealId}`);
  if (foodListContainer) {
    const foodItem = document.createElement('div');
    foodItem.className = 'meal-food-item';
    foodItem.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg2);border-radius:4px;margin-bottom:4px;font-size:12px';

    foodItem.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:500;margin-bottom:2px">${item.name}</div>
        <div style="color:var(--muted);font-size:11px">${weight}g | ${kcal}kcal | 탄${carbs}g 단${protein}g 지${fat}g</div>
      </div>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;font-size:14px" title="삭제">✕</button>
    `;

    foodListContainer.appendChild(foodItem);
  }

  // 모달 닫기
  closeNutritionWeightModal();

  // 검색 모달 닫기
  document.getElementById('nutrition-search-modal').classList.remove('open');
}
