// 内存数据库实现，用于演示

class InMemoryDB {
  constructor() {
    this.data = {
      articles: [],
      categories: [],
      tags: [],
      article_tags: [],
      article_stats: [],
      api_keys: [],
      users: [],
      settings: {}
    };
    this.idCounter = 1;
    this.initDemoData();
  }

  initDemoData() {
    // 初始化演示数据
    this.createCategory({ name: '技术', slug: '技术', description: '技术相关文章' });
    this.createCategory({ name: '生活', slug: '生活', description: '生活相关文章' });

    this.createTag({ name: 'Next.js', slug: 'next-js' });
    this.createTag({ name: 'React', slug: 'react' });
    this.createTag({ name: '前端', slug: 'frontend' });
    this.createTag({ name: '生活', slug: 'life' });
    this.createTag({ name: '随笔', slug: 'essay' });

    this.createArticle({
      title: 'Next.js 14 新特性介绍',
      content: '<p>Next.js 14 带来了很多新特性，包括 App Router、Server Components 等。</p><p>这是一个非常强大的版本，值得学习和使用。</p>',
      summary: 'Next.js 14 带来了很多新特性，包括 App Router、Server Components 等。',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
      categoryId: 1,
      tags: ['Next.js', 'React', '前端'],
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date('2024-02-28T08:00:00.000Z'),
    });

    this.createArticle({
      title: '如何提高前端开发效率',
      content: '<p>提高前端开发效率的方法有很多，比如使用合适的工具、建立良好的开发习惯等。</p><p>本文分享一些实用的技巧和工具。</p>',
      summary: '提高前端开发效率的方法和技巧',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
      categoryId: 1,
      tags: ['前端', '开发效率'],
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date('2024-02-27T10:00:00.000Z'),
    });

    this.createArticle({
      title: '周末旅行记',
      content: '<p>周末和朋友一起去了郊外，呼吸新鲜空气，放松心情。</p><p>大自然的美景让人心情愉悦，是个不错的周末。</p>',
      summary: '周末郊外旅行的美好体验',
      coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop',
      categoryId: 2,
      tags: ['生活', '随笔'],
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date('2024-02-26T14:00:00.000Z'),
    });

    this.createApiKey({ name: '默认 API Key', key: 'tradeblog-api-key-2024' });

    // 添加默认用户
    this.createUser({ username: 'admin', password: 'admin' });

    // 添加默认网站配置
    this.setSetting('site_name', 'TradeBlog');
    this.setSetting('site_tagline', '记录生活，分享思考');
  }

  getNextId() {
    return this.idCounter++;
  }

  // 文章相关方法
  createArticle(data) {
    const id = this.getNextId();
    const article = {
      id,
      title: data.title,
      content: data.content,
      summary: data.summary || '',
      cover_image: data.coverImage || null,
      category_id: data.categoryId || null,
      is_published: data.isPublished ? 1 : 0,
      is_featured: data.isFeatured ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: data.publishedAt || new Date().toISOString(),
    };
    this.data.articles.push(article);

    // 创建统计数据
    this.data.article_stats.push({
      article_id: id,
      views: 0,
      created_at: new Date().toISOString(),
    });

    // 处理标签
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tagName => {
        let tag = this.data.tags.find(t => t.name === tagName);
        if (!tag) {
          const tagId = this.getNextId();
          tag = {
            id: tagId,
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            created_at: new Date().toISOString(),
          };
          this.data.tags.push(tag);
        }
        this.data.article_tags.push({
          article_id: id,
          tag_id: tag.id,
        });
      });
    }

    return this.getArticleById(id);
  }

  updateArticle(id, data) {
    const articleIndex = this.data.articles.findIndex(a => a.id === id);
    if (articleIndex === -1) return null;

    const article = this.data.articles[articleIndex];
    Object.assign(article, {
      title: data.title,
      content: data.content,
      summary: data.summary || '',
      cover_image: data.coverImage || null,
      category_id: data.categoryId || null,
      is_published: data.isPublished ? 1 : 0,
      is_featured: data.isFeatured ? 1 : 0,
      updated_at: new Date().toISOString(),
    });

    // 处理标签
    if (data.tags !== undefined) {
      this.data.article_tags = this.data.article_tags.filter(at => at.article_id !== id);
      data.tags.forEach(tagName => {
        let tag = this.data.tags.find(t => t.name === tagName);
        if (!tag) {
          const tagId = this.getNextId();
          tag = {
            id: tagId,
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            created_at: new Date().toISOString(),
          };
          this.data.tags.push(tag);
        }
        this.data.article_tags.push({
          article_id: id,
          tag_id: tag.id,
        });
      });
    }

    return this.getArticleById(id);
  }

  deleteArticle(id) {
    const articleIndex = this.data.articles.findIndex(a => a.id === id);
    if (articleIndex === -1) return false;

    this.data.articles.splice(articleIndex, 1);
    this.data.article_stats = this.data.article_stats.filter(s => s.article_id !== id);
    this.data.article_tags = this.data.article_tags.filter(at => at.article_id !== id);
    return true;
  }

  getArticleById(id) {
    const article = this.data.articles.find(a => a.id === id);
    if (!article) return null;

    const tags = this.data.article_tags
      .filter(at => at.article_id === id)
      .map(at => this.data.tags.find(t => t.id === at.tag_id))
      .filter(Boolean);

    const stats = this.data.article_stats.find(s => s.article_id === id);
    const category = this.data.categories.find(c => c.id === article.category_id);

    return {
      ...article,
      tags,
      stats,
      category_name: category ? category.name : null,
    };
  }

  getAllArticles(options = {}) {
    const { page = 1, limit = 10, categoryId, tagId, publishedOnly = true } = options;
    const offset = (page - 1) * limit;

    let articles = this.data.articles.filter(a => !publishedOnly || a.is_published === 1);

    if (categoryId) {
      articles = articles.filter(a => a.category_id === parseInt(categoryId));
    }

    if (tagId) {
      const articleIds = this.data.article_tags
        .filter(at => at.tag_id === parseInt(tagId))
        .map(at => at.article_id);
      articles = articles.filter(a => articleIds.includes(a.id));
    }

    articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    const paginated = articles.slice(offset, offset + limit);

    return paginated.map(article => {
      const stats = this.data.article_stats.find(s => s.article_id === article.id);
      const category = this.data.categories.find(c => c.id === article.category_id);
      const tags = this.data.article_tags
        .filter(at => at.article_id === article.id)
        .map(at => this.data.tags.find(t => t.id === at.tag_id))
        .filter(Boolean);
      return {
        ...article,
        views: stats ? stats.views : 0,
        category_name: category ? category.name : null,
        tags: tags
      };
    });
  }

  searchArticles(query, limit = 20) {
    const articles = this.data.articles
      .filter(a => a.is_published === 1)
      .filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.summary.toLowerCase().includes(query.toLowerCase()) ||
        a.content.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    return articles.map(article => {
      const stats = this.data.article_stats.find(s => s.article_id === article.id);
      const category = this.data.categories.find(c => c.id === article.category_id);
      return {
        ...article,
        views: stats ? stats.views : 0,
        category_name: category ? category.name : null,
        relevance: 1,
      };
    });
  }

  incrementViews(id) {
    const stats = this.data.article_stats.find(s => s.article_id === id);
    if (stats) {
      stats.views++;
    }
  }

  // 分类相关方法
  createCategory(data) {
    const id = this.getNextId();
    const category = {
      id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      created_at: new Date().toISOString(),
    };
    this.data.categories.push(category);
    return category;
  }

  addCategory(name) {
    const existingCategory = this.data.categories.find(c => c.name === name);
    if (existingCategory) {
      return existingCategory;
    }
    return this.createCategory({ name, slug: name.toLowerCase().replace(/\s+/g, '-') });
  }

  removeCategory(name) {
    const categoryIndex = this.data.categories.findIndex(c => c.name === name);
    if (categoryIndex !== -1) {
      const category = this.data.categories[categoryIndex];
      this.data.categories.splice(categoryIndex, 1);
      // 更新文章的分类ID为null
      this.data.articles.forEach(article => {
        if (article.category_id === category.id) {
          article.category_id = null;
        }
      });
    }
  }

  getCategories() {
    return this.data.categories.map(category => {
      const articleCount = this.data.articles.filter(a => 
        a.category_id === category.id && a.is_published === 1
      ).length;
      return {
        ...category,
        article_count: articleCount,
      };
    });
  }

  // 标签相关方法
  createTag(data) {
    const id = this.getNextId();
    const tag = {
      id,
      name: data.name,
      slug: data.slug,
      created_at: new Date().toISOString(),
    };
    this.data.tags.push(tag);
    return tag;
  }

  addTag(name) {
    const existingTag = this.data.tags.find(t => t.name === name);
    if (existingTag) {
      return existingTag;
    }
    return this.createTag({ name, slug: name.toLowerCase().replace(/\s+/g, '-') });
  }

  removeTag(name) {
    const tagIndex = this.data.tags.findIndex(t => t.name === name);
    if (tagIndex !== -1) {
      const tag = this.data.tags[tagIndex];
      this.data.tags.splice(tagIndex, 1);
      this.data.article_tags = this.data.article_tags.filter(at => at.tag_id !== tag.id);
    }
  }

  getTags() {
    return this.data.tags.map(tag => {
      const articleCount = this.data.article_tags.filter(at => at.tag_id === tag.id).length;
      return {
        ...tag,
        article_count: articleCount,
      };
    });
  }

  // API Key 相关方法
  createApiKey(data) {
    const id = this.getNextId();
    const apiKey = {
      id,
      name: data.name,
      key: data.key,
      is_active: 1,
      created_at: new Date().toISOString(),
      last_used_at: null,
    };
    this.data.api_keys.push(apiKey);
    return apiKey;
  }

  getApiKeyByKey(key) {
    return this.data.api_keys.find(k => k.key === key && k.is_active === 1);
  }

  updateApiKeyLastUsed(id) {
    const apiKey = this.data.api_keys.find(k => k.id === id);
    if (apiKey) {
      apiKey.last_used_at = new Date().toISOString();
    }
  }

  // 统计相关方法
  getStats() {
    const total = this.data.articles.filter(a => a.is_published === 1).length;
    const totalViews = this.data.article_stats.reduce((sum, s) => sum + s.views, 0);
    const popular = this.data.articles
      .filter(a => a.is_published === 1)
      .map(a => {
        const stats = this.data.article_stats.find(s => s.article_id === a.id);
        return {
          ...a,
          views: stats ? stats.views : 0,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      total,
      totalViews,
      popular,
    };
  }

  // 用户相关方法
  createUser(data) {
    const id = this.getNextId();
    const user = {
      id,
      username: data.username,
      password: data.password,
      created_at: new Date().toISOString(),
    };
    this.data.users.push(user);
    return user;
  }

  getUserByUsername(username) {
    return this.data.users.find(user => user.username === username);
  }

  updateUserPassword(username, newPassword) {
    const user = this.getUserByUsername(username);
    if (user) {
      user.password = newPassword;
      return true;
    }
    return false;
  }

  // 设置相关方法
  getSetting(key, defaultValue = null) {
    return this.data.settings[key] || defaultValue;
  }

  setSetting(key, value) {
    this.data.settings[key] = value;
    return true;
  }

  getAllSettings() {
    return this.data.settings;
  }
}

const db = new InMemoryDB();

module.exports = { db, initDb: () => {} };
