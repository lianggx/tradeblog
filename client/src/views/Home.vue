<template>
  <div class="home">
    <div class="container">
      <div class="home-layout">
        <!-- 侧边栏 - 分类列表 -->
        <aside class="sidebar">
          <div class="category-section">
            <h3 class="category-title">📁 文章分类</h3>
            <div class="category-list">
              <button 
                class="category-btn" 
                :class="{ active: selectedCategory === null }"
                @click="selectCategory(null)"
              >
                全部
              </button>
              <button 
                v-for="category in categories" 
                :key="category.id"
                class="category-btn"
                :class="{ active: selectedCategory === category.id }"
                @click="selectCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </aside>

        <!-- 主内容区 -->
        <main class="main-content">          
          <div class="articles-list">
            <div v-for="article in articles" :key="article.id" class="article-card">
              <div class="article-header">
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-meta">{{ formatDate(article.published_at) }} · {{ article.category_name || '未分类' }}</p>
              </div>
              <div class="article-content">
                <p v-if="!expandedArticles.includes(article.id)" class="article-summary">{{ article.summary }}</p>
                <div v-if="expandedArticles.includes(article.id)" class="article-full-content" v-html="article.content"></div>
              </div>
              <div class="article-footer">
                <div class="article-tags">
                  <span v-for="tag in article.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
                </div>
                <div class="article-actions">
                  <span 
                    class="read-more-btn"
                    @click="toggleArticle(article.id)"
                  >
                    {{ expandedArticles.includes(article.id) ? '收起' : '展开全文' }}
                  </span>
                  <span class="views">👁 {{ article.views }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="loading">加载中...</div>
          <div v-if="!loading && articles.length === 0" class="empty-state">
            该分类下暂无文章
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      articles: [],
      categories: [],
      selectedCategory: null,
      expandedArticles: [],
      loading: true
    }
  },
  mounted() {
    console.log('Home component mounted')
    this.fetchCategories()
    this.fetchArticles()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.calculateWaterfall()
    },
    async fetchCategories() {
      console.log('fetchCategories called')
      try {
        console.log('Fetching categories from /api/categories')
        const response = await fetch('/api/categories')
        console.log('Response status:', response.status)
        const data = await response.json()
        console.log('Categories data:', data)
        this.categories = data
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    },
    async fetchArticles() {
      this.loading = true
      try {
        let url = '/api/articles/published'
        if (this.selectedCategory) {
          url += `?categoryId=${this.selectedCategory}`
        }
        const response = await fetch(url)
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
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
      this.fetchArticles()
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      return category ? category.name : ''
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    calculateWaterfall() {
      const waterfall = this.$refs.waterfall
      if (!waterfall) return
      
      const cards = waterfall.children
      if (cards.length === 0) return
      
      const columns = window.innerWidth <= 768 ? 1 : 3
      const columnHeights = new Array(columns).fill(0)
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        const minHeight = Math.min(...columnHeights)
        const minIndex = columnHeights.indexOf(minHeight)
        
        card.style.position = 'absolute'
        card.style.left = `${(100 / columns) * minIndex}%`
        card.style.top = `${minHeight}px`
        card.style.width = `${100 / columns - 2}%`
        
        columnHeights[minIndex] += card.offsetHeight + 20
      }
      
      waterfall.style.height = `${Math.max(...columnHeights)}px`
    },
    toggleArticle(articleId) {
      const index = this.expandedArticles.indexOf(articleId)
      if (index > -1) {
        this.expandedArticles.splice(index, 1)
      } else {
        this.expandedArticles.push(articleId)
      }
    }
  }
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
}

/* 布局 */
.home-layout {
  display: flex;
  gap: 2rem;
}

/* 侧边栏 */
.sidebar {
  width: 250px;
  flex-shrink: 0;
}

/* 主内容区 */
.main-content {
  flex: 1;
}

/* 分类区域 */
.category-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 119, 204, 0.1);
  border: 1px solid #dee2e6;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #0077cc;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-btn {
  padding: 0.75rem 1.25rem;
  border: 1px solid #b3e0ff;
  border-radius: 8px;
  background-color: #fff;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-btn:hover {
  background-color: #0077cc;
  color: #fff;
  border-color: #0077cc;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 119, 204, 0.2);
}

.category-btn.active {
  background-color: #0077cc;
  color: #fff;
  border-color: #0077cc;
  box-shadow: 0 4px 12px rgba(0, 119, 204, 0.2);
  transform: translateX(5px);
}

.category-btn::before {
  content: "📄";
  font-size: 0.8rem;
}

.category-btn.active::before {
  content: "📁";
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
}

/* 文章列表 */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 119, 204, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
  word-break: break-word;
  overflow-wrap: break-word;
}

.article-card:hover {
  box-shadow: 0 8px 25px rgba(0, 119, 204, 0.15);
  border-color: #0077cc;
}

.article-meta {
  font-size: 0.85rem;
  word-break: break-word;
  overflow-wrap: break-word;
}

.article-title {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: break-word;
}

.article-content {
  margin-bottom: 1rem;
  word-break: break-word;
  overflow-wrap: break-word;
}

.article-summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  word-break: break-word;
  overflow-wrap: break-word;
}

.article-full-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e6f7ff;
  line-height: 1.8;
  color: #333;
  word-break: break-word;
  overflow-wrap: break-word;
}

.article-full-content h1, .article-full-content h2, .article-full-content h3 {
  color: #0077cc;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.article-full-content p {
  margin-bottom: 1rem;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #f0f8ff;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  color: #0077cc;
  font-size: 0.8rem;
  border: 1px solid #e6f7ff;
}

.article-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.read-more-btn {
  color: #0077cc;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  display: inline-block;
}

.read-more-btn:hover {
  color: #0055aa;
  text-decoration: underline;
}
  
.views {
  color: #0077cc;
  font-size: 0.85rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .category-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .category-btn {
    width: auto;
    padding: 0.5rem 1rem;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .article-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .article-card {
    margin: 0;
  }
}
</style>