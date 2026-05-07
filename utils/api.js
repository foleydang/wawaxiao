const API_BASE = 'https://api.yanten.top/api/wawaxiao'

function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + url,
      method,
      data,
      header: { 'content-type': 'application/json' },
      success(res) {
        if (res.data.success) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

// 本地存储：用户点赞次数
function getUserCounts() {
  return wx.getStorageSync('userCounts') || {}
}

function saveUserCounts(counts) {
  wx.setStorageSync('userCounts', counts)
}

function getUserCount(jokeId, type) {
  const counts = getUserCounts()
  const key = `${jokeId}_${type}`
  return counts[key] || 0
}

function setUserCount(jokeId, type, count) {
  const counts = getUserCounts()
  const key = `${jokeId}_${type}`
  counts[key] = count
  saveUserCounts(counts)
}

function incrementUserCount(jokeId, type) {
  const current = getUserCount(jokeId, type)
  setUserCount(jokeId, type, current + 1)
  return current + 1
}

// 已读笑话
function getReadJokes() {
  return wx.getStorageSync('readJokes') || []
}

function saveReadJokes(ids) {
  wx.setStorageSync('readJokes', ids)
}

function markAsRead(jokeId) {
  const readIds = getReadJokes()
  if (!readIds.includes(jokeId)) {
    readIds.push(jokeId)
    saveReadJokes(readIds)
  }
}

// 最后访问日期
function getLastVisitDate() {
  return wx.getStorageSync('lastVisitDate') || null
}

function setLastVisitDate(date) {
  wx.setStorageSync('lastVisitDate', date)
}

const api = {
  // 获取笑话列表
  getJokes(params = {}) {
    const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&')
    return request(`/jokes?${query}`)
  },
  
  // 获取最新笑话
  getLatestJokes(limit = 50) {
    return request(`/latest?limit=${limit}`)
  },
  
  // 获取今日笑话
  getTodayJokes() {
    return request('/today')
  },
  
  // 获取热门笑话
  getHotJokes() {
    return request('/hot')
  },
  
  // 获取随机笑话
  getRandomJoke() {
    return request('/random')
  },
  
  // 获取单个笑话
  getJokeById(id) {
    return request(`/jokes/${id}`)
  },
  
  // 累计点赞（每次点击都+1）
  like(id) {
    // 本地记录用户点赞次数
    const userCount = incrementUserCount(id, 'like')
    
    return request(`/like/${id}`, 'POST').then(res => ({
      ...res,
      userLikeCount: userCount  // 返回用户累计次数
    }))
  },
  
  // 累计评价为平（每次点击都+1）
  neutral(id) {
    const userCount = incrementUserCount(id, 'neutral')
    
    return request(`/neutral/${id}`, 'POST').then(res => ({
      ...res,
      userNeutralCount: userCount
    }))
  },
  
  // 累计不喜欢（每次点击都+1）
  dislike(id) {
    const userCount = incrementUserCount(id, 'dislike')
    
    return request(`/dislike/${id}`, 'POST').then(res => ({
      ...res,
      userDislikeCount: userCount
    }))
  },
  
  // 获取统计
  getStats() {
    return request('/stats')
  },
  
  // 本地存储方法
  getUserCounts,
  saveUserCounts,
  getUserCount,
  setUserCount,
  incrementUserCount,
  getReadJokes,
  saveReadJokes,
  markAsRead,
  getLastVisitDate,
  setLastVisitDate
}

module.exports = { api }
