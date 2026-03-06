/**
 * 后台管理通用 CRUD 操作组件
 * 提供通用的增删改查功能
 */

// 通用工具函数
const AdminUtils = {
    // 显示提示信息
    showMessage(message, type = 'info') {
        alert(message);
    },

    // 确认对话框
    confirm(message) {
        return confirm(message);
    },

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    },

    // 空值处理
    getValue(value, defaultValue = '') {
        return value !== null && value !== undefined ? value : defaultValue;
    }
};

// 通用 CRUD 管理器
class CrudManager {
    constructor(config) {
        this.apiUrl = config.apiUrl; // API 基础路径
        this.tableElement = config.tableElement; // 表格元素选择器
        this.formElement = config.formElement; // 表单元素选择器
        this.modalElement = config.modalElement; // 模态框元素选择器
        this.renderRow = config.renderRow; // 行渲染函数
        this.getFormData = config.getFormData; // 获取表单数据函数
        this.afterSave = config.afterSave; // 保存后回调
        this.afterDelete = config.afterDelete; // 删除后回调
    }

    // 加载列表数据
    async loadList(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `${this.apiUrl}?${queryString}` : this.apiUrl;
            
            const response = await fetch(url);
            const data = await response.json();
            
            this.renderList(data);
            return data;
        } catch (error) {
            console.error('加载列表失败:', error);
            throw error;
        }
    }

    // 渲染列表
    renderList(data) {
        if (!this.tableElement) return;
        
        const table = document.querySelector(this.tableElement);
        if (!table) return;

        // 检查是否是表格结构
        const tbody = table.querySelector('tbody');
        const isTable = !!tbody;

        // 清空内容
        table.innerHTML = '';
        
        if (!data || data.length === 0) {
            if (isTable) {
                table.innerHTML = '<tbody><tr><td colspan="10" style="text-align: center; padding: 20px;">暂无数据</td></tr></tbody>';
            } else {
                table.innerHTML = '<div style="text-align: center; padding: 20px;">暂无数据</div>';
            }
            return;
        }

        data.forEach(item => {
            const row = this.renderRow(item);
            if (typeof row === 'string') {
                table.insertAdjacentHTML('beforeend', row);
            } else if (row instanceof HTMLElement) {
                table.appendChild(row);
            }
        });
    }

    // 打开新增窗口
    openAddModal() {
        if (this.formElement) {
            document.querySelector(this.formElement).reset();
        }
        
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = '添加';
        }

        this.showModal();
    }

    // 打开编辑窗口
    async openEditModal(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            const item = await response.json();
            
            this.fillFormData(item);
            
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.textContent = '编辑';
            }

            this.showModal();
        } catch (error) {
            console.error('获取详情失败:', error);
            AdminUtils.showMessage('获取详情失败，请稍后重试', 'danger');
        }
    }

    // 填充表单数据
    fillFormData(item) {
        if (!this.formElement) return;
        
        const form = document.querySelector(this.formElement);
        if (!form) return;

        // 遍历表单项并填充数据
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = item[key];
                    } else {
                        input.value = item[key];
                    }
                }

                // 特殊处理 ID 字段
                if (key === 'id') {
                    const idInput = document.getElementById('itemId');
                    if (idInput) {
                        idInput.value = item[key];
                    }
                }
            }
        }

        // 调用自定义填充函数（如果有）
        if (this.onFillFormData) {
            this.onFillFormData(item);
        }
    }

    // 获取表单数据
    getFormValues() {
        if (this.getFormData) {
            return this.getFormData();
        }

        // 默认实现：从表单获取所有字段
        const form = document.querySelector(this.formElement);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // 获取 ID
        const idInput = document.getElementById('itemId');
        if (idInput) {
            data.id = idInput.value;
        }

        return data;
    }

    // 保存数据
    async save() {
        const data = this.getFormValues();
        const id = data.id;

        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${this.apiUrl}/${id}` : this.apiUrl;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('保存失败');
            }

            AdminUtils.showMessage('保存成功！', 'success');
            
            if (this.afterSave) {
                await this.afterSave();
            } else {
                this.loadList();
            }

            this.hideModal();
        } catch (error) {
            console.error('保存失败:', error);
            AdminUtils.showMessage('保存失败，请稍后重试', 'danger');
        }
    }

    // 删除数据
    async delete(id, itemName = '该项') {
        if (!AdminUtils.confirm(`确定要删除${itemName}吗？`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            AdminUtils.showMessage('删除成功！', 'success');
            
            if (this.afterDelete) {
                await this.afterDelete();
            } else {
                this.loadList();
            }
        } catch (error) {
            console.error('删除失败:', error);
            AdminUtils.showMessage('删除失败，请稍后重试', 'danger');
        }
    }

    // 显示模态框
    showModal() {
        if (!this.modalElement) return;
        
        const modal = document.querySelector(this.modalElement);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('modal-overlay');
        }
    }

    // 隐藏模态框
    hideModal() {
        if (!this.modalElement) return;
        
        const modal = document.querySelector(this.modalElement);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('modal-overlay');
        }
    }

    // 绑定事件
    bindEvents() {
        // 绑定取消按钮事件
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }

        // 绑定表单提交事件
        if (this.formElement) {
            const form = document.querySelector(this.formElement);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.save();
                });
            }
        }
    }
}

// 导出为全局变量
window.AdminUtils = AdminUtils;
window.CrudManager = CrudManager;
