// API Configuration
// Set USE_PYTHON_SERVER=true to use the Python cache proxy
// Set USE_PYTHON_SERVER=false to use Supabase directly

export const API_CONFIG = {
  USE_PYTHON_SERVER: false,
  PYTHON_SERVER_URL: 'http://localhost:8000',
  SUPABASE_URL: '',
  SUPABASE_KEY: '',
};

export const getApiBaseUrl = () => {
  if (API_CONFIG.USE_PYTHON_SERVER) {
    return API_CONFIG.PYTHON_SERVER_URL;
  }
  return API_CONFIG.SUPABASE_URL;
};

export const getApiHeaders = (supabaseKey) => {
  const key = supabaseKey || API_CONFIG.SUPABASE_KEY;
  
  if (API_CONFIG.USE_PYTHON_SERVER) {
    return {
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
};

export const apiRequest = async (endpoint, options = {}, supabaseKey) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    ...getApiHeaders(supabaseKey),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
