// ===========================================
// 桃汽水的魔力补给站 - 核心配置文件
// 所有站点配置都在这里修改
// ===========================================

const TAOCI_CONFIG = {
    // ==================== 站点基础信息 ====================
    site: {
        name: "桃汽水的魔力补给站",
        title: "异世界精灵公主周年庆典",
        version: "1.0.0",
        description: "精灵公主桃汽水的周年庆专属粉丝站点",
        keywords: "虚拟主播,桃汽水,精灵公主,周年庆,粉丝互动",
        
        // 主播信息
        vtuber: {
            name: "桃汽水",
            title: "精灵公主",
            personality: "活泼可爱调皮",
            catchphrase: "契约者们，准备好收集魔力了吗？",
            color: "#FF00FF", // 荧光粉
            birthday: "12月25日",
            debut: "一年前"
        }
    },
    
    // ==================== 时间与活动配置 ====================
    schedule: {
        // 重要日期（请修改为实际日期）
        siteLaunch: "2024-12-10",
        liveStart: "2024-12-25T19:00:00", // 周年庆直播开始
        eventEnd: "2024-12-31T23:59:59",   // 活动结束
        
        // 倒计时配置
        countdown: {
            enabled: true,
            target: "2024-12-25T19:00:00",
            updateInterval: 1000 // 毫秒
        }
    },
    
    // ==================== 页面配置 ====================
    pages: {
        home: {
            enabled: true,
            title: "首页",
            icon: "fa-home",
            sections: ["hero", "countdown", "announcement", "preview"]
        },
        games: {
            enabled: true,
            title: "小游戏",
            icon: "fa-gamepad",
            description: "三款简单的休闲小游戏"
        },
        answers: {
            enabled: true,
            title: "答案之书",
            icon: "fa-book",
            description: "向魔法书提问，获取精灵公主的指引"
        },
        lottery: {
            enabled: true,
            title: "B站抽奖复刻",
            icon: "fa-gift",
            description: "不定期复刻B站趣味抽奖活动"
        },
        messages: {
            enabled: true,
            title: "留言板",
            icon: "fa-comments",
            description: "给桃汽水公主留言祝福"
        }
    },
    
    // ==================== 小游戏配置 ====================
    games: {
        // 魔力泡泡游戏
        bubbleGame: {
            name: "桃汽水的魔力泡泡",
            description: "点击泡泡收集魔力，小心调皮泡泡！",
            icon: "💭",
            difficulty: "easy",
            estimatedTime: "10-15分钟",
            
            // 游戏参数
            settings: {
                initialBubbles: 5,
                spawnRate: 1000, // 毫秒
                gameDuration: 900000, // 15分钟（毫秒）
                pointsPerBubble: 10,
                specialBubbleChance: 0.1, // 10%几率出现特殊泡泡
                
                // 泡泡类型
                bubbleTypes: [
                    { type: "normal", points: 10, color: "#FF00FF", probability: 0.7 },
                    { type: "golden", points: 50, color: "#FFD700", probability: 0.15 },
                    { type: "tricky", points: -20, color: "#FF4444", probability: 0.1 },
                    { type: "rainbow", points: 100, color: "rainbow", probability: 0.05 }
                ]
            }
        },
        
        // 符文快闪游戏
        runeGame: {
            name: "精灵符文快闪",
            description: "快速记忆并点击正确的符文咒语",
            icon: "✨",
            difficulty: "medium",
            estimatedTime: "10-12分钟",
            
            settings: {
                initialSequenceLength: 3,
                maxSequenceLength: 10,
                showTime: 1500, // 毫秒
                inputTime: 3000, // 毫秒
                pointsPerCorrect: 50,
                difficultyIncrease: 0.1, // 每轮难度增加10%
                
                // 符文符号
                runes: ["↑", "↓", "←", "→", "★", "❤️", "🍑", "✨", "🔮", "🌸"]
            }
        },
        
        // 能量蓄力游戏
        energyGame: {
            name: "魔法能量蓄力槽",
            description: "在最佳时机点击，为魔法阵蓄满能量",
            icon: "⚡",
            difficulty: "hard",
            estimatedTime: "12-15分钟",
            
            settings: {
                rounds: 10,
                perfectZone: { min: 0.45, max: 0.55, points: 100 },
                goodZone: { min: 0.35, max: 0.65, points: 70 },
                okZone: { min: 0.25, max: 0.75, points: 40 },
                pointerSpeed: 2,
                acceleration: 0.1
            }
        }
    },
    
    // ==================== 答案之书配置 ====================
    answerBook: {
        enabled: true,
        title: "精灵公主的魔法答案书",
        description: "向魔法书提问，获取桃汽水公主的神秘指引",
        
        // 答案库
        answers: [
            "当然啦，我的契约者！",
            "可能需要一点魔法帮助~",
            "相信自己的直觉！",
            "现在不是最佳时机",
            "大胆尝试吧！",
            "小心调皮的能量波动",
            "答案藏在彩虹尽头",
            "问问你的内心",
            "明天会有转机",
            "保持积极的心态！",
            "需要更多的汽水能量！",
            "跟随星星的指引",
            "魔法正在生效中...",
            "答案正在路上啦~"
        ],
        
        // 特殊答案（低概率）
        specialAnswers: [
            "桃汽水公主亲自为你祝福！✨",
            "获得双倍幸运魔法！",
            "解锁隐藏彩蛋！🎉",
            "你被选中为今天的幸运契约者！"
        ]
    },
    
    // ==================== B站抽奖配置 ====================
    bilibiliLottery: {
        enabled: true,
        title: "B站抽奖活动复刻",
        description: "不定期复刻B站有趣的抽奖活动",
        
        // 活动列表（示例）
        activities: [
            {
                id: "lottery-001",
                name: "周年庆纪念抽奖",
                description: "庆祝桃汽水公主出道一周年",
                startDate: "2024-12-10",
                endDate: "2024-12-25",
                status: "active",
                prizes: ["限定徽章", "语音祝福", "签名板"]
            },
            {
                id: "lottery-002",
                name: "圣诞特别抽奖",
                description: "圣诞节的特别惊喜",
                startDate: "2024-12-20",
                endDate: "2024-12-27",
                status: "upcoming",
                prizes: ["圣诞装扮", "限定表情包", "神秘礼物"]
            }
        ]
    },
    
    // ==================== 留言板配置 ====================
    messageBoard: {
        enabled: true,
        title: "给桃汽水公主的留言",
        description: "留下你对公主的祝福和想说的话",
        
        // 本地存储配置
        storage: {
            key: "taoci_messages",
            maxMessages: 100,
            autoSave: true
        },
        
        // 留言设置
        settings: {
            maxLength: 200,
            minLength: 5,
            allowAnonymous: true,
            previewCount: 10
        }
    },
    
    // ==================== 样式主题配置 ====================
    theme: {
        // 主色调
        colors: {
            primary: "#FF00FF",     // 荧光粉
            secondary: "#FF66CC",   // 热粉
            accent: "#FFB6C1",      // 浅粉
            background: "#FFF5FF",  // 背景粉
            text: "#222222",        // 文字黑
            textLight: "#666666",   // 文字灰
            success: "#44FF44",     // 成功绿
            warning: "#FFFF44",     // 警告黄
            error: "#FF4444"        // 错误红
        },
        
        // 字体
        fonts: {
            heading: "'Ma Shan Zheng', cursive",
            body: "'ZCOOL XiaoWei', sans-serif",
            cute: "'Comic Sans MS', cursive"
        }
    },
    
    // ==================== 社交链接 ====================
    social: {
        bilibili: {
            name: "B站",
            url: "https://space.bilibili.com/",
            icon: "fab fa-bilibili",
            enabled: true
        },
        weibo: {
            name: "微博",
            url: "#",
            icon: "fab fa-weibo",
            enabled: false
        },
        youtube: {
            name: "YouTube",
            url: "#",
            icon: "fab fa-youtube",
            enabled: false
        }
    },
    
    // ==================== 开发配置 ====================
    development: {
        debug: true,
        logLevel: "info", // debug, info, warn, error
        useMockData: true,
        simulateDelay: 300, // API模拟延迟（毫秒）
        
        // 功能开关
        features: {
            animations: true,
            sounds: false,
            notifications: true,
            offlineMode: true
        }
    }
};

// 全局访问
if (typeof window !== 'undefined') {
    window.TAOCI_CONFIG = TAOCI_CONFIG;
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TAOCI_CONFIG;
}