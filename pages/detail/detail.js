const { api } = require('../../utils/api.js')

const CATEGORY_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    joke: { color: '#667eea' },
    moreJokes: [],
    liked: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadJoke(id)
    this.checkLike(id)
  },

  processJoke(j) {
    return {
      ...j,
      color: CATEGORY_COLORS[j.category] || '#667eea'
    }
  },

  async loadJoke(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = this.processJoke(res.data)
      
      const cached = wx.getStorageSync('cachedJokes') || []
      const moreJokes = cached.filter(j => j.id !== id).slice(0, 4).map(this.processJoke)
      
      this.setData({ joke, moreJokes })
      wx.setNavigationBarTitle({ title: joke.title })
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const joke = cached.find(j => j.id === id)
      if (joke) {
        this.setData({ joke: this.processJoke(joke), moreJokes: cached.filter(j => j.id !== id).slice(0, 4).map(this.processJoke) })
      }
    }
  },

  checkLike(id) {
    const favs = wx.getStorageSync('favorites') || []
    this.setData({ liked: favs.includes(id) })
  },

  formatDate(ts) {
    if (!ts) return 'NEW'
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 3600000) return '刚刚'
    if (diff < 86400000) return Math.floor(diff/3600000) + 'h'
    return Math.floor(diff/86400000) + 'd'
  },

  async toggleLike() {
    const favs = wx.getStorageSync('favorites') || []
    const id = this.data.joke.id
    
    try {
      await api.toggleLike(id)
    } catch (err) {}
    
    let newFavs
    if (this.data.liked) {
      newFavs = favs.filter(f => f !== id)
    } else {
      newFavs = [...favs, id]
    }
    
    wx.setStorageSync('favorites', newFavs)
    this.setData({ liked: !this.data.liked })
    wx.showToast({ title: this.data.liked ? '已喜欢' : '已取消', icon: 'none' })
  },

  shareJoke() {
    wx.showShareMenu({ menus: ['shareAppMessage'] })
  },

  goToDetail(e) {
    wx.redirectTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  onShareAppMessage() {
    return { title: this.data.joke.title, path: `/pages/detail/detail?id=${this.data.joke.id}` }
  }
})
