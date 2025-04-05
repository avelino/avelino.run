const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Em produção, você carregaria a chave pública dos servidores remotos
// Esta é uma simulação simplificada para verificação
async function verifySignature(request) {
  const signature = request.headers.signature;

  if (!signature) {
    return false;
  }

  // Extrair parâmetros da assinatura
  const signatureParams = {};
  signature.split(',').forEach(part => {
    const [key, value] = part.split('=');
    signatureParams[key.trim()] = value.replace(/^"/, '').replace(/"$/, '');
  });

  // Obter a chave pública do servidor remoto via keyId
  // Na implementação real, você buscaria a chave pública do servidor remoto
  try {
    // Obter a chave pública do keyId
    const keyIdUrl = signatureParams.keyId;
    const response = await axios.get(keyIdUrl, {
      headers: { 'Accept': 'application/activity+json' }
    });

    const publicKey = response.data.publicKey?.publicKeyPem;
    if (!publicKey) {
      console.log('Public key not found');
      return false;
    }

    // Reconstruir a string de assinatura
    const headerNames = signatureParams.headers.split(' ');
    const signingString = headerNames.map(header => {
      if (header === '(request-target)') {
        return `(request-target): ${request.method.toLowerCase()} ${request.path}`;
      }
      return `${header}: ${request.headers[header]}`;
    }).join('\n');

    // Verificar a assinatura
    const verifier = crypto.createVerify('sha256');
    verifier.update(signingString);
    return verifier.verify(publicKey, signatureParams.signature, 'base64');
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// Processamento de atividades
function processActivity(activity) {
  console.log('Processing activity:', activity.type);

  // Aqui você processaria a atividade (follow, like, etc.)
  // Como o site é estático, você pode querer:
  // 1. Armazenar em banco de dados serverless (Fauna, Supabase)
  // 2. Enviar para um webhook externo para processamento
  // 3. Armazenar em um arquivo como backup (para sites estáticos)

  // Exemplo para 'Follow'
  if (activity.type === 'Follow') {
    // Auto-aceitar follow
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'id': `https://avelino.run/activities/${Date.now()}`,
      'type': 'Accept',
      'actor': 'https://avelino.run/users/hey',
      'object': activity
    };
  }

  return null;
}

exports.handler = async (event) => {
  // Aceitar apenas POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verificar Content-Type
  if (!event.headers['content-type']?.includes('application/activity+json') &&
      !event.headers['content-type']?.includes('application/ld+json')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid Content-Type' })
    };
  }

  try {
    const activity = JSON.parse(event.body);

    // Verificar assinatura (opcional em alguns casos, mas recomendado)
    const signatureValid = await verifySignature({
      headers: event.headers,
      method: event.httpMethod,
      path: event.path,
      body: event.body
    });

    if (!signatureValid) {
      console.log('Signature verification failed but continuing for compatibility');
    }

    // Processar a atividade
    const response = processActivity(activity);

    // Se houver uma resposta (ex: Accept para Follow)
    if (response) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/activity+json'
        },
        body: JSON.stringify(response)
      };
    }

    // Resposta padrão
    return {
      statusCode: 202,
      body: JSON.stringify({ status: 'Accepted' })
    };
  } catch (error) {
    console.error('Error processing inbox request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};