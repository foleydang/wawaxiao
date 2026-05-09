# Hexo 博客操作指南

博客源文件位置：`~/github/foleydang-blog`
博客访问地址：https://foleydang.github.io

---

## 🚀 日常操作

### 新建文章
```bash
cd ~/github/foleydang-blog
hexo new "文章标题"
```
→ 文件生成在 `source/_posts/文章标题.md`

### 编辑文章
```bash
nano ~/github/foleydang-blog/source/_posts/文章标题.md
# 或用你喜欢的编辑器
```

### 本地预览
```bash
cd ~/github/foleydang-blog
hexo server
# 访问 http://localhost:4000
```

### 发布文章
```bash
cd ~/github/foleydang-blog
hexo clean && hexo g -d
```
→ 自动生成并推送到 GitHub Pages

---

## 📁 目录结构

```
foleydang-blog/
├── _config.yml          # Hexo 主配置
├── _config.next.yml     # NexT 主题配置 (美化、功能)
├── source/
│   ├── _posts/          # 文章目录 (Markdown)
│   ├── about/           # 关于页面
│   ├── images/          # 图片资源
│   └── _data/
│       └── styles.styl  # 自定义样式
└── scaffolds/           # 文章模板
```

---

## ✅ 已完成配置

### 美化功能 (2026-04-19)
| 功能 | 说明 |
|------|------|
| 阅读进度条 | 页面顶部显示阅读进度 |
| 加载进度条 | 页面加载时顶部进度条 |
| Canvas 彩带 | 背景动态彩带效果 |
| 代码块美化 | Mac 风格复制按钮、语言显示 |
| 滚动百分比 | 回到顶部按钮显示进度 |
| 页脚心跳动画 | ❤️ 图标跳动效果 |
| 菜单徽章 | 菜单项显示文章数量 |
| 头像旋转 | 鼠标悬停头像旋转效果 |
| 自定义样式 | 链接、图片、标签云、滚动条美化 |
| 字数统计 | 显示文章字数和阅读时长 |
| SEO 网站地图 | 自动生成 sitemap.xml |

### 已迁移内容
| 内容 | 状态 |
|------|------|
| Hello World (2024-01-16) | ✅ |
| 使用Hexo写博客 (2025-07-16) | ✅ |
| 关于页面 | ✅ |
| 微信公众号二维码 | ✅ |
| 标签/分类页面 | ✅ 自动生成 |

---

## 💬 评论系统 (Giscus)

评论系统使用 Giscus (基于 GitHub Discussions)

### 配置信息
- 仓库: `foleydang/blog-discussions`
- 分类: Announcements
- 语言: zh-CN

### 更新配置
编辑 `_config.next.yml` 的 `giscus` 部分

---

## 🔧 配置修改

### 修改博客标题/作者
编辑 `_config.yml`：
```yaml
title: 程序开发之道
author: FoleyDang
```

### 修改主题样式
编辑 `_config.next.yml`：
```yaml
scheme: Gemini  # Muse | Mist | Pisces | Gemini
darkmode: true  # 深色模式
```

### 修改菜单
编辑 `_config.next.yml`：
```yaml
menu:
  home: / || fa fa-home
  about: /about/ || fa fa-user
  tags: /tags/ || fa fa-tags
  categories: /categories/ || fa fa-th
  archives: /archives/ || fa fa-archive
```

### 修改主色调
编辑 `source/_data/styles.styl`：
```stylus
:root {
  --primary-color: #49b1f5;      // 蓝色
  --primary-color-hover: #ff7242; // 橙色
}
```

---

## 📝 文章格式

```markdown
---
title: 文章标题
date: 2026-04-19 14:00:00
categories: 技术
tags:
  - Hexo
  - 博客
---

正文内容...
```

---

## ⚠️ 注意

- 部署会覆盖 `foleydang.github.io` 仓库的内容
- 源文件在 `foleydang-blog` 目录，别删错了
- 图片放 `source/images/` 目录
- 评论系统需要先在 GitHub 启用 Discussions
- 修改配置后需要 `hexo clean && hexo g -d` 重新部署

---

## 🆘 常见问题

### 头像不显示？
1. 强制刷新浏览器 (Cmd+Shift+R)
2. 等待 GitHub Pages 缓存更新 (1-2分钟)
3. 检查 `_config.next.yml` 中 `avatar.url` 配置

### 样式没生效？
1. 清除浏览器缓存
2. 确认 `source/_data/styles.styl` 存在
3. 重新 `hexo clean && hexo g -d`

### 添加打赏功能？
编辑 `_config.next.yml`：
```yaml
reward_settings:
  enable: true
reward:
  wechatpay: /images/wechatpay.png
  alipay: /images/alipay.png
```
然后把收款二维码图片放到 `source/images/`
