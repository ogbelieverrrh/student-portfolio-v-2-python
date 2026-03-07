"""
Python FastAPI Server - Caching Proxy for Supabase
This server caches and optimizes database requests to speed up the React app.
"""

import os
import json
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import asyncio
from collections import OrderedDict

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Simple in-memory cache with TTL
class Cache:
    def __init__(self, max_size: int = 100):
        self.cache: OrderedDict = OrderedDict()
        self.max_size = max_size
        self.ttl_seconds = 30  # Cache TTL in seconds
    
    def get(self, key: str) -> Optional[Dict]:
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['timestamp'] < self.ttl_seconds:
                self.cache.move_to_end(key)
                return entry['data']
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, data: Dict):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = {'data': data, 'timestamp': time.time()}
        if len(self.cache) > self.max_size:
            self.cache.popitem(last=False)
    
    def clear(self):
        self.cache.clear()

cache = Cache(max_size=200)

# Supabase headers
def get_headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting FastAPI Cache Proxy Server...")
    print(f"📡 Connected to Supabase: {SUPABASE_URL[:30]}...")
    yield
    # Shutdown
    print("🛑 Shutting down...")

app = FastAPI(title="Student Portfolio API Proxy", lifespan=lifespan)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache key generator
def make_cache_key(endpoint: str, params: dict = None) -> str:
    if params:
        sorted_params = sorted(params.items())
        return f"{endpoint}?{'_'.join(f'{k}={v}' for k,v in sorted_params)}"
    return endpoint

# Proxy endpoint for Supabase REST API
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy(path: str, request: Request):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    # Build the full URL
    full_url = f"{SUPABASE_URL}/rest/v1/{path}"
    
    # Get query params
    params = dict(request.query_params)
    
    # Check cache for GET requests
    cache_key = make_cache_key(full_url, params)
    if request.method == "GET":
        cached = cache.get(cache_key)
        if cached:
            print(f"📦 Cache hit: {path}")
            return JSONResponse(content=cached, headers={"X-Cache": "HIT"})
    
    # Forward request to Supabase
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            headers = get_headers()
            
            if request.method == "GET":
                response = await client.get(full_url, headers=headers, params=params)
            elif request.method == "POST":
                body = await request.body()
                response = await client.post(full_url, headers=headers, params=params, content=body)
            elif request.method == "PUT":
                body = await request.body()
                response = await client.put(full_url, headers=headers, params=params, content=body)
            elif request.method == "PATCH":
                body = await request.body()
                response = await client.patch(full_url, headers=headers, params=params, content=body)
            elif request.method == "DELETE":
                response = await client.delete(full_url, headers=headers, params=params)
            else:
                raise HTTPException(status_code=405, detail="Method not allowed")
            
            if response.status_code >= 400:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            data = response.json()
            
            # Cache GET responses
            if request.method == "GET" and isinstance(data, list):
                cache.set(cache_key, data)
                print(f"💾 Cached: {path} ({len(data)} items)")
            
            return JSONResponse(content=data)
            
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Gateway Timeout")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Batch endpoint - fetch multiple tables in one request
@app.post("/api/batch")
async def batch_request(requests: List[Dict[str, Any]]):
    """Execute multiple database queries in parallel"""
    results = []
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = []
        for req in requests:
            endpoint = req.get('endpoint', '')
            params = req.get('params', {})
            full_url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
            
            task = client.get(full_url, headers=get_headers(), params=params)
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                results.append({'error': str(response)})
            else:
                try:
                    data = response.json()
                    results.append({'data': data})
                except:
                    results.append({'error': 'Failed to parse response'})
    
    return results

# Optimized student data fetch
@app.get("/api/students/{student_id}/files")
async def get_student_files(
    student_id: str,
    type: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0)
):
    """Get files for a specific student with optional filtering"""
    params = {
        'student_id': f'eq.{student_id}',
        'select': '*',
        'order': 'created_at.desc',
        'limit': limit,
        'offset': offset
    }
    
    if type:
        params['type'] = f'eq.{type}'
    
    cache_key = make_cache_key(f"students/{student_id}/files", params)
    cached = cache.get(cache_key)
    if cached:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/files",
            headers=get_headers(),
            params=params
        )
        
        if response.status_code >= 400:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        data = response.json()
        cache.set(cache_key, data)
        return data

# Cache management
@app.post("/api/cache/clear")
async def clear_cache():
    """Clear the cache"""
    cache.clear()
    return {"message": "Cache cleared"}

@app.get("/api/cache/stats")
async def cache_stats():
    """Get cache statistics"""
    return {
        "size": len(cache.cache),
        "max_size": cache.max_size,
        "ttl_seconds": cache.ttl_seconds
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "supabase_connected": bool(SUPABASE_URL and SUPABASE_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
