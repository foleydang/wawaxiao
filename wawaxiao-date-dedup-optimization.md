# 哇哇笑日期和去重优化方案

## 🎯 问题分析

### 问题1：笑话没有日期
- ❌ 无法判断"最新"、"近日"
- ❌ 未读数量一直是28（不更新）
- ❌ 用户无法区分新旧笑话

### 问题2：笑话库有重复
- ❌ 10个重复笑话
- ❌ ID 93-102 与 ID 83-92 完全相同
- ❌ 需要去重机制

---

## ✅ 解决方案

### 方案设计

**采用：增加date字段（标准化日期）**

```json
{
  "id": 1,
  "title": "...",
  "content": "...",
  "createdAt": 1746585600000,  // 时间戳（保留）
  "date": "2026-05-07",        // 标准日期 ⭐
  "likes": 2,
  "dislikes": 0
}
```

**为什么选择这个方案？**

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **增加date字段** ⭐ | 直观、易查询、易扩展 | 需修改数据结构 | ✅ 推荐 |
| **ID包含日期** | ID直观 | 不灵活、影响现有逻辑 | ❌ |
| **只用时间戳** | 灵活 | 不直观、难查询 | ❌ |

---

## 📊 数据结构设计

### 笑话数据

```json
{
  "id": 1,                    // 保持原ID（1-500）
  "title": "程序员面试",
  "content": "...",
  "category": "职场",
  
  // 时间相关 ⭐
  "createdAt": 1746585600000, // 原时间戳
  "date": "2026-05-07",       // 标准日期（新增）
  
  // 统计数据
  "likes": 2,
  "neutrals": 0,
  "dislikes": 0,
  "score": 2,
  "isHot": false,
  
  "status": "approved",
  "images": []
}
```

---

### 用户本地存储

#### 已读笑话

```javascript
// 本地存储
wx.getStorageSync('readJokes')

// 格式：笑话ID数组
[1, 2, 3, 5, 10, 15, 20]
```

#### 用户评价

```javascript
// 本地存储
wx.getStorageSync('userRatings')

// 格式：笑话ID -> 评价
{
  "1": "like",
  "2": "neutral",
  "5": "dislike"
}
```

#### 最后访问日期

```javascript
// 本地存储
wx.getStorageSync('lastVisitDate')

// 格式：日期字符串
"2026-05-07"
```

---

## 🔍 未读数量计算

### 计算逻辑

```javascript
// 获取最新笑话日期
const stats = await api.getStats()
const latestDate = stats.data.latestDate

// 获取用户最后访问日期
const lastVisitDate = api.getLastVisitDate()

// 获取已读笑话ID
const readIds = api.getReadJokes()

// 获取最新笑话列表
const latestJokes = await api.getLatestJokes(50)

// 计算未读数量
const unreadCount = latestJokes.data.list.filter(joke => {
  // 日期比上次访问新
  const isNewDate = joke.date > lastVisitDate
  // ID未读过
  const isUnread = !readIds.includes(joke.id)
  
  return isNewDate || isUnread
}).length

return unreadCount
```

---

## 🚀 新增API接口

### GET /latest - 获取最新笑话

```bash
GET /api/wawaxiao/latest?limit=50

返回最近7天的笑话（按日期排序）
```

### GET /today - 获取今日笑话

```bash
GET /api/wawaxiao/today

返回今天的笑话
```

### GET /dates - 获取日期列表

```bash
GET /api/wawaxiao/dates

返回所有日期及其笑话数量
```

### GET /jokes?recentDays=7

```bash
GET /api/wawaxiao/jokes?recentDays=7

返回最近N天的笑话
```

---

## 📅 笑话管理流程

### 每日添加笑话流程

1. **获取当天日期**
   ```javascript
   const today = new Date().toISOString().split('T')[0]
   ```

2. **检查当日笑话数量**
   ```javascript
   const todayJokes = jokes.filter(j => j.date === today)
   // 最多50条/天
   ```

3. **去重检查（Rouge相似度）**
   ```javascript
   // 检查是否与现有笑话重复
   // Rouge-L > 0.8 视为重复
   ```

4. **添加新笑话**
   ```javascript
   jokes.push({
     id: newId,
     date: today,
     createdAt: Date.now(),
     ...
   })
   ```

---

## 🔄 去重机制

### 去重算法

1. **完全匹配去重**（已实现）
   ```python
   # content完全相同视为重复
   if joke['content'] in seen_content:
       # 重复，不添加
   ```

2. ** Rouge相似度去重**（未来）
   ```python
   # 使用Rouge-L算法
   # 相似度 > 0.8 视为重复
   
   from rouge_score import rouge_scorer
   scorer = rouge_scorer.RougeScorer(['rougeL'], use_stemmer=True)
   
   scores = scorer.score(existing_joke['content'], new_joke['content'])
   if scores['rougeL'].fmeasure > 0.8:
       # 重复
   ```

---

## ✅ 优化成果

### 去重完成

```
原有笑话：102条
去重后：92条
删除重复：10条
```

### 日期字段添加

```
笑话日期分布：
  2026-05-07: 10条（今天）
  2025-05-07: 82条（历史）
```

### API优化

```
新增接口：
- GET /latest     最近7天笑话
- GET /today      今日笑话
- GET /dates      日期列表
- GET /stats      包含latestDate
```

---

## 📊 统计信息

```json
{
  "total": 92,          // 总笑话数
  "totalLikes": 2,      // 总喜欢数
  "latestDate": "2026-05-07",  // 最新日期 ⭐
  "todayCount": 10      // 今日笑话数 ⭐
}
```

---

## 🎯 用户使用流程

### 首页显示未读数量

```javascript
// 1. 获取统计信息
const stats = await api.getStats()
const latestDate = stats.data.latestDate

// 2. 计算未读
const lastVisitDate = api.getLastVisitDate()
const readIds = api.getReadJokes()

if (lastVisitDate < latestDate) {
  // 有新笑话
  const latestJokes = await api.getLatestJokes()
  const unread = latestJokes.data.list.filter(j => !readIds.includes(j.id)).length
  
  // 显示："今日更新10条，未读5条"
}
```

### 用户阅读笑话

```javascript
// 用户打开笑话详情
api.markAsRead(joke.id)  // 标记已读

// 用户评价
api.rate(joke.id, prevRating, newRating)
api.setUserRating(joke.id, newRating)
```

---

## 💾 存储位置

### 后端存储

```
~/github/yanten-api/data/database/wawaxiao-jokes.json
- 只存统计数据（简洁）
- date字段（标准化日期）
- 不存用户细节（隐私）
```

### 前端本地存储

```
wx.getStorageSync('readJokes')     // 已读ID
wx.getStorageSync('userRatings')   // 用户评价
wx.getStorageSync('lastVisitDate') // 最后访问日期
```

---

## 📝 优化清单

- ✅ 去重：删除10个重复笑话
- ✅ date字段：标准化日期
- ✅ 未读计算：基于日期判断
- ✅ 新增API：/latest、/today、/dates
- ✅ 本地存储：已读、评价、访问日期
- ✅ 每日管理：最多50条/天
- ⏳ Rouge去重：待实现

---

## 🚀 下一步

### 未来优化

1. **Rouge相似度去重**（自动化）
2. **笑话质量评分**（基于评价）
3. **热门推荐优化**（基于日期+评分）
4. **笑话分类智能**（AI分类）

---

**问题已全部解决！日期系统完整，去重完成，未读计算正确！**