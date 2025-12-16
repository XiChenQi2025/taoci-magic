// ===========================================
// 桃汽水的魔力补给站 - 工具函数库
// ===========================================

const TaociUtils = {
    // ==================== DOM操作工具 ====================
    
    // 创建元素
    createElement(tag, className, text = '', attributes = {}) {
        const element = document.createElement(tag);
        if (className) {
            if (Array.isArray(className)) {
                element.classList.add(...className);
            } else {
                element.classList.add(className);
            }
        }
        if (text) element.textContent = text;
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        return element;
    },
    
    // 清空元素内容
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    
    // 显示/隐藏元素
    toggleElement(element, show) {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    },
    
    // ==================== 字符串工具 ====================
    
    // 生成随机字符串
    generateId(length = 8) {
        return Math.random().toString(36).substr(2, length);
    },
    
    // 截断字符串
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // 格式化日期
    formatDate(dateString, format = 'YYYY-MM-DD HH:mm') {
        const date = new Date(dateString);
        const pad = num => num.toString().padStart(2, '0');
        
        const replacements = {
            YYYY: date.getFullYear(),
            MM: pad(date.getMonth() + 1),
            DD: pad(date.getDate()),
            HH: pad(date.getHours()),
            mm: pad(date.getMinutes()),
            ss: pad(date.getSeconds())
        };
        
        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
    },
    
    // ==================== 时间工具 ====================
    
    // 倒计时计算
    calculateCountdown(targetDate) {
        const now = new Date().getTime();
        const target = new Date(targetDate).getTime();
        const difference = target - now;
        
        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds, expired: false };
    },
    
    // 格式化倒计时显示
    formatCountdown(countdown) {
        if (countdown.expired) {
            return "活动已开始！";
        }
        
        const parts = [];
        if (countdown.days > 0) parts.push(`${countdown.days}天`);
        if (countdown.hours > 0) parts.push(`${countdown.hours}小时`);
        if (countdown.minutes > 0) parts.push(`${countdown.minutes}分`);
        parts.push(`${countdown.seconds}秒`);
        
        return parts.join(' ');
    },
    
    // ==================== 随机工具 ====================
    
    // 随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // 随机数组元素
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // 加权随机选择
    weightedRandom(items) {
        const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= (item.weight || 1);
            if (random <= 0) {
                return item;
            }
        }
        
        return items[items.length - 1];
    },
    
    // ==================== 本地存储工具 ====================
    
    // 保存到本地存储
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`taoci_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('本地存储失败:', error);
            return false;
        }
    },
    
    // 从本地存储读取
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`taoci_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('本地存储读取失败:', error);
            return defaultValue;
        }
    },
    
    // 清除本地存储
    clearStorage(key) {
        try {
            localStorage.removeItem(`taoci_${key}`);
            return true;
        } catch (error) {
            console.warn('本地存储清除失败:', error);
            return false;
        }
    },
    
    // ==================== 动画工具 ====================
    
    // 淡入动画
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const interval = 16; // 约60fps
        const increment = interval / duration;
        
        const fade = () => {
            opacity += increment;
            element.style.opacity = opacity;
            
            if (opacity < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        fade();
    },
    
    // 淡出动画
    fadeOut(element, duration = 300, callback) {
        let opacity = 1;
        const interval = 16;
        const decrement = interval / duration;
        
        const fade = () => {
            opacity -= decrement;
            element.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(fade);
            } else {
                element.style.display = 'none';
                if (callback) callback();
            }
        };
        
        fade();
    },
    
    // ==================== 设备检测 ====================
    
    // 检测移动设备
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // 检测触摸设备
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // ==================== 网络工具 ====================
    
    // 模拟API延迟
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // 模拟API请求
    async mockApi(endpoint, data = null, success = true) {
        if (TAOCI_CONFIG.development.simulateDelay) {
            await this.simulateDelay(TAOCI_CONFIG.development.simulateDelay);
        }
        
        return {
            success,
            data: data || { message: `模拟${endpoint}响应` },
            timestamp: new Date().toISOString()
        };
    },
    
    // ==================== 日志工具 ====================
    
    // 分级日志
    log(level, message, data = null) {
        if (!TAOCI_CONFIG.development.debug) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevel = levels.indexOf(TAOCI_CONFIG.development.logLevel);
        const messageLevel = levels.indexOf(level);
        
        if (messageLevel >= currentLevel) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            if (data) {
                console[level](prefix, message, data);
            } else {
                console[level](prefix, message);
            }
        }
    }
};

// 全局访问
if (typeof window !== 'undefined') {
    window.TaociUtils = TaociUtils;
}