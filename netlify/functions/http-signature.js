const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Obter a chave privada com melhor tratamento de erro
function getPrivateKey() {
  // Primeira opção: variável de ambiente (produção)
  if (process.env.PRIVATE_KEY) {
    console.log("Using private key from environment variable");
    return process.env.PRIVATE_KEY;
  }

  // Segunda opção: arquivo local (desenvolvimento)
  try {
    const keyPath = path.join(__dirname, '../../private.pem');
    if (fs.existsSync(keyPath)) {
      console.log("Using private key from file");
      return fs.readFileSync(keyPath, 'utf8');
    }
  } catch (err) {
    console.error("Error reading private key file:", err);
  }

  // Fallback: chave de exemplo para desenvolvimento (NÃO USE EM PRODUÇÃO)
  console.warn("WARNING: Using fallback development key - NOT SECURE FOR PRODUCTION");
  return `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC4oFuIQiZy8DTL
3QRRdzNqfABXSriBZTiEKajPr9s5OVmVJkn0j2aHy5AIJ0IJQuTm3/46Lqt2fErl
g3j47t36DWOitzJsTPUr3n4KqQQtPpHAREY7PvYNn5xWbHjC7ZtYJaXqxsaBxC5M
hrvB4l+W+UZDyEciAHH8R0KIEsTC5vPCbuLeR5zqMvl/XoU0/p3ieYmrh97wAALk
sMstvL2wCoQdp4EbudvrWYLk9Kw7DiMQj4r3IfiKGf8CwNP6cb4SVXQ...
-----END PRIVATE KEY-----`;
}

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
    // Obter a chave privada
    const PRIVATE_KEY = getPrivateKey();

    if (!PRIVATE_KEY || PRIVATE_KEY.trim() === '') {
      throw new Error('Private key is missing or empty');
    }

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
    console.error('Error creating signature:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create signature',
        details: error.message
      })
    };
  }
};