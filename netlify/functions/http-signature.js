const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Carregar a chave privada do ambiente
// Em produção, use variáveis de ambiente do Netlify para armazenar a chave privada
// Para desenvolvimento local, usamos um arquivo
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/**
 * Cria uma assinatura HTTP para ActivityPub
 * @param {Object} event - Evento Netlify
 */
exports.handler = async (event) => {
  // Permitir apenas requisições POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { headers, method, path, body } = JSON.parse(event.body);

    // Criar uma string canônica para assinatura
    const date = new Date().toUTCString();
    const requestTarget = `${method.toLowerCase()} ${path}`;
    const digest = body ? `SHA-256=${crypto.createHash('sha256').update(body).digest('base64')}` : '';

    // Cabeçalhos para assinatura
    const headersToSign = ['(request-target)', 'host', 'date'];
    if (digest) headersToSign.push('digest');

    // Montar string de assinatura
    const signingString = headersToSign.map(header => {
      if (header === '(request-target)') return `(request-target): ${requestTarget}`;
      if (header === 'host') return `host: ${headers.host || 'avelino.run'}`;
      if (header === 'date') return `date: ${date}`;
      if (header === 'digest') return `digest: ${digest}`;
      return `${header}: ${headers[header] || ''}`;
    }).join('\n');

    // Assinar a string com a chave privada
    const signature = crypto.createSign('sha256')
      .update(signingString)
      .sign(PRIVATE_KEY, 'base64');

    // Criar cabeçalho de assinatura
    const signatureHeader = `keyId="https://avelino.run/users/hey#main-key",algorithm="rsa-sha256",headers="${headersToSign.join(' ')}",signature="${signature}"`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        signature: signatureHeader,
        'signature-input': headersToSign.join(' '),
        date: date,
        digest: digest || undefined
      })
    };
  } catch (error) {
    console.error('Error creating signature:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create signature' })
    };
  }
};