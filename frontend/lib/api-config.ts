// API Configuration
export const API_CONFIG = {
  // Use environment variable if available, fallback to production URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    PREDICT: '/v1/predict',
    GENERATE: '/v1/generate', 
    TOKENIZE: '/v1/tokenize',
    ATTENTION: '/v1/attention',
    ATTENTION_HEAD_OUT: '/v1/attention/head-out',
    QKV: '/v1/qkv',
    MLP: '/v1/mlp',
    ABLATION: '/v1/ablation',
    JUDGE: '/v1/judge',
    MODELS: '/v1/models'
  }
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export individual endpoint URLs for convenience
export const API_URLS = {
  HEALTH: getApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
  PREDICT: getApiUrl(API_CONFIG.ENDPOINTS.PREDICT),
  GENERATE: getApiUrl(API_CONFIG.ENDPOINTS.GENERATE),
  TOKENIZE: getApiUrl(API_CONFIG.ENDPOINTS.TOKENIZE),
  ATTENTION: getApiUrl(API_CONFIG.ENDPOINTS.ATTENTION),
  ATTENTION_HEAD_OUT: getApiUrl(API_CONFIG.ENDPOINTS.ATTENTION_HEAD_OUT),
  QKV: getApiUrl(API_CONFIG.ENDPOINTS.QKV),
  MLP: getApiUrl(API_CONFIG.ENDPOINTS.MLP),
  ABLATION: getApiUrl(API_CONFIG.ENDPOINTS.ABLATION),
  JUDGE: getApiUrl(API_CONFIG.ENDPOINTS.JUDGE),
  MODELS: getApiUrl(API_CONFIG.ENDPOINTS.MODELS)
};
