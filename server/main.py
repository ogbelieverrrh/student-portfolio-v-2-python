"""
Python FastAPI Server - Optimized Caching Proxy for Supabase
High-performance server with advanced caching, compression, and optimization.
"""

import os
import json
import time
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
from collections import OrderedDict
from functools import lru_cache

from fastapi import FastAPI, HTTPException, Request, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, FileResponse
from fastapi.staticfiles import StaticFiles
import httpx
import asyncio

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# ============== OPTIMIZED CACHE ==============
class OptimizedCache:
    """High-performance LRU cache with TTL and stale-while-revalidate support"""
    
    def __init__(self, max_size: int = 500):
        self.cache: OrderedDict = OrderedDict()
        self.max_size = max_size
        self.ttl_seconds = 60  # Longer TTL for better performance
        self.stale_ttl = 120  # Allow stale cache after TTL expires
        self.hits = 0
        self.misses = 0
        self._lock = asyncio.Lock()
    
    async def get(self, key: str, allow_stale: bool = True) -> Optional[Any]:
        async with self._lock:
            if key in self.cache:
                entry = self.cache[key]
                age = time.time() - entry['timestamp']
                
                # Fresh cache hit
                if age < self.ttl_seconds:
                    self.cache.move_to_end(key)
                    self.hits += 1
                    entry['hits'] = entry.get('hits', 0) + 1
                    return {**entry['data'], '_cache_status': 'fresh'}
                
                # Stale cache hit (still usable)
                elif allow_stale and age < self.stale_ttl:
                    self.cache.move_to_end(key)
                    self.hits += 1
                    return {**entry['data'], '_cache_status': 'stale'}
                
                # Cache expired
                else:
                    del self.cache[key]
            
            self.misses += 1
            return None
    
    async def set(self, key: str, data: Any, ttl: int = None):
        async with self._lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            
            self.cache[key] = {
                'data': data, 
                'timestamp': time.time(),
                'ttl': ttl or self.ttl_seconds,
                'hits': 0
            }
            
            # Evict oldest if over max size
            if len(self.cache) > self.max_size:
                self.cache.popitem(last=False)
    
    async def delete(self, key: str):
        async with self._lock:
            if key in self.cache:
                del self.cache[key]
    
    async def clear(self):
        async with self._lock:
            self.cache.clear()
            self.hits = 0
            self.misses = 0
    
    def get_stats(self) -> Dict:
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate:.1f}%",
            "ttl_seconds": self.ttl_seconds
        }

cache = OptimizedCache(max_size=500)

# ============== HTTP CLIENT POOL ==============
class HTTPClientPool:
    """Shared HTTP client with connection pooling"""
    
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
    
    async def get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                limits=httpx.Limits(
                    max_connections=100,
                    max_keepalive_connections=20,
                    keepalive_expiry=30
                ),
                follow_redirects=True
            )
        return self._client
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

http_pool = HTTPClientPool()

# ============== SUPABASE HEADERS ==============
def get_headers(extra_headers: Dict[str, str] = None) -> Dict[str, str]:
    """Base headers function"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    if extra_headers:
        forward_headers = ['prefer', 'range', 'if-none-match']
        for k, v in extra_headers.items():
            if k.lower() in forward_headers:
                headers[k] = v
    return headers

def get_anon_headers(extra_headers: Dict[str, str] = None) -> Dict[str, str]:
    """Headers for anonymous requests"""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
    }
    if extra_headers:
        # Only forward specific safe headers
        forward_headers = ['prefer', 'range', 'if-none-match']
        for k, v in extra_headers.items():
            if k.lower() in forward_headers:
                headers[k] = v
    return headers

# ============== CACHE KEY GENERATOR ==============
def make_cache_key(endpoint: str, params: dict = None, body: bytes = None) -> str:
    """Generate a unique cache key"""
    key_parts = [endpoint]
    
    if params:
        sorted_params = sorted(params.items())
        key_parts.append('_'.join(f'{k}={v}' for k, v in sorted_params))
    
    if body:
        body_hash = hashlib.md5(body).hexdigest()[:8]
        key_parts.append(f'body={body_hash}')
    
    return ':'.join(key_parts)

# ============== LIFESPAN ==============
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Optimized FastAPI Cache Proxy Server...")
    print(f"📡 Connected to Supabase: {SUPABASE_URL[:40]}...")
    print(f"⚡ Cache: {cache.max_size} entries, {cache.ttl_seconds}s TTL")
    yield
    await http_pool.close()
    print("🛑 Server shutdown complete")

# ============== APP SETUP ==============
app = FastAPI(
    title="Student Portfolio API - Optimized",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== PROXY ENDPOINT ==============
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy(path: str, request: Request, 
               cache_control: str = Header(None),
               x_cache_bypass: str = Header(None)):
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    full_url = f"{SUPABASE_URL}/rest/v1/{path}"
    params = dict(request.query_params)
    
    # Check cache for GET requests
    cache_key = make_cache_key(full_url, params)
    cache_bypass = x_cache_bypass == "true" or cache_control == "no-cache"
    
    if request.method == "GET" and not cache_bypass:
        cached = await cache.get(cache_key)
        if cached:
            status = cached.pop('_cache_status', 'hit')
            headers = {"X-Cache": status.upper(), "X-Cache-Hit": "true"}
            return JSONResponse(content=cached, headers=headers)
    
    # Forward request to Supabase
    client = await http_pool.get_client()

    # Extract headers to forward
    request_headers = dict(request.headers)
    supabase_headers = get_anon_headers(request_headers)
    
    try:
        if request.method == "GET":
            response = await client.get(full_url, headers=supabase_headers, params=params)
        elif request.method == "POST":
            body = await request.body()
            cache_key = make_cache_key(full_url, params, body)
            response = await client.post(full_url, headers=supabase_headers, params=params, content=body)
        elif request.method == "PUT":
            body = await request.body()
            response = await client.put(full_url, headers=supabase_headers, params=params, content=body)
        elif request.method == "PATCH":
            body = await request.body()
            response = await client.patch(full_url, headers=supabase_headers, params=params, content=body)
        elif request.method == "DELETE":
            response = await client.delete(full_url, headers=supabase_headers, params=params)
        else:
            raise HTTPException(status_code=405, detail="Method not allowed")
        
        if response.status_code >= 400:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        # Handle empty responses (like 204 No Content)
        if response.status_code == 204 or not response.content:
            data = [] if request.method == "GET" else {}
        else:
            try:
                data = response.json()
            except json.JSONDecodeError:
                data = {"message": response.text}
        
        # Cache GET responses
        if request.method == "GET" and isinstance(data, list):
            await cache.set(cache_key, data)
        
        # Invalidate related caches on write
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            await invalidate_related_caches(path)
        
        return JSONResponse(content=data, status_code=response.status_code)
        
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Gateway Timeout - Supabase slow")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Cannot connect to Supabase")

async def invalidate_related_caches(path: str):
    """Invalidate caches that might be affected by a write"""
    # For now, just clear relevant prefixes
    if "files" in path:
        keys_to_delete = [k for k in cache.cache.keys() if "files" in k]
        for key in keys_to_delete:
            await cache.delete(key)
    elif "students" in path:
        keys_to_delete = [k for k in cache.cache.keys() if "students" in k]
        for key in keys_to_delete:
            await cache.delete(key)

# ============== BATCH ENDPOINT ==============
@app.post("/api/batch")
async def batch_request(requests: List[Dict[str, Any]]):
    """Execute multiple database queries in parallel"""
    results = []
    client = await http_pool.get_client()
    
    tasks = []
    endpoints = []
    
    for req in requests:
        endpoint = req.get('endpoint', '')
        params = req.get('params', {})
        full_url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
        
        cache_key = make_cache_key(full_url, params)
        
        # Check cache first
        cached = await cache.get(cache_key, allow_stale=False)
        if cached:
            results.append({'data': cached, '_cached': True})
            continue
        
        task = client.get(full_url, headers=get_headers(), params=params)
        tasks.append(task)
        endpoints.append({'index': len(results), 'cache_key': cache_key})
        results.append({})  # Placeholder
    
    # Execute uncached requests in parallel
    if tasks:
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, response in enumerate(responses):
            task_info = endpoints[i]
            idx = task_info['index']
            cache_key = task_info['cache_key']
            
            if isinstance(response, Exception):
                results[idx] = {'error': str(response)}
            else:
                try:
                    data = response.json()
                    results[idx] = {'data': data}
                    await cache.set(cache_key, data)
                except:
                    results[idx] = {'error': 'Failed to parse response'}
    
    return results

# ============== OPTIMIZED FILE ENDPOINTS ==============
@app.get("/api/students/{student_id}/files")
async def get_student_files(
    student_id: str,
    request: Request,
    type: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    cache_control: str = Header(None)
):
    """Get files for a specific student with caching"""
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
    cache_bypass = cache_control == "no-cache"
    
    if not cache_bypass:
        cached = await cache.get(cache_key)
        if cached:
            return JSONResponse(content=cached, headers={"X-Cache": "HIT"})
    
    client = await http_pool.get_client()
    response = await client.get(
        f"{SUPABASE_URL}/rest/v1/files",
        headers=get_headers(dict(request.headers)),
        params=params
    )
    
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
    data = response.json()
    await cache.set(cache_key, data)
    return data

@app.get("/api/teachers/{teacher_id}/students")
async def get_teacher_students(teacher_id: str, request: Request):
    """Get students for a teacher with caching"""
    cache_key = f"teachers/{teacher_id}/students"
    
    cached = await cache.get(cache_key)
    if cached:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})
    
    client = await http_pool.get_client()
    response = await client.get(
        f"{SUPABASE_URL}/rest/v1/students",
        headers=get_headers(dict(request.headers)),
        params={'select': '*', 'order': 'name.asc'}
    )
    
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    
    data = response.json()
    await cache.set(cache_key, data)
    return data

@app.get("/api/dashboard/{user_id}")
async def get_dashboard_data(user_id: str, request: Request, role: str = Query("student")):
    """Optimized endpoint - fetch all dashboard data in one go"""
    cache_key = f"dashboard/{user_id}/{role}"
    
    cached = await cache.get(cache_key)
    if cached:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})
    
    client = await http_pool.get_client()
    
    extra_headers = dict(request.headers)
    if role == "student":
        # Fetch student data
        tasks = [
            client.get(f"{SUPABASE_URL}/rest/v1/files", headers=get_headers(extra_headers),
                      params={'student_id': f'eq.{user_id}', 'select': '*', 'order': 'created_at.desc', 'limit': 50}),
            client.get(f"{SUPABASE_URL}/rest/v1/shares", headers=get_headers(extra_headers),
                      params={'recipient_id': f'eq.{user_id}', 'select': '*'}),
            client.get(f"{SUPABASE_URL}/rest/v1/notifications", headers=get_headers(extra_headers),
                      params={'user_id': f'eq.{user_id}', 'order': 'created_at.desc', 'limit': 20}),
        ]
    else:
        # Fetch teacher/admin data
        tasks = [
            client.get(f"{SUPABASE_URL}/rest/v1/students", headers=get_headers(extra_headers), params={'select': '*'}),
            client.get(f"{SUPABASE_URL}/rest/v1/files", headers=get_headers(extra_headers), params={'select': '*', 'limit': 100}),
            client.get(f"{SUPABASE_URL}/rest/v1/shares", headers=get_headers(extra_headers), params={'select': '*'}),
        ]
    
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    result = {"role": role, "data": {}}
    
    for i, response in enumerate(responses):
        if isinstance(response, Exception):
            result["data"][f"error_{i}"] = str(response)
        else:
            try:
                result["data"][f"data_{i}"] = response.json()
            except:
                result["data"][f"error_{i}"] = "Parse error"
    
    await cache.set(cache_key, result, ttl=30)  # Shorter TTL for dynamic data
    return result

# ============== CACHE MANAGEMENT ==============
@app.post("/api/cache/clear")
async def clear_cache():
    """Clear the cache"""
    await cache.clear()
    return {"message": "Cache cleared successfully"}

@app.post("/api/cache/invalidate")
async def invalidate_cache(pattern: str = Query(...)):
    """Invalidate cache entries matching a pattern"""
    keys_to_delete = [k for k in cache.cache.keys() if pattern in k]
    for key in keys_to_delete:
        await cache.delete(key)
    return {"message": f"Invalidated {len(keys_to_delete)} entries", "pattern": pattern}

@app.get("/api/cache/stats")
async def cache_stats():
    """Get detailed cache statistics"""
    return cache.get_stats()

# ============== HEALTH CHECK ==============
@app.get("/health")
async def health_check():
    """Enhanced health check"""
    client = await http_pool.get_client()
    
    # Test Supabase connection
    supabase_ok = False
    try:
        response = await client.get(f"{SUPABASE_URL}/rest/v1/", 
                                     headers=get_anon_headers(),
                                     params={'limit': 1})
        supabase_ok = response.status_code < 500
    except:
        pass
    
    return {
        "status": "healthy" if supabase_ok else "degraded",
        "timestamp": datetime.now().isoformat(),
        "supabase_connected": supabase_ok,
        "cache": cache.get_stats(),
        "version": "2.0.0"
    }

# ============== SERVE FRONTEND ==============
# Try to mount the build directory if it exists
build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "build"))
static_dir = os.path.join(build_dir, "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Check if this is an API or health route - let those be handled by their own handlers
    if full_path.startswith("api/") or full_path == "api" or full_path == "health":
        raise HTTPException(status_code=404)

    # Check if the requested path exists as a file in the build directory
    file_path = os.path.join(build_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # Fallback to index.html for SPA routing
    index_path = os.path.join(build_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    raise HTTPException(status_code=404, detail="Not found")

@app.get("/")
async def root():
    index_path = os.path.join(build_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "name": "Student Portfolio API - Optimized",
        "version": "2.0.0",
        "message": "Frontend not built. API is running.",
        "endpoints": {
            "proxy": "/api/{path}",
            "batch": "/api/batch",
            "cache": "/api/cache/{stats|clear|invalidate}",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    
    # Optimized uvicorn settings
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        workers=1,
        limit_concurrency=100,
        limit_max_requests=1000,
        access_log=False
    )
