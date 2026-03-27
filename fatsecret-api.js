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
      results.push({
        id: `csv_${results.length}`,
        name: food['제품명'],
        manufacturer: food['제조사'],
        energy: parseFloat(food['에너지(kcal)']) || 0,
        protein: parseFloat(food['단백질(g)']) || 0,
        fat: parseFloat(food['지방(g)']) || 0,
        carbs: parseFloat(food['탄수화물(g)']) || 0,
        sodium: parseFloat(food['나트륨(mg)']) || 0,
        calcium: parseFloat(food['칼슘(mg)']) || 0,
        iron: parseFloat(food['철분(mg)']) || 0,
        score: food.score,
        rawData: food,
      });
    }
  }

  return results.slice(0, 10); // 상위 10개만 반환
}

// 프록시 URL 설정 (Vercel 배포 후 사용)
// 사용자가 설정: localStorage.setItem('fs_proxy_url', 'https://your-vercel-url.vercel.app/api/fatsecret-proxy')
function getProxyUrl() {
  const stored = localStorage.getItem('fs_proxy_url');
  if (stored) return stored;

  // 자동 감지: 현재 호스트에서 프록시 찾기
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Vercel 배포 감지
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}/api/fatsecret-proxy`;
  }

  // 로컬 개발: 포트 3000 또는 5000에서 실행 중인 프록시 찾기
  return 'http://localhost:3000/api/fatsecret-proxy';
}

/**
 * Node.js crypto 없이 HMAC-SHA1 생성 (브라우저 환경)
 */
async function generateHMACSHA1(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * 한국어 감지
 */
function isKorean(text) {
  return /[\uAC00-\uD7AF]/.test(text);  // 한글 범위 확인
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

/**
 * 한국 공공 API에서 식품 검색 (Vercel 프록시 사용)
 */
async function searchKoreanFoodDB(searchTerm) {
  try {
    const apiKey = localStorage.getItem('korean_food_api_key') || 'e54c5a3ae4ee20df7abd68a1b14528ad309c2fbe25a9ab1128bf7e410414d59b';

    // Vercel 프록시를 통해 요청 (CORS 문제 해결)
    const response = await fetch(getProxyUrl().replace('/api/fatsecret-proxy', '/api/korean-food-proxy'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        searchTerm,
      }),
    });

    if (!response.ok) {
      throw new Error(`프록시 오류: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items.map(item => ({
        id: item.foodCode || item.foodId,
        name: item.foodNm || item.FOOD_NM_KR,
        type: 'Generic',
        description: item.servingSize ? `1회 제공량: ${item.servingSize}g` : '',
        korean: true,
      }));
    }
    return [];
  } catch (error) {
    console.error('[searchKoreanFoodDB]', error);
    return [];
  }
}

/**
 * FatSecret 음식 검색 (Vercel 프록시 사용)
 * @param {string} searchTerm 검색어 (한글/영어 지원)
 * @returns {Promise<Array>} 검색 결과 배열
 */
export async function searchFatSecretFood(searchTerm) {
  // 한국어 입력 감지
  if (isKorean(searchTerm)) {
    const koreanResults = await searchKoreanFoodDB(searchTerm);
    if (koreanResults.length > 0) {
      return koreanResults;  // 한국 DB 결과 반환
    }
    // 한국 DB에 없으면 FatSecret도 시도 (영어 자동 번역 필요)
  }

  // FatSecret 검색 (영어)
  const consumerKey = localStorage.getItem('fs_consumer_key') || '';
  const consumerSecret = localStorage.getItem('fs_consumer_secret') || '';

  if (!consumerKey || !consumerSecret) {
    throw new Error('FatSecret 자격증명이 설정되지 않았습니다.');
  }

  const params = {
    method: 'foods.search',
    search_expression: searchTerm,
    page_number: '0',
    format: 'json',
    region: 'KR',
    language: 'ko',
  };

  try {
    const response = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumerKey,
        consumerSecret,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // 응답 파싱
    if (data.foods && data.foods.food) {
      const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
      return foods.map(f => ({
        id: f.food_id,
        name: f.food_name,
        type: f.food_type || 'Generic',
        servings: f.servings || { serving: [] },
      }));
    }

    return [];
  } catch (error) {
    console.error('[fatsecret-api] searchFatSecretFood:', error);
    throw error;
  }
}

/**
 * FatSecret 음식 상세 정보 조회 (영양 정보)
 * @param {string} foodId 음식 ID
 * @returns {Promise<object>} 음식 상세 정보
 */
export async function getFatSecretFoodDetails(foodId) {
  const consumerKey = localStorage.getItem('fs_consumer_key') || '';
  const consumerSecret = localStorage.getItem('fs_consumer_secret') || '';

  if (!consumerKey || !consumerSecret) {
    throw new Error('FatSecret 자격증명이 설정되지 않았습니다.');
  }

  const params = {
    method: 'food.get',
    food_id: foodId,
    format: 'json',
  };

  try {
    const response = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumerKey,
        consumerSecret,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[fatsecret-api] getFatSecretFoodDetails:', error);
    throw error;
  }
}

/**
 * 서빙 정보에서 영양 정보 추출 (100g 기준으로 정규화)
 * @param {object} servings 서빙 정보
 * @returns {object} 100g당 영양 정보 {kcal, protein, carbs, fat}
 */
export function extractNutritionPer100g(servings) {
  if (!servings || !servings.serving) return null;

  const servingList = Array.isArray(servings.serving) ? servings.serving : [servings.serving];

  // 100g 서빙 찾기
  const serving100g = servingList.find(s =>
    parseInt(s.serving_size) === 100 ||
    (s.serving_size_unit && s.serving_size_unit.includes('g') && parseInt(s.serving_size) === 100)
  );

  if (!serving100g) {
    // 첫 번째 서빙 사용 후 100g로 정규화
    const first = servingList[0];
    const servingSize = parseInt(first.serving_size) || 100;
    const ratio = 100 / servingSize;

    return {
      kcal: Math.round(parseFloat(first.calories) * ratio),
      protein: Math.round(parseFloat(first.protein) * ratio * 10) / 10,
      carbs: Math.round(parseFloat(first.carbohydrate) * ratio * 10) / 10,
      fat: Math.round(parseFloat(first.fat) * ratio * 10) / 10,
    };
  }

  return {
    kcal: Math.round(parseFloat(serving100g.calories) || 0),
    protein: Math.round(parseFloat(serving100g.protein) * 10) / 10 || 0,
    carbs: Math.round(parseFloat(serving100g.carbohydrate) * 10) / 10 || 0,
    fat: Math.round(parseFloat(serving100g.fat) * 10) / 10 || 0,
  };
}
