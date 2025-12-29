// 答案之书模块重构版主类
import { getRandomAnswer } from './answer-data.js';

export default class AnswerBookModule {
    constructor() {
        this.state = 'IDLE'; // IDLE, THINKING, REVEALING, SHOWING
        this.currentAnswer = '';
        this.answerHistory = [];
        this.isHistoryExpanded = false;
        
        // 绑定方法
        this.handleAskClick = this.handleAskClick.bind(this);
        this.toggleHistory = this.toggleHistory.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
    }

    init(container) {
        try {
            // 渲染模块结构
            this.render(container);
            
            // 加载历史记录
            this.loadHistory();
            
            // 绑定事件
            this.bindEvents();
            
            // 恢复历史记录展开状态
            this.restoreHistoryState();
            
        } catch (error) {
            console.error('答案之书模块初始化失败:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="color: #FF6B9D;">答案之书加载失败</h2>
                    <p style="color: #666;">魔法暂时失效了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    render(container) {
        container.innerHTML = `
            <!-- 背景花纹 -->
            <div class="answer-book-bg">
                <div class="bg-pattern"></div>
                <div class="floating-star"></div>
                <div class="floating-star"></div>
                <div class="floating-star"></div>
                <div class="floating-star"></div>
            </div>
            
            <!-- 主容器 -->
            <div class="answer-book-container">
                <!-- 标题区域 -->
                <div class="title-section">
                    <h1 class="main-title">答案之书</h1>
                    <p class="subtitle">向魔法提问，获取你内心的答案</p>
                    <p class="disclaimer">答案仅供参考，最终的选择在你心中</p>
                </div>
                
                <!-- 答案展示框 -->
                <div class="answer-card">
                    <div class="card-corner tl"></div>
                    <div class="card-corner tr"></div>
                    <div class="card-corner bl"></div>
                    <div class="card-corner br"></div>
                    
                    <div class="answer-text-container">
                        <div class="answer-text" id="answer-text">
                            <div class="waiting-text">
                                <span>准备接受魔法的指引</span>
                                <div class="thinking-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 状态提示 -->
                <div class="status-indicator" id="status-indicator">
                    点击魔法按钮，向答案之书提问
                </div>
                
                <!-- 获取答案按钮 -->
                <div class="ask-button-container">
                    <button class="ask-button" id="ask-button">
                        <div class="ripple">
                            <div class="ripple-wave"></div>
                            <div class="ripple-wave"></div>
                            <div class="ripple-wave"></div>
                        </div>
                        <span class="button-text">魔法提问</span>
                        <div class="loading-spinner"></div>
                    </button>
                </div>
                
                <!-- 历史记录区域 -->
                <div class="history-container" id="history-container">
                    <div class="history-header" id="history-header">
                        <div class="history-title">
                            <span>历史答案</span>
                            <span class="history-count" id="history-count">0</span>
                        </div>
                        <div class="toggle-icon" id="toggle-icon">▼</div>
                    </div>
                    
                    <div class="history-content" id="history-content">
                        <ul class="history-list" id="history-list">
                            <!-- 历史记录会动态生成 -->
                        </ul>
                        <button class="clear-history-btn" id="clear-history-btn">清空历史记录</button>
                    </div>
                </div>
            </div>
        `;
        
        // 保存重要元素的引用
        this.answerText = document.getElementById('answer-text');
        this.statusIndicator = document.getElementById('status-indicator');
        this.askButton = document.getElementById('ask-button');
        this.historyList = document.getElementById('history-list');
        this.historyCount = document.getElementById('history-count');
        this.historyContent = document.getElementById('history-content');
        this.toggleIcon = document.getElementById('toggle-icon');
        this.historyHeader = document.getElementById('history-header');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
    }

    async handleAskClick() {
        if (this.state === 'IDLE' || this.state === 'SHOWING') {
            await this.startThinking();
        }
    }

    async startThinking() {
        // 进入思考状态
        this.setState('THINKING');
        
        // 等待2秒模拟思考过程
        await this.wait(2000);
        
        // 获取随机答案
        this.currentAnswer = getRandomAnswer();
        
        // 进入揭示状态
        this.setState('REVEALING');
        
        // 播放答案揭示动画
        await this.playRevealAnimation(this.currentAnswer);
        
        // 进入显示状态
        this.setState('SHOWING');
        
        // 保存到历史记录
        this.addToHistory(this.currentAnswer);
    }

    setState(newState) {
        this.state = newState;
        
        // 更新UI状态
        switch (newState) {
            case 'IDLE':
                this.statusIndicator.textContent = '点击魔法按钮，向答案之书提问';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                break;
                
            case 'THINKING':
                this.statusIndicator.textContent = '魔法书正在翻阅中，请稍候...';
                this.askButton.disabled = true;
                this.askButton.classList.add('loading');
                break;
                
            case 'REVEALING':
                this.statusIndicator.textContent = '魔法答案正在显现...';
                break;
                
            case 'SHOWING':
                this.statusIndicator.textContent = '这是魔法书给你的答案';
                this.askButton.disabled = false;
                this.askButton.classList.remove('loading');
                this.askButton.querySelector('.button-text').textContent = '再次提问';
                break;
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async playRevealAnimation(answer) {
        // 清空答案文本
        this.answerText.innerHTML = '';
        
        // 显示等待状态
        const waitingDiv = document.createElement('div');
        waitingDiv.className = 'waiting-text';
        waitingDiv.innerHTML = `
            <span>魔法书正在翻阅中</span>
            <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.answerText.appendChild(waitingDiv);
        
        // 等待1秒
        await this.wait(1000);
        
        // 清空并开始显示答案
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
                charSpan.style.animation = `char-appear 0.3s ease forwards`;
            }, i * delay);
        }
        
        // 等待动画完成
        await new Promise(resolve => {
            setTimeout(resolve, chars.length * delay + 300);
        });
    }

    bindEvents() {
        // 按钮点击事件
        if (this.askButton) {
            this.askButton.addEventListener('click', this.handleAskClick);
        }
        
        // 历史记录展开/收起
        if (this.historyHeader) {
            this.historyHeader.addEventListener('click', this.toggleHistory);
        }
        
        // 清空历史记录
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', this.clearHistory);
        }
    }

    // 历史记录功能
    loadHistory() {
        const savedHistory = localStorage.getItem('answer_book_history');
        if (savedHistory) {
            this.answerHistory = JSON.parse(savedHistory);
            this.renderHistory();
            this.updateHistoryCount();
        }
        
        // 加载历史记录展开状态
        const historyState = localStorage.getItem('answer_book_history_expanded');
        if (historyState) {
            this.isHistoryExpanded = historyState === 'true';
        }
    }

    restoreHistoryState() {
        if (this.isHistoryExpanded) {
            this.historyContent.classList.add('expanded');
            this.toggleIcon.classList.add('expanded');
        }
    }

    saveHistory() {
        localStorage.setItem('answer_book_history', JSON.stringify(this.answerHistory));
        localStorage.setItem('answer_book_history_expanded', JSON.stringify(this.isHistoryExpanded));
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
            this.toggleHistory();
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
        if (confirm('确定要清空所有历史答案吗？此操作不可撤销。')) {
            this.answerHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.updateHistoryCount();
        }
    }

    toggleHistory() {
        this.isHistoryExpanded = !this.isHistoryExpanded;
        
        if (this.isHistoryExpanded) {
            this.historyContent.classList.add('expanded');
            this.toggleIcon.classList.add('expanded');
        } else {
            this.historyContent.classList.remove('expanded');
            this.toggleIcon.classList.remove('expanded');
        }
        
        // 保存展开状态
        localStorage.setItem('answer_book_history_expanded', JSON.stringify(this.isHistoryExpanded));
    }

    destroy() {
        // 清理事件监听
        if (this.askButton) {
            this.askButton.removeEventListener('click', this.handleAskClick);
        }
        
        if (this.historyHeader) {
            this.historyHeader.removeEventListener('click', this.toggleHistory);
        }
        
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.removeEventListener('click', this.clearHistory);
        }
    }
}