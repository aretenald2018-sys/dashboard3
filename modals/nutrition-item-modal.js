export const MODAL_HTML = `
<div class="modal-overlay" id="nutrition-item-modal" onclick="closeNutritionItemModal(event)">
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <div class="modal-title" id="nutrition-item-title">음식 정보 등록</div>
    <div class="ex-editor-form">
      <div><div class="ex-editor-label">음식 이름 *</div><input class="ex-editor-input" id="ni-name" placeholder="예: 닭가슴살 구이"></div>
      <div class="diet-plan-row">
        <div><div class="ex-editor-label">기준 단위</div><input class="ex-editor-input" id="ni-unit" placeholder="예: 100g, 1개, 1공기"></div>
        <div><div class="ex-editor-label">칼로리 (kcal)</div><input class="ex-editor-input" id="ni-kcal" type="number" placeholder="165"></div>
      </div>
      <div class="diet-plan-row">
        <div><div class="ex-editor-label">탄수화물 (g)</div><input class="ex-editor-input" id="ni-carbs" type="number" step="0.1" placeholder="0"></div>
        <div><div class="ex-editor-label">단백질 (g)</div><input class="ex-editor-input" id="ni-protein" type="number" step="0.1" placeholder="31"></div>
      </div>
      <div class="diet-plan-row">
        <div><div class="ex-editor-label">지방 (g)</div><input class="ex-editor-input" id="ni-fat" type="number" step="0.1" placeholder="3.6"></div>
        <div><div class="ex-editor-label">메모</div><input class="ex-editor-input" id="ni-note" placeholder="선택 사항"></div>
      </div>
      <div class="ex-editor-actions">
        <button class="ex-editor-cancel" id="ni-delete-btn" onclick="deleteNutritionItemFromModal()" style="display:none;color:var(--diet-bad)">삭제</button>
        <button class="ex-editor-cancel" onclick="closeNutritionItemModal()">취소</button>
        <button class="ex-editor-save" onclick="saveNutritionItemFromModal()">저장하기</button>
      </div>
    </div>
  </div>
</div>
`;
