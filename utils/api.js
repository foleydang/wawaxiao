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

function getUserId() {
  let userId = wx.getStorageSync('userId')
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    wx.setStorageSync('userId', userId)
  }
  return userId
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
  
  // 喜欢/取消喜欢（同步到数据库）
  toggleLike(id, isLike) {
    return request(`/like/${id}`, 'POST', {
      userId: getUserId(),
      action: isLike ? 'like' : 'unlike'
    })
  },
  
  // 不喜欢/取消不喜欢（同步到数据库）
  toggleDislike(id, isDislike) {
    return request(`/dislike/${id}`, 'POST', {
      userId: getUserId(),
      action: isDislike ? 'dislike' : 'undislike'
    })
  },
  
  // 增加分享数
  incrementShare(id) {
    return request(`/share/${id}`, 'POST', { userId: getUserId() })
  },
  
  // 获取统计信息
  getStats() {
    return request('/stats')
  }
}

module.exports = { api, getUserId }
