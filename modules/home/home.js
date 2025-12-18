// 桃汽水首页模块 - 随机展示皮套图片
class HomeModule {
    constructor() {
        this.config = {
            images: [
                {
                    id: 1,
                    url: './assets/images/character/taoci-avatar-1.png',
                    name: '桃汽水公主 - 庆典装扮'
                },
                {
                    id: 2,
                    url: './assets/images/character/taoci-avatar-2.png',
                    name: '桃汽水公主 - 日常装扮'
                },
                {
                    id: 3,
                    url: './assets/images/character/taoci-avatar-3.png',
                    name: '桃汽水公主 - 魔法装扮'
                }
            ],
            fallbackEmoji: '🍑',
            altText: '桃汽水 - 异世界精灵公主',
            countdownTarget: '2025-12-25T19:00:00'
        };
        
        this.currentImageIndex = 0;
        this.totalImages = this.config.images.length;
    }
    
    // 初始化首页
    init() {
        console.log('🏠 初始化首页模块...');
        
        // 1. 随机选择图片
        this.currentImageIndex = this.getRandomImageIndex();
        const selectedImage = this.config.images[this.currentImageIndex];
        
        // 2. 加载图片
        this.loadCharacterImage(selectedImage.url, selectedImage.name);
        
        // 3. 更新图片信息
        this.updateImageInfo(selectedImage.name, this.currentImageIndex + 1, this.totalImages);
        
        // 4. 初始化倒计时
        this.initCountdown();
        
        // 5. 绑定功能卡片事件
        this.bindFeatureCards();
        
        console.log('✅ 首页模块初始化完成');
    }
    
    // 随机选择图片索引
    getRandomImageIndex() {
        return Math.floor(Math.random() * this.totalImages);
    }
    
    // 加载角色图片
    loadCharacterImage(imageUrl, altText) {
        const container = document.getElementById('character-image-container');
        if (!container) return;
        
        const img = new Image();
        img.className = 'character-img';
        img.alt = altText;
        
        img.onload = function() {
            console.log(`✅ 图片加载成功: ${imageUrl}`);
            
            // 清除加载占位符
            const loadingEl = container.querySelector('.image-loading');
            if (loadingEl) {
                loadingEl.remove();
            }
            
            // 添加图片
            container.appendChild(img);
            
            // 添加加载完成动画
            setTimeout(() => {
                img.style.opacity = '0';
                img.style.transform = 'scale(0.9)';
                
                requestAnimationFrame(() => {
                    img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1)';
                });
            }, 100);
        };
        
        img.onerror = function() {
            console.warn(`❌ 图片加载失败: ${imageUrl}, 使用Emoji回退`);
            
            // 清除加载占位符
            const loadingEl = container.querySelector('.image-loading');
            if (loadingEl) {
                loadingEl.remove();
            }
            
            // 显示Emoji回退
            const fallbackEmoji = window.taociConfig?.character?.fallbackEmoji || '🍑';
            container.innerHTML = `
                <div class="emoji-fallback">
                    <div class="fallback-emoji">${fallbackEmoji}</div>
                    <p class="fallback-text">图片加载失败</p>
                </div>
            `;
        };
        
        // 开始加载
        img.src = imageUrl;
    }
    
    // 更新图片信息
    updateImageInfo(name, current, total) {
        const nameEl = document.getElementById('image-name');
        const counterEl = document.getElementById('image-counter');
        
        if (nameEl) nameEl.textContent = name;
        if (counterEl) counterEl.textContent = `图片 ${current} / ${total}`;
    }
    
    // 初始化倒计时
    initCountdown() {
        const targetDate = new Date(this.config.countdownTarget).getTime();
        const now = new Date().getTime();
        const diff = targetDate - now;
        
        if (diff <= 0) {
            this.updateCountdownDisplay(0, 0, 0, 0, '🎉 周年庆已经开始啦！');
            return;
        }
        
        // 立即更新一次
        this.updateCountdown();
        
        // 每秒更新一次
        const interval = setInterval(() => {
            this.updateCountdown();
            
            // 检查是否结束
            const now = new Date().getTime();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                clearInterval(interval);
                this.updateCountdownDisplay(0, 0, 0, 0, '🎉 周年庆已经开始啦！');
            }
        }, 1000);
    }
    
    // 更新倒计时
    updateCountdown() {
        const targetDate = new Date(this.config.countdownTarget).getTime();
        const now = new Date().getTime();
        const diff = targetDate - now;
        
        // 计算时间
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // 更新显示
        this.updateCountdownDisplay(days, hours, minutes, seconds);
    }
    
    // 更新倒计时显示
    updateCountdownDisplay(days, hours, minutes, seconds, customMessage = null) {
        const display = document.getElementById('countdown-display');
        const message = document.getElementById('countdown-message');
        
        if (display) {
            const items = display.querySelectorAll('.countdown-item');
            const values = [days, hours, minutes, seconds];
            
            items.forEach((item, index) => {
                const numberEl = item.querySelector('.countdown-number');
                if (numberEl) {
                    numberEl.textContent = values[index].toString().padStart(2, '0');
                    
                    // 添加更新动画
                    numberEl.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        numberEl.style.transform = 'scale(1)';
                    }, 300);
                }
            });
        }
        
        if (message) {
            if (customMessage) {
                message.textContent = customMessage;
            } else {
                if (days > 0) {
                    message.textContent = `距离桃汽水公主周年庆还有 ${days} 天`;
                } else if (hours > 0) {
                    message.textContent = `距离周年庆还有 ${hours} 小时`;
                } else if (minutes > 0) {
                    message.textContent = `最后 ${minutes} 分钟！`;
                } else {
                    message.textContent = `最后 ${seconds} 秒！`;
                }
            }
        }
    }
    
    // 绑定功能卡片事件
    bindFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 获取目标模块
                const moduleId = card.dataset.module;
                
                // 使用全局导航函数
                if (window.Taoci && window.Taoci.loadModule) {
                    window.Taoci.loadModule(moduleId);
                } else {
                    // 备用导航
                    window.location.hash = moduleId;
                }
            });
        });
    }
    
    // 刷新图片（用于调试）
    refreshImage() {
        const oldIndex = this.currentImageIndex;
        let newIndex;
        
        // 确保新图片与旧图片不同
        do {
            newIndex = this.getRandomImageIndex();
        } while (newIndex === oldIndex && this.totalImages > 1);
        
        this.currentImageIndex = newIndex;
        const selectedImage = this.config.images[newIndex];
        
        // 重新加载图片
        const container = document.getElementById('character-image-container');
        if (container) {
            const existingImg = container.querySelector('.character-img');
            if (existingImg) {
                existingImg.remove();
            }
            
            // 显示加载状态
            container.innerHTML = `
                <div class="image-loading">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>加载新图片中...</p>
                </div>
            `;
            
            // 加载新图片
            setTimeout(() => {
                this.loadCharacterImage(selectedImage.url, selectedImage.name);
                this.updateImageInfo(selectedImage.name, newIndex + 1, this.totalImages);
            }, 500);
        }
        
        console.log(`🔄 图片刷新: ${oldIndex + 1} → ${newIndex + 1}`);
    }
}

// 模块配置（供主骨架注册）
const homeModuleConfig = {
    id: 'home',
    name: '魔力大厅',
    icon: 'fas fa-home',
    content: document.querySelector('.home-module')?.outerHTML || '',
    onLoad: function() {
        console.log('🏠 首页模块开始加载');
        
        // 创建首页模块实例
        const homeModule = new HomeModule();
        homeModule.init();
        
        // 添加调试按钮（仅本地开发）
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            addDebugButton(homeModule);
        }
    }
};

// 添加调试按钮（仅开发环境）
function addDebugButton(homeModule) {
    const debugBtn = document.createElement('button');
    debugBtn.className = 'dev-debug-btn';
    debugBtn.innerHTML = '🔄 调试';
    debugBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 1000;
        background: var(--neon-purple);
        color: white;
        border: none;
        border-radius: 20px;
        padding: 10px 15px;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(204, 102, 255, 0.3);
        transition: all 0.3s ease;
    `;
    
    debugBtn.onmouseenter = () => {
        debugBtn.style.transform = 'translateY(-2px)';
        debugBtn.style.boxShadow = '0 6px 16px rgba(204, 102, 255, 0.4)';
    };
    
    debugBtn.onmouseleave = () => {
        debugBtn.style.transform = '';
        debugBtn.style.boxShadow = '0 4px 12px rgba(204, 102, 255, 0.3)';
    };
    
    debugBtn.onclick = () => {
        homeModule.refreshImage();
    };
    
    document.body.appendChild(debugBtn);
}

// 注册模块到主框架
if (window.Taoci) {
    window.Taoci.registerModule(homeModuleConfig);
    console.log('✅ 首页模块已注册到主框架');
}