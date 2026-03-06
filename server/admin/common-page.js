/**
 * 后台管理页面通用功能组件
 * 提供页面加载、消息提示等通用功能
 */

// 页面管理器
const PageManager = {
    // 当前页面配置
    config: null,

    // 初始化页面
    init(config) {
        this.config = config;
        
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    },

    // 设置页面
    setup() {
        // 检查是否已经通过HTML引用了common-header.js
        // 如果页面中已经存在.header或header元素，说明头部已经加载
        const headerExists = document.querySelector('.header') || document.querySelector('header');
        // 检查是否已经有common-header.js脚本
        const commonHeaderScript = document.querySelector('script[src="/admin/common-header.js"]');
        
        // 只有在头部不存在且没有引用common-header.js时才加载
        if (!headerExists && !commonHeaderScript) {
            this.loadCommonHeader();
        }

        // 执行页面初始化回调
        if (this.config.onInit) {
            this.config.onInit();
        }

        // 绑定通用事件
        this.bindGlobalEvents();
    },

    // 加载公共头部
    loadCommonHeader() {
        const script = document.createElement('script');
        script.src = '/admin/common-header.js';
        document.head.appendChild(script);
    },

    // 绑定全局事件
    bindGlobalEvents() {
        // 模态框点击外部关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
            }
        });

        // ESC 键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal-overlay');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    },

    // 显示加载状态
    showLoading(element) {
        if (!element) return;
        element.innerHTML = '<div style="text-align: center; padding: 20px;">加载中...</div>';
    },

    // 隐藏加载状态
    hideLoading(element) {
        if (!element) return;
        const loadingEl = element.querySelector('[style*="text-align: center"]');
        if (loadingEl) {
            loadingEl.remove();
        }
    },

    // 显示错误信息
    showError(element, message) {
        if (!element) return;
        element.innerHTML = `<div style="color: #dc3545; padding: 20px; text-align: center;">${message}</div>`;
    },

    // 显示成功提示
    showSuccess(message, duration = 3000) {
        this.showMessage(message, 'success', duration);
    },

    // 显示错误提示
    showErrorToast(message, duration = 3000) {
        this.showMessage(message, 'danger', duration);
    },

    // 显示提示消息
    showMessage(message, type = 'info', duration = 3000) {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `alert alert-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 200px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(messageEl);

        // 自动消失
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, duration);
    }
};

// API 调用助手
const ApiHelper = {
    // GET 请求
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    },

    // POST 请求
    async post(url, data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    },

    // PUT 请求
    async put(url, data = {}) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    },

    // DELETE 请求
    async delete(url) {
        const response = await fetch(url, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }
};

// 表单助手
const FormHelper = {
    // 重置表单
    reset(formSelector) {
        const form = document.querySelector(formSelector);
        if (form) {
            form.reset();
        }
    },

    // 获取表单数据
    getData(formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // 处理数组字段
            if (formData.getAll(key).length > 1) {
                data[key] = formData.getAll(key);
            } else {
                data[key] = value;
            }
        }

        // 处理复选框
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (!formData.has(checkbox.name)) {
                data[checkbox.name] = checkbox.checked;
            }
        });

        return data;
    },

    // 填充表单数据
    fillData(formSelector, data) {
        const form = document.querySelector(formSelector);
        if (!form) return;

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = data[key];
                    } else if (input.type === 'radio') {
                        const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radio) radio.checked = true;
                    } else {
                        input.value = data[key];
                    }
                }
            }
        }
    },

    // 验证表单
    validate(formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) return false;

        const requiredInputs = form.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                input.style.borderColor = '#ddd';
            }
        });

        return isValid;
    }
};

// 导出为全局变量
window.PageManager = PageManager;
window.ApiHelper = ApiHelper;
window.FormHelper = FormHelper;
