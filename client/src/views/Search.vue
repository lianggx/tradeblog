<template>
  <div class="search">
    <div class="container">
      <h2 class="page-title">搜索</h2>
      
      <div class="search-form">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="输入搜索关键词..." 
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button @click="performSearch" class="search-btn">搜索</button>
      </div>
      
      <div v-if="loading" class="loading">搜索中...</div>
      <div v-else-if="results.length > 0" class="search-results">
        <div v-for="article in results" :key="article.id" class="article-card">
          <h3 class="article-title"><router-link :to="`/article/${article.id}`">{{ article.title }}</router-link></h3>
          <p class="article-meta">{{ formatDate(article.published_at) }} · {{ article.category_name }}</p>
          <p class="article-summary">{{ article.summary }}</p>
        </div>
      </div>
      <div v-else-if="searched" class="no-results">没有找到相关文章</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Search',
  data() {
    return {
      searchQuery: '',
      results: [],
      loading: false,
      searched: false
    }
  },
  methods: {
    async performSearch() {
      if (!this.searchQuery.trim()) return
      
      this.loading = true
      this.searched = true
      
      try {
        const response = await fetch(`/api/articles/search?query=${encodeURIComponent(this.searchQuery)}`)
        const data = await response.json()
        this.results = data
        this.loading = false
      } catch (error) {
        console.error('Error searching articles:', error)
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
.search {
  padding: 2rem 0;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.search-form {
  display: flex;
  max-width: 600px;
  margin: 0 auto 2rem;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-btn {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 0 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: #0069d9;
}

.search-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.article-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 1rem;
}

.article-summary {
  color: #666;
  line-height: 1.6;
}

.loading, .no-results {
  text-align: center;
  padding: 4rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-btn {
    padding: 0.75rem;
  }
}
</style>
