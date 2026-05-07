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

// 获取用户评价记录（本地存储）
function getUserRatings() {
  return wx.getStorageSync('userRatings') || {}
}

// 保存用户评价记录
function saveUserRatings(ratings) {
  wx.setStorageSync('userRatings', ratings)
}

// 获取用户对某个笑话的评价
function getUserRating(jokeId) {
  const ratings = getUserRatings()
  return ratings[jokeId] || null  // 'like' | 'neutral' | 'dislike' | null
}

// 保存用户对某个笑话的评价
function setUserRating(jokeId, rating) {
  const ratings = getUserRatings()
  
  if (rating === null) {
    delete ratings[jokeId]
  } else {
    ratings[jokeId] = rating
  }
  
  saveUserRatings(ratings)
}

const api = {
  // 获取笑话列表
  getJokes(params = {}) {
    const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&')
    return request(`/jokes?${query}`)
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
  
  // 三档评价（发送新旧评价给服务器）
  rate(id, prevRating, newRating) {
    return request(`/rate/${id}`, 'POST', {
      prevRating,  // 旧评价
      newRating    // 新评价
    })
  },
  
  // 获取统计信息
  getStats() {
    return request('/stats')
  },
  
  // 本地存储相关
  getUserRatings,
  saveUserRatings,
  getUserRating,
  setUserRating
}

module.exports = { api }
