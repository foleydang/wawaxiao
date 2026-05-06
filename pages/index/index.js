const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

const CAT_ICONS = {
  '职场': '💼',
  '生活': '☕',
  '家庭': '🏠',
  '校园': '📚'
}

Page({
  data: {
    pageClass: '',
    currentJoke: null,
    allJokes: [],
    freshJokes: [],
    hotJokes: [],
    freshCount: 0,
    liked: false,
    disliked: false,
    loading: true,
    themeIcon: '🌙',
    categories: [
      { name: '职场', color: '#f093fb', icon: '💼', count: 0 },
      { name: '生活', color: '#4facfe', icon: '☕', count: 0 },
      { name: '家庭', color: '#43e97b', icon: '🏠', count: 0 },
      { name: '校园', color: '#fa709a', icon: '📚', count: 0 }
    ]
  },

  onLoad() {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJokes()
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.updateData()
  },

  processJokes(jokes) {
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      hasImage: j.images && j.images.length > 0,
      images: j.images || []
    }))
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: 50 })
      const jokes = this.processJokes(res.data.list || res.data)
      
      wx.setStorageSync('cachedJokes', jokes)
      
      this.updateData(jokes)
      this.setData({ loading: false })
      
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      this.updateData(jokes)
      this.setData({ loading: false })
    }
  },

  updateData(jokes) {
    if (!jokes) jokes = this.processJokes(this.data.allJokes || wx.getStorageSync('cachedJokes') || [])
    
    const seenIds = getSeenIds()
    const freshJokes = jokes.filter(j => !seenIds.includes(j.id))
    const hotJokes = jokes.filter(j => j.isHot).slice(0, 6)
    
    // 当前显示第一条未看过的
    let currentJoke = freshJokes.length > 0 ? freshJokes[0] : null
    
    // 如果当前笑话已被看过，换下一个
    if (this.data.currentJoke && seenIds.includes(this.data.currentJoke.id)) {
      currentJoke = freshJokes.length > 0 ? freshJokes[Math.floor(Math.random() * freshJokes.length)] : null
    }
    
    // 更新分类计数
    const categories = this.data.categories.map(c => ({
      ...c,
      count: jokes.filter(j => j.category === c.name).length
    }))
    
    this.setData({
      allJokes: jokes,
      freshJokes,
      hotJokes,
      freshCount: freshJokes.length,
      currentJoke,
      categories
    })
    
    if (currentJoke) {
      this.checkStatus(currentJoke.id)
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

  nextJoke() {
    // 获取最新的未看列表
    const seenIds = getSeenIds()
    const freshJokes = this.data.allJokes.filter(j => !seenIds.includes(j.id))
    
    if (freshJokes.length === 0) {
      wx.showToast({ title: '都看完了', icon: 'none' })
      this.setData({
        currentJoke: null,
        freshJokes: [],
        freshCount: 0
      })
      return
    }
    
    // 随机选一条
    const randomJoke = freshJokes[Math.floor(Math.random() * freshJokes.length)]
    
    // 标记为已看过
    markSeen(randomJoke.id)
    
    // 重新计算未看列表
    const newSeenIds = getSeenIds()
    const newFreshJokes = this.data.allJokes.filter(j => !newSeenIds.includes(j.id))
    
    this.setData({
      currentJoke: randomJoke,
      freshJokes: newFreshJokes,
      freshCount: newFreshJokes.length,
      liked: false,
      disliked: false
    })
    
    this.checkStatus(randomJoke.id)
  },

  toggleLike() {
    const id = this.data.currentJoke.id
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
    
    const joke = this.data.currentJoke
    joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
    
    this.setData({ liked: !wasLiked, currentJoke: joke })
  },

  toggleDislike() {
    const id = this.data.currentJoke.id
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
    
    const joke = this.data.currentJoke
    joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
    
    this.setData({ disliked: !wasDisliked, currentJoke: joke })
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
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({ current: url, urls: urls || [url] })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    markSeen(id)
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goToCategory(e) {
    const category = e.currentTarget.dataset.category
    wx.switchTab({ url: '/pages/library/library' })
    // 需要在 library 页面处理分类切换
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goToLibrary() {
    wx.switchTab({ url: '/pages/library/library' })
  },

  onShareAppMessage() {
    const joke = this.data.currentJoke
    if (!joke) return
    
    joke.shares++
    this.setData({ currentJoke: joke })
    
    return {
      title: `【哇哇笑】${joke.title}`,
      path: `/pages/detail/detail?id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  }
})
