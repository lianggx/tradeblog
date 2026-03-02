<template>
  <div class="article-detail">
    <div class="container">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="article" class="article">
        <div class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <p class="article-meta">{{ formatDate(article.published_at) }} · {{ article.category_name }} · {{ article.stats.views }} 阅读</p>
          <div class="article-tags">
            <span v-for="tag in article.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
          </div>
        </div>
        
        <div class="article-content" v-html="article.content"></div>
        
        <div class="article-actions">
          <button @click="isExpanded = !isExpanded" class="expand-btn">
            {{ isExpanded ? '收起' : '展开全部' }}
          </button>
        </div>
      </div>
      <div v-else class="error">文章不存在</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      article: null,
      loading: true,
      isExpanded: true
    }
  },
  mounted() {
    this.fetchArticle()
  },
  methods: {
    async fetchArticle() {
      try {
        const response = await fetch(`/api/articles/${this.id}`)
        const data = await response.json()
        this.article = data
        this.loading = false
      } catch (error) {
        console.error('Error fetching article:', error)
        this.loading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.article-detail {
  padding: 2rem 0;
}

.article {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.article-header {
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.article-meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tag {
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  color: #666;
  font-size: 0.8rem;
}

.article-content {
  line-height: 1.8;
  color: #333;
  margin-bottom: 2rem;
  transition: max-height 0.3s ease;
}

.article-content h1, .article-content h2, .article-content h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.article-content p {
  margin-bottom: 1rem;
}

.article-actions {
  text-align: center;
  margin-top: 2rem;
}

.expand-btn {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.expand-btn:hover {
  background-color: #0069d9;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 4rem;
  color: #dc3545;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article {
    padding: 1.5rem;
  }
  
  .article-title {
    font-size: 1.5rem;
  }
}
</style>
