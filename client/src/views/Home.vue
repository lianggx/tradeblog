<template>
  <div class="home">
    <div class="container">
      <h2 class="page-title">最新文章</h2>
      
      <div class="waterfall" ref="waterfall">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <div class="article-header">
            <h3 class="article-title"><router-link :to="`/article/${article.id}`">{{ article.title }}</router-link></h3>
            <p class="article-meta">{{ formatDate(article.published_at) }} · {{ article.category_name }}</p>
          </div>
          <div class="article-content">
            <p class="article-summary">{{ article.summary }}</p>
          </div>
          <div class="article-footer">
            <div class="article-tags">
              <span v-for="tag in article.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
            </div>
            <div class="article-stats">
              <span class="views">{{ article.views }} 阅读</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">加载中...</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      articles: [],
      loading: true
    }
  },
  mounted() {
    this.fetchArticles()
  },
  methods: {
    async fetchArticles() {
      try {
        const response = await fetch('/api/articles')
        const data = await response.json()
        this.articles = data
        this.loading = false
        // 等待DOM更新后计算瀑布流
        this.$nextTick(() => {
          this.calculateWaterfall()
        })
      } catch (error) {
        console.error('Error fetching articles:', error)
        this.loading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    calculateWaterfall() {
      const waterfall = this.$refs.waterfall
      if (!waterfall) return
      
      const cards = waterfall.children
      const columns = 3
      const columnHeights = new Array(columns).fill(0)
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        const minHeight = Math.min(...columnHeights)
        const minIndex = columnHeights.indexOf(minHeight)
        
        card.style.position = 'absolute'
        card.style.left = `${(100 / columns) * minIndex}%`
        card.style.top = `${minHeight}px`
        card.style.width = `${100 / columns - 2}%`
        
        columnHeights[minIndex] += card.offsetHeight
      }
      
      waterfall.style.height = `${Math.max(...columnHeights)}px`
    }
  }
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.waterfall {
  position: relative;
  width: 100%;
  min-height: 400px;
}

.article-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.article-header {
  margin-bottom: 1rem;
}

.article-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.article-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: #007bff;
}

.article-meta {
  font-size: 0.9rem;
  color: #666;
}

.article-content {
  margin-bottom: 1rem;
}

.article-summary {
  color: #666;
  line-height: 1.6;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  color: #666;
}

.article-stats {
  color: #666;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .waterfall {
    display: block;
  }
  
  .article-card {
    position: static !important;
    width: 100% !important;
    margin: 1rem 0;
  }
}
</style>
