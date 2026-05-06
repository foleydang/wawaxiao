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
  
  toggleLike(id, liked) {
    return request(`/like/${id}`, 'POST', { userId: wx.getStorageSync('userId') || Date.now() })
  },
  
  toggleDislike(id, disliked) {
    return request(`/dislike/${id}`, 'POST', { userId: wx.getStorageSync('userId') || Date.now() })
  },
  
  submitJoke(data) {
    return request('/jokes', 'POST', data)
  },
  
  getStats() {
    return request('/stats')
  }
}

module.exports = { api, request }
