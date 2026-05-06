const { api } = require('../../utils/api.js')
const { markSeen } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    pageClass: '',
    joke: { color: '#667eea', likes: 0, dislikes: 0, shares: 0, hasImage: false },
    moreJokes: [],
    liked: false,
    disliked: false,
    themeIcon: '🌙',
    showShareTip: false
  },

  onLoad(options) {
    initTheme()
    
    const id = parseInt(options.id)
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJoke(id)
    this.checkStatus(id)
    this.startTime = Date.now()
    
    // 显示分享提示（3秒后自动隐藏）
    this.setData({ showShareTip: true })
    setTimeout(() => this.setData({ showShareTip: false }), 3000)
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  },

  onUnload() {
    if (Date.now() - this.startTime >= 3000) {
      markSeen(this.data.joke.id)
    }
  },

  processJoke(j) {
    return {
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
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

  checkStatus(id) {
    const likes = wx.getStorageSync('userLikes') || []
    const dislikes = wx.getStorageSync('userDislikes') || []
    this.setData({
      liked: likes.includes(id),
      disliked: dislikes.includes(id)
    })
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    wx.showToast({ title: newTheme === 'dark' ? '夜间模式' : '日间模式', icon: 'none' })
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({ current: url, urls: this.data.joke.images })
  },

  toggleLike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
    if (dislikes.includes(id)) {
      dislikes = dislikes.filter(d => d !== id)
      wx.setStorageSync('userDislikes', dislikes)
      this.setData({ disliked: false })
    }
    
    const wasLiked = this.data.liked
    if (wasLiked) {
      likes = likes.filter(l => l !== id)
    } else {
      likes.push(id)
    }
    
    wx.setStorageSync('userLikes', likes)
    
    const joke = this.data.joke
    joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
    
    this.setData({ liked: !wasLiked, joke })
    wx.showToast({ title: wasLiked ? '取消' : '喜欢', icon: 'none' })
  },

  toggleDislike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
    if (likes.includes(id)) {
      likes = likes.filter(l => l !== id)
      wx.setStorageSync('userLikes', likes)
      this.setData({ liked: false })
    }
    
    const wasDisliked = this.data.disliked
    if (wasDisliked) {
      dislikes = dislikes.filter(d => d !== id)
    } else {
      dislikes.push(id)
    }
    
    wx.setStorageSync('userDislikes', dislikes)
    
    const joke = this.data.joke
    joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
    
    this.setData({ disliked: !wasDisliked, joke })
    wx.showToast({ title: wasDisliked ? '取消' : '不喜欢', icon: 'none' })
  },

  goBack() { wx.navigateBack() },

  goToDetail(e) {
    wx.redirectTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  // 分享给朋友
  onShareAppMessage() {
    const joke = this.data.joke
    
    // 增加分享数
    joke.shares++
    this.setData({ joke })
    
    return {
      title: `【哇哇笑】${joke.title}`,
      path: `/pages/detail/detail?id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const joke = this.data.joke
    
    joke.shares++
    this.setData({ joke })
    
    return {
      title: `【哇哇笑】${joke.title}\n${joke.content.substring(0, 50)}`,
      query: `id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  }
})
