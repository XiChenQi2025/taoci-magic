// 留言角模块主类
import { messageService } from './message-service.js';

export default class MessageBoardModule {
    constructor() {
        this.messages = [];
        this.currentUser = this.getOrCreateUser();
        this.sortBy = 'latest'; // latest 或 hot
        this.replyingTo = null; // 当前正在回复的消息ID
        this.activeReplyPanel = null; // 当前活动的回复面板
        
        // 预设头像选项
        this.avatarOptions = ['✨', '🌙', '🍑', '🥤', '🎀'];
        
        // 绑定方法
        this.handlePostMessage = this.handlePostMessage.bind(this);
        this.handleReply = this.handleReply.bind(this);
        this.handleLike = this.handleLike.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
    }

    async init(appContainer) {
        try {
            // 1. 注入模块样式
            this.injectStyles();
            
            // 2. 渲染模块结构
            this.render(appContainer);
            
            // 3. 加载留言数据
            await this.loadMessages();
            
            // 4. 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('留言角模块初始化失败:', error);
            appContainer.innerHTML = `
                <div class="card">
                    <h2 class="card-title">留言角加载失败</h2>
                    <p class="card-content">网络开小差了，请刷新页面重试</p>
                </div>
            `;
        }
    }

    destroy() {
        // 清理事件监听
        const postBtn = document.getElementById('post-btn');
        const sortBtns = document.querySelectorAll('.sort-btn');
        const avatarOptions = document.querySelectorAll('.avatar-option');
        const nicknameInput = document.getElementById('nickname-input');
        const contentInput = document.getElementById('content-input');
        
        if (postBtn) postBtn.removeEventListener('click', this.handlePostMessage);
        sortBtns.forEach(btn => btn.removeEventListener('click', this.handleSortChange));
        avatarOptions.forEach(option => option.removeEventListener('click', () => {}));
        
        if (nicknameInput) nicknameInput.removeEventListener('input', this.handleNicknameChange);
        if (contentInput) contentInput.removeEventListener('input', this.handleContentChange);
        
        // 清理样式
        const style = document.getElementById('message-board-styles');
        if (style) style.remove();
    }

    injectStyles() {
        // 检查是否已注入样式
        if (!document.getElementById('message-board-styles')) {
            const style = document.createElement('style');
            style.id = 'message-board-styles';
            style.textContent = `
                /* 这里应该是message-board.css的内容 */
                /* 由于CSS内容较长，我们在外部文件中定义 */
            `;
            document.head.appendChild(style);
            
            // 动态加载外部CSS文件
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './message-board.css';
            link.id = 'message-board-styles-external';
            document.head.appendChild(link);
        }
    }

    // 获取或创建用户身份
    getOrCreateUser() {
        const savedUser = localStorage.getItem('taoci_current_user');
        
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        
        // 创建新用户
        const newUser = {
            avatar: '✨',
            nickname: '',
            sessionId: '#' + Math.random().toString(36).substr(2, 4).toUpperCase(),
            isStreamer: false
        };
        
        localStorage.setItem('taoci_current_user', JSON.stringify(newUser));
        return newUser;
    }

    // 保存用户身份
    saveCurrentUser() {
        localStorage.setItem('taoci_current_user', JSON.stringify(this.currentUser));
    }

    render(container) {
        container.innerHTML = `
            <div class="message-board-container">
                <!-- 发布面板 -->
                <div class="post-panel">
                    <div class="panel-header">
                        <div class="avatar-selector" id="avatar-selector">
                            ${this.avatarOptions.map(avatar => `
                                <div class="avatar-option ${avatar === this.currentUser.avatar ? 'selected' : ''}" 
                                     data-avatar="${avatar}">
                                    ${avatar}
                                </div>
                            `).join('')}
                        </div>
                        <input type="text" 
                               class="nickname-input" 
                               id="nickname-input"
                               placeholder="取个闪亮的名字…"
                               value="${this.currentUser.nickname || ''}"
                               maxlength="20">
                    </div>
                    <textarea class="content-input" 
                              id="content-input"
                              placeholder="发射你的星光…（支持**粗体**和链接）"></textarea>
                    <button class="btn btn-green post-btn" id="post-btn">
                        <span>发射星光！</span>
                    </button>
                </div>
                
                <!-- 排序控制 -->
                <div class="sort-controls">
                    <button class="sort-btn ${this.sortBy === 'latest' ? 'active' : ''}" 
                            data-sort="latest">
                        最新优先
                    </button>
                    <button class="sort-btn ${this.sortBy === 'hot' ? 'active' : ''}" 
                            data-sort="hot">
                        最热优先
                    </button>
                </div>
                
                <!-- 留言列表 -->
                <div class="message-list" id="message-list">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <span style="margin-left: 1rem;">加载星光中…</span>
                    </div>
                </div>
                
                <!-- 状态栏 -->
                <div class="status-bar">
                    共有 <strong id="message-count">0</strong> 颗星光在此闪耀
                </div>
            </div>
        `;
        
        // 保存重要元素的引用
        this.avatarSelector = container.querySelector('#avatar-selector');
        this.nicknameInput = container.querySelector('#nickname-input');
        this.contentInput = container.querySelector('#content-input');
        this.postBtn = container.querySelector('#post-btn');
        this.messageList = container.querySelector('#message-list');
        this.messageCount = container.querySelector('#message-count');
        this.sortBtns = container.querySelectorAll('.sort-btn');
    }

    async loadMessages() {
        const response = await messageService.getSortedMessages(this.sortBy);
        
        if (response.code === 200) {
            this.messages = response.data;
            this.renderMessageList();
            this.updateMessageCount();
        } else {
            this.messageList.innerHTML = `
                <div class="empty-state">
                    <h3>加载失败</h3>
                    <p>${response.message}</p>
                    <button class="btn btn-pink mt-1" onclick="location.reload()">重新加载</button>
                </div>
            `;
        }
    }

    renderMessageList() {
        if (this.messages.length === 0) {
            this.messageList.innerHTML = `
                <div class="empty-state">
                    <h3>✨ 这里还没有星光 ✨</h3>
                    <p>快发布第一条留言，成为最亮的星星吧！</p>
                </div>
            `;
            return;
        }
        
        this.messageList.innerHTML = '';
        
        this.messages.forEach(message => {
            // 渲染主留言
            const messageCard = this.createMessageCard(message, false);
            this.messageList.appendChild(messageCard);
            
            // 渲染回复
            if (message.replies && message.replies.length > 0) {
                message.replies.forEach(reply => {
                    const replyCard = this.createMessageCard(reply, true, message.nickname);
                    this.messageList.appendChild(replyCard);
                });
            }
        });
    }

    createMessageCard(message, isReply = false, parentNickname = null) {
        const card = document.createElement('div');
        card.className = `message-card ${isReply ? 'reply' : 'main-message'} ${message.isStreamer ? 'streamer' : ''}`;
        card.dataset.id = message.id;
        card.dataset.parentId = message.parentId;
        
        // 根据userId生成装饰线颜色
        const hue = this.hashString(message.userId) % 360;
        const color = `hsl(${hue}, 100%, 60%)`;
        
        if (!isReply) {
            card.style.setProperty('--decor-color', color);
            card.style.borderLeft = `4px solid ${color}`;
        }
        
        const timeStr = this.formatTime(message.timestamp);
        
        card.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">
                    ${message.avatar}
                </div>
                <div class="message-meta">
                    <div class="message-nickname">
                        ${message.nickname}
                        ${message.isStreamer ? '<span class="streamer-badge">🍑 本尊</span>' : ''}
                        <span class="user-id">${message.userId}</span>
                        ${isReply && parentNickname ? `<span class="reply-to">回复 @${parentNickname}</span>` : ''}
                    </div>
                    <div class="message-time">${timeStr}</div>
                </div>
                <div class="message-actions">
                    <div class="action-menu">
                        <button class="action-btn menu-trigger">⋯</button>
                        <div class="menu-dropdown">
                            <button class="menu-item report">举报</button>
                            <button class="menu-item copy-link">复制链接</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="message-content">${this.formatContent(message.content)}</div>
            <div class="message-footer">
                <button class="like-btn ${message.likes > 0 ? 'liked' : ''}" data-id="${message.id}">
                    <span class="like-icon">❤️</span>
                    <span class="like-count">${message.likes}</span>
                </button>
                <button class="reply-btn" data-id="${message.id}">
                    <span>💬</span>
                    <span>回复</span>
                </button>
                <button class="copy-btn" data-id="${message.id}">
                    <span>📋</span>
                    <span>复制</span>
                </button>
            </div>
        `;
        
        // 绑定卡片事件
        this.bindCardEvents(card, message, isReply);
        
        return card;
    }

    formatContent(content) {
        // 简单Markdown处理
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/\n/g, '<br>');
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        // 转换为秒
        const seconds = Math.floor(diff / 1000);
        
        if (seconds < 60) {
            return '刚刚';
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes}分钟前`;
        } else if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return `${hours}小时前`;
        } else {
            const date = new Date(timestamp);
            return date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    bindCardEvents(card, message, isReply) {
        const likeBtn = card.querySelector('.like-btn');
        const replyBtn = card.querySelector('.reply-btn');
        const copyBtn = card.querySelector('.copy-btn');
        const menuTrigger = card.querySelector('.menu-trigger');
        const menuDropdown = card.querySelector('.menu-dropdown');
        const reportBtn = card.querySelector('.report');
        const copyLinkBtn = card.querySelector('.copy-link');
        
        // 点赞按钮
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleLike(message.id, isReply, message.parentId);
        });
        
        // 回复按钮
        replyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showReplyPanel(message.id, message.nickname, card);
        });
        
        // 复制按钮
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyMessageLink(message.id);
        });
        
        // 菜单按钮
        menuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
        });
        
        // 举报按钮
        reportBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const response = await messageService.reportMessage(message.id);
            alert(response.message);
            menuDropdown.classList.remove('show');
        });
        
        // 复制链接按钮
        copyLinkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyMessageLink(message.id);
            menuDropdown.classList.remove('show');
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', () => {
            menuDropdown.classList.remove('show');
        });
        
        // 阻止菜单内部点击事件冒泡
        menuDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    showReplyPanel(messageId, targetNickname, targetCard) {
        // 如果已有回复面板，先移除
        if (this.activeReplyPanel) {
            this.activeReplyPanel.remove();
            this.activeReplyPanel = null;
        }
        
        // 如果点击的是同一个消息的回复按钮，关闭面板
        if (this.replyingTo === messageId) {
            this.replyingTo = null;
            targetCard.classList.remove('focused-message');
            return;
        }
        
        // 设置回复目标
        this.replyingTo = messageId;
        targetCard.classList.add('focused-message');
        
        // 创建回复面板
        const replyPanel = document.createElement('div');
        replyPanel.className = 'reply-panel';
        replyPanel.dataset.targetId = messageId;
        
        replyPanel.innerHTML = `
            <div class="reply-header">
                <div class="reply-avatar">${this.currentUser.avatar}</div>
                <span>回复 @${targetNickname}</span>
            </div>
            <textarea class="reply-input" placeholder="回复 @${targetNickname}…"></textarea>
            <div class="reply-buttons">
                <button class="cancel-reply">取消</button>
                <button class="send-reply">发送</button>
            </div>
        `;
        
        // 插入到目标卡片后面
        targetCard.after(replyPanel);
        this.activeReplyPanel = replyPanel;
        
        // 聚焦输入框
        const replyInput = replyPanel.querySelector('.reply-input');
        replyInput.focus();
        
        // 绑定回复面板事件
        const cancelBtn = replyPanel.querySelector('.cancel-reply');
        const sendBtn = replyPanel.querySelector('.send-reply');
        
        cancelBtn.addEventListener('click', () => {
            replyPanel.remove();
            this.activeReplyPanel = null;
            this.replyingTo = null;
            targetCard.classList.remove('focused-message');
        });
        
        sendBtn.addEventListener('click', async () => {
            const content = replyInput.value.trim();
            if (!content) {
                alert('请输入回复内容');
                return;
            }
            
            if (!this.currentUser.nickname) {
                alert('请先设置昵称');
                return;
            }
            
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<span>发送中…</span>';
            
            await this.handleReply(content, messageId);
            
            replyPanel.remove();
            this.activeReplyPanel = null;
            this.replyingTo = null;
            targetCard.classList.remove('focused-message');
        });
        
        // 回车发送
        replyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                sendBtn.click();
            }
        });
    }

    bindEvents() {
        // 头像选择
        this.avatarSelector.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                const avatar = option.dataset.avatar;
                
                // 更新UI
                this.avatarSelector.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // 更新用户信息
                this.currentUser.avatar = avatar;
                this.saveCurrentUser();
            });
        });
        
        // 昵称输入
        this.nicknameInput.addEventListener('input', (e) => {
            this.currentUser.nickname = e.target.value.trim();
            this.saveCurrentUser();
        });
        
        // 内容输入
        this.contentInput.addEventListener('input', () => {
            this.updatePostButtonState();
        });
        
        // 发布按钮
        this.postBtn.addEventListener('click', this.handlePostMessage);
        
        // 排序按钮
        this.sortBtns.forEach(btn => {
            btn.addEventListener('click', this.handleSortChange);
        });
        
        // 全局点击关闭菜单
        document.addEventListener('click', () => {
            document.querySelectorAll('.menu-dropdown').forEach(menu => {
                menu.classList.remove('show');
            });
        });
        
        // 主播身份模拟（开发用）
        this.setupStreamerSimulation();
    }

    updatePostButtonState() {
        const hasContent = this.contentInput.value.trim().length > 0;
        const hasNickname = this.currentUser.nickname.trim().length > 0;
        
        this.postBtn.disabled = !(hasContent && hasNickname);
        
        if (this.postBtn.disabled) {
            this.postBtn.innerHTML = '<span>发射星光！</span>';
        }
    }

    async handlePostMessage() {
        const content = this.contentInput.value.trim();
        const nickname = this.currentUser.nickname.trim();
        
        if (!content || !nickname) {
            alert('请填写昵称和留言内容');
            return;
        }
        
        // 禁用按钮，显示加载状态
        this.postBtn.disabled = true;
        this.postBtn.innerHTML = '<span>发射中…</span>';
        
        const messageData = {
            avatar: this.currentUser.avatar,
            nickname: nickname,
            userId: this.currentUser.sessionId,
            content: content,
            parentId: null,
            isStreamer: this.currentUser.isStreamer
        };
        
        const response = await messageService.postMessage(messageData);
        
        if (response.code === 201) {
            // 清空输入框
            this.contentInput.value = '';
            
            // 重新加载留言
            await this.loadMessages();
            
            // 滚动到顶部
            this.messageList.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('发布失败：' + response.message);
        }
        
        // 恢复按钮状态
        this.postBtn.disabled = false;
        this.postBtn.innerHTML = '<span>发射星光！</span>';
    }

    async handleReply(content, parentId) {
        if (!this.currentUser.nickname) {
            alert('请先设置昵称');
            return;
        }
        
        const messageData = {
            avatar: this.currentUser.avatar,
            nickname: this.currentUser.nickname,
            userId: this.currentUser.sessionId,
            content: content,
            parentId: parentId,
            isStreamer: this.currentUser.isStreamer
        };
        
        const response = await messageService.postMessage(messageData);
        
        if (response.code === 201) {
            // 重新加载留言
            await this.loadMessages();
        } else {
            alert('回复失败：' + response.message);
        }
    }

    async handleLike(messageId, isReply = false, parentId = null) {
        const response = await messageService.toggleLike(messageId, isReply, parentId);
        
        if (response.code === 200) {
            // 重新加载留言
            await this.loadMessages();
            
            // 添加粒子效果
            this.createLikeParticles(messageId);
        } else {
            alert('点赞失败：' + response.message);
        }
    }

    async handleSortChange(e) {
        const sortType = e.target.dataset.sort;
        
        if (sortType === this.sortBy) return;
        
        // 更新按钮状态
        this.sortBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // 更新排序方式
        this.sortBy = sortType;
        
        // 重新加载留言
        await this.loadMessages();
    }

    copyMessageLink(messageId) {
        const url = `${window.location.origin}${window.location.pathname}#message-${messageId}`;
        
        navigator.clipboard.writeText(url).then(() => {
            alert('链接已复制到剪贴板！');
        }).catch(() => {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('链接已复制到剪贴板！');
        });
    }

    updateMessageCount() {
        let totalMessages = this.messages.length;
        this.messages.forEach(msg => {
            totalMessages += (msg.replies?.length || 0);
        });
        
        this.messageCount.textContent = totalMessages;
    }

    createLikeParticles(messageId) {
        const likeBtn = document.querySelector(`.like-btn[data-id="${messageId}"]`);
        if (!likeBtn) return;
        
        const rect = likeBtn.getBoundingClientRect();
        const container = likeBtn.closest('.message-card');
        
        // 创建粒子容器
        let particleContainer = container.querySelector('.like-particles');
        if (!particleContainer) {
            particleContainer = document.createElement('div');
            particleContainer.className = 'like-particles';
            container.appendChild(particleContainer);
        }
        
        // 创建粒子
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'like-particle';
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            
            particle.style.left = `${rect.width / 2}px`;
            particle.style.top = `${rect.height / 2}px`;
            
            particleContainer.appendChild(particle);
            
            // 粒子动画
            particle.animate([
                {
                    transform: `translate(0, 0) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            });
            
            // 移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 800);
        }
        
        // 清理容器
        setTimeout(() => {
            if (particleContainer && particleContainer.children.length === 0) {
                particleContainer.remove();
            }
        }, 1000);
    }

    // 主播身份模拟（开发用）
    setupStreamerSimulation() {
        // 在控制台设置主播身份
        window.enableStreamerMode = (password) => {
            const isValid = messageService.verifyStreamer(password);
            if (isValid) {
                this.currentUser.nickname = '桃汽水';
                this.currentUser.avatar = '🍑';
                this.currentUser.sessionId = '#TAO1';
                this.currentUser.isStreamer = true;
                this.saveCurrentUser();
                
                // 更新UI
                this.nicknameInput.value = '桃汽水';
                this.avatarSelector.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.dataset.avatar === '🍑');
                });
                
                alert('主播模式已启用！');
            } else {
                alert('密码错误');
            }
        };
        
        console.log('开发提示：在控制台输入 enableStreamerMode("taoci2024") 启用主播模式');
    }
}