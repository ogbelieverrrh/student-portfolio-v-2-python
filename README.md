# Student Portfolio v2 - Python Server Edition

This is an optimized version with a Python FastAPI caching proxy server.

## What's New

### 1. Python FastAPI Server (server/)
A caching proxy server that:
- Caches Supabase responses (30-second TTL)
- Batches multiple API requests
- Reduces client-server round trips
- Provides batch endpoint for parallel queries

### 2. Paginated File Lists
- Files are now loaded in pages (10 per page)
- Reduces initial load time
- Better UX with navigation controls

### 3. Optimized API Config
- Optional Python server mode
- Easy toggle between direct Supabase and cached proxy

## Quick Start

### Option 1: Use Direct Supabase (Default - Same as Original)
```bash
cd student-portfolio-v-2-python
npm install
npm start
```

### Option 2: Use Python Server (Faster)
1. Install Python dependencies:
```bash
cd server
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Supabase URL and Key
```

3. Start the Python server:
```bash
python main.py
# Server runs on http://localhost:8000
```

4. Enable Python server in React:
Edit `src/utils/apiConfig.js`:
```javascript
export const API_CONFIG = {
  USE_PYTHON_SERVER: true,
  ...
};
```

5. Start React:
```bash
npm start
```

## Features

| Feature | Status |
|---------|--------|
| Python Caching Proxy | ✅ |
| Batch API Requests | ✅ |
| Paginated File Lists | ✅ |
| All Original Features | ✅ |

## Architecture

```
[React App] <-> [Python Server] <-> [Supabase]
                   (Cache)
```

## API Endpoints

- `GET /api/*` - Proxy to Supabase with caching
- `POST /api/batch` - Batch multiple requests
- `GET /api/students/{id}/files` - Optimized student files
- `POST /api/cache/clear` - Clear cache
- `GET /api/health` - Health check

## Fallback

The original version is in `student-portfolio-v-2/` - you can always go back if needed.
# student-portfolio-v-2-python
