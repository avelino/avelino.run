const { Resend } = require('resend');

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey) {
    return jsonResponse(500, { error: 'Missing RESEND_API_KEY environment variable' });
  }
  if (!audienceId) {
    return jsonResponse(500, { error: 'Missing RESEND_AUDIENCE_ID environment variable' });
  }

  try {
    const { email, firstName, lastName } = JSON.parse(event.body || '{}');

    if (!email || typeof email !== 'string') {
      return jsonResponse(400, { error: 'Email is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(trimmedEmail)) {
      return jsonResponse(400, { error: 'Invalid email' });
    }

    const resend = new Resend(apiKey);

    const payload = {
      email: trimmedEmail,
      firstName: firstName ? String(firstName).trim() : undefined,
      lastName: lastName ? String(lastName).trim() : undefined,
      unsubscribed: false,
      audienceId
    };

    const { data, error } = await resend.contacts.create(payload);

    if (error) {
      return jsonResponse(400, { error: error.message || 'Failed to subscribe' });
    }

    return jsonResponse(200, { success: true, id: data?.id });
  } catch (err) {
    return jsonResponse(500, { error: 'Internal Server Error' });
  }
};


