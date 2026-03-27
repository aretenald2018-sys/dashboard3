export const MODAL_HTML = `
<div class="modal-overlay" id="cooking-modal" onclick="closeCookingModal(event)">
  <div class="modal-sheet cooking-modal-sheet">
    <div class="sheet-handle"></div>
    <div class="modal-title" id="cooking-modal-title">🍳 요리 기록 추가</div>
    <div class="wine-form">
      <div class="wine-form-section">
        <div class="wine-form-row">
          <div class="wine-form-field" style="flex:3">
            <label class="wine-form-label">요리명 *</label>
            <input class="wine-form-input" id="cooking-name" placeholder="예: 된장찌개, 파스타 카르보나라">
          </div>
          <div class="wine-form-field" style="flex:1">
            <label class="wine-form-label">날짜 *</label>
            <input class="wine-form-input" id="cooking-date" type="date">
          </div>
        </div>
        <div class="wine-form-row">
          <div class="wine-form-field">
            <label class="wine-form-label">카테고리</label>
            <select class="wine-form-input" id="cooking-category">
              <option value="한식">한식</option>
              <option value="일식">일식</option>
              <option value="양식">양식</option>
              <option value="중식">중식</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div class="wine-form-field">
            <label class="wine-form-label">결과</label>
            <select class="wine-form-input" id="cooking-result">
              <option value="success">✅ 대성공</option>
              <option value="partial">🟡 보통</option>
              <option value="fail">❌ 아쉬움</option>
            </select>
          </div>
        </div>
      </div>
      <div class="wine-form-section">
        <div class="wine-form-section-title">🔗 레시피 출처</div>
        <div class="wine-form-field">
          <input class="wine-form-input" id="cooking-source" placeholder="예: 백종원 유튜브, 만개의 레시피 URL 등">
        </div>
      </div>
      <div class="wine-form-section">
        <div class="wine-form-section-title">📝 조리 과정 메모</div>
        <div class="wine-form-field">
          <textarea class="wine-form-input wine-form-textarea" id="cooking-process" placeholder="조리 시 주의할 점이나 주요 과정을 기록하세요" rows="3"></textarea>
        </div>
      </div>
      <div class="wine-form-section">
        <div class="wine-form-section-title">🍽️ 맛 결과 & 개선점</div>
        <div class="wine-form-field">
          <textarea class="wine-form-input wine-form-textarea" id="cooking-result-notes" placeholder="맛 평점이나 다음엔 어떻게 바꿔볼지 기록하세요" rows="3"></textarea>
        </div>
      </div>
      <div class="wine-form-section">
        <div class="wine-form-section-title">📸 완성 사진</div>
        <div class="wine-form-field">
          <label class="wine-form-label">사진 URL</label>
          <input class="wine-form-input" id="cooking-photo-url" placeholder="https://..." oninput="onCookingPhotoInput()">
        </div>
        <img id="cooking-photo-preview" style="display:none;width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-top:8px;border:1px solid var(--border)" alt="미리보기">
      </div>
      <div class="wine-form-actions">
        <button class="ex-editor-cancel" onclick="closeCookingModal()">취소</button>
        <button class="ex-editor-save"   onclick="saveCookingFromModal()">저장하기</button>
      </div>
      <button class="ex-editor-delete" id="cooking-delete-btn" onclick="deleteCookingFromModal()" style="display:none">🗑️ 기록 삭제</button>
    </div>
  </div>
</div>
`;
