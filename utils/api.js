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
