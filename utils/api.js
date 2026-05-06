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
  getJokes(params = {}) {
    const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&')
    return request(`/jokes?${query}`)
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
  
  // 喜欢/取消喜欢
  toggleLike(id, liked) {
    return request(`/like/${id}`, 'POST', {
      userId: getUserId(),
      action: liked ? 'like' : 'unlike'
    })
  },
  
  // 不喜欢/取消不喜欢
  toggleDislike(id, disliked) {
    return request(`/dislike/${id}`, 'POST', {
      userId: getUserId(),
      action: disliked ? 'dislike' : 'undislike'
    })
  },
  
  // 增加分享数
  incrementShare(id) {
    return request(`/share/${id}`, 'POST', { userId: getUserId() })
  },
  
  submitJoke(data) {
    return request('/jokes', 'POST', data)
  },
  
  getStats() {
    return request('/stats')
  }
}

module.exports = { api, request, getUserId }
