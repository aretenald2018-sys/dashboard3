// ================================================================
// api/korean-food-proxy.js — 한국 공공 API 프록시
// Vercel Serverless Function
// ================================================================

module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // JSON 바디 파싱
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    } else if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString('utf-8'));
    }

    const { apiKey, searchTerm } = body;

    console.log('[korean-food-proxy] 수신:', {
      apiKey: apiKey ? '있음' : '없음',
      searchTerm,
    });

    if (!apiKey || !searchTerm) {
      return res.status(400).json({ error: 'Missing apiKey or searchTerm' });
    }

    // 공공데이터포털 API 호출 (GET 방식, Inq02 사용)
    const url = `https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo01/getFoodNtrCpntDbInq02?serviceKey=${apiKey}&FOOD_NM_KR=${encodeURIComponent(searchTerm)}&pageNo=1&numOfRows=20&type=json`;

    console.log('[korean-food-proxy] API 호출:', url.substring(0, 100) + '...');

    const response = await fetch(url);
    const text = await response.text();

    console.log('[korean-food-proxy] 응답 상태:', response.status);
    console.log('[korean-food-proxy] 응답 길이:', text.length);
    console.log('[korean-food-proxy] 응답 처음:', text.substring(0, 200));

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[korean-food-proxy] JSON 파싱 오류:', parseError.message);
      console.error('[korean-food-proxy] 응답 전체:', text);
      return res.status(500).json({
        error: 'API 응답이 유효하지 않음',
        details: text.substring(0, 500)
      });
    }

    console.log('[korean-food-proxy] 파싱된 데이터:', {
      hasBody: !!data.body,
      itemCount: data.body?.items ? (Array.isArray(data.body.items) ? data.body.items.length : 1) : 0,
    });

    // 응답 파싱
    if (data.body && data.body.items) {
      const items = Array.isArray(data.body.items) ? data.body.items : [data.body.items];
      return res.status(200).json({ items });
    }

    return res.status(200).json({ items: [] });
  } catch (error) {
    console.error('[korean-food-proxy]', error);
    return res.status(500).json({ error: error.message });
  }
};
