// ===========================================
// 桃汽水的魔力补给站 - 主应用逻辑
// ===========================================

class TaociApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 'home';
        this.init();
    }
    
    // 初始化应用
    async init() {
        TaociUtils.log('info', '正在初始化桃汽水的魔力补给站...');
        
        // 隐藏加载动画
        this.hideLoading();
        
        // 初始化DOM元素
        this.initElements();
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 初始化路由
        this.initRoutes();
        
        // 初始化首页
        await this.initHomePage();
        
        // 启动倒计时
        this.startCountdown();
        
        this.isInitialized = true;
        TaociUtils.log('info', '应用初始化完成！');
    }
    
    // 隐藏加载动画
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            setTimeout(() => {
                TaociUtils.fadeOut(loading, 500, () => {
                    loading.style.display = 'none';
                });
            }, 1000);
        }
    }
    
    // 初始化DOM元素引用
    initElements() {
        this.elements = {
            app: document.getElementById('app'),
            menuToggle: document.getElementById('menu-toggle'),
            nav: document.getElementById('nav'),
            logo: document.getElementById('logo'),
            liveBadge: document.getElementById('live-badge')
        };
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 移动端菜单切换
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => {
                this.elements.nav.classList.toggle('active');
            });
        }
        
        // 导航链接点击
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (TaociUtils.isMobile()) {
                    this.elements.nav.classList.remove('active');
                }
            });
        });
        
        // 点击外部关闭移动菜单
        document.addEventListener('click', (e) => {
            if (this.elements.nav.classList.contains('active') && 
                !this.elements.nav.contains(e.target) && 
                !this.elements.menuToggle.contains(e.target)) {
                this.elements.nav.classList.remove('active');
            }
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.elements.nav.classList.remove('active');
            }
        });
    }
    
    // 初始化路由
    initRoutes() {
        // 注册首页路由
        taociRouter.registerRoute('home', () => this.loadHomePage());
        
        // 注册小游戏路由
        taociRouter.registerRoute('games', () => this.loadGamesPage());
        
        // 注册答案之书路由
        taociRouter.registerRoute('answers', () => this.loadAnswersPage());
        
        // 注册抽奖路由
        taociRouter.registerRoute('lottery', () => this.loadLotteryPage());
        
        // 注册留言板路由
        taociRouter.registerRoute('messages', () => this.loadMessagesPage());
    }
    
    // ==================== 页面加载方法 ====================
    
    // 初始化首页
    async initHomePage() {
        const pageElement = document.getElementById('page-home');
        if (!pageElement) return;
        
        TaociUtils.clearElement(pageElement);
        
        // 创建首页内容
        pageElement.appendChild(this.createHeroSection());
        pageElement.appendChild(this.createAnnouncementSection());
        pageElement.appendChild(this.createPreviewSection());
    }
    
    // 加载首页（路由触发）
    async loadHomePage() {
        TaociUtils.log('info', '加载首页');
        await this.initHomePage();
    }
    
    // 加载小游戏页面
    async loadGamesPage() {
        const pageElement = document.getElementById('page-games');
        if (!pageElement) return;
        
        TaociUtils.clearElement(pageElement);
        
        // 创建页面标题
        const title = TaociUtils.createElement('h1', 'page-title', 
            TAOCI_CONFIG.games.bubbleGame.name);
        pageElement.appendChild(title);
        
        // 创建游戏介绍
        const intro = TaociUtils.createElement('div', 'page-intro');
        intro.innerHTML = `
            <p>🎮 这里有三个有趣的魔法小游戏，快来挑战吧！</p>
            <p>每个游戏都有不同的玩法，看看你能获得多少魔力！</p>
        `;
        pageElement.appendChild(intro);
        
        // 创建游戏卡片容器
        const gamesContainer = TaociUtils.createElement('div', 'games-container');
        
        // 游戏卡片数据
        const games = [
            TAOCI_CONFIG.games.bubbleGame,
            TAOCI_CONFIG.games.runeGame,
            TAOCI_CONFIG.games.energyGame
        ];
        
        // 创建游戏卡片
        games.forEach(game => {
            const card = this.createGameCard(game);
            gamesContainer.appendChild(card);
        });
        
        pageElement.appendChild(gamesContainer);
        
        // 添加提示
        const tip = TaociUtils.createElement('div', 'page-tip');
        tip.innerHTML = '<p>💡 小贴士：游戏正在开发中，敬请期待！</p>';
        pageElement.appendChild(tip);
    }
    
    // 加载答案之书页面
    async loadAnswersPage() {
        const pageElement = document.getElementById('page-answers');
        if (!pageElement) return;
        
        TaociUtils.clearElement(pageElement);
        
        const config = TAOCI_CONFIG.answerBook;
        
        // 创建页面标题
        const title = TaociUtils.createElement('h1', 'page-title', config.title);
        pageElement.appendChild(title);
        
        // 创建描述
        const desc = TaociUtils.createElement('p', 'page-description', config.description);
        pageElement.appendChild(desc);
        
        // 创建答案之书容器
        const bookContainer = TaociUtils.createElement('div', 'answer-book-container');
        
        // 书图标
        const bookIcon = TaociUtils.createElement('div', 'book-icon', '📖');
        bookContainer.appendChild(bookIcon);
        
        // 问题输入
        const questionInput = TaociUtils.createElement('input', 'question-input');
        questionInput.type = 'text';
        questionInput.placeholder = '输入你的问题，然后点击魔法书...';
        questionInput.maxLength = 50;
        bookContainer.appendChild(questionInput);
        
        // 获取答案按钮
        const getAnswerBtn = TaociUtils.createElement('button', 'get-answer-btn', '🔮 获取答案');
        getAnswerBtn.addEventListener('click', () => {
            this.showAnswer(questionInput.value || '随机问题');
        });
        bookContainer.appendChild(getAnswerBtn);
        
        // 答案显示区域
        const answerDisplay = TaociUtils.createElement('div', 'answer-display');
        answerDisplay.innerHTML = '<p>答案将在这里显示...</p>';
        bookContainer.appendChild(answerDisplay);
        
        pageElement.appendChild(bookContainer);
        
        // 保存引用
        this.answerDisplay = answerDisplay;
        this.questionInput = questionInput;
    }
    
    // 加载抽奖页面
    async loadLotteryPage() {
        const pageElement = document.getElementById('page-lottery');
        if (!pageElement) return;
        
        TaociUtils.clearElement(pageElement);
        
        const config = TAOCI_CONFIG.bilibiliLottery;
        
        // 创建页面标题
        const title = TaociUtils.createElement('h1', 'page-title', config.title);
        pageElement.appendChild(title);
        
        // 创建描述
        const desc = TaociUtils.createElement('p', 'page-description', config.description);
        pageElement.appendChild(desc);
        
        // 创建活动列表
        const activitiesContainer = TaociUtils.createElement('div', 'activities-container');
        
        config.activities.forEach(activity => {
            const activityCard = this.createActivityCard(activity);
            activitiesContainer.appendChild(activityCard);
        });
        
        pageElement.appendChild(activitiesContainer);
        
        // 添加说明
        const notice = TaociUtils.createElement('div', 'page-notice');
        notice.innerHTML = `
            <p>📢 说明：</p>
            <p>1. 这些是复刻B站的抽奖活动</p>
            <p>2. 实际抽奖请关注桃汽水B站动态</p>
            <p>3. 本页面仅为娱乐展示</p>
        `;
        pageElement.appendChild(notice);
    }
    
    // 加载留言板页面
    async loadMessagesPage() {
        const pageElement = document.getElementById('page-messages');
        if (!pageElement) return;
        
        TaociUtils.clearElement(pageElement);
        
        const config = TAOCI_CONFIG.messageBoard;
        
        // 创建页面标题
        const title = TaociUtils.createElement('h1', 'page-title', config.title);
        pageElement.appendChild(title);
        
        // 创建描述
        const desc = TaociUtils.createElement('p', 'page-description', config.description);
        pageElement.appendChild(desc);
        
        // 创建留言表单
        const form = this.createMessageForm();
        pageElement.appendChild(form);
        
        // 创建留言列表
        const messagesList = TaociUtils.createElement('div', 'messages-list');
        pageElement.appendChild(messagesList);
        
        // 加载示例留言
        this.loadSampleMessages(messagesList);
    }
    
    // ==================== 页面组件创建方法 ====================
    
    // 创建英雄区域
    createHeroSection() {
        const hero = TaociUtils.createElement('div', 'hero-section');
        
        // 角色问候
        const greeting = TaociUtils.createElement('div', 'hero-greeting');
        greeting.innerHTML = `
            <h2>${TAOCI_CONFIG.site.vtuber.catchphrase}</h2>
            <p>我是${TAOCI_CONFIG.site.vtuber.name}，来自异世界的${TAOCI_CONFIG.site.vtuber.title}！</p>
            <p>感谢大家一年来的陪伴，周年庆就要开始啦~</p>
        `;
        hero.appendChild(greeting);
        
        // 倒计时显示
        const countdownSection = TaociUtils.createElement('div', 'countdown-section');
        const countdownTitle = TaociUtils.createElement('h3', 'countdown-title', '🎉 周年庆直播倒计时');
        countdownSection.appendChild(countdownTitle);
        
        const countdownDisplay = TaociUtils.createElement('div', 'countdown-display', '正在计算...');
        countdownSection.appendChild(countdownDisplay);
        
        hero.appendChild(countdownSection);
        
        // 保存倒计时显示引用
        this.countdownDisplay = countdownDisplay;
        
        return hero;
    }
    
    // 创建公告区域
    createAnnouncementSection() {
        const announcement = TaociUtils.createElement('div', 'announcement-section');
        
        const title = TaociUtils.createElement('h3', 'section-title', '📢 公主公告');
        announcement.appendChild(title);
        
        const content = TaociUtils.createElement('div', 'announcement-content');
        content.innerHTML = `
            <p><strong>🎊 周年庆活动预告：</strong></p>
            <ul>
                <li>📅 日期：${TaociUtils.formatDate(TAOCI_CONFIG.schedule.liveStart, 'MM月DD日 HH:mm')}</li>
                <li>📍 地点：B站直播间「桃汽水Official」</li>
                <li>🎁 福利：限定礼物、特别节目、粉丝互动</li>
                <li>🎮 活动：小游戏挑战、抽奖、特别纪念</li>
            </ul>
            <p>记得准时来直播间哦！我们一起庆祝这个特别的日子~</p>
        `;
        announcement.appendChild(content);
        
        return announcement;
    }
    
    // 创建预览区域
    createPreviewSection() {
        const preview = TaociUtils.createElement('div', 'preview-section');
        
        const title = TaociUtils.createElement('h3', 'section-title', '✨ 站点功能预览');
        preview.appendChild(title);
        
        const previewGrid = TaociUtils.createElement('div', 'preview-grid');
        
        // 功能预览卡片
        const features = [
            { icon: '🎮', title: '魔力小游戏', desc: '三款休闲小游戏，收集魔力' },
            { icon: '📖', title: '答案之书', desc: '向魔法书提问，获取神秘答案' },
            { icon: '🎁', title: 'B站抽奖', desc: '复刻B站趣味抽奖活动' },
            { icon: '💬', title: '留言板', desc: '给桃汽水公主留言祝福' }
        ];
        
        features.forEach(feature => {
            const card = TaociUtils.createElement('a', 'preview-card');
            card.href = `#${feature.title.includes('游戏') ? 'games' : 
                         feature.title.includes('答案') ? 'answers' :
                         feature.title.includes('抽奖') ? 'lottery' : 'messages'}`;
            
            card.innerHTML = `
                <div class="preview-icon">${feature.icon}</div>
                <h4>${feature.title}</h4>
                <p>${feature.desc}</p>
            `;
            
            previewGrid.appendChild(card);
        });
        
        preview.appendChild(previewGrid);
        
        return preview;
    }
    
    // 创建游戏卡片
    createGameCard(game) {
        const card = TaociUtils.createElement('div', 'game-card');
        
        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h3>${game.name}</h3>
            <p class="game-desc">${game.description}</p>
            <div class="game-meta">
                <span class="game-difficulty">难度: ${game.difficulty}</span>
                <span class="game-time">时长: ${game.estimatedTime}</span>
            </div>
            <button class="game-play-btn" data-game="${game.name}">
                🎮 开始游戏
            </button>
        `;
        
        // 添加点击事件
        const playBtn = card.querySelector('.game-play-btn');
        playBtn.addEventListener('click', () => {
            this.showGameModal(game);
        });
        
        return card;
    }
    
    // 创建活动卡片
    createActivityCard(activity) {
        const card = TaociUtils.createElement('div', 'activity-card');
        
        let statusBadge = '';
        if (activity.status === 'active') {
            statusBadge = '<span class="status-badge active">进行中</span>';
        } else if (activity.status === 'upcoming') {
            statusBadge = '<span class="status-badge upcoming">即将开始</span>';
        }
        
        card.innerHTML = `
            <h4>${activity.name} ${statusBadge}</h4>
            <p>${activity.description}</p>
            <div class="activity-dates">
                <span>开始: ${activity.startDate}</span>
                <span>结束: ${activity.endDate}</span>
            </div>
            <div class="activity-prizes">
                <strong>奖品:</strong> ${activity.prizes.join('、')}
            </div>
        `;
        
        return card;
    }
    
    // 创建留言表单
    createMessageForm() {
        const form = TaociUtils.createElement('form', 'message-form');
        
        form.innerHTML = `
            <div class="form-group">
                <label for="message-author">你的名字（可选）:</label>
                <input type="text" id="message-author" placeholder="可以匿名哦~" maxlength="20">
            </div>
            
            <div class="form-group">
                <label for="message-content">想对桃汽水说的话:</label>
                <textarea id="message-content" placeholder="写下你的祝福或想说的话..." 
                          maxlength="${TAOCI_CONFIG.messageBoard.settings.maxLength}" 
                          rows="4" required></textarea>
                <div class="char-count">
                    <span id="char-count">0</span> / ${TAOCI_CONFIG.messageBoard.settings.maxLength}
                </div>
            </div>
            
            <div class="form-group">
                <button type="submit" class="submit-btn">
                    <i class="fas fa-paper-plane"></i> 发送留言
                </button>
                <button type="button" class="preview-btn">
                    <i class="fas fa-eye"></i> 预览效果
                </button>
            </div>
        `;
        
        // 字符计数
        const textarea = form.querySelector('#message-content');
        const charCount = form.querySelector('#char-count');
        
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
        
        // 表单提交
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitMessage(form);
        });
        
        // 预览按钮
        const previewBtn = form.querySelector('.preview-btn');
        previewBtn.addEventListener('click', () => {
            this.previewMessage(form);
        });
        
        return form;
    }
    
    // ==================== 业务逻辑方法 ====================
    
    // 启动倒计时
    startCountdown() {
        if (!this.countdownDisplay) return;
        
        const updateCountdown = () => {
            const countdown = TaociUtils.calculateCountdown(TAOCI_CONFIG.schedule.countdown.target);
            
            if (countdown.expired) {
                this.countdownDisplay.textContent = '直播已经开始！';
                this.elements.liveBadge.textContent = '直播中';
                this.elements.liveBadge.style.background = TAOCI_CONFIG.theme.colors.success;
                return;
            }
            
            const display = TaociUtils.formatCountdown(countdown);
            this.countdownDisplay.textContent = display;
            
            // 如果距离开始不到1小时，更新徽章
            if (countdown.days === 0 && countdown.hours < 1) {
                this.elements.liveBadge.textContent = '即将开始';
                this.elements.liveBadge.style.background = TAOCI_CONFIG.theme.colors.warning;
            }
        };
        
        // 立即更新一次
        updateCountdown();
        
        // 定时更新
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }
    
    // 显示答案
    showAnswer(question) {
        if (!this.answerDisplay) return;
        
        // 显示加载中
        this.answerDisplay.innerHTML = '<p class="loading-answer">🔮 魔法书正在思考...</p>';
        
        // 模拟延迟
        setTimeout(() => {
            // 决定是普通答案还是特殊答案
            const isSpecial = Math.random() < 0.1; // 10%几率特殊答案
            
            let answer;
            if (isSpecial) {
                answer = TaociUtils.randomElement(TAOCI_CONFIG.answerBook.specialAnswers);
            } else {
                answer = TaociUtils.randomElement(TAOCI_CONFIG.answerBook.answers);
            }
            
            // 显示答案
            this.answerDisplay.innerHTML = `
                <div class="answer-result">
                    <div class="question">你的问题: "${question}"</div>
                    <div class="answer">魔法书说: "${answer}"</div>
                    <div class="answer-note">✨ 来自桃汽水公主的指引</div>
                </div>
            `;
            
            // 清空输入框
            if (this.questionInput) {
                this.questionInput.value = '';
            }
            
            // 添加一些动画效果
            this.answerDisplay.classList.add('show-answer');
            setTimeout(() => {
                this.answerDisplay.classList.remove('show-answer');
            }, 1000);
            
        }, 1500);
    }
    
    // 显示游戏模态框
    showGameModal(game) {
        // 创建模态框
        const modal = TaociUtils.createElement('div', 'game-modal');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${game.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="game-preview">
                        <div class="preview-placeholder">
                            🎮 游戏预览区域
                        </div>
                    </div>
                    <div class="game-info">
                        <p><strong>玩法说明:</strong> ${game.description}</p>
                        <p><strong>预计时长:</strong> ${game.estimatedTime}</p>
                        <p><strong>难度:</strong> ${game.difficulty}</p>
                        <div class="game-tip">
                            💡 提示: 游戏正在开发中，即将上线！
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close-btn">关闭</button>
                    <button class="btn-primary" disabled>开始游戏（开发中）</button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(modal);
        
        // 显示模态框
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // 关闭按钮事件
        const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            });
        });
        
        // 点击外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
    }
    
    // 提交留言
    submitMessage(form) {
        const author = form.querySelector('#message-author').value.trim() || '匿名契约者';
        const content = form.querySelector('#message-content').value.trim();
        
        if (!content) {
            this.showNotification('请填写留言内容！', 'warning');
            return;
        }
        
        if (content.length < TAOCI_CONFIG.messageBoard.settings.minLength) {
            this.showNotification(`留言内容至少需要${TAOCI_CONFIG.messageBoard.settings.minLength}个字`, 'warning');
            return;
        }
        
        // 创建留言对象
        const message = {
            id: TaociUtils.generateId(),
            author,
            content,
            timestamp: new Date().toLocaleString(),
            likes: 0
        };
        
        // 保存到本地存储
        this.saveMessage(message);
        
        // 显示成功通知
        this.showNotification('留言发送成功！桃汽水公主会看到的~', 'success');
        
        // 清空表单
        form.reset();
        form.querySelector('#char-count').textContent = '0';
        
        // 重新加载留言列表
        const messagesList = document.querySelector('.messages-list');
        if (messagesList) {
            this.loadSampleMessages(messagesList);
        }
    }
    
    // 预览留言
    previewMessage(form) {
        const author = form.querySelector('#message-author').value.trim() || '匿名契约者';
        const content = form.querySelector('#message-content').value.trim();
        
        if (!content) {
            this.showNotification('请填写留言内容以预览', 'info');
            return;
        }
        
        // 创建预览模态框
        const modal = TaociUtils.createElement('div', 'preview-modal');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>留言预览</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="message-preview">
                        <div class="message-header">
                            <div class="message-author">${author}</div>
                            <div class="message-time">刚刚</div>
                        </div>
                        <div class="message-content">${content}</div>
                        <div class="message-footer">
                            <button class="like-btn">❤️ 0</button>
                        </div>
                    </div>
                    <div class="preview-note">
                        💡 这是留言的预览效果，点击"发送留言"才会真正发布。
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close-btn">关闭预览</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // 关闭按钮
        const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            });
        });
    }
    
    // 保存留言到本地存储
    saveMessage(message) {
        const storageKey = TAOCI_CONFIG.messageBoard.storage.key;
        let messages = TaociUtils.loadFromStorage(storageKey, []);
        
        // 添加到开头
        messages.unshift(message);
        
        // 限制数量
        if (messages.length > TAOCI_CONFIG.messageBoard.storage.maxMessages) {
            messages = messages.slice(0, TAOCI_CONFIG.messageBoard.storage.maxMessages);
        }
        
        // 保存
        TaociUtils.saveToStorage(storageKey, messages);
    }
    
    // 加载示例留言
    loadSampleMessages(container) {
        TaociUtils.clearElement(container);
        
        // 从本地存储加载
        const storageKey = TAOCI_CONFIG.messageBoard.storage.key;
        let messages = TaociUtils.loadFromStorage(storageKey, []);
        
        // 如果没有留言，使用示例数据
        if (messages.length === 0) {
            messages = [
                {
                    id: 'msg-001',
                    author: '桃汽水头号粉丝',
                    content: '公主殿下周年快乐！期待今晚的直播！',
                    timestamp: '2024-12-10 10:30',
                    likes: 42
                },
                {
                    id: 'msg-002',
                    author: '气泡捕捉大师',
                    content: '已经准备好收集魔力了！希望抽到限定徽章~',
                    timestamp: '2024-12-10 11:15',
                    likes: 28
                },
                {
                    id: 'msg-003',
                    author: '魔法阵研究员',
                    content: '符文游戏真好玩！希望能一直保留这个网站！',
                    timestamp: '2024-12-10 12:45',
                    likes: 35
                }
            ];
        }
        
        // 限制显示数量
        const displayMessages = messages.slice(0, TAOCI_CONFIG.messageBoard.settings.previewCount);
        
        // 创建留言卡片
        displayMessages.forEach(msg => {
            const messageCard = this.createMessageCard(msg);
            container.appendChild(messageCard);
        });
        
        // 如果没有留言
        if (displayMessages.length === 0) {
            const emptyMessage = TaociUtils.createElement('div', 'empty-messages');
            emptyMessage.innerHTML = '<p>还没有留言，快来写下第一条祝福吧！</p>';
            container.appendChild(emptyMessage);
        }
    }
    
    // 创建留言卡片
    createMessageCard(message) {
        const card = TaociUtils.createElement('div', 'message-card');
        
        card.innerHTML = `
            <div class="message-header">
                <div class="message-author">${message.author}</div>
                <div class="message-time">${message.timestamp}</div>
            </div>
            <div class="message-content">${message.content}</div>
            <div class="message-footer">
                <button class="like-btn" data-id="${message.id}">
                    ❤️ <span class="like-count">${message.likes}</span>
                </button>
            </div>
        `;
        
        // 点赞按钮事件
        const likeBtn = card.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => {
            this.likeMessage(message.id);
        });
        
        return card;
    }
    
    // 点赞留言
    likeMessage(messageId) {
        const storageKey = TAOCI_CONFIG.messageBoard.storage.key;
        let messages = TaociUtils.loadFromStorage(storageKey, []);
        
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
            messages[messageIndex].likes += 1;
            TaociUtils.saveToStorage(storageKey, messages);
            
            // 更新显示
            const likeBtn = document.querySelector(`.like-btn[data-id="${messageId}"]`);
            if (likeBtn) {
                const likeCount = likeBtn.querySelector('.like-count');
                likeCount.textContent = messages[messageIndex].likes;
                
                // 添加动画效果
                likeBtn.classList.add('liked');
                setTimeout(() => {
                    likeBtn.classList.remove('liked');
                }, 300);
            }
        }
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container') || 
                         this.createNotificationContainer();
        
        const notification = TaociUtils.createElement('div', `notification notification-${type}`);
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : 
                      type === 'warning' ? '⚠️' : 
                      type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动消失
        setTimeout(() => {
            this.hideNotification(notification);
        }, 3000);
        
        // 关闭按钮
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }
    
    // 隐藏通知
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // 创建通知容器
    createNotificationContainer() {
        const container = TaociUtils.createElement('div', 'notification-container');
        document.body.appendChild(container);
        return container;
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaociApp();
    
    // 全局访问
    if (typeof window !== 'undefined') {
        window.taociApp = app;
    }
    
    TaociUtils.log('info', '🍑 桃汽水的魔力补给站已启动！');
});