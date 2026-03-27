// ================================================================
// api/fatsecret-proxy.js — FatSecret OAuth1 Proxy
// Vercel Serverless Function
// ================================================================

const crypto = require('crypto');

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

module.exports = async function handler(req, res) {
  // CORS 헤더 설정 (모든 요청에 먼저 설정)
  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // JSON 바디 파싱 (Vercel은 자동 파싱 안 함)
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    } else if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString('utf-8'));
    } else if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const { consumerKey, consumerSecret, params } = body;

    console.log('[fatsecret-proxy] 수신 body:', JSON.stringify(body, null, 2));
    console.log('[fatsecret-proxy] 수신:', {
      consumerKey: consumerKey ? '있음' : '없음',
      consumerSecret: consumerSecret ? '있음' : '없음',
      params: params ? '있음' : '없음',
      paramsKeys: params ? Object.keys(params) : []
    });

    if (!consumerKey || !consumerSecret) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    if (!params || !params.method) {
      return res.status(400).json({ error: 'Missing method parameter' });
    }

    // FatSecret OAuth1 서명 생성
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const signature = generateOAuth1Signature(
      'POST',
      'https://platform.fatsecret.com/rest/server.api',
      params,
      consumerKey,
      consumerSecret,
      nonce,
      timestamp
    );

    const authHeader = generateAuthHeader(consumerKey, signature, nonce, timestamp);

    // FatSecret API 호출
    const formData = new URLSearchParams(params);
    const bodyString = formData.toString();

    console.log('[fatsecret-proxy] 서명:', {
      signature: signature.substring(0, 20) + '...',
      authHeader: authHeader.substring(0, 50) + '...',
      body: bodyString,
    });

    const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyString,
    });

    const data = await response.json();
    console.log('[fatsecret-proxy] FatSecret 응답:', data);

    if (!response.ok || data.error) {
      console.error('[fatsecret-proxy] 에러:', data.error || response.statusText);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[fatsecret-proxy]', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * OAuth1 HMAC-SHA1 서명 생성
 */
function generateOAuth1Signature(method, url, params, consumerKey, consumerSecret, nonce, timestamp) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...params };
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&`;

  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.update(baseString);
  return hmac.digest('base64');
}

/**
 * OAuth 인증 헤더 생성
 */
function generateAuthHeader(consumerKey, signature, nonce, timestamp) {
  const header = [
    `oauth_consumer_key="${encodeURIComponent(consumerKey)}"`,
    `oauth_nonce="${encodeURIComponent(nonce)}"`,
    `oauth_signature="${encodeURIComponent(signature)}"`,
    `oauth_signature_method="HMAC-SHA1"`,
    `oauth_timestamp="${timestamp}"`,
    `oauth_version="1.0"`,
  ].join(', ');

  return `OAuth ${header}`;
}
