const API_BASE = 'https://api.yanten.top/api/wawaxiao'

function getOpenid() {
  const app = getApp()
  return app ? app.getOpenid() : wx.getStorageSync('openid') || wx.getStorageSync('tempOpenid') || ''
}

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

// 本地存储：用户点赞次数（带清理，防止 key 无限增长）
const MAX_USER_COUNTS_KEYS = 200;

function getUserCounts() {
  const counts = wx.getStorageSync('userCounts') || {}
  // 超过上限时清理最旧的 key
  const keys = Object.keys(counts)
  if (keys.length > MAX_USER_COUNTS_KEYS) {
    // 简单策略：随机淘汰一半（没有时间戳排序，性价比最高的方案）
    const half = Math.floor(keys.length / 2)
    for (let i = 0; i < half; i++) {
      delete counts[keys[i]]
    }
    saveUserCounts(counts)
  }
  return counts
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

// 已读笑话（带大小上限，防止 storage 无限增长）
const MAX_READ_SIZE = 500;

function getReadJokes() {
  return wx.getStorageSync('readJokes') || []
}

function saveReadJokes(ids) {
  // 超过上限时淘汰最旧的
  if (ids.length > MAX_READ_SIZE) {
    ids = ids.slice(ids.length - MAX_READ_SIZE)
  }
  wx.setStorageSync('readJokes', ids)
}

function markAsRead(jokeId) {
  const readIds = getReadJokes()
  if (!readIds.includes(jokeId)) {
    readIds.push(jokeId)
    saveReadJokes(readIds)
  }
}

// 本地收藏缓存（与后端同步）
function getLocalLikedJokes() {
  return wx.getStorageSync('userLikes') || []
}

function saveLocalLikedJokes(ids) {
  wx.setStorageSync('userLikes', ids)
}

function addLocalLikedJoke(jokeId) {
  const likedIds = getLocalLikedJokes()
  if (!likedIds.includes(jokeId)) {
    likedIds.push(jokeId)
    saveLocalLikedJokes(likedIds)
  }
}

function removeLocalLikedJoke(jokeId) {
  const likedIds = getLocalLikedJokes()
  const index = likedIds.indexOf(jokeId)
  if (index > -1) {
    likedIds.splice(index, 1)
    saveLocalLikedJokes(likedIds)
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
  
  getLatestJokes(limit = 50) {
    return request(`/latest?limit=${limit}`)
  },
  
  getTodayJokes() {
    return request('/today')
  },
  
  getHotJokes() {
    return request('/hot')
  },
  
  getRandomJoke() {
    return request('/random')
  },
  
  getJokeById(id) {
    return request(`/jokes/${id}`)
  },
  
  // 点赞（同时自动收藏到后端）
  like(id) {
    const userCount = incrementUserCount(id, 'like')
    addLocalLikedJoke(id)
    
    return request(`/like/${id}`, 'POST', { openid: getOpenid() }).then(res => ({
      ...res,
      userLikeCount: userCount
    }))
  },
  
  neutral(id) {
    const userCount = incrementUserCount(id, 'neutral')
    return request(`/neutral/${id}`, 'POST', { openid: getOpenid() }).then(res => ({
      ...res,
      userNeutralCount: userCount
    }))
  },
  
  dislike(id) {
    const userCount = incrementUserCount(id, 'dislike')
    return request(`/dislike/${id}`, 'POST', { openid: getOpenid() }).then(res => ({
      ...res,
      userDislikeCount: userCount
    }))
  },
  
  getStats() {
    return request('/stats')
  },
  
  // ==================== 收藏 API ====================
  
  // 获取收藏列表（后端）
  getFavorites(page = 1, limit = 50) {
    return request(`/favorites?openid=${getOpenid()}&page=${page}&limit=${limit}`)
  },
  
  // 添加收藏（后端）
  addFavorite(jokeId) {
    addLocalLikedJoke(jokeId)
    return request(`/favorites/${jokeId}`, 'POST', { openid: getOpenid() })
  },
  
  // 删除收藏（后端）
  removeFavorite(jokeId) {
    removeLocalLikedJoke(jokeId)
    return request(`/favorites/${jokeId}?openid=${getOpenid()}`, 'DELETE')
  },
  
  // 检查是否已收藏（批量）
  checkFavorites(ids) {
    if (!ids || ids.length === 0) return Promise.resolve({})
    return request(`/favorites/check?openid=${getOpenid()}&ids=${ids.join(',')}`)
  },
  

  // ==================== 投稿 API ====================
  
  // 投稿笑话
  submitJoke(data) {
    return request('/submit', 'POST', data)
  },
  
  // 查询我的投稿
  getMySubmits() {
    return request(`/submit/mine?openid=${getOpenid()}`)
  },
  // ==================== 本地存储方法 ====================
  
  getUserCounts,
  saveUserCounts,
  getUserCount,
  setUserCount,
  incrementUserCount,
  getReadJokes,
  saveReadJokes,
  markAsRead,
  getLocalLikedJokes,
  saveLocalLikedJokes,
  addLocalLikedJoke,
  removeLocalLikedJoke,
  getLastVisitDate,
  setLastVisitDate,
  getOpenid
}

module.exports = { api }
