// 简单的博客服务器 - 使用内存数据库
const http = require('http');
const fs = require('fs');
const path = require('path');

// 内存数据库
const { db } = require('./lib/db.js');

// 处理 HTTP 请求
const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 解析请求路径
  const url = new URL(req.url, 'http://localhost:3000');
  const pathname = url.pathname;

  // 处理 API 请求
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname);
  } 
  // 处理管理后台请求
  else if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    handleAdminRequest(req, res, pathname);
  }
  else {
    // 处理静态文件
    handleStaticRequest(req, res, pathname);
  }
});

// 处理 API 请求
function handleApiRequest(req, res, pathname) {
  // 获取文章列表
  if (pathname === '/api/articles') {
    if (req.method === 'GET') {
      const articles = db.getAllArticles();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(articles));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const article = db.createArticle({
            title: data.title,
            content: data.content,
            summary: data.summary,
            categoryId: data.category_id,
            tags: data.tags,
            isPublished: true,
            publishedAt: data.published_at || new Date().toISOString()
          });
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: article.id, message: 'Article created successfully' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    }
  } 
  // 获取单个文章
  else if (pathname.match(/^\/api\/articles\/\d+$/)) {
    const id = pathname.split('/').pop();
    if (req.method === 'GET') {
      const article = db.getArticleById(parseInt(id));
      if (!article) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Article not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(article));
    } else if (req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const article = db.updateArticle(parseInt(id), {
            title: data.title,
            content: data.content,
            summary: data.summary,
            categoryId: data.category_id,
            tags: data.tags,
            isPublished: true
          });
          if (!article) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Article not found' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Article updated successfully' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else if (req.method === 'DELETE') {
      const success = db.deleteArticle(parseInt(id));
      if (!success) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Article not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Article deleted successfully' }));
    }
  }
  // 获取标签列表
  else if (pathname === '/api/tags') {
    if (req.method === 'GET') {
      const tags = db.getTags();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tags));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          db.addTag(data.name);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Tag added successfully' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    }
  }
  // 删除标签
  else if (pathname.match(/^\/api\/tags\/.*$/)) {
    if (req.method === 'DELETE') {
      const tagName = decodeURIComponent(pathname.split('/').pop());
      db.removeTag(tagName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Tag deleted successfully' }));
    }
  }
  // 获取分类列表
  else if (pathname === '/api/categories') {
    if (req.method === 'GET') {
      const categories = db.getCategories();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(categories));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          db.addCategory(data.name);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Category added successfully' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    }
  }
  // 删除分类
  else if (pathname.match(/^\/api\/categories\/.*$/)) {
    if (req.method === 'DELETE') {
      const categoryName = decodeURIComponent(pathname.split('/').pop());
      db.removeCategory(categoryName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Category deleted successfully' }));
    }
  }
  // 修改密码
  else if (pathname === '/api/change-password') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const currentPassword = data.currentPassword;
          const newPassword = data.newPassword;
          
          if (!currentPassword || !newPassword) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '请提供当前密码和新密码' }));
            return;
          }
          
          // 验证当前密码
          const user = db.getUserByUsername('admin');
          if (!user || user.password !== currentPassword) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '当前密码不正确' }));
            return;
          }
          
          // 更新密码
          const success = db.updateUserPassword('admin', newPassword);
          if (success) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '密码修改成功' }));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '密码修改失败' }));
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '无效的请求数据' }));
        }
      });
    }
  }
  // 登录验证
  else if (pathname === '/api/login') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const user = db.getUserByUsername('admin');
          if (user && user.password === data.password) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid password' }));
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    }
  }
  // API Key管理
  else if (pathname === '/api/api-keys') {
    if (req.method === 'GET') {
      // 获取所有API Key
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(db.data.api_keys));
    } else if (req.method === 'POST') {
      // 创建API Key
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const apiKey = db.createApiKey(data);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ id: apiKey.id, message: 'API Key created successfully' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    }
  }
  else if (pathname.match(/^\/api\/api-keys\/\d+$/)) {
    const id = parseInt(pathname.split('/').pop());
    if (req.method === 'GET') {
      // 获取单个API Key
      const apiKey = db.data.api_keys.find(k => k.id === id);
      if (apiKey) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(apiKey));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API Key not found' }));
      }
    } else if (req.method === 'PUT') {
      // 更新API Key
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const apiKeyIndex = db.data.api_keys.findIndex(k => k.id === id);
          if (apiKeyIndex !== -1) {
            db.data.api_keys[apiKeyIndex] = {
              ...db.data.api_keys[apiKeyIndex],
              name: data.name,
              key: data.key
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'API Key updated successfully' }));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API Key not found' }));
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else if (req.method === 'DELETE') {
      // 删除API Key
      const apiKeyIndex = db.data.api_keys.findIndex(k => k.id === id);
      if (apiKeyIndex !== -1) {
        db.data.api_keys.splice(apiKeyIndex, 1);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'API Key deleted successfully' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API Key not found' }));
      }
    }
  }
  // 网站设置管理
  else if (pathname === '/api/settings') {
    if (req.method === 'GET') {
      // 获取所有设置
      const settings = db.getAllSettings();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(settings));
    } else if (req.method === 'PUT') {
      // 更新设置
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          Object.keys(data).forEach(key => {
            db.setSetting(key, data[key]);
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Settings updated successfully' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    }
  }
}

// 处理管理后台请求
function handleAdminRequest(req, res, pathname) {
  // 提取管理后台路径
  const adminPath = pathname.replace('/admin', '');
  let filePath = path.join(__dirname, 'server', 'admin');
  
  // 如果有额外路径，添加到filePath
  if (adminPath && adminPath !== '/') {
    filePath = path.join(filePath, adminPath);
  }
  
  console.log('Admin request path:', pathname);
  console.log('Calculated file path:', filePath);
  
  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // 如果文件不存在且没有扩展名，尝试添加.html
      if (path.extname(filePath) === '') {
        const htmlFilePath = filePath + '.html';
        fs.stat(htmlFilePath, (err2, stats2) => {
          if (err2) {
            console.log('File not found:', htmlFilePath);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
          }
          console.log('Serving file:', htmlFilePath);
          serveFile(res, htmlFilePath);
        });
      } else {
        console.log('File not found:', filePath);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
        return;
      }
    } else {
      // 如果是目录，尝试加载index.html
      if (stats.isDirectory()) {
        const indexFilePath = path.join(filePath, 'index.html');
        fs.stat(indexFilePath, (err3, stats3) => {
          if (err3) {
            console.log('Index file not found:', indexFilePath);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
          }
          console.log('Serving directory index:', indexFilePath);
          serveFile(res, indexFilePath);
        });
      } else {
        console.log('Serving file:', filePath);
        serveFile(res, filePath);
      }
    }
  });
}

// 提供文件的辅助函数
function serveFile(res, filePath) {
  // 读取文件
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 Internal Server Error</h1>');
      return;
    }
    
    // 设置内容类型
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
}

// 处理静态文件
function handleStaticRequest(req, res, pathname) {
  let filePath = path.join(__dirname, 'client', pathname);
  
  // 默认页面
  if (filePath === path.join(__dirname, 'client', '/')) {
    filePath = path.join(__dirname, 'client', 'index.html');
  }
  
  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 Internal Server Error</h1>');
        return;
      }
      
      // 设置内容类型
      const extname = path.extname(filePath);
      let contentType = 'text/html';
      switch (extname) {
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
}

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
