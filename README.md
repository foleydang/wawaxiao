# 哇哇笑 微信小程序

一个精心设计的笑话合集小程序，让你每天开心一笑！😄

## 功能特点

- 🔥 **热门推荐** - 精选热门笑话，保证让你笑到停不下来
- 📂 **分类浏览** - 职场、生活、家庭、校园等多个分类
- 🎲 **随机笑话** - 一键获取随机笑话，惊喜不断
- ❤️ **收藏功能** - 喜欢的笑话可以收藏起来
- 📤 **分享功能** - 好笑的内容分享给朋友

## 项目结构

```
wawaxiao-miniapp/
├── pages/
│   ├── index/          # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── detail/        # 详情页
│       ├── detail.js
│       ├── detail.json
│       ├── detail.wxml
│       └── detail.wxss
├── utils/
│   └── jokes.js       # 笑话数据
├── images/            # 图片资源
├── app.js             # 小程序入口
├── app.json           # 全局配置
├── app.wxss           # 全局样式
└── project.config.json
```

## 使用方法

1. 下载微信开发者工具
2. 导入本项目
3. 在 `project.config.json` 中填写你的 AppID
4. 点击编译即可预览

## 图标说明

项目需要以下图标文件（放置在 `images/` 目录）：

- `happy.png` - 首页未选中图标
- `happy-active.png` - 首页选中图标
- `share.png` - 分享图片（建议 5:4 比例）

可以使用 AI 工具或设计软件创建这些图标。

## 自定义笑话

编辑 `utils/jokes.js` 文件可以添加更多笑话：

```javascript
{
  id: 唯一ID,
  category: '分类名称',
  title: '笑话标题',
  content: '笑话内容',
  likes: 点赞数,
  isHot: 是否热门（可选）
}
```

## 技术栈

- 微信小程序原生开发
- CSS3 渐变和动画
- LocalStorage 本地存储

## 注意事项

1. 笑话内容需要符合微信小程序内容规范
2. 如需用户上传笑话，需要补充内容审核机制
3. 建议接入微信内容安全 API

---

祝你笑口常开！🥔