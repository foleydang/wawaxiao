# 哇哇笑 😄 微信小程序

一个精心设计的笑话合集小程序，让你每天开心一笑！

## 📱 功能特点

- 🔥 **热门推荐** — 精选热门笑话，保证让你笑到停不下来
- 📂 **分类浏览** — 职场、生活、家庭、校园等多个分类
- 🎲 **随机笑话** — 一键获取随机笑话，惊喜不断
- ❤️ **收藏功能** — 喜欢的笑话可以收藏起来，随时查看
- 📤 **分享功能** — 好笑的内容分享给朋友
- 🔄 **下拉刷新** — 更新热门推荐

## 🎨 界面设计

- **主题色**: `#FF6B6B` 温暖珊瑚红 / 深色模式 `#0f0f23`
- **风格**: 可爱、柔和、圆润
- **动效**: 卡片点击缩放、弹窗动画

## 📦 项目结构

```
wawaxiao/
├── project.config.json    # 项目配置（指向 miniprogram/）
├── miniprogram/           # 小程序源码
│   ├── app.js             # 入口逻辑
│   ├── app.json           # 页面与 tabBar 配置
│   ├── app.wxss           # 全局样式
│   ├── sitemap.json       # sitemap 配置
│   ├── pages/
│   │   ├── index/         # 首页（笑话列表）
│   │   ├── detail/        # 详情页
│   │   ├── library/       # 笑话库（分类浏览）
│   │   ├── search/        # 搜索页
│   │   ├── favorites/     # 收藏页
│   │   └── submit/        # 投稿页
│   ├── utils/
│   │   ├── api.js         # 数据接口（本地数据 + API）
│   │   ├── jokes.js       # 笑话数据源
│   │   ├── seen.js        # 已读记录管理
│   │   └── theme.js       # 主题切换逻辑
│   └── images/            # 图标与图片资源
│       ├── home*.png      # Tab 图标
│       ├── library*.png
│       ├── heart*.png
│       └── share.png
└── docs/                  # 其他文档（非小程序代码）
```

## 🚀 使用方法

1. 下载**微信开发者工具**
2. Clone 本项目：`git clone https://github.com/foleydang/wawaxiao.git`
3. 用开发者工具打开项目根目录
4. 在 `project.config.json` 中填写你的 **AppID**
5. 点击编译即可预览

> 项目采用 `miniprogramRoot` 配置，小程序代码位于 `miniprogram/` 子目录。

## 📝 添加更多笑话

编辑 `miniprogram/utils/jokes.js` 文件：

```javascript
{
  id: 21,              // 唯一ID（递增）
  category: '职场',    // 分类：职场/生活/家庭/校园
  title: '笑话标题',
  content: '笑话内容（支持换行）',
  likes: 1000,         // 点赞数
  isHot: true          // 是否热门（可选）
}
```

## ⚠️ 提交审核注意事项

1. 内容需符合微信小程序规范，避免敏感笑话
2. 类目选择：**工具 > 信息查询**
3. 如需用户上传笑话，需接入内容审核机制

## 🔧 技术栈

- 微信小程序原生开发
- CSS3 渐变和动画
- LocalStorage 本地存储（收藏功能）
- 深色/浅色主题切换

---

**祝你笑口常开！** 🥔

> GitHub: https://github.com/foleydang/wawaxiao
