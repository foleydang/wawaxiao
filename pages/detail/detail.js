const { api } = require('../../utils/api.js')
const { markSeen, hasSeen } = require('../../utils/seen.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    joke: { color: '#667eea', likes: 0, dislikes: 0 },
    moreJokes: [],
    liked: false,
    disliked: false,
    hasSeen: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadJoke(id)
    this.checkLike(id)
    this.checkDislike(id)
    this.checkSeen(id)
    this.startTime = Date.now()
  },

  onUnload() {
    // 停留超过3秒标记已看过
    const time = Math.round((Date.now() - this.startTime) / 1000)
    if (time >= 3 && this.data.joke.id) {
      markSeen(this.data.joke.id)
    }
  },

  processJoke(j) {
    return {
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      likes: j.likes || 0,
      dislikes: j.dislikes || 0
    }
  },

  async loadJoke(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = this.processJoke(res.data)
      
      const cached = wx.getStorageSync('cachedJokes') || []
      const more = cached.filter(j => j.id !== id).slice(0, 4).map(this.processJoke)
      
      this.setData({ joke, moreJokes: more })
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const joke = cached.find(j => j.id === id)
      if (joke) {
        const more = cached.filter(j => j.id !== id).slice(0, 4).map(this.processJoke)
        this.setData({ joke: this.processJoke(joke), moreJokes: more })
      }
    }
  },

  checkLike(id) {
    const favs = wx.getStorageSync('likes') || []
    this.setData({ liked: favs.includes(id) })
  },

  checkDislike(id) {
    const dislikes = wx.getStorageSync('dislikes') || []
    this.setData({ disliked: dislikes.includes(id) })
  },

  checkSeen(id) {
    this.setData({ hasSeen: hasSeen(id) })
  },

  async toggleLike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('likes') || []
    let dislikes = wx.getStorageSync('dislikes') || []
    
    // 如果已不喜欢，先取消不喜欢
    if (dislikes.includes(id)) {
      dislikes = dislikes.filter(d => d !== id)
      wx.setStorageSync('dislikes', dislikes)
      this.setData({ disliked: false })
    }
    
    // 切换喜欢
    if (this.data.liked) {
      likes = likes.filter(l => l !== id)
    } else {
      likes = [...likes, id]
    }
    
    wx.setStorageSync('likes', likes)
    this.setData({ liked: !this.data.liked })
    
    // 同步到服务器（可选）
    try {
      await api.toggleLike(id, this.data.liked)
    } catch (err) {}
    
    wx.showToast({ title: this.data.liked ? '已喜欢' : '已取消', icon: 'none' })
  },

  async toggleDislike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('likes') || []
    let dislikes = wx.getStorageSync('dislikes') || []
    
    // 如果已喜欢，先取消喜欢
    if (likes.includes(id)) {
      likes = likes.filter(l => l !== id)
      wx.setStorageSync('likes', likes)
      this.setData({ liked: false })
    }
    
    // 切换不喜欢
    if (this.data.disliked) {
      dislikes = dislikes.filter(d => d !== id)
    } else {
      dislikes = [...dislikes, id]
    }
    
    wx.setStorageSync('dislikes', dislikes)
    this.setData({ disliked: !this.data.disliked })
    
    wx.showToast({ title: this.data.disliked ? '已不喜欢' : '已取消', icon: 'none' })
  },

  goBack() { wx.navigateBack() },

  goToDetail(e) {
    wx.redirectTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  shareJoke() { wx.showShareMenu({ menus: ['shareAppMessage'] }) },

  onShareAppMessage() {
    return { title: this.data.joke.title, path: `/pages/detail/detail?id=${this.data.joke.id}` }
  }
})
