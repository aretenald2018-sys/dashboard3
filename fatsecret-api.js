// ================================================================
// fatsecret-api.js — Claude + CSV RAG Integration
// ================================================================

// ========== CSV 데이터 로딩 ==========
let csvFoodDatabase = null;

/**
 * CSV 파일 로드 (앱 시작 시 한 번만)
 */
export async function loadCSVDatabase(csvPath = '/data/foods.csv') {
  if (csvFoodDatabase) return csvFoodDatabase;

  try {
    const response = await fetch(csvPath);
    const csvText = await response.text();

    // CSV 파싱
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    csvFoodDatabase = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      return record;
    });

    console.log(`✅ CSV 로드 완료: ${csvFoodDatabase.length}개 식품`);
    return csvFoodDatabase;
  } catch (error) {
    console.error('CSV 로드 실패:', error);
    return [];
  }
}

/**
 * 검색 정확도 스코링 (정확 일치 > 부분 일치 > 유사 매칭)
 */
function calculateSearchScore(foodName, searchTerm) {
  const name = foodName.toLowerCase();
  const term = searchTerm.toLowerCase();

  // 1. 정확 일치 (100점)
  if (name === term) return 100;

  // 2. 시작 일치 (90점)
  if (name.startsWith(term)) return 90;

  // 3. 전체 포함 (80점)
  if (name.includes(term)) return 80;

  // 4. 각 단어 포함 (70점)
  const searchWords = term.split(/\s+/);
  const allWordsIncluded = searchWords.every(word => name.includes(word));
  if (allWordsIncluded) return 70;

  // 5. 부분 단어 일치 (50점)
  const partialMatches = searchWords.filter(word => name.includes(word)).length;
  if (partialMatches > 0) return 50 + (partialMatches * 5);

  return 0;
}

/**
 * CSV에서 정확도 높은 순으로 검색 (중복 제거, 정렬)
 */
export function searchCSVFood(searchTerm) {
  if (!csvFoodDatabase || csvFoodDatabase.length === 0) {
    console.warn('CSV 데이터가 로드되지 않았습니다');
    return [];
  }

  // 1. 스코어 계산
  const scoredResults = csvFoodDatabase
    .map(food => ({
      ...food,
      score: calculateSearchScore(food['제품명'] || '', searchTerm),
      normalizedName: (food['제품명'] || '').toLowerCase(),
    }))
    .filter(f => f.score > 0);

  // 2. 정확도 높은 순으로 정렬
  scoredResults.sort((a, b) => b.score - a.score);

  // 3. 같은 이름인 경우 제조사 기준으로 중복 제거 (각각 하나씩만)
  const seen = new Set();
  const results = [];

  for (const food of scoredResults) {
    const key = food['제품명'];
    if (!seen.has(key)) {
      seen.add(key);
      // 안정적인 ID: 제품명과 제조사 조합 (검색 결과 개수와 무관)
      const stableId = `csv_${encodeURIComponent(food['제품명'])}_${encodeURIComponent(food['제조사'])}`;
      results.push({
        id: stableId,
        name: food['제품명'],
        manufacturer: food['제조사'],
        energy: parseFloat(food['에너지(kcal)']) || 0,
        protein: parseFloat(food['단백질(g)']) || 0,
        fat: parseFloat(food['지방(g)']) || 0,
        carbs: parseFloat(food['탄수화물(g)']) || 0,
        sodium: parseFloat(food['나트륨(mg)']) || 0,
        calcium: 0,  // CSV에 칼슘 데이터 없음
        iron: 0,     // CSV에 철분 데이터 없음
        score: food.score,
        rawData: food,
      });
    }
  }

  return results.slice(0, 10); // 상위 10개만 반환
}


/**
 * Claude와 식품 영양정보 분석 (RAG 방식)
 * CSV 데이터를 Claude에게 전달해서 정확한 분석 제공 (환각 방지)
 */
export async function analyzeFoodWithClaude(food, userGoal = '일반 영양정보') {
  try {
    const apiKey = localStorage.getItem('claude_api_key');
    if (!apiKey) {
      throw new Error('Claude API 키가 설정되지 않았습니다.');
    }

    // Claude API 호출 (CSV 데이터 기반)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: `당신은 대한민국 영양학 전문가입니다.
정확한 식품 데이터 기반으로만 답변하세요.
환각이나 추측은 절대 금지합니다.
사용자의 목표에 맞춰 최고의 조언을 제공하세요.`,
        messages: [{
          role: 'user',
          content: `다음 식품 정보를 분석해주세요:

🍗 식품명: ${food.name}
제조사: ${food.manufacturer}
기준량: 100g

📊 영양정보:
- 에너지: ${food.energy} kcal
- 단백질: ${food.protein}g
- 지방: ${food.fat}g
- 탄수화물: ${food.carbs}g
- 나트륨: ${food.sodium}mg
- 칼슘: ${food.calcium}mg
- 철분: ${food.iron}mg

❓ 사용자 목표: ${userGoal}

이 식품의 특징, 추천 섭취 시기, 궁합이 좋은 음식, 주의사항 등을 알려주세요.`,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '분석 실패');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('[analyzeFood WithClaude]', error);
    throw error;
  }
}

