// API Key测试脚本
const http = require('http');

// 测试配置
const baseUrl = 'http://localhost:3000';
const apiKeys = [
  'tradeblog-api-key-2024' // 默认API Key
];

// 测试函数
async function testApiKey(apiKey, testNumber) {
  console.log(`\n=== 测试 ${testNumber}: 使用API Key ${apiKey} ===`);
  
  try {
    // 1. 测试发布文章
    console.log('1. 测试发布文章...');
    const createResult = await createArticle(apiKey, `测试文章 ${testNumber}`, `测试内容 ${testNumber}`);
    console.log('   发布结果:', createResult.message || createResult.error);
    
    if (!createResult.id) {
      console.log('   发布失败，跳过后续测试');
      return false;
    }
    
    const articleId = createResult.id;
    
    // 2. 测试编辑文章
    console.log('2. 测试编辑文章...');
    const updateResult = await updateArticle(apiKey, articleId, `更新后的测试文章 ${testNumber}`, `更新后的测试内容 ${testNumber}`);
    console.log('   编辑结果:', updateResult.message || updateResult.error);
    
    // 3. 测试删除文章
    console.log('3. 测试删除文章...');
    const deleteResult = await deleteArticle(apiKey, articleId);
    console.log('   删除结果:', deleteResult.message || deleteResult.error);
    
    return true;
  } catch (error) {
    console.error('测试出错:', error.message);
    return false;
  }
}

// 创建文章
function createArticle(apiKey, title, content) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title,
      content,
      summary: content.substring(0, 100),
      category_id: 1,
      tag_ids: [1]
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/articles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          resolve({ error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// 更新文章
function updateArticle(apiKey, articleId, title, content) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title,
      content,
      summary: content.substring(0, 100),
      category_id: 1,
      tag_ids: [1]
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/articles/${articleId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          resolve({ error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// 删除文章
function deleteArticle(apiKey, articleId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/articles/${articleId}`,
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          resolve({ error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// 运行测试
async function runTests() {
  console.log('开始API Key测试...');
  
  let successCount = 0;
  let totalTests = 0;
  
  // 运行10次测试
  for (let i = 1; i <= 10; i++) {
    const apiKey = apiKeys[i % apiKeys.length];
    const success = await testApiKey(apiKey, i);
    if (success) {
      successCount++;
    }
    totalTests++;
  }
  
  console.log('\n=== 测试结果 ===');
  console.log(`总测试次数: ${totalTests}`);
  console.log(`成功次数: ${successCount}`);
  console.log(`失败次数: ${totalTests - successCount}`);
  console.log(`成功率: ${(successCount / totalTests * 100).toFixed(2)}%`);
  
  if (successCount === totalTests) {
    console.log('✅ 所有测试通过！');
  } else {
    console.log('❌ 部分测试失败，需要检查API Key配置');
  }
}

// 执行测试
runTests();