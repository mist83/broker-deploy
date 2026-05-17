# Liskov File System - LLM Usage Guide

## Overview

Liskov File System provides a standalone HTTP API for file operations on S3 and local storage. This guide shows how to use the API from LLMs, scripts, and applications.

## Base Configuration

**API Base URL:** `https://6pgxmqlv2c7k4vdocaohnh2gk40wogxs.lambda-url.us-west-2.on.aws`

**Custom Domain (CNAME):** `https://liskov-filesystem.mikesendpoint.com`

**Authentication:** All requests require the `X-Liskov-Auth-Token` header

**Bucket Specification:** Provide bucket name via:
- Query parameter: `?bucket=bucket-name`
- Header: `X-Bucket-Name: bucket-name`

## Quick Start

### cURL Examples

```bash
# Set your auth token
AUTH_TOKEN="your-secret-token-here"
BUCKET="vizio-data-ingestion"

# List files
curl -H "X-Liskov-Auth-Token: $AUTH_TOKEN" \
  "https://liskov-filesystem.mikesendpoint.com/api/filesystem/list-prefix?bucket=$BUCKET&prefix=folder/"

# Read text file
curl -H "X-Liskov-Auth-Token: $AUTH_TOKEN" \
  "https://liskov-filesystem.mikesendpoint.com/api/filesystem/text?bucket=$BUCKET&path=file.txt"

# Write text file
curl -X POST \
  -H "X-Liskov-Auth-Token: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path":"test.txt","content":"Hello World"}' \
  "https://liskov-filesystem.mikesendpoint.com/api/filesystem/text?bucket=$BUCKET"

# Delete file
curl -X DELETE \
  -H "X-Liskov-Auth-Token: $AUTH_TOKEN" \
  "https://liskov-filesystem.mikesendpoint.com/api/filesystem?bucket=$BUCKET&path=test.txt"

# Check if file exists
curl -H "X-Liskov-Auth-Token: $AUTH_TOKEN" \
  "https://liskov-filesystem.mikesendpoint.com/api/filesystem/exists?bucket=$BUCKET&path=file.txt"

# Get file info
curl -H "X-Liskov-Auth-Token: $AUTH_TOKEN" \
  "https://liskov-filesystem.mikesendpoint.com/api/filesystem/info?bucket=$BUCKET&path=file.txt"
```

### JavaScript/Fetch Examples

```javascript
const API_BASE = 'https://liskov-filesystem.mikesendpoint.com';
const AUTH_TOKEN = 'your-secret-token-here';
const BUCKET = 'vizio-data-ingestion';

// Helper function for API calls
async function liskovAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'X-Liskov-Auth-Token': AUTH_TOKEN,
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response;
}

// List files
async function listFiles(prefix = '') {
  const response = await liskovAPI(
    `/api/filesystem/list-prefix?bucket=${BUCKET}&prefix=${prefix}`
  );
  return await response.json();
}

// Read text file
async function readTextFile(path) {
  const response = await liskovAPI(
    `/api/filesystem/text?bucket=${BUCKET}&path=${encodeURIComponent(path)}`
  );
  return await response.text();
}

// Write text file
async function writeTextFile(path, content) {
  await liskovAPI(`/api/filesystem/text?bucket=${BUCKET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content })
  });
}

// Delete file
async function deleteFile(path) {
  await liskovAPI(
    `/api/filesystem?bucket=${BUCKET}&path=${encodeURIComponent(path)}`,
    { method: 'DELETE' }
  );
}

// Upload binary file
async function uploadFile(path, file) {
  const formData = new FormData();
  formData.append('bucket', BUCKET);
  formData.append('path', path);
  formData.append('file', file);
  
  await liskovAPI('/api/filesystem/bytes', {
    method: 'POST',
    body: formData
  });
}

// Download binary file
async function downloadFile(path) {
  const response = await liskovAPI(
    `/api/filesystem/bytes?bucket=${BUCKET}&path=${encodeURIComponent(path)}`
  );
  return await response.blob();
}

// Usage examples
const files = await listFiles('documents/');
const content = await readTextFile('config.json');
await writeTextFile('output.txt', 'Generated content');
await deleteFile('temp.txt');
```

### Python Examples

```python
import requests
import json

API_BASE = 'https://liskov-filesystem.mikesendpoint.com'
AUTH_TOKEN = 'your-secret-token-here'
BUCKET = 'vizio-data-ingestion'

class LiskovClient:
    def __init__(self, base_url, auth_token, bucket):
        self.base_url = base_url
        self.headers = {'X-Liskov-Auth-Token': auth_token}
        self.bucket = bucket
    
    def list_files(self, prefix=''):
        url = f'{self.base_url}/api/filesystem/list-prefix'
        params = {'bucket': self.bucket, 'prefix': prefix}
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def read_text(self, path):
        url = f'{self.base_url}/api/filesystem/text'
        params = {'bucket': self.bucket, 'path': path}
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.text
    
    def write_text(self, path, content):
        url = f'{self.base_url}/api/filesystem/text'
        params = {'bucket': self.bucket}
        data = {'path': path, 'content': content}
        response = requests.post(url, headers=self.headers, params=params, json=data)
        response.raise_for_status()
    
    def delete_file(self, path):
        url = f'{self.base_url}/api/filesystem'
        params = {'bucket': self.bucket, 'path': path}
        response = requests.delete(url, headers=self.headers, params=params)
        response.raise_for_status()
    
    def file_exists(self, path):
        url = f'{self.base_url}/api/filesystem/exists'
        params = {'bucket': self.bucket, 'path': path}
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_file_info(self, path):
        url = f'{self.base_url}/api/filesystem/info'
        params = {'bucket': self.bucket, 'path': path}
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def upload_file(self, path, file_data):
        url = f'{self.base_url}/api/filesystem/bytes'
        files = {'file': file_data}
        data = {'bucket': self.bucket, 'path': path}
        response = requests.post(url, headers=self.headers, data=data, files=files)
        response.raise_for_status()
    
    def download_file(self, path):
        url = f'{self.base_url}/api/filesystem/bytes'
        params = {'bucket': self.bucket, 'path': path}
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.content

# Usage
client = LiskovClient(API_BASE, AUTH_TOKEN, BUCKET)

# List files
files = client.list_files('documents/')
print(f'Found {len(files)} files')

# Read/write text
content = client.read_text('config.json')
client.write_text('output.txt', 'Generated content')

# Check existence
exists = client.file_exists('important.txt')

# Get metadata
info = client.get_file_info('data.csv')
print(f'Size: {info["size"]} bytes')

# Upload/download binary
with open('local.pdf', 'rb') as f:
    client.upload_file('remote.pdf', f)

data = client.download_file('remote.pdf')
with open('downloaded.pdf', 'wb') as f:
    f.write(data)
```

## API Endpoints Reference

### File Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/filesystem/text` | GET | Read text file |
| `/api/filesystem/text` | POST | Write text file |
| `/api/filesystem/bytes` | GET | Download binary file |
| `/api/filesystem/bytes` | POST | Upload binary file |
| `/api/filesystem/exists` | GET | Check if file exists |
| `/api/filesystem` | DELETE | Delete file |
| `/api/filesystem/list` | GET | List files in directory |
| `/api/filesystem/list-prefix` | GET | List files with prefix |
| `/api/filesystem/info` | GET | Get file metadata |
| `/api/filesystem/copy` | POST | Copy file |
| `/api/filesystem/move` | POST | Move/rename file |
| `/api/filesystem/range` | GET | Read byte range |
| `/api/filesystem/tags` | GET | Get file tags |
| `/api/filesystem/tags` | POST | Add file tags |
| `/api/filesystem/health` | GET | Health check (no auth) |

### Common Parameters

**Query Parameters:**
- `bucket` - Bucket name (required on most endpoints)
- `path` - File path (required for file operations)
- `prefix` - Path prefix for listing operations
- `searchPattern` - File pattern for filtering (default: `*`)

**Headers:**
- `X-Liskov-Auth-Token` - Authentication token (required)
- `X-Bucket-Name` - Alternative bucket specification

## Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Bucket parameter required (query param 'bucket' or header 'X-Bucket-Name')"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters, invalid input)
- `401` - Unauthorized (missing or invalid auth token)
- `404` - File not found
- `500` - Server error

## Best Practices

1. **Always include auth token** - All endpoints except `/health` require authentication
2. **Specify bucket per request** - Allows working with multiple buckets
3. **URL encode paths** - Use `encodeURIComponent()` for file paths with special characters
4. **Handle errors gracefully** - Check response status and parse error messages
5. **Use appropriate endpoints** - Use `/text` for text files, `/bytes` for binary files
6. **Batch operations** - Use `/list-prefix` to get multiple files at once

## Security Notes

- Auth token is transmitted in headers (not URL)
- HTTPS recommended for production
- Token should be kept secret and rotated regularly
- No bucket-level permissions - token grants access to all buckets

## Rate Limiting

Currently no rate limiting is enforced. Use responsibly.

## Support

- **Web UI:** https://liskov-filesystem.mikesendpoint.com
- **Swagger API:** https://liskov-filesystem.mikesendpoint.com/swagger
- **Health Check:** https://liskov-filesystem.mikesendpoint.com/api/filesystem/health
