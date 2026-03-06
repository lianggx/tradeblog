<template>
  <div class="app">
    <header class="header">
      <div class="container">
        <h1 class="logo"><a href="/">TradeBlog</a></h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/search" class="nav-link">搜索</router-link>
        </nav>
      </div>
    </header>
    
    <main class="main">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 TradeBlog. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f0f8ff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: #0077cc;
  box-shadow: 0 4px 15px rgba(0, 119, 204, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 20px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.logo a {
  color: #fff;
  text-decoration: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.main {
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer {
  background: #0077cc;
  color: #fff;
  padding: 2rem 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    width: 100%;
    justify-content: center;
  }
}
</style>
