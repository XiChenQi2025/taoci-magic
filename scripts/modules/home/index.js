// 首页模块主类
export default class HomeModule {
    constructor() {
        // 动态皮套图配置
        this.characterImages = [
            { 
                id: 1, 
                url: './assets/home/character-1.jpg', 
                alt: '桃汽水-日常服', 
                credit: '画师：桃之梦',
                mainColor: '#FF00FF'
            },
            { 
                id: 2, 
                url: './assets/home/character-2.jpg', 
                alt: '桃汽水-庆典服', 
                credit: '画师：甜汽水',
                mainColor: '#BF00FF'
            },
            { 
                id: 3, 
                url: './assets/home/character-3.jpg', 
                alt: '桃汽水-魔力觉醒', 
                credit: '画师：星之绘',
                mainColor: '#00BFFF'
            },
            { 
                id: 4, 
                url: './assets/home/character-4.jpg', 
                alt: '桃汽水-星空漫步', 
                credit: '画师：幻月',
                mainColor: '#00FF00'
            },
            { 
                id: 5, 
                url: './assets/home/character-5.jpg', 
                alt: '桃汽水-夏日限定', 
                credit: '画师：夏日冰',
                mainColor: '#FFFF00'
            }
        ];
        
        // 主播留言配置
        this.streamerMessages = [
            {
                id: 1,
                text: '感谢大家一直以来的支持！每次看到你们的弹幕和留言，都是我最大的动力～',
                date: '2024-03-15',
                emoji: '❤️'
            },
            {
                id: 2,
                text: '最近在练习新的歌曲，希望能在下一次直播给大家带来惊喜！',
                date: '2024-03-10',
                emoji: '🎵'
            },
            {
                id: 3,
                text: '12-24周年庆即将到来，准备了好多特别节目和福利，一定要来哦！',
                date: '2024-03-05',
                emoji: '🎉'
            },
            {
                id: 4,
                text: '天气转凉啦，各位小桃子们记得添衣保暖，不要生病哦～',
                date: '2024-02-28',
                emoji: '☕'
            },
            {
                id: 5,
                text: '新衣服正在制作中！是大家投票选出的星空主题，超期待的！',
                date: '2024-02-20',
                emoji: '✨'
            }
        ];
        
        // 周年庆活动配置
        this.anniversaryEvents = {
            title: '🎉 12-24周年狂欢庆典 🎉',
            countdownTo: '2024-06-01T20:00:00',
            highlights: [
                {
                    icon: '🎤',
                    text: '限定纪念直播 - 独家新曲首发'
                },
                {
                    icon: '🎁',
                    text: '特别福利抽奖 - 签名周边放送'
                },
                {
                    icon: '👗',
                    text: '新衣装发布 - 星空主题限定'
                },
                {
                    icon: '🎮',
                    text: '互动游戏夜 - 与主播一起玩'
                }
            ],
            schedule: [
                { time: '20:00', event: '周年庆开场 & 新曲发布' },
                { time: '20:30', event: '新衣装展示 & 幕后故事' },
                { time: '21:00', event: '互动游戏环节' },
                { time: '21:30', event: '福利抽奖时间' },
                { time: '22:00', event: '粉丝感谢时间' }
            ]
        };
        
        // 弹幕消息配置
        this.barrageMessages = [
            '桃汽水最棒！',
            '生日快乐！',
            '新衣服好美～',
            '永远支持你！',
            '歌声太治愈了',
            '期待周年庆！',
            '魔力补给站',
            '桃桃放心飞',
            '桃子永相随',
            '直播加油！'
        ];
        
        this.currentImageIndex = -1;
        this.currentMessageIndex = 0;
        this.isAutoPlaying = true;
        this.likedMessages = new Set();
        this.barrageInterval = null;
        this.particles = [];
        this.timers = [];
        
        // 尝试获取上次的图片记录
        const lastImageId = localStorage.getItem('lastCharacterImageId');
        if (lastImageId) {
            this.lastImageId = parseInt(lastImageId);
        }
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式
            this.injectStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 初始化各子系统
            await this.initImageGallery();
            this.initAnnouncement();
            this.initMessageWall();
            this.initInteractiveEffects();
            
            // 4. 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('首页模块初始化失败:', error);
            appContainer.innerHTML = `
                <div class="card">
                    <h2 class="card-title">首页加载失败</h2>
                    <p class="card-content">网络开小差了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    destroy() {
        // 清理所有定时器
        this.timers.forEach(timer => clearInterval(timer));
        this.timers = [];
        
        if (this.barrageInterval) {
            clearInterval(this.barrageInterval);
            this.barrageInterval = null;
        }
        
        // 清理粒子动画
        if (this.particleAnimationFrame) {
            cancelAnimationFrame(this.particleAnimationFrame);
        }
        
        // 移除事件监听
        if (this.messageCard) {
            this.messageCard.removeEventListener('mouseenter', this.pauseMessages);
            this.messageCard.removeEventListener('mouseleave', this.resumeMessages);
        }
        
        // 清理DOM元素
        const style = document.getElementById('home-module-styles');
        if (style) style.remove();
        
        const barrage = document.querySelector('.barrage-container');
        if (barrage) barrage.remove();
        
        const particles = document.querySelector('.particle-container');
        if (particles) particles.remove();
    }

    injectStyles() {
        // 检查是否已加载过样式
        if (document.getElementById('home-module-styles')) {
            return;
        }
        
        // 直接内联注入CSS内容，避免路径问题
        const style = document.createElement('style');
        style.id = 'home-module-styles';
        
        style.textContent = `
            /* 首页模块特有样式 - 内联注入避免路径问题 */
            
            /* 动态皮套图容器 */
            .character-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 5;
                pointer-events: none;
            }
            
            .character-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 0.8s ease;
            }
            
            .character-image.loaded {
                opacity: 1;
            }
            
            .character-mask {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(
                    circle at 30% 50%,
                    transparent 20%,
                    rgba(10, 10, 10, 0.4) 70%
                );
                z-index: 1;
            }
            
            .character-credit {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.5);
                color: rgba(255, 255, 255, 0.7);
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.8rem;
                z-index: 2;
            }
            
            /* 内容悬浮层 */
            .home-content-layer {
                position: relative;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 20;
                padding: 2rem;
            }
            
            /* 顶部留空区域 */
            .home-top-space {
                height: 20vh;
                width: 100%;
            }
            
            /* 中间内容区 */
            .home-middle-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 90%;
                max-width: 1400px;
                height: 60vh;
                gap: 2rem;
            }
            
            /* 底部留空区域 */
            .home-bottom-space {
                height: 20vh;
                width: 100%;
            }
            
            /* 公告板卡片 */
            .announcement-card {
                background: var(--card-bg);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 3px solid rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                padding: 2rem;
                width: 45%;
                min-height: 400px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1),
                            0 0 20px rgba(255, 255, 157, 0.3);
                border-top: 4px solid;
                border-image: var(--rainbow) 1;
                position: relative;
                overflow: hidden;
            }
            
            .announcement-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--rainbow);
                border-radius: 20px 20px 0 0;
            }
            
            .announcement-title {
                font-size: 1.8rem;
                color: var(--yellow);
                text-align: center;
                margin-bottom: 1.5rem;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
                animation: blink 2s infinite;
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .countdown-display {
                font-size: 1.4rem;
                color: var(--orange);
                text-align: center;
                margin: 1rem 0;
                padding: 0.8rem;
                background: rgba(255, 165, 0, 0.1);
                border-radius: 10px;
                border: 1px solid rgba(255, 165, 0, 0.3);
            }
            
            .highlights-list {
                list-style: none;
                padding: 1rem 0;
            }
            
            .highlights-list li {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin: 0.8rem 0;
                font-size: 1.1rem;
            }
            
            .highlight-icon {
                font-size: 1.5rem;
                width: 40px;
                text-align: center;
            }
            
            .schedule-btn {
                display: block;
                margin: 1.5rem auto;
                padding: 0.8rem 1.5rem;
                background: linear-gradient(135deg, var(--yellow), #FFF176);
                color: #333;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 3px solid rgba(255, 255, 255, 0.95);
            }
            
            .schedule-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(255, 245, 157, 0.4),
                            0 0 0 3px rgba(255, 255, 255, 0.95) inset;
            }
            
            .schedule-panel {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 10px;
                padding: 1.5rem;
                margin-top: 1rem;
                display: none;
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .schedule-panel.active {
                display: block;
            }
            
            .schedule-item {
                display: flex;
                align-items: center;
                padding: 0.8rem;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .schedule-time {
                font-weight: bold;
                color: var(--purple);
                width: 80px;
            }
            
            .subscribe-btn {
                width: 100%;
                margin-top: 1.5rem;
                padding: 1rem;
                font-size: 1.1rem;
            }
            
            /* 留言墙卡片 */
            .message-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border-radius: 20px;
                padding: 2rem;
                width: 45%;
                min-height: 400px;
                position: relative;
                border: 3px solid var(--primary);
                box-shadow: 0 10px 30px rgba(179, 157, 219, 0.3);
            }
            
            .streamer-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid var(--primary);
                box-shadow: 0 0 20px rgba(179, 157, 219, 0.3);
                margin-bottom: 1rem;
            }
            
            .message-content {
                font-size: 1.2rem;
                line-height: 1.6;
                color: #333;
                min-height: 150px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .message-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(179, 157, 219, 0.2);
            }
            
            .message-date {
                color: #666;
                font-size: 0.9rem;
            }
            
            .message-controls {
                display: flex;
                gap: 1rem;
                align-items: center;
            }
            
            .control-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--primary);
                transition: all 0.3s ease;
                padding: 0.5rem;
                border-radius: 50%;
            }
            
            .control-btn:hover {
                background: rgba(179, 157, 219, 0.1);
                transform: scale(1.1);
            }
            
            .like-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(179, 157, 219, 0.1);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                color: var(--primary);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .like-btn:hover {
                background: rgba(179, 157, 219, 0.2);
                transform: translateY(-2px);
            }
            
            .like-btn.liked {
                background: var(--primary);
                color: white;
            }
            
            .message-counter {
                font-size: 0.9rem;
                color: #666;
                text-align: center;
                margin-top: 1rem;
            }
            
            /* 弹幕系统 */
            .barrage-container {
                position: fixed;
                bottom: 10%;
                left: 0;
                width: 100%;
                height: 40%;
                z-index: 50;
                pointer-events: none;
                overflow: hidden;
            }
            
            .barrage-item {
                position: absolute;
                white-space: nowrap;
                font-size: 1rem;
                opacity: 0.8;
                pointer-events: auto;
                cursor: pointer;
                transition: opacity 0.3s ease;
                text-shadow: 0 0 5px currentColor;
            }
            
            .barrage-item:hover {
                opacity: 1;
                transform: scale(1.1);
            }
            
            /* 粒子系统 */
            .particle-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 40;
                pointer-events: none;
            }
            
            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                pointer-events: none;
            }
            
            /* 响应式设计 */
            @media (max-width: 1200px) {
                .home-middle-content {
                    flex-direction: column;
                    justify-content: center;
                    gap: 3rem;
                    height: auto;
                }
                
                .announcement-card,
                .message-card {
                    width: 90%;
                    max-width: 600px;
                }
            }
            
            @media (max-width: 768px) {
                .home-content-layer {
                    padding: 1rem;
                }
                
                .character-image {
                    object-fit: contain;
                }
                
                .announcement-title {
                    font-size: 1.5rem;
                }
                
                .message-content {
                    font-size: 1.1rem;
                }
                
                .barrage-container {
                    display: none; /* 移动端关闭弹幕保证性能 */
                }
                
                .particle-container {
                    display: none; /* 移动端关闭粒子效果 */
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    render(container) {
        container.innerHTML = `
            <!-- 动态皮套图容器 -->
            <div class="character-container">
                <div class="character-mask"></div>
                <img class="character-image" src="" alt="" />
                <div class="character-credit"></div>
            </div>
            
            <!-- 内容悬浮层 -->
            <div class="home-content-layer">
                <div class="home-top-space"></div>
                
                <div class="home-middle-content">
                    <!-- 留言墙卡片 -->
                    <div class="message-card">
                        <img class="streamer-avatar" src="./assets/avatar.png" alt="桃汽水头像">
                        <div class="message-content">
                            <span class="message-emoji"></span>
                            <span class="message-text"></span>
                        </div>
                        <div class="message-meta">
                            <div class="message-date"></div>
                            <div class="message-controls">
                                <button class="control-btn prev-btn">◀</button>
                                <button class="control-btn pause-btn">⏸</button>
                                <button class="control-btn next-btn">▶</button>
                                <button class="like-btn">
                                    <span class="like-emoji">❤️</span>
                                    <span class="like-count">0</span>
                                </button>
                            </div>
                        </div>
                        <div class="message-counter"></div>
                    </div>
                    
                    <!-- 公告板卡片 -->
                    <div class="announcement-card">
                        <h2 class="announcement-title">${this.anniversaryEvents.title}</h2>
                        <div class="countdown-display"></div>
                        <ul class="highlights-list">
                            ${this.anniversaryEvents.highlights.map(item => `
                                <li>
                                    <span class="highlight-icon">${item.icon}</span>
                                    <span>${item.text}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <button class="schedule-btn">查看详细日程</button>
                        <div class="schedule-panel">
                            ${this.anniversaryEvents.schedule.map(item => `
                                <div class="schedule-item">
                                    <div class="schedule-time">${item.time}</div>
                                    <div>${item.event}</div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-yellow subscribe-btn">点击订阅直播提醒</button>
                    </div>
                </div>
                
                <div class="home-bottom-space"></div>
            </div>
            
            <!-- 弹幕容器 -->
            <div class="barrage-container"></div>
            
            <!-- 粒子容器 -->
            <div class="particle-container"></div>
        `;
        
        // 保存重要元素的引用
        this.characterImage = container.querySelector('.character-image');
        this.characterCredit = container.querySelector('.character-credit');
        this.messageCard = container.querySelector('.message-card');
        this.messageText = container.querySelector('.message-text');
        this.messageEmoji = container.querySelector('.message-emoji');
        this.messageDate = container.querySelector('.message-date');
        this.messageCounter = container.querySelector('.message-counter');
        this.prevBtn = container.querySelector('.prev-btn');
        this.pauseBtn = container.querySelector('.pause-btn');
        this.nextBtn = container.querySelector('.next-btn');
        this.likeBtn = container.querySelector('.like-btn');
        this.likeCount = container.querySelector('.like-count');
        this.countdownDisplay = container.querySelector('.countdown-display');
        this.scheduleBtn = container.querySelector('.schedule-btn');
        this.schedulePanel = container.querySelector('.schedule-panel');
        this.subscribeBtn = container.querySelector('.subscribe-btn');
        this.barrageContainer = container.querySelector('.barrage-container');
        this.particleContainer = container.querySelector('.particle-container');
    }

    async initImageGallery() {
        const images = this.characterImages;
        
        // 防重复逻辑：如果上次有记录，尝试选不同的图片
        let availableIndices = images.map((_, index) => index);
        
        if (this.lastImageId !== undefined) {
            const lastIndex = images.findIndex(img => img.id === this.lastImageId);
            if (lastIndex !== -1) {
                availableIndices = availableIndices.filter(i => i !== lastIndex);
            }
        }
        
        // 随机选择一张图片
        const randomIndex = availableIndices.length > 0 
            ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
            : Math.floor(Math.random() * images.length);
            
        this.currentImageIndex = randomIndex;
        const selectedImage = images[randomIndex];
        
        // 保存选择记录
        localStorage.setItem('lastCharacterImageId', selectedImage.id.toString());
        
        // 设置图片
        this.characterImage.alt = selectedImage.alt;
        this.characterCredit.textContent = selectedImage.credit || '';
        
        // 预加载图片
        await this.loadImage(selectedImage.url);
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.characterImage.src = url;
                setTimeout(() => {
                    this.characterImage.classList.add('loaded');
                    resolve();
                }, 100);
            };
            img.onerror = () => {
                // 加载失败时使用占位图
                this.characterImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="%230a0a0a"/><text x="200" y="300" font-family="Arial" font-size="20" fill="white" text-anchor="middle">桃汽水の魔力补给站</text></svg>';
                this.characterImage.alt = '图片加载失败';
                this.characterCredit.textContent = '图片加载失败，请刷新重试';
                this.characterImage.classList.add('loaded');
                reject(new Error('图片加载失败'));
            };
            img.src = url;
        });
    }

    initAnnouncement() {
        // 初始化倒计时
        this.updateCountdown();
        this.timers.push(setInterval(() => this.updateCountdown(), 1000));
        
        // 计算距离周年庆的天数
        const targetDate = new Date(this.anniversaryEvents.countdownTo);
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
            this.countdownDisplay.textContent = '🎉 庆典进行中！ 🎉';
        } else {
            this.countdownDisplay.textContent = `距离庆典还有 ${diffDays} 天`;
        }
    }

    updateCountdown() {
        const targetDate = new Date(this.anniversaryEvents.countdownTo);
        const now = new Date();
        
        const diffMs = targetDate - now;
        
        if (diffMs <= 0) {
            this.countdownDisplay.textContent = '🎉 庆典进行中！ 🎉';
            return;
        }
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        this.countdownDisplay.textContent = `距离庆典还有 ${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
    }

    initMessageWall() {
        // 加载点赞记录
        this.loadLikedMessages();
        
        // 显示第一条留言
        this.showMessage(this.currentMessageIndex);
        
        // 自动轮播
        this.startAutoPlay();
        
        // 保存方法引用用于事件监听
        this.pauseMessages = () => this.pauseAutoPlay();
        this.resumeMessages = () => this.startAutoPlay();
        
        // 添加鼠标悬停暂停/恢复
        this.messageCard.addEventListener('mouseenter', this.pauseMessages);
        this.messageCard.addEventListener('mouseleave', this.resumeMessages);
    }

    showMessage(index) {
        const messages = this.streamerMessages;
        if (messages.length === 0) return;
        
        // 循环索引
        if (index >= messages.length) index = 0;
        if (index < 0) index = messages.length - 1;
        
        this.currentMessageIndex = index;
        const message = messages[index];
        
        // 更新显示
        this.messageText.textContent = message.text;
        this.messageEmoji.textContent = message.emoji + ' ';
        this.messageDate.textContent = message.date;
        this.messageCounter.textContent = `${index + 1} / ${messages.length}`;
        
        // 更新点赞按钮状态
        const isLiked = this.likedMessages.has(message.id);
        this.likeBtn.classList.toggle('liked', isLiked);
        
        // 获取点赞数
        const likes = localStorage.getItem(`message_likes_${message.id}`) || '0';
        this.likeCount.textContent = likes;
    }

    startAutoPlay() {
        if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
        
        this.autoPlayTimer = setInterval(() => {
            this.currentMessageIndex++;
            this.showMessage(this.currentMessageIndex);
        }, 8000);
        
        this.isAutoPlaying = true;
        this.pauseBtn.textContent = '⏸';
    }

    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        
        this.isAutoPlaying = false;
        this.pauseBtn.textContent = '▶';
    }

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    loadLikedMessages() {
        const liked = localStorage.getItem('liked_messages');
        if (liked) {
            this.likedMessages = new Set(JSON.parse(liked));
        }
    }

    saveLikedMessages() {
        localStorage.setItem('liked_messages', JSON.stringify([...this.likedMessages]));
    }

    initInteractiveEffects() {
        // 初始化弹幕系统（桌面端）
        if (window.innerWidth > 768) {
            this.initBarrageSystem();
        }
        
        // 初始化粒子系统（桌面端）
        if (window.innerWidth > 768) {
            this.initParticleSystem();
        }
    }

    initBarrageSystem() {
        // 创建弹幕
        const createBarrage = () => {
            const messages = this.barrageMessages;
            const text = messages[Math.floor(Math.random() * messages.length)];
            
            const barrage = document.createElement('div');
            barrage.className = 'barrage-item';
            barrage.textContent = text;
            
            // 随机颜色
            const colors = ['#FF00FF', '#BF00FF', '#00BFFF', '#00FF00', '#FFFF00', '#FFA500'];
            barrage.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            // 随机位置和速度
            const top = Math.random() * 80 + 10; // 10% - 90%
            const speed = Math.random() * 100 + 50; // 50-150px每秒
            const duration = (window.innerWidth + 200) / speed;
            
            barrage.style.top = `${top}%`;
            barrage.style.left = `-200px`;
            barrage.style.transform = `translateX(-100%)`;
            
            this.barrageContainer.appendChild(barrage);
            
            // 动画
            barrage.animate([
                { transform: `translateX(-100%)`, opacity: 0 },
                { transform: `translateX(0%)`, opacity: 1 },
                { transform: `translateX(0%)`, opacity: 1, offset: 0.8 },
                { transform: `translateX(100%)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'linear'
            });
            
            // 点击效果
            barrage.addEventListener('click', () => {
                barrage.style.opacity = '1';
                barrage.style.textShadow = '0 0 15px currentColor';
                setTimeout(() => {
                    barrage.style.opacity = '';
                    barrage.style.textShadow = '';
                }, 1000);
            });
            
            // 移除元素
            setTimeout(() => {
                if (barrage.parentNode) {
                    barrage.remove();
                }
            }, duration * 1000 + 1000);
        };
        
        // 定时生成弹幕
        this.barrageInterval = setInterval(createBarrage, 2000);
        // 初始创建一些弹幕
        for (let i = 0; i < 5; i++) {
            setTimeout(createBarrage, i * 300);
        }
    }

    initParticleSystem() {
        // 根据当前皮套图的主色调设置粒子颜色
        const currentImage = this.characterImages[this.currentImageIndex];
        const mainColor = currentImage?.mainColor || '#FF00FF';
        
        // 鼠标移动时生成粒子
        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768) return;
            
            // 创建一些粒子
            for (let i = 0; i < 3; i++) {
                this.createParticle(e.clientX, e.clientY, mainColor);
            }
        });
        
        // 动画循环
        const animateParticles = () => {
            this.updateParticles();
            this.particleAnimationFrame = requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }

    createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = color;
        
        // 随机大小和透明度
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        
        this.particleContainer.appendChild(particle);
        
        // 粒子数据
        const particleData = {
            element: particle,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01
        };
        
        this.particles.push(particleData);
        
        // 限制粒子数量
        if (this.particles.length > 100) {
            const oldParticle = this.particles.shift();
            if (oldParticle.element.parentNode) {
                oldParticle.element.remove();
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // 阻力
            particle.vy += 0.05; // 重力
            
            // 更新生命周期
            particle.life -= particle.decay;
            
            // 更新元素
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.opacity = particle.life;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                if (particle.element.parentNode) {
                    particle.element.remove();
                }
                this.particles.splice(i, 1);
            }
        }
    }

    bindEvents() {
        // 留言墙控制
        this.prevBtn.addEventListener('click', () => {
            this.currentMessageIndex--;
            this.showMessage(this.currentMessageIndex);
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.currentMessageIndex++;
            this.showMessage(this.currentMessageIndex);
        });
        
        this.pauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        
        this.likeBtn.addEventListener('click', () => {
            const currentMessage = this.streamerMessages[this.currentMessageIndex];
            const isLiked = this.likedMessages.has(currentMessage.id);
            
            if (isLiked) {
                // 取消点赞
                this.likedMessages.delete(currentMessage.id);
                this.likeBtn.classList.remove('liked');
                
                // 更新本地存储点赞数
                let likes = parseInt(localStorage.getItem(`message_likes_${currentMessage.id}`) || '0');
                likes = Math.max(0, likes - 1);
                localStorage.setItem(`message_likes_${currentMessage.id}`, likes.toString());
                this.likeCount.textContent = likes;
            } else {
                // 点赞
                this.likedMessages.add(currentMessage.id);
                this.likeBtn.classList.add('liked');
                
                // 更新本地存储点赞数
                let likes = parseInt(localStorage.getItem(`message_likes_${currentMessage.id}`) || '0');
                likes += 1;
                localStorage.setItem(`message_likes_${currentMessage.id}`, likes.toString());
                this.likeCount.textContent = likes;
            }
            
            this.saveLikedMessages();
        });
        
        // 公告板控制
        this.scheduleBtn.addEventListener('click', () => {
            this.schedulePanel.classList.toggle('active');
            this.scheduleBtn.textContent = this.schedulePanel.classList.contains('active') 
                ? '收起日程' 
                : '查看详细日程';
        });
        
        this.subscribeBtn.addEventListener('click', () => {
            alert('已订阅直播提醒！周年庆开始前会通过浏览器通知提醒您～');
        });
        
        // 窗口大小变化时调整效果
        window.addEventListener('resize', () => {
            // 移动端关闭特效，桌面端重新初始化
            if (window.innerWidth <= 768) {
                if (this.barrageInterval) {
                    clearInterval(this.barrageInterval);
                    this.barrageInterval = null;
                }
                if (this.particleContainer) {
                    this.particleContainer.style.display = 'none';
                }
            } else {
                if (!this.barrageInterval) {
                    this.initBarrageSystem();
                }
                if (this.particleContainer) {
                    this.particleContainer.style.display = 'block';
                }
            }
        });
    }
}