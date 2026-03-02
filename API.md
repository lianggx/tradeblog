# TradeBlog API 文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: API Key（Header: `X-API-Key`）
- **数据格式**: JSON

## 认证

所有需要认证的接口都需要在请求头中包含 API Key：

```http
X-API-Key: your-api-key-here
```

默认 API Key：`tradeblog-api-key-2024`（可在 `.env.local` 中修改）

## 文章接口

### 1. 获取文章列表

**请求**
```http
GET /api/articles?page=1&limit=10&categoryId=1&tagId=1
```

**参数**
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10
- `categoryId` (可选): 分类 ID
- `tagId` (可选): 标签 ID

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "文章标题",
      "content": "文章内容",
      "summary": "文章摘要",
      "cover_image": "https://example.com/image.jpg",
      "category_id": 1,
      "is_published": true,
      "is_featured": false,
      "created_at": "2024-02-28T08:00:00.000Z",
      "updated_at": "2024-02-28T08:00:00.000Z",
      "published_at": "2024-02-28T08:00:00.000Z",
      "category_name": "技术",
      "views": 100
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

### 2. 获取文章详情

**请求**
```http
GET /api/articles/:id
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    "content": "文章内容",
    "summary": "文章摘要",
    "cover_image": "https://example.com/image.jpg",
    "category_id": 1,
    "is_published": true,
    "is_featured": false,
    "created_at": "2024-02-28T08:00:00.000Z",
    "updated_at": "2024-02-28T08:00:00.000Z",
    "published_at": "2024-02-28T08:00:00.000Z",
    "category_name": "技术",
    "tags": [
      {
        "id": 1,
        "name": "技术",
        "slug": "技术",
        "created_at": "2024-02-28T08:00:00.000Z"
      }
    ],
    "stats": {
      "article_id": 1,
      "views": 100,
      "created_at": "2024-02-28T08:00:00.000Z"
    }
  }
}
```

### 3. 创建文章

**请求**
```http
POST /api/articles
Content-Type: application/json
X-API-Key: your-api-key
```

**请求体**
```json
{
  "title": "文章标题",
  "content": "<p>文章内容</p>",
  "summary": "文章摘要",
  "coverImage": "https://example.com/image.jpg",
  "categoryId": 1,
  "tags": ["技术", "生活"],
  "isPublished": true,
  "isFeatured": false
}
```

**参数说明**
- `title` (必填): 文章标题
- `content` (必填): 文章内容（HTML 格式）
- `summary` (可选): 文章摘要
- `coverImage` (可选): 封面图片 URL
- `categoryId` (可选): 分类 ID
- `tags` (可选): 标签数组
- `isPublished` (可选): 是否发布，默认 false
- `isFeatured` (可选): 是否精选，默认 false

**响应**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "文章标题",
    ...
  }
}
```

### 4. 更新文章

**请求**
```http
PUT /api/articles/:id
Content-Type: application/json
X-API-Key: your-api-key
```

**请求体**
```json
{
  "title": "更新后的标题",
  "content": "<p>更新后的内容</p>",
  "summary": "更新后的摘要",
  "coverImage": "https://example.com/new-image.jpg",
  "categoryId": 2,
  "tags": ["技术", "随笔"],
  "isPublished": true,
  "isFeatured": true
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "更新后的标题",
    ...
  }
}
```

### 5. 删除文章

**请求**
```http
DELETE /api/articles/:id
X-API-Key: your-api-key
```

**响应**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

### 6. 搜索文章

**请求**
```http
GET /api/articles/search?q=关键词&limit=20
```

**参数**
- `q` (必填): 搜索关键词
- `limit` (可选): 返回数量，默认 20

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "文章标题",
      "content": "文章内容",
      "summary": "文章摘要",
      "cover_image": "https://example.com/image.jpg",
      "category_id": 1,
      "is_published": true,
      "is_featured": false,
      "published_at": "2024-02-28T08:00:00.000Z",
      "category_name": "技术",
      "views": 100,
      "relevance": 0.5
    }
  ]
}
```

## 分类接口

### 获取所有分类

**请求**
```http
GET /api/categories
```

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "技术",
      "slug": "技术",
      "description": "技术相关文章",
      "created_at": "2024-02-28T08:00:00.000Z",
      "article_count": 10
    }
  ]
}
```

## 标签接口

### 获取所有标签

**请求**
```http
GET /api/tags
```

**响应**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "技术",
      "slug": "技术",
      "created_at": "2024-02-28T08:00:00.000Z",
      "article_count": 10
    }
  ]
}
```

## 统计接口

### 获取统计数据

**请求**
```http
GET /api/stats
```

**响应**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "totalViews": 1000,
    "popular": [
      {
        "id": 1,
        "title": "热门文章",
        "content": "文章内容",
        "summary": "文章摘要",
        "cover_image": "https://example.com/image.jpg",
        "category_id": 1,
        "is_published": true,
        "is_featured": false,
        "published_at": "2024-02-28T08:00:00.000Z",
        "views": 500
      }
    ]
  }
}
```

## 错误响应

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "error": "错误信息"
}
```

### 常见错误码

- `400`: 请求参数错误
- `401`: 未授权（缺少或无效的 API Key）
- `404`: 资源不存在
- `500`: 服务器内部错误

## 使用示例

### cURL 示例

#### 创建文章
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tradeblog-api-key-2024" \
  -d '{
    "title": "我的第一篇文章",
    "content": "<p>这是文章内容</p>",
    "summary": "这是文章摘要",
    "tags": ["技术", "生活"],
    "isPublished": true
  }'
```

#### 获取文章列表
```bash
curl http://localhost:3000/api/articles?page=1&limit=10
```

#### 搜索文章
```bash
curl http://localhost:3000/api/articles/search?q=Next.js
```

### JavaScript 示例

```javascript
// 创建文章
const createArticle = async (articleData) => {
  const response = await fetch('http://localhost:3000/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'tradeblog-api-key-2024',
    },
    body: JSON.stringify(articleData),
  });
  return response.json();
};

// 使用示例
createArticle({
  title: '我的第一篇文章',
  content: '<p>这是文章内容</p>',
  summary: '这是文章摘要',
  tags: ['技术', '生活'],
  isPublished: true,
}).then(data => console.log(data));
```

### Python 示例

```python
import requests

# 创建文章
def create_article(article_data):
    url = 'http://localhost:3000/api/articles'
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': 'tradeblog-api-key-2024',
    }
    response = requests.post(url, json=article_data, headers=headers)
    return response.json()

# 使用示例
article_data = {
    'title': '我的第一篇文章',
    'content': '<p>这是文章内容</p>',
    'summary': '这是文章摘要',
    'tags': ['技术', '生活'],
    'isPublished': True,
}
result = create_article(article_data)
print(result)
```

## 机器人对接指南

1. **获取 API Key**：在后台管理中生成或使用默认的 API Key
2. **设置请求头**：每次请求都包含 `X-API-Key` 头
3. **处理响应**：所有响应都是 JSON 格式，包含 `success` 字段
4. **错误处理**：根据 `success` 字段判断请求是否成功

## 注意事项

1. API Key 请妥善保管，不要泄露
2. 文章内容支持 HTML 格式，建议使用富文本编辑器生成
3. 标签会自动创建，无需预先创建
4. 搜索功能使用全文索引，性能较好
5. 建议在生产环境中使用 HTTPS

## 更新日志

### v1.0.0 (2024-02-28)
- 初始版本发布
- 支持文章 CRUD 操作
- 支持分类和标签
- 支持全文搜索
- 支持统计数据
