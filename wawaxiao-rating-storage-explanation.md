# 用户评价数据存储说明

## 🤔 当前问题

用户问："用户喜欢/平/不喜欢的数据是咋保存的？因为用户可以多次点赞"

---

## 📊 **当前实现（单次评价模式）**

### 后端存储（笑话统计）

```json
wawaxiao-jokes.json:
{
  "id": 1,
  "likes": 10,      // 总喜欢人数（不是次数）
  "neutrals": 5,    // 总平的人数
  "dislikes": 2     // 总不喜欢的人数
}
```

**含义：**
- likes=10 → 10个用户喜欢了这个笑话
- **不是** 1个用户点了10次

---

### 前端存储（用户评价）

```javascript
// 本地localStorage
userRatings = {
  "1": "like",      // 我对笑话1评价为喜欢
  "2": "neutral",   // 我对笑话2评价为平
  "3": "dislike"    // 我对笑话3评价为不喜欢
}
```

**含义：**
- 每个笑话只能有一个评价
- 用户点击喜欢 → 存 "like"
- 用户再点击平 → 从 "like" 变成 "neutral"

---

## 🔍 **两种模式对比**

### 模式1：单次评价（当前）⭐

**用户行为：**
```
用户点击喜欢 → 按钮激活
用户再点击喜欢 → 取消喜欢（toggle）
用户点击平 → 切换为平
```

**数据存储：**
- 后端：统计人数（likes=10表示10个人喜欢）
- 前端：存评价类型（"like" | "neutral" | "dislike"）

**API逻辑：**
```javascript
// 用户第一次点击喜欢
prevRating = null
newRating = "like"
→ likes += 1 (10→11)

// 用户再点击喜欢（取消）
prevRating = "like"
newRating = null
→ likes -= 1 (11→10)

// 用户点击平（切换）
prevRating = "like"
newRating = "neutral"
→ likes -= 1, neutrals += 1
```

---

### 模式2：累计点赞（多次）

**用户行为：**
```
用户点击喜欢 → 喜欢+1
用户再点击喜欢 → 喜欢+2
用户再点击喜欢 → 喜欢+3
...
```

**数据存储：**
- 后端：统计次数（likes=10表示总共点了10次）
- 前端：存点赞次数

**需要修改：**

#### 后端存储
```json
{
  "id": 1,
  "likes": 10,      // 总点赞次数
  "userLikes": {    // 用户点赞次数 ⭐
    "user_abc": 5,  // 用户abc点了5次
    "user_xyz": 3   // 用户xyz点了3次
  }
}
```

#### 前端存储
```javascript
// 本地localStorage
userLikeCounts = {
  "1": 5,    // 我对笑话1点了5次喜欢
  "2": 3,    // 我对笑话2点了3次喜欢
  "3": 1     // 我对笑话3点了1次喜欢
}
```

---

## 💾 **如果要支持多次点赞**

### 方案A：用户维度存储（推荐）

**后端：**
```json
{
  "id": 1,
  "likes": 10,
  "userActions": {
    "user_abc": {
      "likeCount": 5,
      "dislikeCount": 0,
      "neutralCount": 0
    }
  }
}
```

**优点：**
- ✅ 可以统计每个用户的点赞次数
- ✅ 可以防刷（限制单用户次数）
- ✅ 可以分析用户行为

**缺点：**
- ⚠️ 数据会越来越大
- ⚠️ 用户隐私问题

---

### 方案B：只存总数（简洁）

**后端：**
```json
{
  "id": 1,
  "likes": 10    // 总次数（不存用户细节）
}
```

**前端：**
```javascript
userLikeCounts = {
  "1": 5    // 我点了5次
}
```

**逻辑：**
```javascript
// 用户点击喜欢
const count = userLikeCounts[jokeId] || 0
userLikeCounts[jokeId] = count + 1

// 发送API
api.incrementLike(jokeId)
// → 后端 likes += 1
```

---

## 🎯 **我的建议**

### 当前模式（单次评价）⭐ 推荐保留

**理由：**
1. ✅ 数据简洁（不存用户细节）
2. ✅ 隐私友好（用户数据本地）
3. ✅ 三档评价更合理（喜欢/平/不喜欢）
4. ✅ 防刷榜（每人只能评价一次）

**用户体验：**
- 用户点击喜欢 → 激活显示
- 用户再点击 → 取消或切换
- 清晰的评价状态

---

### 如果确实要多次点赞

**建议限制：**
- 每个用户每个笑话最多点赞5次
- 防止无限刷榜

**实现方案：**
```javascript
// 前端检查
const maxLikes = 5
const count = userLikeCounts[jokeId] || 0

if (count < maxLikes) {
  userLikeCounts[jokeId] = count + 1
  api.incrementLike(jokeId)
} else {
  wx.showToast({ title: '最多点赞5次', icon: 'none' })
}
```

---

## 🔍 **当前数据流转**

### 用户评价流程

```
用户打开笑话详情
  ↓
读取本地：userRatings[1] = null
  ↓
显示：三个按钮都未激活
  ↓
用户点击"喜欢"
  ↓
发送API：
  prevRating: null
  newRating: "like"
  ↓
后端更新：
  likes += 1 (10→11)
  neutrals = 5 (不变)
  dislikes = 2 (不变)
  ↓
前端保存：
  userRatings[1] = "like"
  ↓
显示："喜欢"按钮激活
```

---

### 用户切换评价

```
用户点击"平"
  ↓
读取本地：userRatings[1] = "like"
  ↓
发送API：
  prevRating: "like"
  newRating: "neutral"
  ↓
后端更新：
  likes -= 1 (11→10)
  neutrals += 1 (5→6)
  dislikes = 2 (不变)
  ↓
前端保存：
  userRatings[1] = "neutral"
  ↓
显示："平"按钮激活，"喜欢"取消
```

---

## 📊 **存储位置总结**

### 后端（服务器）

| 数据 | 存储位置 | 格式 | 说明 |
|------|----------|------|------|
| 笑话统计 | jokes.json | likes/neutrals/dislikes | 人数统计 |

**不存用户细节！**

---

### 前端（用户本地）

| 数据 | 存储位置 | 格式 | 说明 |
|------|----------|------|------|
| 用户评价 | userRatings | {id: "like"} | 评价类型 |
| 已读笑话 | readJokes | [id1, id2] | ID数组 |
| 最后访问 | lastVisitDate | "2026-05-07" | 日期 |

---

## 🤝 **请确认需求**

**问题：你想要哪种模式？**

### 选项1：单次评价（当前）⭐
- 用户对每个笑话只能评价一次
- 可以切换评价类型
- 数据简洁

### 选项2：累计点赞
- 用户可以多次点赞
- 需要限制次数（防刷）
- 数据更复杂

---

**请告诉我你想要哪种？我可以相应调整！**