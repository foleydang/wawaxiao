const { api } = require('../../utils/api.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

function getSeenIds() {
  const str = wx.getStorageSync('seenJokesStr') || ''
  return str ? str.split(',').map(Number) : []
}

function addSeenId(id) {
  let ids = getSeenIds()
  if (!ids.includes(id)) {
    ids.unshift(id)
    if (ids.length > 30) ids = ids.slice(0, 30)
    wx.setStorageSync('seenJokesStr', ids.join(','))
  }
}

Page({
  data: {
    joke: { color: '#667eea' },
    moreJokes: [],
    liked: false,
    hasSeen: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadJoke(id)
    this.checkLike(id)
    this.checkSeen(id)
    this.startTime = Date.now()
  },

  onUnload() {
    // 停留超过3秒标记已看过
    const time = Math.round((Date.now() - this.startTime) / 1000)
    if (time >= 3) {
      addSeenId(this.data.joke.id)
    }
  },

  processJoke(j) {
    return { ...j, color: CAT_COLORS[j.category] || '#667eea' }
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
    const seen = getSeenIds()
    this.setData({ hasSeen: seen.includes(id) })
  },

  async toggleLike() {
    const id = this.data.joke.id
    let favs = wx.getStorageSync('favorites') || []
    
    try { await api.toggleLike(id) } catch (err) {}
    
    if (this.data.liked) {
      favs = favs.filter(f => f !== id)
    } else {
      favs = [...favs, id]
    }
    
    wx.setStorageSync('favorites', favs)
    this.setData({ liked: !this.data.liked })
    wx.showToast({ title: this.data.liked ? '已喜欢' : '已取消', icon: 'none' })
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
