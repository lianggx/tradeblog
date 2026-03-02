const apiKeyRepository = require('../lib/repositories/apiKey');

export function requireApiKey(req) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return { authorized: false, error: 'API key is required' };
  }

  const key = apiKeyRepository.findByKey(apiKey);

  if (!key) {
    return { authorized: false, error: 'Invalid API key' };
  }

  apiKeyRepository.updateLastUsed(key.id);

  return { authorized: true, apiKey: key };
}
