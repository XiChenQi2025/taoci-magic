// 留言角数据服务层
// 使用 LocalStorage 实现，模拟 API 调用返回 Promise

class MessageService {
    constructor() {
        this.storageKey = 'taoci_message_board';
        this.streamerPassword = 'taoci2024'; // 主播身份密码（仅前端模拟）
        this.initStorage();
    }

    // 初始化存储
    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = this.getInitialData();
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    // 获取模拟数据
    getInitialData() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        return [
            {
                id: 'msg_001',
                parentId: null,
                avatar: '🍑',
                nickname: '桃汽水',
                userId: '#TAO1',
                content: '欢迎大家来到魔力补给站！这里是属于我们的小天地，可以随意留言交流哦～有什么想对我说的，或者有什么有趣的想法，都可以在这里分享！✨',
                timestamp: now - 5 * oneDay,
                likes: 42,
                isStreamer: true,
                replies: [
                    {
                        id: 'msg_101',
                        parentId: 'msg_001',
                        avatar: '✨',
                        nickname: '星光粉丝',
                        userId: '#STAR',
                        content: '桃桃终于有留言板了！太开心了！期待在这里和大家一起聊天～',
                        timestamp: now - 4 * oneDay,
                        likes: 15,
                        isStreamer: false
                    },
                    {
                        id: 'msg_102',
                        parentId: 'msg_001',
                        avatar: '🌙',
                        nickname: '夜猫子',
                        userId: '#MOON',
                        content: '今天直播的新歌太好听了！**单曲循环中** 🎵',
                        timestamp: now - 3 * oneDay,
                        likes: 28,
                        isStreamer: false
                    }
                ]
            },
            {
                id: 'msg_002',
                parentId: null,
                avatar: '🥤',
                nickname: '汽水狂热粉',
                userId: '#SODA',
                content: '想问下大家，周年庆的限定周边在哪里可以预订呀？好想要那个星空主题的马克杯！',
                timestamp: now - 2 * oneDay,
                likes: 19,
                isStreamer: false,
                replies: [
                    {
                        id: 'msg_201',
                        parentId: 'msg_002',
                        avatar: '🍑',
                        nickname: '桃汽水',
                        userId: '#TAO1',
                        content: '在官方店铺哦！链接在这里：https://shop.taoci.com ，谢谢支持！🥰',
                        timestamp: now - 1 * oneDay,
                        likes: 36,
                        isStreamer: true
                    }
                ]
            },
            {
                id: 'msg_003',
                parentId: null,
                avatar: '🎀',
                nickname: '粉色小桃子',
                userId: '#PEACH',
                content: '今天遇到了不开心的事...但是看了桃桃的直播感觉被治愈了，谢谢你一直带来快乐！',
                timestamp: now - 12 * 60 * 60 * 1000, // 12小时前
                likes: 31,
                isStreamer: false,
                replies: []
            }
        ];
    }

    // 生成唯一ID
    generateId() {
        return 'msg_' + Math.random().toString(36).substr(2, 9);
    }

    // 获取所有留言（模拟 GET /api/messages）
    async getAllMessages() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const messages = data ? JSON.parse(data) : [];
            
            // 模拟网络延迟
            await this.simulateDelay();
            
            return {
                code: 200,
                data: messages,
                message: '获取留言成功'
            };
        } catch (error) {
            console.error('获取留言失败:', error);
            return {
                code: 500,
                data: [],
                message: '获取留言失败，请稍后重试'
            };
        }
    }

    // 发布新留言（模拟 POST /api/messages）
    async postMessage(messageData) {
        try {
            // 验证必要字段
            if (!messageData.avatar || !messageData.nickname || !messageData.content) {
                throw new Error('缺少必要字段');
            }

            // 获取现有数据
            const data = localStorage.getItem(this.storageKey);
            const messages = data ? JSON.parse(data) : [];
            
            // 创建新消息
            const newMessage = {
                id: this.generateId(),
                parentId: messageData.parentId || null,
                avatar: messageData.avatar,
                nickname: messageData.nickname.trim(),
                userId: messageData.userId,
                content: messageData.content.trim(),
                timestamp: Date.now(),
                likes: 0,
                isStreamer: messageData.isStreamer || false,
                replies: []
            };

            // 如果是回复，找到主留言并添加
            if (messageData.parentId) {
                const parentIndex = messages.findIndex(msg => msg.id === messageData.parentId);
                if (parentIndex !== -1) {
                    if (!messages[parentIndex].replies) {
                        messages[parentIndex].replies = [];
                    }
                    messages[parentIndex].replies.push(newMessage);
                } else {
                    // 如果找不到父消息，作为新消息添加
                    messages.push(newMessage);
                }
            } else {
                // 新主留言
                messages.push(newMessage);
            }

            // 保存到 LocalStorage
            localStorage.setItem(this.storageKey, JSON.stringify(messages));
            
            // 模拟网络延迟
            await this.simulateDelay();
            
            return {
                code: 201,
                data: newMessage,
                message: '发布成功'
            };
        } catch (error) {
            console.error('发布留言失败:', error);
            return {
                code: 500,
                data: null,
                message: '发布失败，请稍后重试'
            };
        }
    }

    // 点赞/取消点赞
    async toggleLike(messageId, isReply = false, parentId = null) {
        try {
            const data = localStorage.getItem(this.storageKey);
            let messages = data ? JSON.parse(data) : [];
            
            if (isReply && parentId) {
                // 处理回复的点赞
                const parentIndex = messages.findIndex(msg => msg.id === parentId);
                if (parentIndex !== -1 && messages[parentIndex].replies) {
                    const replyIndex = messages[parentIndex].replies.findIndex(reply => reply.id === messageId);
                    if (replyIndex !== -1) {
                        messages[parentIndex].replies[replyIndex].likes += 1;
                    }
                }
            } else {
                // 处理主留言的点赞
                const messageIndex = messages.findIndex(msg => msg.id === messageId);
                if (messageIndex !== -1) {
                    messages[messageIndex].likes += 1;
                }
            }

            localStorage.setItem(this.storageKey, JSON.stringify(messages));
            
            await this.simulateDelay();
            
            return {
                code: 200,
                message: '点赞成功'
            };
        } catch (error) {
            console.error('点赞失败:', error);
            return {
                code: 500,
                message: '点赞失败，请稍后重试'
            };
        }
    }

    // 举报留言（前端标记）
    async reportMessage(messageId) {
        try {
            // 在实际应用中，这里应该发送到后端
            // 前端只记录到 LocalStorage
            const reports = JSON.parse(localStorage.getItem('message_reports') || '[]');
            if (!reports.includes(messageId)) {
                reports.push(messageId);
                localStorage.setItem('message_reports', JSON.stringify(reports));
            }
            
            await this.simulateDelay();
            
            return {
                code: 200,
                message: '举报已提交，感谢您的反馈'
            };
        } catch (error) {
            console.error('举报失败:', error);
            return {
                code: 500,
                message: '举报失败，请稍后重试'
            };
        }
    }

    // 验证主播身份
    verifyStreamer(password) {
        return password === this.streamerPassword;
    }

    // 模拟网络延迟
    simulateDelay(min = 300, max = 800) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // 获取排序后的留言
    async getSortedMessages(sortBy = 'latest') {
        const response = await this.getAllMessages();
        if (response.code !== 200) return response;
        
        let messages = [...response.data];
        
        if (sortBy === 'latest') {
            // 按时间倒序
            messages.sort((a, b) => b.timestamp - a.timestamp);
        } else if (sortBy === 'hot') {
            // 按热度排序（点赞数 + 回复数 * 2）
            messages.sort((a, b) => {
                const aHot = a.likes + (a.replies?.length || 0) * 2;
                const bHot = b.likes + (b.replies?.length || 0) * 2;
                return bHot - aHot;
            });
        }
        
        return {
            code: 200,
            data: messages,
            message: '获取留言成功'
        };
    }
}

// 导出单例实例
export const messageService = new MessageService();