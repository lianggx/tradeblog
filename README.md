# TradeBlog

一个基于 Vue 3 和 Node.js + SQLite 的个人博客系统。

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

- **前端框架**：Vue 3
- **后端框架**：Express.js
- **编程语言**：JavaScript
- **数据库**：SQLite + better-sqlite3
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
├── client/                   # 前端代码
│   ├── src/                 # 源代码
│   │   ├── views/           # 页面组件
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 入口文件
│   ├── package.json         # 前端依赖
│   └── vite.config.js       # Vite 配置
├── server/                  # 后端代码
│   ├── admin/               # 后台管理页面
│   ├── routes/              # API 路由
│   ├── db.js                # 数据库初始化
│   └── index.js             # 后端入口
├── lib/                     # 工具库
│   ├── middleware/          # 中间件
│   ├── repositories/        # 数据访问层
│   ├── db.js                # 数据库连接
│   └── utils.js             # 工具函数
├── server.js                # 应用入口
├── package.json             # 后端依赖
└── .env.local               # 环境变量配置
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

### 服务器部署

1. **前端构建**：
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **上传文件**：
   - 将 `client/dist` 目录上传到 Nginx 静态文件目录（如 `/var/www/html`）
   - 将后端代码上传到服务器（如 `/data/sites/tradeblog`）

3. **安装后端依赖**：
   ```bash
   cd /data/sites/tradeblog
   npm install
   ```

4. **初始化数据库**：
   ```bash
   npm run db:init
   ```

5. **配置 Nginx**：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # 前端静态文件
       location / {
           root /var/www/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # API 请求转发
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # 管理后台
       location /admin {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **启动后端服务**：
   ```bash
   # 安装 PM2 进程管理工具
   npm install -g pm2
   
   # 启动应用
   pm2 start server/index.js --name tradeblog
   
   # 设置开机自启
   pm2 startup
   pm2 save
   ```

### 本地开发

```bash
# 启动后端服务
npm start

# 启动前端开发服务器
cd client
npm run dev
```

## 常见问题

### better-sqlite3 编译失败

如果遇到 better-sqlite3 编译问题，请确保：

1. 安装了 Python 和 C++ 编译工具
2. 使用 `npm install --build-from-source`
3. 或者使用预编译的二进制文件

### 数据库文件位置

默认情况下，数据库文件会根据环境变量 `DATABASE_URL` 的配置创建：
- 开发环境：默认创建 `database.db` 文件
- 生产环境：默认创建 `production-blog.db` 文件

您可以在 `.env.local` 或 `.env.production` 文件中修改数据库文件路径。

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
