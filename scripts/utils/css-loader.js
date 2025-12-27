// CSS加载工具
class CSSLoader {
    constructor() {
        this.loadedCSS = new Map();
    }
    
    // 加载CSS文件
    load(url, id) {
        if (this.loadedCSS.has(url)) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.id = `css-${id}`;
            
            link.onload = () => {
                this.loadedCSS.set(url, true);
                resolve();
            };
            
            link.onerror = reject;
            
            document.head.appendChild(link);
        });
    }
    
    // 卸载CSS文件
    unload(id) {
        const link = document.getElementById(`css-${id}`);
        if (link) {
            link.remove();
            this.loadedCSS.delete(link.href);
        }
    }
}

// 导出全局实例
export const cssLoader = new CSSLoader();