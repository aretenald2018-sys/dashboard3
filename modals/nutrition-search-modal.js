export const MODAL_HTML = `
<div class="modal-overlay" id="nutrition-search-modal" onclick="closeNutritionSearch(event)">
  <div class="modal-sheet">
    <div class="sheet-handle"></div>
    <div class="modal-title">🔍 영양 성분 검색</div>
    <div class="ex-editor-form" style="padding-bottom:8px">
      <input class="ex-editor-input" id="nutrition-search-input" placeholder="음식 이름을 입력하세요.." oninput="renderNutritionSearchResults()">
      <div id="nutrition-search-results" style="max-height:280px;overflow-y:auto;margin-top:8px"></div>
      <div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px">
        <button class="ex-picker-add" onclick="openNutritionItemEditor(null)" style="width:100%">+ 찾는 음식이 없나요? 직접 추가</button>
      </div>
    </div>
  </div>
</div>
`;
