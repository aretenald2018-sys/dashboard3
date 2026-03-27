export const MODAL_HTML = `
<div class="modal-overlay" id="diet-plan-modal" onclick="closeDietPlanModal(event)">
  <div class="modal-sheet" style="max-height:90vh;overflow-y:auto">
    <div class="sheet-handle"></div>
    <div class="modal-title">🥗 다이어트 플랜 설정</div>
    <div class="ex-editor-form">
      <div class="diet-plan-section-title">신체 정보</div>
      <div class="diet-plan-row">
        <div><div class="ex-editor-label">신장 (cm)</div><input class="ex-editor-input" id="dp-height" type="number" placeholder="175"></div>
        <div><div class="ex-editor-label">연령 (세)</div><input class="ex-editor-input" id="dp-age" type="number" placeholder="32"></div>
      </div>
      <div class="diet-plan-row">
        <div><div class="ex-editor-label">현재 체중 (kg)</div><input class="ex-editor-input" id="dp-weight" type="number" step="0.1" placeholder="75"></div>
        <div><div class="ex-editor-label">체지방률 (%)</div><input class="ex-editor-input" id="dp-bodyfat" type="number" step="0.1" placeholder="17"></div>
      </div>

      <div class="diet-plan-section-title" style="margin-top:14px">목표 설정</div>
      <div class="diet-plan-row">
        <div><div class="ex-editor-label">목표 체중 (kg)</div><input class="ex-editor-input" id="dp-target-weight" type="number" step="0.1" placeholder="68"></div>
        <div><div class="ex-editor-label">목표 체지방률 (%)</div><input class="ex-editor-input" id="dp-target-bf" type="number" step="0.1" placeholder="8"></div>
      </div>
      <div><div class="ex-editor-label">플랜 시작일</div><input class="ex-editor-input" id="dp-start-date" type="date"></div>

      <div class="diet-plan-section-title" style="margin-top:14px">활동 계수 및 파라미터</div>
      <div class="diet-plan-row">
        <div>
          <div class="ex-editor-label">주당 감량 속도 <span style="color:var(--muted);font-size:10px">(권장: 0.007~0.010)</span></div>
          <input class="ex-editor-input" id="dp-loss-rate" type="number" step="0.001" min="0.003" max="0.015" placeholder="0.009">
        </div>
        <div>
          <div class="ex-editor-label">활동 지수 <span style="color:var(--muted);font-size:10px">(기본 1.3 고정)</span></div>
          <input class="ex-editor-input" id="dp-activity" type="number" step="0.05" min="1.1" max="1.9" placeholder="1.3" disabled style="opacity:.5">
        </div>
      </div>
      <div class="diet-plan-row">
        <div>
          <div class="ex-editor-label">리피드(Refeed) 칼로리 <span style="color:var(--muted);font-size:10px">(치팅데이 권장: 5000kcal)</span></div>
          <input class="ex-editor-input" id="dp-refeed-kcal" type="number" step="100" placeholder="5000">
        </div>
      </div>
      <div>
        <div class="ex-editor-label">리피드 요일 <span style="color:var(--muted);font-size:10px">(복수 선택 가능)</span></div>
        <div class="refeed-day-btns" id="dp-refeed-days">
          <button class="refeed-day-btn" data-dow="1">월</button>
          <button class="refeed-day-btn" data-dow="2">화</button>
          <button class="refeed-day-btn" data-dow="3">수</button>
          <button class="refeed-day-btn" data-dow="4">목</button>
          <button class="refeed-day-btn" data-dow="5">금</button>
          <button class="refeed-day-btn" data-dow="6">토</button>
          <button class="refeed-day-btn" data-dow="0">일</button>
        </div>
      </div>

      <div class="diet-calc-preview" id="dp-calc-preview"></div>

      <div class="ex-editor-actions">
        <button class="ex-editor-cancel" onclick="closeDietPlanModal()">취소</button>
        <button class="ex-editor-save" onclick="saveDietPlanFromModal()">플랜 저장</button>
      </div>
    </div>
  </div>
</div>
`;
