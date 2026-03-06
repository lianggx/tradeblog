// 通用头部加载脚本
(function() {
    fetch('/admin/common-header.html')
        .then(response => response.text())
        .then(html => {
            // 在 body 开头插入头部（不包括 content div）
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 获取 header 和 nav
            const header = tempDiv.querySelector('.header');
            const nav = tempDiv.querySelector('.nav');
            
            // 创建容器并插入到 body 开头
            const container = document.createElement('div');
            if (header) container.appendChild(header);
            if (nav) container.appendChild(nav);
            
            document.body.insertAdjacentElement('afterbegin', container);
        })
        .catch(error => console.error('加载公共头部失败:', error));
})();
