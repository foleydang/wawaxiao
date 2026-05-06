const { api } = require('../../utils/api.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    joke: { color: '#667eea' },
    moreJokes: [],
    liked: false,
    hasSeen: false,
    readTime: '30s'
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadJoke(id)
    this.checkLike(id)
    this.checkSeen(id)
    this.startTime = Date.now()
  },

  onUnload() {
    // 计算阅读时长
    const time = Math.round((Date.now() - this.startTime) / 1000)
    if (time >= 5) {
      this.markAsSeen(this.data.joke.id)
    }
  },

  processJoke(j) {
    return {
      ...j,
      color: CAT_COLORS[j.category] || '#667eea'
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
    const favs = wx.getStorageSync('favorites') || []
    this.setData({ liked: favs.includes(id) })
  },

  checkSeen(id) {
    const seen = wx.getStorageSync('seenJokes') || []
    this.setData({ hasSeen: seen.includes(id) })
  },

  markAsSeen(id) {
    let seen = wx.getStorageSync('seenJokes') || []
    if (!seen.includes(id)) {
      seen = [id, ...seen].slice(0, 100)
      wx.setStorageSync('seenJokes', seen)
    }
    this.setData({ hasSeen: true })
  },

  async toggleLike() {
    const id = this.data.joke.id
    let favs = wx.getStorageSync('favorites') || []
    
    try {
      await api.toggleLike(id)
    } catch (err) {}
    
    if (this.data.liked) {
      favs = favs.filter(f => f !== id)
    } else {
      favs = [...favs, id]
    }
    
    wx.setStorageSync('favorites', favs)
    this.setData({ liked: !this.data.liked })
    wx.showToast({ title: this.data.liked ? '已喜欢' : '已取消', icon: 'none' })
  },

  goBack() {
    wx.navigateBack()
  },

  goToDetail(e) {
    wx.redirectTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  shareJoke() {
    wx.showShareMenu({ menus: ['shareAppMessage'] })
  },

  onShareAppMessage() {
    return { title: this.data.joke.title, path: `/pages/detail/detail?id=${this.data.joke.id}` }
  }
})
