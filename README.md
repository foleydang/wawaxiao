# 哇哇笑 😄 微信小程序

一个精心设计的笑话合集小程序，让你每天开心一笑！

## 📱 功能特点

| 功能 | 说明 |
|------|------|
| 🔥 热门推荐 | 精选热门笑话，保证让你笑到停不下来 |
| 📂 分类浏览 | 职场、生活、家庭、校园等多个分类 |
| 🎲 随机笑话 | 一键获取随机笑话，惊喜不断 |
| ❤️ 收藏功能 | 喜欢的笑话可以收藏起来，随时查看 |
| 📤 分享功能 | 好笑的内容分享给朋友 |
| 🔄 下拉刷新 | 更新热门推荐 |

## 🎨 界面设计

- **主题色**: `#FF6B6B` 温暖珊瑚红
- **风格**: 可爱、柔和、圆润
- **动效**: 卡片点击缩放、弹窗动画
- **图标**: 自绘笑脸和爱心图标

## 📦 项目结构

```
wawaxiao-miniapp/
├── pages/
│   ├── index/          # 首页（笑话列表）
│   ├── detail/         # 详情页
│   └── favorites/      # 收藏页
├── utils/
│   └── jokes.js        # 笑话数据（20条经典笑话）
├── images/             # 图标资源
│   ├── happy.png       # Tab图标（未选中）
│   ├── happy-active.png
│   ├── favorite.png
│   ├── favorite-active.png
│   └── share.png       # 分享图
├── app.js/json/wxss    # 小程序入口
└── project.config.json # 项目配置
```

## 🚀 使用方法

1. 下载**微信开发者工具**
2. Clone 本项目：`git clone https://github.com/foleydang/wawaxiao.git`
3. 用开发者工具打开项目目录
4. 在 `project.config.json` 中填写你的 **AppID**
5. 点击编译即可预览

## 📝 添加更多笑话

编辑 `utils/jokes.js` 文件：

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

---

**祝你笑口常开！** 🥔

> GitHub: https://github.com/foleydang/wawaxiao
