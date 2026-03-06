/**
 * 后台管理公共组件使用说明
 * 
 * 已重构的页面：
 * - tags.html ✅
 * - categories.html ✅
 * 
 * 待重构的页面：
 * - articles.html
 * - api-keys.html
 */

// ============================================
// 1. 在页面中引入公共组件（放在 head 标签内）
// ============================================
/*
<script src="/admin/common-header.js"></script>
<script src="/admin/common-page.js"></script>
<script src="/admin/common-crud.js"></script>
<link rel="stylesheet" href="/admin/admin.css">
*/

// ============================================
// 2. 基础用法 - 简单列表页面（如 tags、categories）
// ============================================
/*
PageManager.init({
    onInit: function() {
        crudManager = new CrudManager({
            apiUrl: '/api/your-endpoint',  // API 地址
            tableElement: '#yourListId',   // 列表容器选择器
            formElement: '#yourFormId',    // 表单选择器
            
            // 渲染每一行
            renderRow: function(item) {
                const div = document.createElement('div');
                div.className = 'your-item-class';
                div.innerHTML = `
                    <span>${item.name}</span>
                    <button class="btn btn-danger" onclick="deleteItem('${item.id}')">删除</button>
                `;
                return div;
            },
            
            // 获取表单数据
            getFormData: function() {
                const value = document.getElementById('yourInputId').value.trim();
                if (!value) {
                    alert('请输入内容');
                    return null;
                }
                return { name: value };
            },
            
            // 保存后回调
            afterSave: function() {
                FormHelper.reset('#yourFormId');
                crudManager.loadList();
            }
        });
        
        // 加载列表
        crudManager.loadList();
        
        // 绑定事件
        crudManager.bindEvents();
    }
});

// 删除函数（兼容旧代码）
function deleteItem(id) {
    crudManager.delete(id, '项目');
}
*/

// ============================================
// 3. 进阶用法 - 带模态框的复杂页面（如 articles）
// ============================================
/*
let crudManager;

PageManager.init({
    onInit: function() {
        crudManager = new CrudManager({
            apiUrl: '/api/articles',
            tableElement: '#articlesTable',
            formElement: '#articleForm',
            modalElement: '#articleModal',
            
            // 渲染表格行
            renderRow: function(article) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${article.id}</td>
                    <td>${article.title}</td>
                    <td>${article.author || 'Admin'}</td>
                    <td>${PageManager.formatDate(article.published_at)}</td>
                    <td>${article.is_published === 1 ? '已发布' : '草稿'}</td>
                    <td class="actions">
                        <button class="btn btn-secondary" onclick="editArticle(${article.id})">编辑</button>
                        <button class="btn btn-danger" onclick="deleteArticle(${article.id})">删除</button>
                    </td>
                `;
                return row;
            },
            
            // 获取表单数据（处理富文本等复杂字段）
            getFormData: function() {
                return {
                    title: document.getElementById('title').value,
                    author: document.getElementById('author').value,
                    content: document.getElementById('contentHidden').value,
                    tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
                    status: document.getElementById('status').value
                };
            },
            
            // 填充表单数据（处理富文本等复杂字段）
            onFillFormData: function(item) {
                document.getElementById('content').innerHTML = item.content;
                document.getElementById('tags').value = item.tags ? item.tags.map(t => t.name).join(', ') : '';
            },
            
            afterSave: function() {
                crudManager.loadList();
            },
            
            afterDelete: function() {
                crudManager.loadList();
            }
        });
        
        // 加载列表
        crudManager.loadList();
        
        // 绑定按钮事件
        document.getElementById('addArticleBtn').addEventListener('click', function() {
            crudManager.openAddModal();
        });
        
        crudManager.bindEvents();
    }
});

// 编辑文章
function editArticle(id) {
    crudManager.openEditModal(id);
}

// 删除文章
function deleteArticle(id) {
    crudManager.delete(id, '文章');
}
*/

// ============================================
// 4. 工具类使用说明
// ============================================

// AdminUtils - 通用工具
/*
AdminUtils.showMessage('操作成功', 'success');  // 显示提示消息
AdminUtils.confirm('确定要删除吗？');            // 确认对话框
AdminUtils.formatDate('2024-01-01');            // 格式化日期
AdminUtils.getValue(null, '默认值');             // 空值处理
*/

// PageManager - 页面管理
/*
PageManager.showLoading(element);               // 显示加载状态
PageManager.hideLoading(element);               // 隐藏加载状态
PageManager.showSuccess('保存成功！');           // 显示成功提示
PageManager.showErrorToast('操作失败');          // 显示错误提示
*/

// ApiHelper - API 调用助手
/*
await ApiHelper.get('/api/articles', {page: 1});     // GET 请求
await ApiHelper.post('/api/articles', data);         // POST 请求
await ApiHelper.put('/api/articles/1', data);        // PUT 请求
await ApiHelper.delete('/api/articles/1');           // DELETE 请求
*/

// FormHelper - 表单助手
/*
FormHelper.reset('#formId');                         // 重置表单
const data = FormHelper.getData('#formId');          // 获取表单数据
FormHelper.fillData('#formId', data);                // 填充表单数据
const isValid = FormHelper.validate('#formId');      // 验证表单
*/

// ============================================
// 5. CrudManager 配置项说明
// ============================================
/*
new CrudManager({
    apiUrl: '',              // 必填 - API 基础路径
    tableElement: '',        // 必填 - 列表容器选择器
    formElement: '',         // 必填 - 表单选择器
    modalElement: '',        // 可选 - 模态框选择器
    renderRow: function(){}, // 必填 - 行渲染函数
    getFormData: function(){}, // 必填 - 获取表单数据函数
    onFillFormData: function(){}, // 可选 - 自定义填充表单数据
    afterSave: function(){}, // 可选 - 保存后回调
    afterDelete: function(){} // 可选 - 删除后回调
})
*/

// ============================================
// 6. 方法说明
// ============================================
/*
crudManager.loadList(params)           // 加载列表
crudManager.renderList(data)           // 渲染列表
crudManager.openAddModal()             // 打开新增窗口
crudManager.openEditModal(id)          // 打开编辑窗口
crudManager.save()                     // 保存数据
crudManager.delete(id, name)           // 删除数据
crudManager.showModal()                // 显示模态框
crudManager.hideModal()                // 隐藏模态框
crudManager.bindEvents()               // 绑定事件
*/
