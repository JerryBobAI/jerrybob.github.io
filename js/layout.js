// 布局组件 - header、footer、article-meta等页面布局相关组件

// =============== 移动端菜单管理器 ===============
let mobileMenuManager = null;

function createMobileMenuManager() {
    // 如果已存在管理器，先销毁
    if (mobileMenuManager) {
        mobileMenuManager.destroy();
        mobileMenuManager = null;
    }

    mobileMenuManager = {
        isToggling: false,
        isInitialized: false,
        outsideClickHandler: null,
        buttonClickHandler: null,

        init: function() {
            if (this.isInitialized) return;

            const button = document.getElementById('mobile-menu-button');
            const menu = document.getElementById('mobile-menu');

            if (!button || !menu) return;

            console.log('🔧 初始化移动端菜单管理器');

            // 重置状态
            menu.classList.add('hidden');
            button.setAttribute('aria-expanded', 'false');
            this.isToggling = false;

            // 创建绑定的事件处理函数
            this.buttonClickHandler = (event) => {
                console.log('📱 菜单按钮被点击');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                if (this.isToggling) {
                    console.log('⏳ 菜单正在切换中，忽略点击');
                    return;
                }

                this.toggle();
            };

            this.outsideClickHandler = (event) => {
                const button = document.getElementById('mobile-menu-button');
                const menu = document.getElementById('mobile-menu');

                if (!button || !menu) return;

                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                if (isExpanded && !menu.contains(event.target) && !button.contains(event.target)) {
                    console.log('🖱️ 点击外部区域，关闭菜单');
                    this.close();
                }
            };

            // 绑定事件
            button.addEventListener('click', this.buttonClickHandler, { capture: true });

            // 菜单容器点击事件 - 阻止冒泡
            const container = menu.querySelector('.mobile-menu-container');
            if (container) {
                container.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                });
            }

            // 菜单项点击事件
            const links = menu.querySelectorAll('.mobile-nav-link');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    console.log('🔗 菜单项被点击，关闭菜单');
                    this.close();
                });
            });

            // 延迟绑定外部点击事件，避免立即触发
            setTimeout(() => {
                document.addEventListener('click', this.outsideClickHandler);
            }, 100);

            this.isInitialized = true;
            console.log('✅ 移动端菜单管理器初始化完成');
        },

        toggle: function() {
            const button = document.getElementById('mobile-menu-button');
            if (!button) return;

            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            console.log(`🔄 切换菜单状态: ${isExpanded ? '关闭' : '打开'}`);

            if (isExpanded) {
                this.close();
            } else {
                this.open();
            }
        },

        open: function() {
            if (this.isToggling) return;
            this.isToggling = true;

            console.log('📂 打开菜单');
            const button = document.getElementById('mobile-menu-button');
            const menu = document.getElementById('mobile-menu');
            const container = menu.querySelector('.mobile-menu-container');

            menu.classList.remove('hidden');
            button.setAttribute('aria-expanded', 'true');

            if (container) {
                container.style.animation = 'mobileMenuSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                setTimeout(() => {
                    this.isToggling = false;
                    console.log('✅ 菜单打开完成');
                }, 350);
            } else {
                this.isToggling = false;
            }
        },

        close: function() {
            if (this.isToggling) return;
            this.isToggling = true;

            console.log('📁 关闭菜单');
            const button = document.getElementById('mobile-menu-button');
            const menu = document.getElementById('mobile-menu');
            const container = menu.querySelector('.mobile-menu-container');

            button.setAttribute('aria-expanded', 'false');

            if (container) {
                container.style.animation = 'mobileMenuSlideOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                setTimeout(() => {
                    menu.classList.add('hidden');
                    container.style.animation = '';
                    this.isToggling = false;
                    console.log('✅ 菜单关闭完成');
                }, 250);
            } else {
                menu.classList.add('hidden');
                this.isToggling = false;
            }
        },

        destroy: function() {
            console.log('🗑️ 销毁移动端菜单管理器');

            if (this.outsideClickHandler) {
                document.removeEventListener('click', this.outsideClickHandler);
                this.outsideClickHandler = null;
            }

            if (this.buttonClickHandler) {
                const button = document.getElementById('mobile-menu-button');
                if (button) {
                    button.removeEventListener('click', this.buttonClickHandler, { capture: true });
                }
                this.buttonClickHandler = null;
            }

            this.isInitialized = false;
            this.isToggling = false;
        }
    };

    return mobileMenuManager;
}

// =============== Header组件 ===============

// 渲染Header组件 - 根据页面类型显示不同内容
function renderHeader(currentPath, isRoot) {
    const isIndexPage = currentPath.endsWith('index.html') || currentPath === '' || currentPath === '/';
    const isArticlePage = currentPath.includes('docs/') && !isIndexPage;

    if (isIndexPage) {
        // 所有index页面显示导航栏
        renderHomepageHeader(currentPath, isRoot);
    } else if (isArticlePage) {
        // 文章页面显示元信息
        renderArticleHeader(currentPath, isRoot);
    } else {
        console.log('❌ 未知页面类型，跳过header渲染');
        return;
    }
}

// 渲染导航栏 - 用于所有index页面（首页、分类页等）
function renderHomepageHeader(currentPath, isRoot) {
    const headerElement = document.querySelector('[data-component="header"]');
    if (!headerElement) return;
    headerElement.classList.add('header-component', 'glass-effect');

    // 路径处理逻辑改进，避免重复路径
    let prefix = '';
    if (!isRoot) {
        // 计算当前页面到网站根目录的路径
        const pathSegments = currentPath.split('/');
        // 如果是docs下的子目录，需要回退两级
        if (pathSegments.length >= 2 && pathSegments[0] === 'docs') {
            prefix = '../../';
        } else if (pathSegments.length >= 1) {
            // 其他情况回退一级
            prefix = '../';
        }
    }

    // 调试输出
    console.log('当前路径:', currentPath, '前缀:', prefix);

    // 设置导航激活状态
    let homeClass = isRoot ? 'active' : '';
    let aiClass = currentPath.includes('/docs/ai/') ? 'active' : '';
    let personalClass = currentPath.includes('/docs/personal/') ? 'active' : '';
    let familyClass = currentPath.includes('/docs/family/') ? 'active' : '';
    let workClass = currentPath.includes('/docs/work/') ? 'active' : '';
    let socialClass = currentPath.includes('/docs/social/') ? 'active' : '';

    // 生成绝对路径的链接
    const homeLink = `${prefix}index.html`;
    const aiLink = `${prefix}docs/ai/index.html`;
    const personalLink = `${prefix}docs/personal/index.html`;
    const familyLink = `${prefix}docs/family/index.html`;
    const workLink = `${prefix}docs/work/index.html`;
    const socialLink = `${prefix}docs/social/index.html`;

    headerElement.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center">
                    <a href="${homeLink}" class="flex items-center hover:opacity-90 transition-opacity">
                        <img src="${prefix}images/logo.png" alt="Logo" class="h-10 w-10 rounded-full mr-3 flex-shrink-0">
                        <span class="text-xl sm:text-2xl font-bold text-primary">JerryBob</span>
                    </a>
                </div>

                <!-- 桌面端导航 -->
                <nav class="hidden md:flex space-x-6">
                    <a href="${homeLink}" class="nav-link ${homeClass}">首页</a>
                    <a href="${aiLink}" class="nav-link ${aiClass}">AI</a>
                    <a href="${personalLink}" class="nav-link ${personalClass}">个人</a>
                    <a href="${familyLink}" class="nav-link ${familyClass}">家庭</a>
                    <a href="${workLink}" class="nav-link ${workClass}">工作</a>
                    <a href="${socialLink}" class="nav-link ${socialClass}">社交</a>
                </nav>

                <!-- 移动端菜单按钮 -->
                <button class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        id="mobile-menu-button" aria-expanded="false">
                    <span class="sr-only">打开主菜单</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>


        </div>
    `;

    // 创建独立的移动端菜单（在header外部）
    createIndependentMobileMenu(homeLink, aiLink, personalLink, familyLink, workLink, socialLink, homeClass, aiClass, personalClass, familyClass, workClass, socialClass);

    // 添加移动端菜单交互
    setTimeout(() => {
        const manager = createMobileMenuManager();
        manager.init();
    }, 100);

    console.log('✅ 导航栏渲染完成 (index页面)');
}

// 创建独立的移动端菜单
function createIndependentMobileMenu(homeLink, aiLink, personalLink, familyLink, workLink, socialLink, homeClass, aiClass, personalClass, familyClass, workClass, socialClass) {
    // 检查是否已存在移动端菜单
    let existingMenu = document.getElementById('mobile-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    // 创建独立的移动端菜单
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobile-menu';
    mobileMenu.className = 'md:hidden hidden fixed top-16 left-0 right-0 z-50';

    mobileMenu.innerHTML = `
        <div class="mobile-menu-container glass-effect mx-4 mt-2 mb-4 rounded-2xl shadow-lg overflow-hidden">
            <div class="px-4 py-3 space-y-1">
                <a href="${homeLink}" class="mobile-nav-link ${homeClass}">首页</a>
                <a href="${aiLink}" class="mobile-nav-link ${aiClass}">AI</a>
                <a href="${personalLink}" class="mobile-nav-link ${personalClass}">个人</a>
                <a href="${familyLink}" class="mobile-nav-link ${familyClass}">家庭</a>
                <a href="${workLink}" class="mobile-nav-link ${workClass}">工作</a>
                <a href="${socialLink}" class="mobile-nav-link ${socialClass}">社交</a>
            </div>
        </div>
    `;

    // 插入到body中
    document.body.appendChild(mobileMenu);
}

// 渲染文章页面Header - 显示元信息
function renderArticleHeader(currentPath, isRoot) {
    // 检查是否已存在header组件
    let headerElement = document.querySelector('[data-component="header"]');

    // 如果不存在，创建新的header组件
    if (!headerElement) {
        console.log('📝 创建新的header组件');
        headerElement = document.createElement('div');
        headerElement.setAttribute('data-component', 'header');
        headerElement.className = 'header-component glass-effect';

        // 插入到body的开头
        const bodyElement = document.body;
        if (bodyElement) {
            bodyElement.insertBefore(headerElement, bodyElement.firstChild);
            // 给body添加class，确保页面内容不被遮挡
            bodyElement.classList.add('has-fixed-header');
            console.log('✅ Header组件已插入到body开头');
        } else {
            console.warn('⚠️ 无法找到body元素');
            return;
        }
    } else {
        headerElement.classList.add('header-component', 'glass-effect');
    }

    // 路径处理逻辑
    let prefix = '';
    if (!isRoot) {
        const pathSegments = currentPath.split('/');
        if (pathSegments.length >= 2 && pathSegments[0] === 'docs') {
            prefix = '../../';
        } else if (pathSegments.length >= 1) {
            prefix = '../';
        }
    }

    // 获取元数据
    const metadata = getPageMetadata(currentPath);

    // 设置默认值
    const today = new Date();
    const dateStr = metadata?.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let tags = metadata && metadata.tags ? metadata.tags : ['博客'];

    // 使用共享的标签构建函数 - 自动检测背景色
    let tagsHtml = '';
    if (typeof buildTagsHtml === 'function') {
        tagsHtml = buildTagsHtml(tags, {
            padding: 'px-3 py-1',
            withAnimation: true
            // 不指定 isDarkBackground，让函数自动检测
        });
    } else {
        // 回退到原始方法 - 也使用自动检测
        const isPageDark = typeof window.isDarkBackground === 'function' ? window.isDarkBackground() : true;
        const tagColors = getTagColorsForTags ? getTagColorsForTags(tags, isPageDark) : tags.map(tag => getTagColorClass(tag, isPageDark));
        tagsHtml = tags.map((tag, index) => {
            const colorClass = tagColors[index] || getTagColorClass(tag, isPageDark);
            return `<span class="inline-block ${colorClass} hover:opacity-80 transition-all duration-200 hover:scale-105 rounded-full px-3 py-1 text-xs font-medium border tag-animate" style="animation-delay: ${index * 0.1}s">${tag}</span>`;
        }).join('');
    }

    const homeLink = `${prefix}index.html`;

    // 添加header样式
    const headerStyles = `
        <style>
            .header-component {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                width: 100vw !important;
                margin: 0 !important;
                z-index: 1001 !important;
                opacity: 0;
                transform: translateY(-20px);
                animation: slideInFromTop 0.6s ease-out forwards;
            }

            @keyframes slideInFromTop {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* 确保页面内容不被header遮挡 */
            body.has-fixed-header {
                padding-top: 64px !important;
            }

            /* 增强的毛玻璃效果 - 默认深色背景优化 */
            .header-component .glass-effect {
                background: rgba(40, 40, 40, 0.7) !important; /* 通用深灰色，适配各种深色背景 */
                backdrop-filter: blur(30px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
                border: none !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25) !important; /* 更轻的阴影 */
            }

            /* 浅色背景的毛玻璃效果 - 更透明，适配白色和浅色背景 */
            .header-component.light-bg .glass-effect {
                background: rgba(255, 255, 255, 0.75) !important; /* 白色透明背景，更通用 */
                backdrop-filter: blur(20px) saturate(120%) !important;
                -webkit-backdrop-filter: blur(20px) saturate(120%) !important;
                border: none !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important; /* 极淡的阴影，几乎不可见 */
            }

            /* 浅色背景下的日期文字 - 更深的颜色确保可读性 */
            .header-component.light-bg .ultra-light-date {
                color: rgba(55, 65, 81, 0.85) !important; /* 更深的灰色 */
            }
            .header-component.light-bg .ultra-light-date a {
                color: rgba(55, 65, 81, 0.85) !important;
            }
            .header-component.light-bg .ultra-light-date a:hover {
                color: rgba(55, 65, 81, 1) !important;
            }

            /* 深色背景下的日期文字 - 更白更清晰 */
            .ultra-light-date {
                color: rgba(255, 255, 255, 0.9) !important;
            }
            .ultra-light-date a {
                color: rgba(255, 255, 255, 0.9) !important;
            }
            .ultra-light-date a:hover {
                color: rgba(255, 255, 255, 1) !important;
            }

            .tag-animate {
                opacity: 0;
                transform: translateY(10px);
                animation: tagFadeIn 0.4s ease-out forwards;
            }

            @keyframes tagFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        </style>
    `;

    // 使用导航栏的布局结构，但填入元信息内容
    headerElement.innerHTML = `
        ${headerStyles}
        <div class="w-full glass-effect">
            <div class="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
                <div class="flex items-center ultra-light-date">
                    <a href="${homeLink}" class="home-link">
                        <i class="fa-solid fa-home mr-2" aria-hidden="true"></i>
                    </a>
                    <span class="text-sm font-medium">${dateStr}</span>
                </div>
                <div class="flex flex-wrap gap-2 mt-2 md:mt-0">
                    ${tagsHtml}
                </div>
            </div>
        </div>
    `;

    // 根据背景色动态调整毛玻璃效果
    setTimeout(() => {
        if (typeof window.isDarkBackground === 'function') {
            const isDark = window.isDarkBackground();
            console.log('🎨 根据背景色调整毛玻璃效果:', isDark ? '深色背景' : '浅色背景');

            if (!isDark) {
                // 浅色背景：添加light-bg类
                headerElement.classList.add('light-bg');
                console.log('✅ 应用浅色背景毛玻璃效果');
            } else {
                // 深色背景：移除light-bg类（使用默认深色效果）
                headerElement.classList.remove('light-bg');
                console.log('✅ 应用深色背景毛玻璃效果');
            }
        }
    }, 100);

    console.log('✅ Header组件（包含元信息）渲染完成');
}

// =============== Footer组件 ===============

// 渲染Footer组件
function renderFooter(isRoot) {
    const footerElement = document.querySelector('[data-component="footer"]');
    if (!footerElement) return;
    if (isRoot) {
        footerElement.innerHTML = `
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                <p class="footer-text">© 2025 <span class="text-primary font-semibold">JerryBob</span>. All rights reserved.</p>
                <div class="flex space-x-4">
                    <a href="https://web.okjike.com/u/8d6e830c-4da1-4753-ab41-020b91002aec" target="_blank" class="social-button bg-yellow-400">
                        <span class="social-button-text">J</span>
                    </a>
                    <a href="https://x.com/JerryBobAI" target="_blank" class="social-button bg-black">
                        <span class="social-button-text">X</span>
                    </a>
                </div>
            </div>
        `;
        footerElement.style.display = 'block';
        footerElement.style.opacity = '1';
        console.log('首页显示footer');
    } else {
        footerElement.style.display = 'none';
        console.log('非首页不显示footer');
    }
}

// =============== Article Meta组件 ===============

// 渲染文章元信息组件 - 功能已移到header中
function renderArticleMeta(currentPath, metadataCache) {
    // 功能已移到 renderHeader 中，不再单独渲染
    console.log('ℹ️ 元信息功能已移到header组件中');
    return;

    // 检查是否已存在元信息组件
    let articleMetaElement = document.querySelector('[data-component="article-meta"]');

    // 如果不存在，创建新的元信息组件
    if (!articleMetaElement) {
        console.log('📝 创建新的元信息组件');
        articleMetaElement = document.createElement('div');
        articleMetaElement.setAttribute('data-component', 'article-meta');
        articleMetaElement.className = 'article-meta-component';

        // 插入到body开头
        const bodyElement = document.body;

        if (bodyElement) {
            bodyElement.insertBefore(articleMetaElement, bodyElement.firstChild);
            console.log('✅ 元信息组件已插入到body开头');
        } else {
            console.warn('⚠️ 无法找到 body 元素');
            return;
        }
    }

    // 获取元数据
    const metadata = getPageMetadata(currentPath);
    console.log('📊 获取到的元数据:', metadata);

    // 设置默认值
    const today = new Date();
    const dateStr = metadata?.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let tags = metadata && metadata.tags ? metadata.tags : ['博客'];

    console.log('📅 使用的日期:', dateStr);
    console.log('🏷️ 使用的标签:', tags);

    // 使用共享的标签构建函数
    let tagsHtml = '';
    if (typeof buildTagsHtml === 'function') {
        tagsHtml = buildTagsHtml(tags, {
            padding: 'px-3 py-1',
            withAnimation: true
        });
    } else {
        console.error('❌ buildTagsHtml 函数未定义，回退到原始方法');
        // 回退到原始方法
        const tagColors = getTagColorsForTags ? getTagColorsForTags(tags) : tags.map(tag => getTagColorClass(tag));
        tagsHtml = tags.map((tag, index) => {
            const colorClass = tagColors[index] || getTagColorClass(tag);
            return `<span class="inline-block ${colorClass} hover:opacity-80 transition-all duration-200 hover:scale-105 rounded-full px-3 py-1 text-xs font-medium border tag-animate" style="animation-delay: ${index * 0.1}s">${tag}</span>`;
        }).join('');
    }

    // 构建元信息 HTML
    let homeLink = "../../index.html";
    if (currentPath.split('/').length <= 2) {
        homeLink = "../index.html";
    }

    // 简化样式
    const styles = `
        <style>
            /* 移除重复的CSS，使用CSS文件中的统一样式 */
            .ultra-light-date {
                color: rgba(107, 114, 128, 0.7);
            }
            .ultra-light-date a {
                color: rgba(107, 114, 128, 0.7);
            }
            .ultra-light-date a:hover {
                color: rgba(107, 114, 128, 0.9);
            }
            /* 简化的 meta 信息样式 */
            .article-meta-component {
                position: sticky !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                width: 100vw !important;
                margin: 0 !important;
                z-index: 1000 !important;
                opacity: 0;
                transform: translateY(-20px);
                animation: slideInFromTop 0.6s ease-out forwards;
            }

            @keyframes slideInFromTop {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .article-meta-blur {
                transition: all 0.3s ease;
            }

            .tag-animate {
                opacity: 0;
                transform: translateY(10px);
                animation: tagFadeIn 0.4s ease-out forwards;
            }

            @keyframes tagFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        </style>
    `;

    // 渲染 HTML 内容 - 保持原有的简洁设计
    articleMetaElement.innerHTML = `
        ${styles}
        <div class="w-full article-meta-blur glass-effect">
            <div class="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
                <div class="flex items-center ultra-light-date">
                    <a href="${homeLink}" class="home-link">
                        <i class="fa-solid fa-home mr-2" aria-hidden="true"></i>
                    </a>
                    <span class="text-sm font-medium">${dateStr}</span>
                </div>
                <div class="flex flex-wrap gap-2 mt-2 md:mt-0">
                    ${tagsHtml}
                </div>
            </div>
        </div>
    `;

    console.log('✅ 元信息组件渲染完成');
}

// =============== 布局系统初始化 ===============

// 初始化所有布局组件
async function initializeLayout() {
    console.log('🚀 开始初始化布局组件');

    // 等待核心系统初始化完成
    const coreState = await initializeCore();
    if (!coreState) {
        console.error('❌ 核心系统初始化失败');
        return;
    }

    const { currentPath, isRoot } = coreState;
    const metadataCache = getMetadataCache();

    // 渲染各布局组件
    renderHeader(currentPath, isRoot);
    renderFooter(isRoot);

    console.log('✅ 布局组件初始化完成');
}

// 导出函数供其他模块使用
if (typeof window !== 'undefined') {
    window.renderHeader = renderHeader;
    window.renderHomepageHeader = renderHomepageHeader;
    window.renderArticleHeader = renderArticleHeader;
    window.createIndependentMobileMenu = createIndependentMobileMenu;
    window.renderFooter = renderFooter;
    window.renderArticleMeta = renderArticleMeta;
    window.initializeLayout = initializeLayout;
}

// 多种方式确保布局组件能够正确加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayout);
} else if (document.readyState === 'interactive') {
    // DOM 已加载但资源可能还在加载
    setTimeout(initializeLayout, 100);
} else {
    // 页面完全加载
    initializeLayout();
}

// 备用方案：如果上面的都没执行，在 window.onload 时执行
window.addEventListener('load', function() {
    // 检查是否已经初始化过
    if (!document.querySelector('[data-component="article-meta"]')) {
        console.log('🔄 备用方案：在 window.onload 时初始化布局');
        initializeLayout();
    }
});
