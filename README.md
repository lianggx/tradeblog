# TradeBlog

一个基于 Next.js 14 和 SQLite 的个人博客系统。

## 功能特性

### 核心功能
- 📝 **文章管理**：创建、编辑、删除文章，支持富文本编辑
- 🏷️ **标签系统**：灵活的标签分类
- 📁 **分类管理**：文章分类组织
- 🔍 **全文搜索**：基于 SQLite FTS5 的全文搜索
- 📊 **统计数据**：阅读量统计、热门文章
- 🤖 **API 接口**：供机器人对接的 RESTful API

### 前端功能
- 🌊 **瀑布流布局**：无限滚动加载文章
- 📖 **文章详情**：支持展开/折叠阅读
- 🎨 **响应式设计**：完美适配移动端
- 🌓 **主题切换**：支持暗色/亮色主题
- 🔍 **搜索功能**：关键词搜索文章
- 📅 **归档功能**：按月份查看文章

### 后台管理
- 🔐 **简单密码保护**：后台登录验证
- 📝 **文章管理**：完整的 CRUD 操作
- 🏷️ **标签/分类管理**：轻松管理分类标签
- 📊 **数据统计**：查看访问量和热门文章
- 🔑 **API 密钥管理**：生成和管理 API 密钥

## 技术栈

- **前端框架**：Next.js 14 (App Router)
- **编程语言**：TypeScript / JavaScript
- **样式方案**：Tailwind CSS
- **数据库**：SQLite + better-sqlite3
- **富文本编辑器**：Tiptap
- **认证**：简单密码 + API Key

## 快速开始

### 1. 安装依赖

```bash
npm install
```

如果遇到 better-sqlite3 编译问题，可以尝试：

```bash
npm install --build-from-source
```

或者使用预编译的二进制文件：

```bash
npm install better-sqlite3 --build-from-source
```

### 2. 初始化数据库

```bash
npm run db:init
```

这将创建 `blog.db` 数据库文件并初始化所有表结构。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看博客。

### 4. 访问后台

访问 http://localhost:3000/admin/login

默认密码：`admin`（可在 `.env.local` 中修改）

## 目录结构

```
TradeBlog/
├── app/                      # Next.js App Router
│   ├── admin/                # 后台管理页面
│   │   ├── articles/         # 文章管理
│   │   ├── categories/       # 分类管理
│   │   ├── tags/            # 标签管理
│   │   ├── api-keys/        # API 密钥管理
│   │   └── stats/           # 统计数据
│   ├── api/                 # API 路由
│   │   ├── articles/        # 文章 API
│   │   ├── categories/      # 分类 API
│   │   ├── tags/            # 标签 API
│   │   └── stats/           # 统计 API
│   ├── articles/            # 文章详情页
│   ├── search/              # 搜索页面
│   ├── tags/                # 标签页面
│   ├── categories/          # 分类页面
│   └── archive/             # 归档页面
├── components/              # React 组件
│   └── TiptapEditor.jsx     # 富文本编辑器
├── lib/                     # 工具库
│   ├── db.js                # 数据库连接
│   ├── repositories/        # 数据访问层
│   │   ├── article.js
│   │   ├── category.js
│   │   ├── tag.js
│   │   └── apiKey.js
│   └── middleware/          # 中间件
│       └── auth.js          # 认证中间件
└── public/                  # 静态资源
```

## API 文档

### 认证

所有需要认证的 API 都需要在请求头中包含 API Key：

```
X-API-Key: your-api-key-here
```

### 文章 API

#### 获取文章列表
```
GET /api/articles?page=1&limit=10&categoryId=1&tagId=1
```

#### 获取文章详情
```
GET /api/articles/:id
```

#### 创建文章（需要认证）
```
POST /api/articles
Content-Type: application/json
X-API-Key: your-api-key

{
  "title": "文章标题",
  "content": "文章内容",
  "summary": "文章摘要",
  "coverImage": "https://example.com/image.jpg",
  "categoryId": 1,
  "tags": ["技术", "生活"],
  "isPublished": true,
  "isFeatured": false
}
```

#### 更新文章（需要认证）
```
PUT /api/articles/:id
Content-Type: application/json
X-API-Key: your-api-key

{
  "title": "更新后的标题",
  "content": "更新后的内容",
  ...
}
```

#### 删除文章（需要认证）
```
DELETE /api/articles/:id
X-API-Key: your-api-key
```

#### 搜索文章
```
GET /api/articles/search?q=关键词&limit=20
```

### 分类 API

#### 获取所有分类
```
GET /api/categories
```

### 标签 API

#### 获取所有标签
```
GET /api/tags
```

### 统计 API

#### 获取统计数据
```
GET /api/stats
```

## 环境变量

在 `.env.local` 文件中配置：

```env
# 数据库路径
DATABASE_URL="file:./blog.db"

# 管理员密码
ADMIN_PASSWORD="admin"

# API 密钥
API_KEY="tradeblog-api-key-2024"
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

注意：SQLite 数据库在 Vercel 上需要使用持久化存储，或者考虑使用其他数据库。

### 本地部署

```bash
npm run build
npm start
```

## 常见问题

### better-sqlite3 编译失败

如果遇到 better-sqlite3 编译问题，请确保：

1. 安装了 Python 和 C++ 编译工具
2. 使用 `npm install --build-from-source`
3. 或者使用预编译的二进制文件

### 数据库文件位置

默认情况下，数据库文件 `blog.db` 会在项目根目录创建。

### 修改管理员密码

编辑 `.env.local` 文件中的 `ADMIN_PASSWORD` 变量。

## 开发计划

- [ ] 添加评论系统
- [ ] 实现主题切换功能
- [ ] 添加图片上传功能
- [ ] 实现 RSS 订阅
- [ ] 添加文章推荐功能
- [ ] 优化 SEO
- [ ] 添加单元测试

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
