// 首页模块配置文件
export default {
    // 角色图片配置 - 修正路径
    characterImages: [
        { 
            id: 1, 
            url: 'assets/home/character-1.jpg',  // 改为相对于网站根目录的路径
            alt: '桃汽水-日常服', 
            credit: '画师：桃桃酱',
            description: '今天也是元气满满的桃汽水哦！'
        },
        { 
            id: 2, 
            url: 'assets/home/character-2.jpg', 
            alt: '桃汽水-休闲服',
            credit: '画师：柚子茶',
            description: '休息日的放松时光～'
        },
        { 
            id: 3, 
            url: 'assets/home/character-3.jpg', 
            alt: '桃汽水-冬季服',
            credit: '画师：雪兔',
            description: '冬天也要暖暖的哦！'
        },
        { 
            id: 4, 
            url: 'assets/home/character-4.jpg', 
            alt: '桃汽水-运动装',
            credit: '画师：柠檬汽水',
            description: '一起运动吧！'
        },
        { 
            id: 5, 
            url: 'assets/home/character-5.jpg', 
            alt: '桃汽水-魔法服',
            credit: '画师：星星糖',
            description: '今天也要施展魔法哦～'
        }
    ],
    
    // 默认图片（用于加载失败时）- 修正路径
    defaultImage: {
        url: 'assets/home/default-character.jpg',
        alt: '桃汽水-默认形象',
        credit: '系统默认',
        description: '欢迎来到魔力补给站！'
    },
    
    // 日常公告配置
    announcements: [
        {
            id: 1,
            title: '🎉 日常直播时间调整通知',
            content: '从本周开始，日常直播时间调整为每周三、五、日晚8点。特殊活动会提前通知，记得关注公告哦！',
            date: '2024-01-15',
            type: 'info',
            priority: 1
        },
        {
            id: 2,
            title: '🌟 新主题曲录制完成！',
            content: '感谢大家的支持，我的新主题曲已经录制完成啦！将在下周的特别直播中首次公开，敬请期待！',
            date: '2024-01-14',
            type: 'event',
            priority: 2
        },
        {
            id: 3,
            title: '📢 粉丝群扩容通知',
            content: '由于粉丝数量增加，原粉丝群已达到上限。现已开通2群，群号会在直播中公布，欢迎大家加入！',
            date: '2024-01-13',
            type: 'notice',
            priority: 1
        },
        {
            id: 4,
            title: '🚨 紧急：平台维护通知',
            content: '接平台通知，本周六凌晨2:00-4:00将进行系统维护，期间可能无法正常访问，请合理安排时间。',
            date: '2024-01-12',
            type: 'urgent',
            priority: 3
        }
    ],
    
    // 主播留言配置
    fanMessages: [
        { 
            id: 1, 
            text: '刚刚结束直播，看到大家的弹幕和礼物真的好感动！谢谢每一位陪伴我的小伙伴，你们是我坚持下去的最大动力！', 
            date: '2024-01-15',
            emoji: '😭',
            likes: 42
        },
        { 
            id: 2, 
            text: '今天天气转凉了，大家记得多穿衣服哦～不要像我上次直播时那样感冒了，我会心疼的！', 
            date: '2024-01-14',
            emoji: '🧥',
            likes: 28
        },
        { 
            id: 3, 
            text: '新学的舞蹈终于练好了！虽然还不太熟练，但我会继续努力的。下周直播跳给大家看，要来看哦！', 
            date: '2024-01-13',
            emoji: '💃',
            likes: 56
        },
        { 
            id: 4, 
            text: '最近在准备一个特别企划，是关于我和大家的故事的。偷偷告诉你们，会有惊喜哦！期待一下吧～', 
            date: '2024-01-12',
            emoji: '🎁',
            likes: 37
        },
        { 
            id: 5, 
            text: '看到大家在留言板的祝福和鼓励，真的真的很感谢。每一份心意我都记在心里，爱你们！', 
            date: '2024-01-11',
            emoji: '💖',
            likes: 89
        }
    ],
    
    // 漂浮弹幕内容
    barrageMessages: [
        '桃汽水加油！',
        '今天也要开开心心！',
        '最喜欢听你唱歌了～',
        '新衣服好可爱！',
        '直播加油！',
        '魔力补给完成！',
        '桃桃最棒！',
        '期待下次直播！',
        '永远支持你！',
        '么么哒～',
        '每天都要来看你！',
        '声音好好听！',
        '跳舞超级可爱！',
        '注意休息哦！',
        '我们会一直陪着你！'
    ],
    
    // 模块设置
    settings: {
        // 图片切换间隔（秒），0表示手动切换
        imageSwitchInterval: 0,
        // 留言轮播间隔（秒）
        messageCarouselInterval: 10,
        // 弹幕生成间隔（秒）
        barrageInterval: 8,
        // 弹幕数量
        barrageCount: 3,
        // 粒子数量
        particleCount: 30,
        // 移动端粒子数量
        mobileParticleCount: 10,
        // 启用粒子效果
        enableParticles: true,
        // 启用弹幕效果
        enableBarrage: true
    }
};