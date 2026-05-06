const { api } = require('../../utils/api.js')
const { markSeen, hasSeen } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon } = require('../../utils/theme.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    joke: { color: '#667eea', likes: 0, dislikes: 0, shares: 0, images: [] },
    moreJokes: [],
    liked: false,
    disliked: false,
    hasSeen: false,
    currentTheme: 'dark',
    themeIcon: '🌙'
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.setData({
      currentTheme: getCurrentTheme(),
      themeIcon: getThemeIcon()
    })
    this.loadJoke(id)
    this.checkLike(id)
    this.checkDislike(id)
    this.checkSeen(id)
    this.startTime = Date.now()
  },

  onUnload() {
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
      dislikes: j.dislikes || 0,
      shares: j.shares || 0,
      images: j.images || [],
      hasImage: j.images && j.images.length > 0
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

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      currentTheme: newTheme,
      themeIcon: newTheme === 'dark' ? '🌙' : '☀️'
    })
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls || [url]
    wx.previewImage({ current: url, urls })
  },

  async toggleLike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('likes') || []
    let dislikes = wx.getStorageSync('dislikes') || []
    
    if (dislikes.includes(id)) {
      dislikes = dislikes.filter(d => d !== id)
      wx.setStorageSync('dislikes', dislikes)
      this.setData({ disliked: false })
    }
    
    const wasLiked = this.data.liked
    if (wasLiked) {
      likes = likes.filter(l => l !== id)
    } else {
      likes = [...likes, id]
    }
    
    wx.setStorageSync('likes', likes)
    
    const joke = this.data.joke
    joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
    
    this.setData({ liked: !wasLiked, joke })
    
    try { await api.toggleLike(id, this.data.liked) } catch (err) {}
    
    wx.showToast({ title: this.data.liked ? '已喜欢' : '已取消', icon: 'none' })
  },

  async toggleDislike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('likes') || []
    let dislikes = wx.getStorageSync('dislikes') || []
    
    if (likes.includes(id)) {
      likes = likes.filter(l => l !== id)
      wx.setStorageSync('likes', likes)
      this.setData({ liked: false })
    }
    
    const wasDisliked = this.data.disliked
    if (wasDisliked) {
      dislikes = dislikes.filter(d => d !== id)
    } else {
      dislikes = [...dislikes, id]
    }
    
    wx.setStorageSync('dislikes', dislikes)
    
    const joke = this.data.joke
    joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
    
    this.setData({ disliked: !wasDisliked, joke })
    
    try { await api.toggleDislike(id, this.data.disliked) } catch (err) {}
    
    wx.showToast({ title: this.data.disliked ? '已不喜欢' : '已取消', icon: 'none' })
  },

  async shareJoke() {
    const joke = this.data.joke
    joke.shares += 1
    this.setData({ joke })
    
    try { await api.incrementShare(joke.id) } catch (err) {}
    
    wx.showShareMenu({ menus: ['shareAppMessage'] })
  },

  goBack() { wx.navigateBack() },

  goToDetail(e) {
    wx.redirectTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  onShareAppMessage() {
    return { title: this.data.joke.title, path: `/pages/detail/detail?id=${this.data.joke.id}` }
  }
})
