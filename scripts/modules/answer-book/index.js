// 答案之书模块主类 v1.7
import { getRandomAnswer } from './answer-data.js';
import { cssLoader } from '../../utils/css-loader.js'; // 导入CSS加载工具

export default class AnswerBookModule {
    constructor() {
        this.state = 'IDLE'; // IDLE, THINKING, REVEALING, SHOWING
        this.currentAnswer = '';
        this.answerHistory = [];
        this.isHistoryOpen = false;
        this.isHistoryExpanded = false; // 历史记录展开状态
        
        // 绑定方法
        this.handleAskClick = this.handleAskClick.bind(this);
        this.toggleHistoryExpansion = this.toggleHistoryExpansion.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
        this.handleHistoryItemClick = this.handleHistoryItemClick.bind(this);
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式（使用CSS加载工具）
            await this.loadStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 加载历史记录
            this.loadHistory();
            
            // 4. 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('答案之书模块初始化失败:', error);
            appContainer.innerHTML = `
                <div class="card">
                    <h2 class="card-title">答案之书加载失败</h2>
                    <p class="card-content">魔法暂时失效了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    destroy() {
        // 清理事件监听
        const book = document.querySelector('.book');
        const askButton = document.querySelector('.ask-button');
        const historyHeader = document.querySelector('.history-header');
        const clearHistoryBtn = document.querySelector('.clear-history-btn');
        const historyItems = document.querySelectorAll('.history-item');
        
        if (book) book.removeEventListener('click', this.handleAskClick);
        if (askButton) askButton.removeEventListener('click', this.handleAskClick);
        if (historyHeader) historyHeader.removeEventListener('click', this.toggleHistoryExpansion);
        if (clearHistoryBtn) clearHistoryBtn.removeEventListener('click', this.clearHistory);
        historyItems.forEach(item => {
            item.removeEventListener('click', this.handleHistoryItemClick);
        });
        
        // 清理样式 - 使用CSS加载工具
        cssLoader.unload('answer-book-styles');
    }

    async loadStyles() {
        // 使用CSS加载工具加载样式
        try {
            await cssLoader.load(
                'scripts/modules/answer-book/answer-book.css',
                'answer-book-styles'
            );
        } catch (error) {
            console.warn('CSS加载失败，使用回退样式:', error);
            // 如果CSS加载失败，可以添加一些内联样式作为回退
            this.addFallbackStyles();
        }
    }

    addFallbackStyles() {
        // 简约回退样式，与主骨架保持一致
        const style = document.createElement('style');
        style.id = 'answer-book-fallback-styles';
        style.textContent = `
            .answer-book-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 2.5rem 1.5rem;
                min-height: calc(100vh - 200px);
                background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 50%, #EEEEEE 100%);
            }
            .book-title {
                font-size: 2.8rem;
                font-weight: 700;
                text-align: center;
                margin-bottom: 1rem;
                color: #CE93D8;
                position: relative;
                display: inline-block;
            }
            .book-title::after {
                content: '';
                position: absolute;
                bottom: -5px;
                left: 25%;
                width: 50%;
                height: 3px;
                background: linear-gradient(135deg, #CE93D8, #F48FB1);
                border-radius: 2px;
            }
            .book-container {
                width: 500px;
                height: 320px;
                margin: 1.5rem auto;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                border: 3px solid rgba(255, 255, 255, 0.95);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            }
            .answer-display {
                background: rgba(255, 255, 255, 0.98);
                border-radius: 16px;
                padding: 2rem;
                border: 2px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            }
            .answer-text {
                font-size: 1.8rem;
                color: #424242;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-weight: 500;
            }
            .ask-button {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: linear-gradient(135deg, #CE93D8, #9575CD);
                color: white;
                border: 3px solid rgba(255, 255, 255, 0.95);
                cursor: pointer;
                font-weight: 600;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            }
            .history-section {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 18px;
                border: 3px solid rgba(255, 255, 255, 0.95);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            }
            .history-section::before {
                content: '';
                display: block;
                height: 4px;
                background: linear-gradient(135deg, #CE93D8, #F48FB1);
                border-radius: 18px 18px 0 0;
            }
        `;
        document.head.appendChild(style);
    }


    render(container) {
        container.innerHTML = `
            <div class="answer-book-container">
                <!-- 背景光效 -->
                <div class="background-glow" id="background-glow"></div>
                
                <!-- 粒子容器 -->
                <div class="particle-container" id="particle-container"></div>
                
                <!-- 标题区域 -->
                <div class="book-header">
                    <h1 class="book-title">答案之书</h1>
                    <p class="book-subtitle">向魔法提问，获取你内心的答案</p>
                    <p class="book-disclaimer">答案仅供参考，最终的选择在你心中</p>
                </div>
                
                <!-- 答案展示框 -->
                <div class="book-container">
                    <div class="book">
                        <div class="book-cover"></div>
                        <div class="book-pages"></div>
                        <div class="answer-display" id="answer-display">
                            <div class="answer-text" id="answer-text"></div>
                        </div>
                    </div>
                </div>
                
                <!-- 状态提示 -->
                <div class="status-indicator" id="status-indicator">
                    准备好了吗？点击魔法球或卡片开始
                </div>
                
                <!-- 控制按钮 -->
                <div class="book-controls">
                    <button class="ask-button" id="ask-button">
                        <span class="button-text">魔法提问</span>
                        <div class="button-loader"></div>
                    </button>
                    <div class="action-tip">点击上方卡片也可以获取答案</div>
                </div>
                
                <!-- 历史记录区域 -->
                <div class="history-section" id="history-section">
                    <div class="history-header">
                        <div style="display: flex; align-items: center;">
                            <h3 class="history-title">历史答案</h3>
                            <span class="history-count" id="history-count">0</span>
                        </div>
                        <div class="history-toggle-icon">▼</div>
                    </div>
                    
                    <div class="history-list-container" id="history-list-container">
                        <ul class="history-list" id="history-list"></ul>
                        <button class="clear-history-btn" id="clear-history-btn">清空历史</button>
                    </div>
                </div>
            </div>
        `;
        
        // 保存重要元素的引用
        this.book = container.querySelector('.book');
        this.answerDisplay = container.querySelector('#answer-display');
        this.answerText = container.querySelector('#answer-text');
        this.statusIndicator = container.querySelector('#status-indicator');
        this.askButton = container.querySelector('#ask-button');
        this.backgroundGlow = container.querySelector('#background-glow');
        this.particleContainer = container.querySelector('#particle-container');
        this.historySection = container.querySelector('#history-section');
        this.historyList = container.querySelector('#history-list');
        this.historyListContainer = container.querySelector('#history-list-container');
        this.historyHeader = container.querySelector('.history-header');
        this.historyCount = document.querySelector('#history-count');
        this.clearHistoryBtn = document.querySelector('#clear-history-btn');
        
        // 初始状态下收起历史记录
        this.historyListContainer.classList.remove('expanded');
        const toggleIcon = document.querySelector('.history-toggle-icon');
        if (toggleIcon) {
            toggleIcon.classList.remove('expanded');
        }
    }

    async handleAskClick() {
        if (this.state === 'IDLE' || this.state === 'SHOWING') {
            await this.startThinking();
        }
    }

    async startThinking() {
        // 进入思考状态
        this.setState('THINKING');
        
        // 1. 显示等待反馈
        this.showWaitingFeedback();
        
        // 2. 播放3秒寻找答案动画
        await this.playSearchingAnimation(3000);
        
        // 3. 获取随机答案
        this.currentAnswer = getRandomAnswer();
        
        // 4. 进入揭示状态
        this.setState('REVEALING');
        
        // 5. 播放答案揭示动画
        await this.playRevealAnimation(this.currentAnswer);
        
        // 6. 进入显示状态
        this.setState('SHOWING');
        
        // 7. 保存到历史记录
        this.addToHistory(this.currentAnswer);
    }

    showWaitingFeedback() {
        // 清空答案文本并显示等待信息
        this.answerText.innerHTML = '';
        this.answerText.classList.add('waiting');
        this.answerDisplay.classList.add('show');
    }

    setState(newState) {
        this.state = newState;
        
        // 更新UI状态
        switch (newState) {
            case 'IDLE':
                this.statusIndicator.textContent = '准备好了吗？点击魔法球或卡片开始';
                this.statusIndicator.className = 'status-indicator';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '魔法提问';
                this.backgroundGlow.classList.remove('intense');
                // 隐藏答案显示区域
                this.answerDisplay.classList.remove('show');
                this.answerText.classList.remove('waiting');
                break;
                
            case 'THINKING':
                this.statusIndicator.textContent = '魔法书正在寻找答案，请稍候...';
                this.statusIndicator.className = 'status-indicator thinking';
                this.askButton.disabled = true;
                this.askButton.classList.add('loading');
                this.backgroundGlow.classList.add('intense');
                break;
                
            case 'REVEALING':
                this.statusIndicator.textContent = '魔法答案正在显现...';
                break;
                
            case 'SHOWING':
                this.statusIndicator.textContent = '这是魔法书给你的答案';
                this.statusIndicator.className = 'status-indicator';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '再次提问';
                this.backgroundGlow.classList.remove('intense');
                break;
        }
    }

    async playSearchingAnimation(duration) {
        // 创建书页翻动效果
        this.createPageFlippingEffect();
        
        return new Promise(resolve => {
            setTimeout(() => {
                // 停止书页翻动
                const pages = this.book.querySelectorAll('.book-page');
                pages.forEach(page => {
                    page.style.animation = 'none';
                    
                    // 减速定格动画
                    page.animate([
                        {
                            transform: page.style.transform,
                            opacity: 0.8
                        },
                        {
                            transform: 'rotateY(90deg) translateZ(-10px)',
                            opacity: 0.5
                        },
                        {
                            transform: 'rotateY(180deg) translateZ(-20px)',
                            opacity: 0.3
                        }
                    ], {
                        duration: 500,
                        easing: 'ease-out',
                        fill: 'forwards'
                    });
                });
                
                // 粒子聚集效果
                this.createFinalParticles();
                
                // 移除等待状态
                this.answerText.classList.remove('waiting');
                
                resolve();
            }, duration);
        });
    }

    createPageFlippingEffect() {
        const bookPages = this.book.querySelector('.book-pages');
        bookPages.innerHTML = '';
        
        // 创建多个书页层
        for (let i = 0; i < 5; i++) {
            const page = document.createElement('div');
            page.className = 'book-page';
            page.style.transform = `rotateY(${i * 5}deg) translateZ(-${i * 2}px)`;
            page.style.animationDelay = `${i * 0.1}s`;
            page.style.animationDuration = '0.5s';
            page.style.animationName = 'flipPages';
            page.style.animationIterationCount = 'infinite';
            page.style.animationTimingFunction = 'ease-in-out';
            bookPages.appendChild(page);
        }
        
        // 创建粒子效果
        this.createParticles();
    }

    createParticles() {
        // 清除现有粒子
        this.particleContainer.innerHTML = '';
        
        // 创建星光粒子
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'star-particle';
            
            // 随机起始位置（屏幕边缘）
            const side = Math.floor(Math.random() * 4);
            let startX, startY;
            
            switch (side) {
                case 0: // 上边
                    startX = Math.random() * window.innerWidth;
                    startY = -10;
                    break;
                case 1: // 右边
                    startX = window.innerWidth + 10;
                    startY = Math.random() * window.innerHeight;
                    break;
                case 2: // 下边
                    startX = Math.random() * window.innerWidth;
                    startY = window.innerHeight + 10;
                    break;
                case 3: // 左边
                    startX = -10;
                    startY = Math.random() * window.innerHeight;
                    break;
            }
            
            // 卡片中心位置
            const bookRect = this.book.getBoundingClientRect();
            const targetX = bookRect.left + bookRect.width / 2;
            const targetY = bookRect.top + bookRect.height / 2;
            
            // 设置粒子起始位置
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            // 计算距离和时间
            const distance = Math.sqrt(
                Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2)
            );
            const duration = Math.min(distance / 100, 2.5); // 最大2.5秒
            
            // 粒子动画
            particle.animate([
                {
                    transform: 'translate(0, 0) scale(0)',
                    opacity: 0
                },
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1,
                    offset: 0.1
                },
                {
                    transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.5)`,
                    opacity: 0.7
                },
                {
                    transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            });
            
            this.particleContainer.appendChild(particle);
            
            // 移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, duration * 1000);
        }
    }

    createFinalParticles() {
        const bookRect = this.book.getBoundingClientRect();
        const centerX = bookRect.left + bookRect.width / 2;
        const centerY = bookRect.top + bookRect.height / 2;
        
        // 创建向中心聚集的粒子
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'star-particle';
            
            // 从卡片周围随机位置开始
            const angle = Math.random() * Math.PI * 2;
            const distance = 60 + Math.random() * 60;
            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            this.particleContainer.appendChild(particle);
            
            // 粒子向中心移动
            particle.animate([
                {
                    transform: 'scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${centerX - startX}px, ${centerY - startY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 400,
                easing: 'ease-in',
                delay: i * 10
            });
            
            // 移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 800);
        }
    }

    async playRevealAnimation(answer) {
        // 显示答案区域
        this.answerDisplay.classList.add('show');
        
        // 清空答案文本
        this.answerText.innerHTML = '';
        
        // 逐字显示答案
        const chars = answer.split('');
        const delay = 70; // 每个字符的显示延迟
        
        for (let i = 0; i < chars.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = chars[i];
            
            // 处理空格
            if (chars[i] === ' ') {
                charSpan.innerHTML = '&nbsp;';
            }
            
            this.answerText.appendChild(charSpan);
            
            // 字符显示动画
            setTimeout(() => {
                charSpan.animate([
                    {
                        opacity: 0,
                        transform: 'translateY(8px)'
                    },
                    {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                ], {
                    duration: 250,
                    easing: 'ease-out',
                    fill: 'forwards'
                });
            }, i * delay);
        }
        
        // 等待动画完成
        await new Promise(resolve => {
            setTimeout(resolve, chars.length * delay + 400);
        });
    }

    resetBook() {
        // 清空书页
        const bookPages = this.book.querySelector('.book-pages');
        if (bookPages) {
            bookPages.innerHTML = '';
        }
        
        // 隐藏答案
        this.answerDisplay.classList.remove('show');
        this.answerText.innerHTML = '';
        
        // 清空粒子
        this.particleContainer.innerHTML = '';
    }

    bindEvents() {
        // 卡片点击事件
        if (this.book) {
            this.book.addEventListener('click', this.handleAskClick);
        }
        
        // 按钮点击事件
        if (this.askButton) {
            this.askButton.addEventListener('click', this.handleAskClick);
        }
        
        // 历史记录展开/收起
        if (this.historyHeader) {
            this.historyHeader.addEventListener('click', this.toggleHistoryExpansion);
        }
        
        // 清空历史记录
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', this.clearHistory);
        }
        
        // 历史记录项点击事件（查看历史答案）
        this.historyList.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                this.handleHistoryItemClick(historyItem);
            }
        });
    }

    handleHistoryItemClick(item) {
        const answer = item.querySelector('.history-answer').textContent;
        this.showHistoryAnswer(answer);
    }

    showHistoryAnswer(answer) {
        // 清空当前状态
        this.resetBook();
        
        // 显示历史答案
        this.answerText.innerHTML = '';
        this.answerDisplay.classList.add('show');
        
        // 逐字显示历史答案
        const chars = answer.split('');
        const delay = 50;
        
        for (let i = 0; i < chars.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char';
            charSpan.textContent = chars[i];
            
            if (chars[i] === ' ') {
                charSpan.innerHTML = '&nbsp;';
            }
            
            this.answerText.appendChild(charSpan);
            
            setTimeout(() => {
                charSpan.animate([
                    {
                        opacity: 0,
                        transform: 'translateY(8px)'
                    },
                    {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                ], {
                    duration: 200,
                    easing: 'ease-out',
                    fill: 'forwards'
                });
            }, i * delay);
        }
        
        // 更新状态
        this.state = 'SHOWING';
        this.statusIndicator.textContent = '这是历史答案';
    }

    // 历史记录功能
    loadHistory() {
        const savedHistory = localStorage.getItem('taoci_answer_history');
        if (savedHistory) {
            this.answerHistory = JSON.parse(savedHistory);
            this.renderHistory();
            this.updateHistoryCount();
        }
    }

    saveHistory() {
        localStorage.setItem('taoci_answer_history', JSON.stringify(this.answerHistory));
    }

    addToHistory(answer) {
        const historyItem = {
            answer: answer,
            timestamp: new Date().toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        this.answerHistory.unshift(historyItem);
        
        // 最多保存30条记录
        if (this.answerHistory.length > 30) {
            this.answerHistory = this.answerHistory.slice(0, 30);
        }
        
        this.saveHistory();
        this.renderHistory();
        this.updateHistoryCount();
        
        // 如果历史记录是收起的，自动展开
        if (!this.isHistoryExpanded) {
            this.toggleHistoryExpansion();
        }
    }

    renderHistory() {
        if (!this.historyList) return;
        
        if (this.answerHistory.length === 0) {
            this.historyList.innerHTML = `
                <li class="no-history">
                    还没有历史答案，点击上方按钮开始提问
                </li>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.answerHistory.map((item, index) => `
            <li class="history-item" data-index="${index}">
                <div class="history-answer">${item.answer}</div>
                <div class="history-time">${item.timestamp}</div>
            </li>
        `).join('');
    }

    updateHistoryCount() {
        if (this.historyCount) {
            this.historyCount.textContent = this.answerHistory.length;
        }
    }

    clearHistory() {
        if (confirm('确定要清空所有历史答案吗？')) {
            this.answerHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.updateHistoryCount();
        }
    }

    toggleHistoryExpansion() {
        const listContainer = this.historyListContainer;
        const toggleIcon = document.querySelector('.history-toggle-icon');
        
        if (this.isHistoryExpanded) {
            // 收起历史记录
            listContainer.classList.remove('expanded');
            listContainer.classList.add('collapsing');
            
            if (toggleIcon) {
                toggleIcon.classList.remove('expanded');
            }
            
            // 动画结束后移除类名
            setTimeout(() => {
                listContainer.classList.remove('collapsing');
            }, 400);
        } else {
            // 展开历史记录
            listContainer.classList.add('expanding');
            listContainer.classList.add('expanded');
            
            if (toggleIcon) {
                toggleIcon.classList.add('expanded');
            }
            
            // 动画结束后移除类名
            setTimeout(() => {
                listContainer.classList.remove('expanding');
            }, 400);
        }
        
        this.isHistoryExpanded = !this.isHistoryExpanded;
    }
}