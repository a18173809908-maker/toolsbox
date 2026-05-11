# AIBoxPro 变更日志

## 2026-05-11

### 新闻详情页优化

**修改文件**: `app/news/[id]/page.tsx`

1. **视觉设计升级**
   - 顶部添加渐变英雄区（靛蓝 → 紫色 → 粉色）
   - 添加装饰性圆形背景元素
   - 采用温暖的紫色/靛蓝色调
   - 各区块使用不同的渐变背景增强视觉区分

2. **文案语气优化**
   - "一句话摘要" → "快速了解"
   - "关键信息" → "核心要点"
   - "事件背景" → "背景解读"
   - "影响分析" → "💡 我们的观点"
   - "适合谁关注" → "这篇文章适合你吗？"
   - "相关链接" → "延伸阅读"
   - "相关资讯" → "你可能也感兴趣"
   - "收藏" → "收藏文章"
   - "点赞" → "觉得有用"

3. **阅读体验提升**
   - 添加阅读进度条（页面顶部）
   - 添加返回顶部按钮（滚动超过300px自动出现）
   - 目录导航每个区块有清晰图标标题标识

4. **内容关联增强**
   - 底部展示同分类相关文章
   - 美化相关工具展示卡片

5. **互动功能**
   - 添加收藏按钮
   - 添加点赞按钮（hover红色主题切换）
   - 保留社交分享功能

---

### 新闻列表页优化

**修改文件**: `app/news/page.tsx`

1. **空状态优化**
   - 添加图标和圆角背景
   - 添加标题"暂无相关资讯"
   - 添加描述文字说明原因
   - 添加「返回全部资讯」按钮

2. **热门事件点击功能**
   - 改为可点击链接
   - 点击跳转到相关资讯搜索页面
   - 添加hover效果

3. **分享弹窗位置调整**
   - 改为向上展开
   - 调整阴影方向适配

---

### 分享按钮改进

**修改文件**: `components/ShareButton.tsx`

1. **样式改进**
   - 从列表式改为3x2图标网格
   - 添加各平台专属图标（微信、朋友圈、小红书、微博、QQ、复制链接）
   - hover时有轻微放大效果
   - 点击后显示"已复制"状态

---

### 工具库页面重构（方案二：侧边栏筛选设计）

**修改文件**: `app/tools/page.tsx`

1. **布局结构**
   - 左侧260px固定侧边栏
   - 右侧工具卡片网格
   - 侧边栏使用sticky定位

2. **侧边栏功能**
   - 搜索框（支持Enter搜索）
   - 分类筛选（带数量显示）
   - 地区筛选（国内直连/需要VPN）
   - 定价筛选（免费/Freemium/付费）
   - 清除所有筛选按钮

3. **交互效果**
   - 侧边栏选项hover高亮
   - 工具卡片hover上浮+阴影效果
   - 选中状态使用主色调橙色标识

---

### 客户端组件提取

**新建文件**: `app/tools/SearchInput.tsx`

- 解决Next.js 16 Server Components不允许传递事件处理器的问题
- 包含useState管理搜索值
- 支持Enter键提交搜索

---

### CSS样式更新

**修改文件**: `app/globals.css`

1. **新闻页面样式**
   - `.news-article-card:hover` - 卡片hover效果
   - `.news-tool-card-link:hover` - 工具卡片hover效果
   - `.news-related-card-link:hover` - 相关卡片hover效果
   - `.news-read-original-link:hover` - 阅读原文按钮hover
   - `.news-collect-btn:hover` - 收藏按钮hover
   - `.news-like-btn:hover` - 点赞按钮hover
   - `.news-hot-topic-link:hover` - 热门话题hover

2. **工具库页面样式**
   - `.sidebar-filter-item:hover` - 侧边栏选项hover效果
   - `.tool-card-link:hover div` - 工具卡片hover效果

---

### 数据库查询增强

**修改文件**: `lib/db/queries.ts`

- 添加 `loadRelatedArticlesByArticleId` 函数
- 支持按文章ID获取相关资讯

---

### 代码修复

1. **移除内联事件处理器**
   - 解决Next.js 16 Server Components限制
   - 使用CSS hover替代JavaScript事件

2. **移除组件内`<script>`标签**
   - 创建`ScrollHandler`客户端组件处理滚动逻辑

3. **修复搜索框溢出问题**
   - 调整搜索框宽度为100%自适应
   - 优化内边距和字体大小

---

### 备份文件

**创建文件**: `app/tools/page.tsx.backup`

- 保存工具库页面重构前的原始代码
