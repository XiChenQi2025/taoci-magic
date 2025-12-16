// ===========================================
// 桃汽水的魔力补给站 - 简单路由系统
// ===========================================

class TaociRouter {
    constructor() {
        this.routes = {};
        this.currentPage = 'home';
        this.init();
    }
    
    // 初始化路由
    init() {
        // 监听hash变化
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // 初始加载
        this.handleHashChange();
    }
    
    // 处理hash变化
    handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        const pageId = hash.split('?')[0]; // 移除查询参数
        
        if (this.routes[pageId]) {
            this.navigateTo(pageId);
        } else {
            // 如果路由不存在，跳转到首页
            this.navigateTo('home');
        }
    }
    
    // 注册路由
    registerRoute(pageId, handler) {
        this.routes[pageId] = handler;
        TaociUtils.log('info', `注册路由: ${pageId}`);
    }
    
    // 导航到指定页面
    navigateTo(pageId, data = {}) {
        if (pageId === this.currentPage) return;
        
        TaociUtils.log('info', `导航到: ${pageId}`, data);
        
        // 更新当前页面
        this.currentPage = pageId;
        
        // 更新URL hash（不触发页面刷新）
        if (window.location.hash.substring(1) !== pageId) {
            window.location.hash = pageId;
        }
        
        // 更新导航菜单激活状态
        this.updateNavActive(pageId);
        
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }
        
        // 调用页面处理器
        if (this.routes[pageId]) {
            this.routes[pageId](data);
        }
    }
    
    // 更新导航菜单激活状态
    updateNavActive(pageId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // 获取当前页面ID
    getCurrentPage() {
        return this.currentPage;
    }
    
    // 获取查询参数
    getQueryParams() {
        const hash = window.location.hash.substring(1);
        const queryString = hash.split('?')[1];
        
        if (!queryString) return {};
        
        return queryString.split('&').reduce((params, param) => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
            return params;
        }, {});
    }
}

// 创建全局路由实例
const taociRouter = new TaociRouter();

// 全局访问
if (typeof window !== 'undefined') {
    window.taociRouter = taociRouter;
}