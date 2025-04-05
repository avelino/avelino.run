const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Endpoints estáticos vs dinâmicos
const STATIC_ENDPOINTS = [
  '/users/hey',
  '/.well-known/webfinger',
  '/outbox',
  '/followers',
  '/following'
];

// Endpoints que precisam de assinatura (funções dinâmicas)
const DYNAMIC_ENDPOINTS = [
  '/inbox'
];

// URL base do site
const BASE_URL = 'https://avelino.run';

// Função para assinar requests de saída usando o serviço de assinatura
async function signRequest(method, path, headers = {}, body = null) {
  try {
    const requestData = {
      method,
      path,
      headers,
      body: body ? JSON.stringify(body) : null
    };

    const response = await axios.post('/.netlify/functions/http-signature', requestData);
    return response.data;
  } catch (error) {
    console.error('Error signing request:', error);
    throw new Error('Failed to sign request');
  }
}

exports.handler = async (event) => {
  const { path } = event;
  const accept = event.headers.accept || '';
  const isActivityPubRequest =
    accept.includes('application/activity+json') ||
    accept.includes('application/ld+json');

  // Roteamento baseado no path
  let targetPath = path;

  // 1. Verifica se é um endpoint estático
  if (STATIC_ENDPOINTS.some(endpoint => targetPath.startsWith(endpoint))) {
    // Se for uma requisição ActivityPub para recurso estático
    if (isActivityPubRequest) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/activity+json',
          'Cache-Control': 'public, max-age=300' // Cache de 5 minutos
        },
        // Redireciona para o arquivo estático
        body: JSON.stringify({
          redirect: `${BASE_URL}${targetPath}`
        })
      };
    }

    // Caso contrário, redireciona para o site normal
    return {
      statusCode: 301,
      headers: {
        'Location': `${BASE_URL}${targetPath}`
      },
      body: ''
    };
  }

  // 2. Verifica se é um endpoint dinâmico
  if (DYNAMIC_ENDPOINTS.some(endpoint => targetPath.startsWith(endpoint))) {
    // Redireciona para a função específica
    const functionName = targetPath.split('/')[1]; // Ex: /inbox -> inbox

    // Para endpoints que requerem assinatura, adiciona assinatura
    if (event.httpMethod !== 'GET' && functionName === 'inbox') {
      try {
        // Assina a requisição quando necessário (POST/PUT/DELETE)
        const signatureData = await signRequest(
          event.httpMethod,
          targetPath,
          event.headers,
          event.body ? JSON.parse(event.body) : null
        );

        // Adiciona cabeçalhos de assinatura
        const headers = {
          'Content-Type': event.headers['content-type'] || 'application/activity+json',
          'Signature': signatureData.signature,
          'Date': signatureData.date
        };

        if (signatureData.digest) {
          headers['Digest'] = signatureData.digest;
        }

        // Proxy para a função específica
        return {
          statusCode: 200,
          headers,
          body: event.body || ''
        };
      } catch (error) {
        console.error('Error handling signed request:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to process signed request' })
        };
      }
    }

    // Redireciona para a função Netlify apropriada
    return {
      statusCode: 301,
      headers: {
        'Location': `/.netlify/functions/${functionName}`
      },
      body: ''
    };
  }

  // 3. Resposta padrão - não encontrado
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' })
  };
};