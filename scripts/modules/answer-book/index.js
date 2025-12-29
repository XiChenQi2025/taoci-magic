// 答案之书v2.0 - 梦幻粉色重构版
import { getRandomAnswer } from './answer-data.js';
import { cssLoader } from '../../utils/css-loader.js'; // 导入CSS加载工具

export default class AnswerBookModule {
    constructor() {
        this.state = 'IDLE'; // IDLE, THINKING, REVEALING, SHOWING
        this.currentAnswer = '';
        this.answerHistory = [];
        this.isHistoryOpen = false;
        this.isHistoryExpanded = false;
        this.waitingTexts = [
            "魔法正在凝聚能量...",
            "答案正在显现中...",
            "宇宙正在回应你的问题...",
            "神秘力量正在书写答案..."
        ];
        
        // 绑定方法
        this.handleAskClick = this.handleAskClick.bind(this);
        this.toggleHistoryExpansion = this.toggleHistoryExpansion.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式
            await this.loadStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 加载历史记录
            this.loadHistory();
            
            // 4. 绑定事件
            this.bindEvents();
            
            // 5. 创建魔法粒子背景
            this.createMagicParticles();
            
        } catch (error) {
            console.error('答案之书模块初始化失败:', error);
            appContainer.innerHTML = `
                <div class="card" style="background: rgba(255,255,255,0.9); padding: 2rem; border-radius: 20px; text-align: center;">
                    <h2 style="color: #F48FB1; margin-bottom: 1rem;">答案之书加载失败</h2>
                    <p style="color: #666;">魔法暂时失效了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    destroy() {
        // 清理事件监听
        const askButton = document.querySelector('.ask-button');
        const historyHeader = document.querySelector('.history-header');
        const clearHistoryBtn = document.querySelector('.clear-history-btn');
        
        if (askButton) askButton.removeEventListener('click', this.handleAskClick);
        if (historyHeader) historyHeader.removeEventListener('click', this.toggleHistoryExpansion);
        if (clearHistoryBtn) clearHistoryBtn.removeEventListener('click', this.clearHistory);
        
        // 清理样式
        cssLoader.unload('answer-book-styles');
        
        // 清理粒子动画
        this.clearParticles();
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
            this.addFallbackStyles();
        }
    }

    addFallbackStyles() {
        // 添加基本的内联样式作为回退
        const style = document.createElement('style');
        style.id = 'answer-book-fallback-styles';
        style.textContent = `
            .answer-book-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 2rem 1rem;
                min-height: 100vh;
                background: linear-gradient(135deg, #FFE4E9, #FFD1DC);
            }
            .book-title {
                font-size: 3rem;
                text-align: center;
                margin-bottom: 1rem;
                color: #F48FB1;
            }
            .magic-crystal-ball {
                width: 300px;
                height: 300px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, white, #FFB6C1);
                box-shadow: 0 0 50px rgba(244, 143, 177, 0.5);
                margin: 2rem auto;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .answer-text {
                font-size: 1.8rem;
                color: #333;
                font-family: 'Georgia', serif;
                text-align: center;
                padding: 1rem;
            }
            .ask-button {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: linear-gradient(135deg, #F48FB1, #FF8E53);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1.3rem;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    render(container) {
        container.innerHTML = `
            <div class="answer-book-container">
                <!-- 标题区域 -->
                <div class="book-header">
                    <h1 class="book-title">答案之书</h1>
                    <p class="book-subtitle">在这里，向宇宙提问，倾听内心的声音。让魔法为你揭示隐藏的答案。</p>
                    <p class="book-disclaimer">请记住：答案仅供参考，真正的选择永远在你心中。相信自己的直觉，勇敢前行。</p>
                </div>
                
                <!-- 答案展示区域 -->
                <div class="answer-display-container">
                    <div class="magic-crystal-ball">
                        <div class="answer-display" id="answer-display">
                            <div class="answer-text" id="answer-text">
                                <div class="waiting-text" id="waiting-text">
                                    准备好你的问题
                                    <div class="waiting-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 状态提示 -->
                <div class="status-indicator" id="status-indicator">
                    集中精神，思考你的问题，然后点击魔法球
                </div>
                
                <!-- 控制按钮 -->
                <div class="book-controls">
                    <button class="ask-button" id="ask-button">
                        <span class="button-text">提问</span>
                        <div class="button-loader"></div>
                    </button>
                    <div class="action-tip">点击上方魔法球也可以获取答案</div>
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
                        <button class="clear-history-btn" id="clear-history-btn">清空历史记录</button>
                    </div>
                </div>
            </div>
        `;
        
        // 保存重要元素的引用
        this.crystalBall = container.querySelector('.magic-crystal-ball');
        this.answerDisplay = container.querySelector('#answer-display');
        this.answerText = container.querySelector('#answer-text');
        this.waitingText = container.querySelector('#waiting-text');
        this.statusIndicator = container.querySelector('#status-indicator');
        this.askButton = container.querySelector('#ask-button');
        this.historySection = container.querySelector('#history-section');
        this.historyList = container.querySelector('#history-list');
        this.historyListContainer = container.querySelector('#history-list-container');
        this.historyHeader = container.querySelector('.history-header');
        this.historyCount = document.querySelector('#history-count');
        this.clearHistoryBtn = document.querySelector('#clear-history-btn');
    }

    createMagicParticles() {
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        this.particleContainer.style.position = 'fixed';
        this.particleContainer.style.top = '0';
        this.particleContainer.style.left = '0';
        this.particleContainer.style.width = '100%';
        this.particleContainer.style.height = '100%';
        this.particleContainer.style.pointerEvents = 'none';
        this.particleContainer.style.zIndex = '1';
        
        document.querySelector('.answer-book-container').appendChild(this.particleContainer);
        
        // 创建初始粒子
        for (let i = 0; i < 20; i++) {
            setTimeout(() => this.createParticle(), i * 300);
        }
        
        // 持续创建粒子
        this.particleInterval = setInterval(() => {
            if (document.contains(this.particleContainer)) {
                this.createParticle();
            }
        }, 800);
    }

    createParticle() {
        if (!this.particleContainer) return;
        
        const particle = document.createElement('div');
        particle.className = 'magic-particle';
        
        // 随机大小
        const size = Math.random() * 6 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // 随机起始位置
        const startX = Math.random() * window.innerWidth;
        particle.style.left = `${startX}px`;
        particle.style.top = `${window.innerHeight + 20}px`;
        
        // 随机颜色
        const colors = [
            'rgba(255, 182, 193, 0.9)',
            'rgba(255, 105, 180, 0.8)',
            'rgba(255, 192, 203, 0.7)',
            'rgba(255, 160, 122, 0.6)',
            'rgba(255, 255, 255, 0.9)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机动画参数
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        const endX = startX + (Math.random() * 100 - 50);
        
        particle.style.animation = `magic-float ${duration}s ease-in-out ${delay}s infinite`;
        
        this.particleContainer.appendChild(particle);
        
        // 移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, (duration + delay) * 1000);
    }

    clearParticles() {
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
        }
        if (this.particleContainer && this.particleContainer.parentNode) {
            this.particleContainer.remove();
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
        
        // 1. 增强魔法球效果
        this.enhanceCrystalBall();
        
        // 2. 随机显示等待文本
        await this.showWaitingText();
        
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

    setState(newState) {
        this.state = newState;
        
        // 更新UI状态
        switch (newState) {
            case 'IDLE':
                this.statusIndicator.textContent = '集中精神，思考你的问题，然后点击魔法球';
                this.statusIndicator.className = 'status-indicator';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '提问';
                break;
                
            case 'THINKING':
                this.statusIndicator.textContent = '魔法正在运作，请保持专注...';
                this.statusIndicator.className = 'status-indicator thinking';
                this.askButton.disabled = true;
                this.askButton.classList.add('loading');
                break;
                
            case 'REVEALING':
                this.statusIndicator.textContent = '答案正在显现...';
                break;
                
            case 'SHOWING':
                this.statusIndicator.textContent = '这是宇宙给你的答案';
                this.statusIndicator.className = 'status-indicator';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '再次提问';
                break;
        }
    }

    enhanceCrystalBall() {
        // 增强魔法球的光效
        this.crystalBall.style.animation = 'crystal-float 1s ease-in-out infinite alternate';
        this.crystalBall.style.boxShadow = 
            'inset 0 0 80px rgba(255, 255, 255, 0.9), ' +
            'inset 0 0 120px rgba(255, 182, 193, 0.7), ' +
            '0 0 120px rgba(244, 143, 177, 0.8), ' +
            '0 0 180px rgba(244, 143, 177, 0.6), ' +
            '0 0 0 25px rgba(255, 255, 255, 0.3)';
    }

    async showWaitingText() {
        // 隐藏之前的答案
        const answerChars = this.answerText.querySelectorAll('.char');
        answerChars.forEach(char => char.remove());
        
        // 显示等待文本
        this.waitingText.style.display = 'flex';
        
        // 随机选择一个等待文本
        const randomText = this.waitingTexts[Math.floor(Math.random() * this.waitingTexts.length)];
        this.waitingText.innerHTML = `
            ${randomText}
            <div class="waiting-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        // 等待3秒
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 隐藏等待文本
        this.waitingText.style.display = 'none';
    }

    async playRevealAnimation(answer) {
        // 恢复魔法球正常状态
        this.crystalBall.style.animation = 'crystal-float 6s ease-in-out infinite';
        this.crystalBall.style.boxShadow = 
            'inset 0 0 60px rgba(255, 255, 255, 0.8), ' +
            'inset 0 0 100px rgba(255, 182, 193, 0.5), ' +
            '0 0 80px rgba(244, 143, 177, 0.6), ' +
            '0 0 120px rgba(244, 143, 177, 0.4), ' +
            '0 0 0 15px rgba(255, 255, 255, 0.2)';
        
        // 清空答案文本
        this.answerText.innerHTML = '';
        
        // 逐字显示答案
        const chars = answer.split('');
        const delay = 80; // 每个字符的显示延迟
        
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
                charSpan.style.animation = 'char-float 0.8s ease forwards';
            }, i * delay);
        }
        
        // 等待动画完成
        await new Promise(resolve => {
            setTimeout(resolve, chars.length * delay + 500);
        });
    }

    bindEvents() {
        // 魔法球点击事件
        if (this.crystalBall) {
            this.crystalBall.addEventListener('click', this.handleAskClick);
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
    }

    // 历史记录功能
    loadHistory() {
        const savedHistory = localStorage.getItem('taoci_answer_history_v2');
        if (savedHistory) {
            this.answerHistory = JSON.parse(savedHistory);
            this.renderHistory();
            this.updateHistoryCount();
        }
    }

    saveHistory() {
        localStorage.setItem('taoci_answer_history_v2', JSON.stringify(this.answerHistory));
    }

    addToHistory(answer) {
        const historyItem = {
            answer: answer,
            timestamp: new Date().toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
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
                    还没有历史答案，点击上方魔法球开始提问
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
        if (confirm('确定要清空所有历史答案吗？此操作不可撤销。')) {
            this.answerHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.updateHistoryCount();
            
            // 显示提示
            this.statusIndicator.textContent = '历史记录已清空';
            this.statusIndicator.style.background = 'rgba(255, 100, 100, 0.2)';
            this.statusIndicator.style.borderColor = 'rgba(255, 100, 100, 0.4)';
            
            setTimeout(() => {
                this.statusIndicator.textContent = '这是宇宙给你的答案';
                this.statusIndicator.style.background = '';
                this.statusIndicator.style.borderColor = '';
            }, 2000);
        }
    }

    toggleHistoryExpansion() {
        this.isHistoryExpanded = !this.isHistoryExpanded;
        
        const toggleIcon = document.querySelector('.history-toggle-icon');
        const listContainer = this.historyListContainer;
        
        if (this.isHistoryExpanded) {
            listContainer.classList.add('expanded');
            if (toggleIcon) {
                toggleIcon.classList.add('expanded');
            }
        } else {
            listContainer.classList.remove('expanded');
            if (toggleIcon) {
                toggleIcon.classList.remove('expanded');
            }
        }
    }
}