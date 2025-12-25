// 首页模块主类
import config from './home-config.js';

export default class HomeModule {
    constructor() {
        this.config = config;
        this.currentImageIndex = 0;
        this.currentMessageIndex = 0;
        this.isAutoPlaying = true;
        this.timers = [];
        this.eventListeners = [];
        this.container = null;
        this.carouselTimer = null;
        
        // 粒子效果相关
        this.particles = [];
        this.barrages = [];
        
        console.log('首页模块初始化完成');
    }

    async init(appContainer) {
        try {
            // 1. 加载配置
            await this.loadConfig();
            
            // 2. 创建样式链接
            this.loadStyles();
            
            // 3. 渲染模块HTML结构到appContainer
            this.render(appContainer);
            
            // 4. 初始化各子系统
            await this.initImageGallery();
            this.initAnnouncement();
            this.initMessageWall();
            
            // 5. 初始化交互效果（只在桌面端）
            if (window.innerWidth >= 768) {
                this.initInteractiveEffects();
            }
            
            // 6. 绑定事件
            this.bindEvents();
            
            console.log('首页模块加载完成');
            return this;
            
        } catch (error) {
            console.error('首页模块初始化失败:', error);
            this.showError(appContainer, error);
        }
    }

    destroy() {
        console.log('正在销毁首页模块...');
        
        // 清理所有定时器
        this.timers.forEach(timer => {
            clearInterval(timer);
            clearTimeout(timer);
        });
        this.timers = [];
        
        if (this.carouselTimer) {
            clearInterval(this.carouselTimer);
            this.carouselTimer = null;
        }
        
        // 清理动画帧
        this.particles.forEach(particle => {
            if (particle.animationId) {
                cancelAnimationFrame(particle.animationId);
            }
        });
        
        this.barrages.forEach(barrage => {
            if (barrage.animationId) {
                cancelAnimationFrame(barrage.animationId);
            }
        });
        
        // 移除事件监听器
        this.eventListeners.forEach(listener => {
            if (listener.element && listener.handler) {
                listener.element.removeEventListener(listener.event, listener.handler);
            }
        });
        this.eventListeners = [];
        
        // 移除样式
        const styleLink = document.querySelector('link[href*="home-styles"]');
        if (styleLink) {
            styleLink.remove();
        }
        
        // 清理DOM元素
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('首页模块已销毁');
    }

    // ==================== 核心方法 ====================

    async loadConfig() {
        try {
            // 配置已通过import导入，直接使用
            if (!this.config) {
                throw new Error('配置加载失败');
            }
            
            console.log('首页配置加载成功');
            return this.config;
            
        } catch (error) {
            console.error('加载配置失败:', error);
            // 使用默认配置
            this.config = {
                characterImages: [{ 
                    id: 1, 
                    url: '', 
                    alt: '桃汽水', 
                    credit: '系统', 
                    description: '欢迎来到魔力补给站！' 
                }],
                announcements: [{ 
                    id: 1, 
                    title: '欢迎！', 
                    content: '这里是桃汽水的魔力补给站～', 
                    date: new Date().toISOString().split('T')[0], 
                    type: 'welcome' 
                }],
                fanMessages: [{ 
                    id: 1, 
                    text: '感谢大家的支持！', 
                    date: new Date().toISOString().split('T')[0], 
                    emoji: '💖', 
                    likes: 0 
                }],
                settings: {
                    messageCarouselInterval: 10,
                    enableParticles: false,
                    enableBarrage: false
                }
            };
            return this.config;
        }
    }
    
    loadStyles() {
        // 检查是否已经加载了样式
        const existingStyle = document.querySelector('link[href*="home-styles"]');
        if (existingStyle) {
            return;
        }
        
        // 创建样式链接
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './scripts/modules/home/home-styles.css';
        link.id = 'home-module-styles';
        
        // 添加到head
        document.head.appendChild(link);
        
        console.log('首页样式已加载');
    }

    render(container) {
        this.container = container;
        
        const html = `
            <div id="home-module" class="home-module">
                <!-- 皮套图展示区 -->
                <section class="character-section">
                    <div class="character-container">
                        <img id="character-image" src="" alt="" class="character-image">
                        <div class="character-overlay">
                            <button id="refresh-image" class="btn btn-primary refresh-btn">
                                <span class="btn-icon">🔄</span> 换一张
                            </button>
                            <div id="image-info" class="image-info">
                                <span class="image-credit"></span>
                                <span class="image-description"></span>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- 公告板区域 -->
                <section class="announcement-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="title-icon">📢</span> 最新公告
                        </h2>
                    </div>
                    <div id="announcement-board" class="announcement-board card">
                        <!-- 公告内容由JS动态生成 -->
                    </div>
                </section>
                
                <!-- 留言墙区域 -->
                <section class="message-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="title-icon">💌</span> 主播留言
                        </h2>
                    </div>
                    <div id="message-wall" class="message-wall card">
                        <!-- 留言内容由JS动态生成 -->
                    </div>
                </section>
                
                <!-- 趣味交互区域 -->
                <section class="interactive-section">
                    <div id="particle-canvas" class="particle-canvas"></div>
                    <div id="floating-barrage" class="floating-barrage"></div>
                </section>
            </div>
        `;
        
        container.innerHTML = html;
        console.log('首页HTML结构已渲染');
    }
    
    // ==================== 图片画廊系统 ====================

    async initImageGallery() {
        const imageElement = document.getElementById('character-image');
        const imageCredit = document.querySelector('.image-credit');
        const imageDescription = document.querySelector('.image-description');
        
        if (!imageElement || !this.config?.characterImages?.length) {
            console.warn('图片元素未找到或配置为空');
            return;
        }
        
        // 设置占位图
        imageElement.src = './assets/home/placeholder.jpg';
        imageElement.alt = '加载中...';
        imageElement.classList.add('loading');
        
        // 随机选择图片（避免重复）
        let availableIndices = [...Array(this.config.characterImages.length).keys()];
        const lastImageId = localStorage.getItem('lastCharacterImageId');
        
        if (lastImageId) {
            const lastIndex = this.config.characterImages.findIndex(img => img.id == lastImageId);
            if (lastIndex !== -1) {
                availableIndices = availableIndices.filter(idx => idx !== lastIndex);
            }
        }
        
        // 如果所有图片都显示过了，重置
        if (availableIndices.length === 0) {
            availableIndices = [...Array(this.config.characterImages.length).keys()];
        }
        
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        this.currentImageIndex = randomIndex;
        const selectedImage = this.config.characterImages[randomIndex];
        
        // 保存到localStorage
        localStorage.setItem('lastCharacterImageId', selectedImage.id);
        
        // 预加载图片
        await this.preloadImage(selectedImage.url);
        
        // 更新图片
        imageElement.src = selectedImage.url;
        imageElement.alt = selectedImage.alt;
        imageElement.classList.remove('loading');
        
        // 更新图片信息
        if (imageCredit) imageCredit.textContent = selectedImage.credit || '';
        if (imageDescription) imageDescription.textContent = selectedImage.description || '';
        
        // 淡入效果
        imageElement.style.opacity = 0;
        requestAnimationFrame(() => {
            imageElement.style.transition = 'opacity 0.8s ease';
            imageElement.style.opacity = 1;
        });
        
        // 错误处理
        imageElement.onerror = () => {
            console.error('图片加载失败:', selectedImage.url);
            imageElement.src = './assets/home/default-character.jpg';
            imageElement.alt = '默认形象';
            imageElement.classList.add('error');
            
            if (imageCredit) imageCredit.textContent = '图片加载失败';
            if (imageDescription) imageDescription.textContent = '显示默认形象';
        };
        
        console.log('图片画廊初始化完成');
    }
    
    async preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    
    // ==================== 公告板系统 ====================

    initAnnouncement() {
        const board = document.getElementById('announcement-board');
        if (!board) {
            console.warn('公告板元素未找到');
            return;
        }
        
        // 按优先级排序公告（紧急优先）
        const sortedAnnouncements = [...(this.config.announcements || [])].sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0);
        });
        
        if (!sortedAnnouncements.length) {
            board.innerHTML = this.createDefaultAnnouncement();
            return;
        }
        
        // 显示最新的一条公告
        const latestAnnouncement = sortedAnnouncements[0];
        board.innerHTML = this.createAnnouncementHTML(latestAnnouncement, sortedAnnouncements.length);
        
        console.log('公告板初始化完成');
    }
    
    createDefaultAnnouncement() {
        return `
            <div class="announcement-item">
                <div class="announcement-header">
                    <h3 class="announcement-title">欢迎来到魔力补给站！</h3>
                </div>
                <p class="announcement-content">这里是桃汽水的粉丝互动站，最新公告将在这里显示～</p>
                <div class="announcement-footer">
                    <span class="announcement-date">${this.formatDate(new Date().toISOString().split('T')[0])}</span>
                </div>
            </div>
        `;
    }
    
    createAnnouncementHTML(announcement, totalCount) {
        const isUrgent = announcement.type === 'urgent';
        
        return `
            <div class="announcement-item current">
                <div class="announcement-header">
                    <h3 class="announcement-title">${announcement.title}</h3>
                    ${isUrgent ? '<span class="urgent-badge">紧急</span>' : ''}
                </div>
                <p class="announcement-content">${announcement.content}</p>
                <div class="announcement-footer">
                    <span class="announcement-date">${this.formatDate(announcement.date)}</span>
                    ${totalCount > 1 ? 
                        `<button class="btn-more-announcements btn btn-pink" data-count="${totalCount - 1}">
                            查看更多公告 (${totalCount - 1}条)
                         </button>` : 
                        ''}
                </div>
            </div>
        `;
    }
    
    showAllAnnouncements() {
        const board = document.getElementById('announcement-board');
        if (!board) return;
        
        const sortedAnnouncements = [...(this.config.announcements || [])].sort((a, b) => {
            return (b.priority || 0) - (a.priority || 0);
        });
        
        const announcementsHTML = sortedAnnouncements.map((announcement, index) => `
            <div class="announcement-item ${index === 0 ? 'current' : ''}">
                <div class="announcement-header">
                    <h3 class="announcement-title">${announcement.title}</h3>
                    ${announcement.type === 'urgent' ? '<span class="urgent-badge">紧急</span>' : ''}
                </div>
                <p class="announcement-content">${announcement.content}</p>
                <div class="announcement-footer">
                    <span class="announcement-date">${this.formatDate(announcement.date)}</span>
                </div>
            </div>
        `).join('');
        
        board.innerHTML = `
            <div class="announcements-list">
                ${announcementsHTML}
            </div>
            <button class="btn-less-announcements btn btn-pink mt-2">
                收起公告
            </button>
        `;
        
        // 绑定收起按钮事件
        const lessBtn = board.querySelector('.btn-less-announcements');
        if (lessBtn) {
            this.addEventListener(lessBtn, 'click', () => this.initAnnouncement());
        }
    }
    
    // ==================== 留言墙系统 ====================

    initMessageWall() {
        const wall = document.getElementById('message-wall');
        if (!wall) {
            console.warn('留言墙元素未找到');
            return;
        }
        
        if (!this.config?.fanMessages?.length) {
            wall.innerHTML = this.createDefaultMessage();
            return;
        }
        
        this.currentMessageIndex = 0;
        this.renderMessage(wall, this.currentMessageIndex);
        
        // 启动自动轮播
        this.startMessageCarousel();
        
        console.log('留言墙初始化完成');
    }
    
    createDefaultMessage() {
        return `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-avatar">🍑</span>
                    <div class="message-meta">
                        <span class="message-author">桃汽水</span>
                        <span class="message-date">${this.formatDate(new Date().toISOString().split('T')[0])}</span>
                    </div>
                </div>
                <p class="message-content">留言正在准备中，稍后再来看看吧～</p>
                <div class="message-footer">
                    <div class="message-controls">
                        <span class="message-counter">1/1</span>
                    </div>
                    <button class="btn-like" disabled>
                        <span class="like-icon">❤️</span> <span class="like-count">0</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderMessage(container, index) {
        const message = this.config.fanMessages[index];
        if (!message) return;
        
        // 从localStorage获取点赞数
        const likeKey = `message_like_${message.id}`;
        const storedLikes = localStorage.getItem(likeKey);
        const likeCount = storedLikes ? parseInt(storedLikes) : (message.likes || 0);
        
        container.innerHTML = `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-avatar">${message.emoji || '🍑'}</span>
                    <div class="message-meta">
                        <span class="message-author">桃汽水</span>
                        <span class="message-date">${this.formatDate(message.date)}</span>
                    </div>
                </div>
                <p class="message-content">${message.text}</p>
                <div class="message-footer">
                    <div class="message-controls">
                        <button class="btn-prev-message btn btn-sm btn-primary">
                            <span class="btn-icon">←</span>
                        </button>
                        <span class="message-counter">${index + 1}/${this.config.fanMessages.length}</span>
                        <button class="btn-next-message btn btn-sm btn-primary">
                            <span class="btn-icon">→</span>
                        </button>
                        <button class="btn-pause-play btn btn-sm btn-${this.isAutoPlaying ? 'yellow' : 'green'}">
                            <span class="btn-icon">${this.isAutoPlaying ? '⏸️' : '▶️'}</span>
                        </button>
                    </div>
                    <button class="btn-like" data-message-id="${message.id}">
                        <span class="like-icon">❤️</span> <span class="like-count">${likeCount}</span>
                    </button>
                </div>
            </div>
        `;
        
        // 绑定控制按钮事件
        const prevBtn = container.querySelector('.btn-prev-message');
        const nextBtn = container.querySelector('.btn-next-message');
        const pausePlayBtn = container.querySelector('.btn-pause-play');
        const likeBtn = container.querySelector('.btn-like');
        
        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', () => this.showPrevMessage());
        }
        
        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', () => this.showNextMessage());
        }
        
        if (pausePlayBtn) {
            this.addEventListener(pausePlayBtn, 'click', () => this.toggleCarousel());
        }
        
        if (likeBtn) {
            this.addEventListener(likeBtn, 'click', () => this.handleLike(message.id, likeBtn));
        }
    }
    
    showPrevMessage() {
        if (!this.config?.fanMessages?.length) return;
        
        this.currentMessageIndex = (this.currentMessageIndex - 1 + this.config.fanMessages.length) % this.config.fanMessages.length;
        this.renderMessage(document.getElementById('message-wall'), this.currentMessageIndex);
    }
    
    showNextMessage() {
        if (!this.config?.fanMessages?.length) return;
        
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.config.fanMessages.length;
        this.renderMessage(document.getElementById('message-wall'), this.currentMessageIndex);
    }
    
    startMessageCarousel() {
        if (this.carouselTimer) {
            clearInterval(this.carouselTimer);
        }
        
        const interval = (this.config.settings?.messageCarouselInterval || 10) * 1000;
        
        this.carouselTimer = setInterval(() => {
            if (this.isAutoPlaying && this.config?.fanMessages?.length > 1) {
                this.showNextMessage();
            }
        }, interval);
        
        this.timers.push(this.carouselTimer);
    }
    
    toggleCarousel() {
        this.isAutoPlaying = !this.isAutoPlaying;
        
        const icon = document.querySelector('.btn-pause-play .btn-icon');
        const button = document.querySelector('.btn-pause-play');
        
        if (icon && button) {
            icon.textContent = this.isAutoPlaying ? '⏸️' : '▶️';
            button.className = button.className.replace(/btn-\w+/, this.isAutoPlaying ? 'btn-yellow' : 'btn-green');
        }
        
        if (this.isAutoPlaying) {
            this.startMessageCarousel();
        } else {
            clearInterval(this.carouselTimer);
            this.carouselTimer = null;
        }
    }
    
    handleLike(messageId, button) {
        const likeKey = `message_like_${messageId}`;
        let likeCount = parseInt(button.querySelector('.like-count').textContent);
        likeCount++;
        
        // 保存到localStorage
        localStorage.setItem(likeKey, likeCount);
        
        // 更新显示
        const countSpan = button.querySelector('.like-count');
        if (countSpan) {
            countSpan.textContent = likeCount;
        }
        
        // 添加动画效果
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 300);
        
        console.log(`留言 ${messageId} 点赞数: ${likeCount}`);
    }
    
    // ==================== 交互效果系统 ====================

    initInteractiveEffects() {
        const settings = this.config.settings || {};
        
        if (settings.enableParticles !== false && window.innerWidth >= 768) {
            this.initParticleEffect();
        }
        
        if (settings.enableBarrage !== false && window.innerWidth >= 768) {
            this.initFloatingBarrage();
        }
        
        console.log('交互效果初始化完成');
    }
    
    initParticleEffect() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        
        const particleCount = window.innerWidth < 768 ? 
            (this.config.settings?.mobileParticleCount || 10) : 
            (this.config.settings?.particleCount || 30);
        
        // 主题颜色
        const colors = [
            'rgba(179, 157, 219, 0.6)',  // primary
            'rgba(244, 143, 177, 0.6)',  // secondary
            'rgba(206, 147, 216, 0.6)',  // purple
            'rgba(144, 202, 249, 0.6)',  // blue
            'rgba(255, 204, 128, 0.6)',  // orange
            'rgba(165, 214, 167, 0.6)',  // green
            'rgba(255, 245, 157, 0.6)'   // yellow
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle(canvas, colors);
            if (particle) {
                this.particles.push(particle);
                this.animateParticle(particle);
            }
        }
    }
    
    createParticle(container, colors) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机位置（避免覆盖重要内容）
        const left = Math.random() * 90 + 5; // 5% - 95%
        const top = Math.random() * 70 + 15; // 15% - 85%
        
        // 随机大小
        const size = Math.random() * 4 + 1;
        
        // 随机颜色
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 初始透明度
        const opacity = Math.random() * 0.4 + 0.3;
        
        particle.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            opacity: ${opacity};
            will-change: transform, opacity;
        `;
        
        container.appendChild(particle);
        
        return {
            element: particle,
            x: left,
            y: top,
            size: size,
            color: color,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -Math.random() * 0.2,
            opacity: opacity,
            animationId: null
        };
    }
    
    animateParticle(particle) {
        const animate = () => {
            // 更新位置
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // 边界处理
            if (particle.x < 0) particle.x = 100;
            if (particle.x > 100) particle.x = 0;
            if (particle.y < 0) {
                // 粒子到达顶部，重置到底部
                particle.y = 100;
                particle.x = Math.random() * 100;
            }
            
            // 更新透明度（呼吸效果）
            particle.opacity = 0.3 + Math.sin(Date.now() / 1000 + particle.x) * 0.3;
            
            // 应用变化
            particle.element.style.left = `${particle.x}%`;
            particle.element.style.top = `${particle.y}%`;
            particle.element.style.opacity = particle.opacity;
            
            // 继续动画
            particle.animationId = requestAnimationFrame(animate);
        };
        
        particle.animationId = requestAnimationFrame(animate);
    }
    
    initFloatingBarrage() {
        const container = document.getElementById('floating-barrage');
        if (!container || !this.config?.barrageMessages?.length) return;
        
        const settings = this.config.settings || {};
        const interval = (settings.barrageInterval || 8) * 1000;
        const count = settings.barrageCount || 3;
        
        // 初始创建弹幕
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createBarrage(container);
            }, i * (interval / count));
        }
        
        // 定时创建新弹幕
        const barrageTimer = setInterval(() => {
            this.createBarrage(container);
        }, interval);
        
        this.timers.push(barrageTimer);
    }
    
    createBarrage(container) {
        if (!this.config?.barrageMessages?.length) return;
        
        const barrage = document.createElement('div');
        barrage.className = 'barrage';
        
        // 随机选择内容
        const messages = this.config.barrageMessages;
        const text = messages[Math.floor(Math.random() * messages.length)];
        
        // 随机颜色
        const colors = [
            '#B39DDB', '#F48FB1', '#CE93D8', 
            '#90CAF9', '#FFCC80', '#A5D6A7', '#FFF59D'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机起始位置（从右侧进入）
        const top = Math.random() * 70 + 15; // 15% - 85%
        
        barrage.textContent = text;
        barrage.style.cssText = `
            position: absolute;
            top: ${top}%;
            right: -200px;
            color: ${color};
            font-size: 14px;
            white-space: nowrap;
            text-shadow: 0 0 5px ${color}80;
            pointer-events: auto;
            cursor: pointer;
            opacity: 0.8;
            transition: all 0.3s ease;
            font-weight: 500;
            will-change: transform, opacity;
            z-index: 50;
        `;
        
        container.appendChild(barrage);
        
        // 动画参数
        const startTime = Date.now();
        const duration = 15000; // 15秒
        const startRight = -200;
        const endRight = window.innerWidth + 200;
        
        const barrageData = {
            element: barrage,
            startTime: startTime,
            duration: duration,
            startRight: startRight,
            endRight: endRight,
            animationId: null
        };
        
        this.barrages.push(barrageData);
        
        // 点击交互
        this.addEventListener(barrage, 'click', () => {
            barrage.style.opacity = '1';
            barrage.style.fontWeight = 'bold';
            barrage.style.textShadow = `0 0 10px ${color}`;
            barrage.style.fontSize = '16px';
            
            setTimeout(() => {
                barrage.style.opacity = '0.8';
                barrage.style.fontWeight = '500';
                barrage.style.textShadow = `0 0 5px ${color}80`;
                barrage.style.fontSize = '14px';
            }, 1000);
        });
        
        // 开始动画
        this.animateBarrage(barrageData);
    }
    
    animateBarrage(barrage) {
        const animate = () => {
            const elapsed = Date.now() - barrage.startTime;
            const progress = Math.min(elapsed / barrage.duration, 1);
            
            if (progress < 1) {
                // 计算当前位置
                const currentRight = barrage.startRight + progress * (barrage.endRight - barrage.startRight);
                
                // 透明度变化（淡入淡出）
                let opacity = 0.8;
                if (progress < 0.1) {
                    opacity = progress * 10 * 0.8;
                } else if (progress > 0.9) {
                    opacity = (1 - progress) * 10 * 0.8;
                }
                
                // 应用变化
                barrage.element.style.right = `${currentRight}px`;
                barrage.element.style.opacity = opacity;
                
                // 继续动画
                barrage.animationId = requestAnimationFrame(animate);
            } else {
                // 动画完成，移除元素
                if (barrage.element.parentNode) {
                    barrage.element.parentNode.removeChild(barrage.element);
                }
                
                // 从数组中移除
                const index = this.barrages.indexOf(barrage);
                if (index > -1) {
                    this.barrages.splice(index, 1);
                }
            }
        };
        
        barrage.animationId = requestAnimationFrame(animate);
    }
    
    // ==================== 事件绑定 ====================

    bindEvents() {
        // 图片刷新按钮
        const refreshBtn = document.getElementById('refresh-image');
        if (refreshBtn) {
            this.addEventListener(refreshBtn, 'click', () => {
                this.initImageGallery();
                
                // 添加点击反馈
                refreshBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    refreshBtn.style.transform = 'scale(1)';
                }, 150);
            });
        }
        
        // 查看更多公告按钮
        const moreAnnouncementsHandler = (e) => {
            const target = e.target.closest('.btn-more-announcements');
            if (target) {
                this.showAllAnnouncements();
            }
        };
        
        this.addEventListener(document, 'click', moreAnnouncementsHandler);
        
        // 留言墙悬停控制
        const messageWall = document.getElementById('message-wall');
        if (messageWall) {
            this.addEventListener(messageWall, 'mouseenter', () => {
                if (this.isAutoPlaying) {
                    this.toggleCarousel();
                }
            });
            
            this.addEventListener(messageWall, 'mouseleave', () => {
                if (!this.isAutoPlaying) {
                    this.toggleCarousel();
                }
            });
        }
        
        // 窗口大小变化
        this.addEventListener(window, 'resize', this.handleResize.bind(this));
        
        console.log('事件绑定完成');
    }
    
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    handleResize() {
        // 重新初始化交互效果（如果窗口大小变化）
        if (window.innerWidth >= 768) {
            // 清理现有效果
            this.particles.forEach(p => {
                if (p.element.parentNode) {
                    p.element.parentNode.removeChild(p.element);
                }
                if (p.animationId) {
                    cancelAnimationFrame(p.animationId);
                }
            });
            this.particles = [];
            
            this.barrages.forEach(b => {
                if (b.element.parentNode) {
                    b.element.parentNode.removeChild(b.element);
                }
                if (b.animationId) {
                    cancelAnimationFrame(b.animationId);
                }
            });
            this.barrages = [];
            
            // 重新初始化
            this.initInteractiveEffects();
        }
    }
    
    // ==================== 工具方法 ====================

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (isNaN(diffDays)) {
                return dateString;
            }
            
            if (diffDays === 0) return '今天';
            if (diffDays === 1) return '昨天';
            if (diffDays < 7) return `${diffDays}天前`;
            
            return date.toLocaleDateString('zh-CN', { 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            console.error('日期格式化错误:', error);
            return dateString;
        }
    }
    
    showError(container, error) {
        container.innerHTML = `
            <div class="card" style="max-width: 600px; margin: 2rem auto;">
                <h2 class="card-title">页面加载失败</h2>
                <p class="card-content">抱歉，首页模块加载时出现了问题：${error.message}</p>
                <div class="mt-2">
                    <button id="retry-home" class="btn btn-primary">重试</button>
                    <button onclick="window.app.navigate('/')" class="btn btn-pink ml-2">返回首页</button>
                </div>
            </div>
        `;
        
        const retryBtn = document.getElementById('retry-home');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.destroy();
                this.init(container);
            });
        }
    }
}