// 桃汽水首页模块
class HomeModule {
  constructor() {
    this.moduleId = 'home';
    this.moduleName = '首页';
    this.moduleIcon = 'fas fa-home';
    this.isInitialized = false;
  }

  // 初始化模块
  async init() {
    console.log('🏠 首页模块初始化中...');
    
    // 1. 确保DOM已加载
    if (!document.getElementById('module-container')) {
      console.warn('等待DOM加载...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 2. 加载模块内容
    await this.loadModuleContent();
    
    // 3. 加载图片
    await this.loadCharacterImage();
    
    // 4. 初始化功能
    this.initFeatures();
    
    this.isInitialized = true;
    console.log('✅ 首页模块初始化完成');
  }

  // 加载模块内容
  async loadModuleContent() {
    try {
      // 直接插入HTML结构，不依赖外部文件
      const html = `
        <section class="home-module">
          <!-- 角色展示区域 -->
          <div class="character-container">
            <div class="character-display" id="character-display">
              <div class="loading-placeholder">
                <div class="loading-emoji">🍑</div>
                <p>加载中...</p>
              </div>
            </div>
            
            <!-- 3D立体阴影 -->
            <div class="character-shadow" id="character-shadow"></div>
            
            <!-- 漂浮粒子效果 -->
            <div class="particles-container" id="particles-container"></div>
          </div>
          
          <!-- 欢迎卡片 -->
          <div class="greeting-card">
            <h2 class="greeting-title" id="greeting-title">欢迎来到我的魔力补给站！</h2>
            <p class="greeting-text" id="greeting-text">我是来自异世界的精灵公主桃汽水~ 周年庆活动马上就要开始啦，快来一起收集魔力，参加有趣的游戏吧！</p>
            
            <!-- 随机图片指示器 -->
            <div class="random-indicator">
              <span class="indicator-label">当前展示：</span>
              <span class="indicator-value" id="current-image-index">加载中...</span>
              <span class="indicator-hint">（每次刷新随机展示）</span>
            </div>
          </div>
          
          <!-- 操作提示 -->
          <div class="action-hint">
            <div class="hint-item">
              <div class="hint-icon">🎮</div>
              <p>点击左侧导航开始探索功能</p>
            </div>
            <div class="hint-item">
              <div class="hint-icon">✨</div>
              <p>将鼠标移到图片上查看3D效果</p>
            </div>
          </div>
        </section>
      `;
      
      const container = document.getElementById('module-container');
      if (container) {
        container.innerHTML = html;
        console.log('✅ 首页HTML内容已加载');
      } else {
        console.error('❌ 找不到模块容器');
      }
    } catch (error) {
      console.error('❌ 加载模块内容失败:', error);
    }
  }

  // 加载角色图片
  async loadCharacterImage() {
    try {
      // 图片配置
      const config = {
        imageCount: 3,  // 修改这个数字来增加或减少图片数量
        basePath: 'assets/images/character/',  // 图片基础路径
        fileName: 'taoci-avatar-',  // 图片文件名前缀
        fileExtension: '.png'  // 图片文件扩展名
      };
      
      // 生成随机数 (1 到 imageCount)
      const randomNumber = Math.floor(Math.random() * config.imageCount) + 1;
      
      // 构建图片路径
      const imageUrl = `${config.basePath}${config.fileName}${randomNumber}${config.fileExtension}`;
      
      console.log(`📸 随机图片编号: ${randomNumber}`);
      console.log(`📸 图片路径: ${imageUrl}`);
      
      // 获取显示容器
      const display = document.getElementById('character-display');
      const indicator = document.getElementById('current-image-index');
      
      if (!display || !indicator) {
        console.warn('页面元素未找到，延迟重试...');
        setTimeout(() => this.loadCharacterImage(), 500);
        return;
      }
      
      // 创建图片元素
      const img = document.createElement('img');
      img.className = 'character-image';
      img.src = imageUrl;
      img.alt = `桃汽水皮套图 ${randomNumber}`;
      
      // 图片加载成功
      img.onload = () => {
        console.log(`✅ 图片加载成功: ${imageUrl}`);
        
        // 移除加载占位符
        const placeholder = display.querySelector('.loading-placeholder');
        if (placeholder) {
          placeholder.style.display = 'none';
        }
        
        // 添加到显示区域
        display.appendChild(img);
        
        // 更新指示器
        if (indicator) {
          indicator.textContent = `图片 ${randomNumber} / ${config.imageCount}`;
        }
      };
      
      // 图片加载失败
      img.onerror = () => {
        console.error(`❌ 图片加载失败: ${imageUrl}`);
        
        // 显示错误信息
        display.innerHTML = `
          <div class="error-fallback">
            <div class="error-emoji">⚠️</div>
            <p class="error-text">图片加载失败</p>
            <p class="error-path">${imageUrl}</p>
            <button onclick="location.reload()" class="retry-btn">
              <span>🔄 刷新页面</span>
            </button>
          </div>
        `;
        
        if (indicator) {
          indicator.textContent = '加载失败';
        }
      };
      
    } catch (error) {
      console.error('❌ 加载图片失败:', error);
    }
  }

  // 初始化功能
  initFeatures() {
    console.log('🔧 初始化首页功能...');
    
    // 创建粒子效果
    this.createParticles();
    
    // 添加悬停效果
    this.addHoverEffects();
  }

  // 创建粒子效果
  createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 粒子颜色
    const colors = [
      'rgba(255, 0, 255, 0.8)',    // 荧光粉
      'rgba(255, 102, 204, 0.8)',  // 热粉
      'rgba(51, 255, 153, 0.8)',   // 霓虹绿
      'rgba(255, 255, 51, 0.8)',   // 霓虹黄
      'rgba(204, 102, 255, 0.8)',  // 霓虹紫
    ];
    
    // 创建20个粒子
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // 随机属性
      const size = Math.random() * 8 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 15 + 10;
      const opacity = Math.random() * 0.5 + 0.3;
      
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${left}%;
        top: ${top}%;
        opacity: ${opacity};
        animation: float-particle ${duration}s ease-in-out ${delay}s infinite;
      `;
      
      container.appendChild(particle);
    }
  }

  // 添加悬停效果
  addHoverEffects() {
    const container = document.querySelector('.character-container');
    if (!container) return;
    
    // 鼠标进入时增强效果
    container.addEventListener('mouseenter', () => {
      const img = container.querySelector('.character-image');
      const shadow = document.getElementById('character-shadow');
      
      if (img) {
        img.style.transform = 'translateZ(30px) rotateX(5deg) rotateY(5deg) scale(1.05)';
        img.style.filter = `
          drop-shadow(0 20px 35px rgba(0, 0, 0, 0.5))
          drop-shadow(0 0 50px rgba(255, 110, 255, 1))
          drop-shadow(0 0 70px rgba(255, 110, 255, 0.8))
        `;
      }
      
      if (shadow) {
        shadow.style.opacity = '0.9';
        shadow.style.transform = 'translateX(-50%) rotateX(80deg) scale(1.2)';
      }
    });
    
    // 鼠标离开时恢复
    container.addEventListener('mouseleave', () => {
      const img = container.querySelector('.character-image');
      const shadow = document.getElementById('character-shadow');
      
      if (img) {
        img.style.transform = '';
        img.style.filter = '';
      }
      
      if (shadow) {
        shadow.style.opacity = '0.7';
        shadow.style.transform = 'translateX(-50%) rotateX(80deg) scale(1)';
      }
    });
  }

  // 销毁模块
  destroy() {
    console.log('🗑️ 清理首页模块...');
    this.isInitialized = false;
  }
}

// ==========================================
// 模块注册逻辑（兼容主骨架）
// ==========================================

// 创建模块实例
const homeModuleInstance = new HomeModule();

// 自动初始化（如果主骨架调用）
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🏠 检测到DOM加载完成，准备初始化首页模块...');
  
  // 检查是否在首页
  const isHomePage = window.location.hash === '#home' || 
                     window.location.hash === '' || 
                     window.location.hash === '#';
  
  if (isHomePage) {
    console.log('🏠 当前在首页，开始初始化...');
    await homeModuleInstance.init();
  }
});

// 暴露给主框架
if (window.Taoci) {
  // 注册模块
  window.Taoci.registerModule({
    id: 'home',
    name: '首页',
    icon: 'fas fa-home',
    onLoad: async () => {
      console.log('🏠 首页模块通过主框架加载');
      await homeModuleInstance.init();
    }
  });
}

// 暴露全局API
window.HomeModule = homeModuleInstance;