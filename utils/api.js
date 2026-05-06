// API配置
const API_BASE = 'https://api.yanten.top/api/wawaxiao'

// 网络请求封装
function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE + url,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.data.success) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail(err) {
        // 网络失败时，尝试使用本地缓存
        console.log('API请求失败:', err)
        reject(err)
      }
    })
  })
}

// API接口
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
  
  // 点赞/取消点赞
  toggleLike(id) {
    return request(`/like/${id}`, 'POST', { userId: wx.getStorageSync('userId') || Date.now() })
  },
  
  // 提交新笑话
  submitJoke(data) {
    return request('/jokes', 'POST', data)
  },
  
  // 获取统计数据
  getStats() {
    return request('/stats')
  }
}

module.exports = {
  API_BASE,
  api,
  request
}
