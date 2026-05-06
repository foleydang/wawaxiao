const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
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
    currentJoke: null,
    allJokes: [],
    freshJokes: [],
    seenJokes: [],
    freshCount: 0,
    liked: false,
    disliked: false,
    loading: true,
    showSeen: false,
    themeIcon: '🌙'
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
    this.updateSeenStatus()
  },

  processJokes(jokes) {
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      hasImage: j.images && j.images.length > 0,
      images: j.images || []
    }))
  },

  splitBySeen(jokes) {
    const seenIds = getSeenIds()
    const freshJokes = jokes.filter(j => !seenIds.includes(j.id))
    const seenJokes = jokes.filter(j => seenIds.includes(j.id))
    return { freshJokes, seenJokes }
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: 50 })
      const jokes = this.processJokes(res.data.list)
      const { freshJokes, seenJokes } = this.splitBySeen(jokes)
      
      wx.setStorageSync('cachedJokes', jokes)
      
      const currentJoke = freshJokes.length > 0 ? freshJokes[0] : null
      
      this.setData({
        allJokes: jokes,
        freshJokes,
        seenJokes,
        freshCount: freshJokes.length,
        currentJoke,
        loading: false
      })
      
      if (currentJoke) {
        this.checkStatus(currentJoke.id)
      }
      
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      const { freshJokes, seenJokes } = this.splitBySeen(jokes)
      
      const currentJoke = freshJokes.length > 0 ? freshJokes[0] : null
      
      this.setData({
        allJokes: jokes,
        freshJokes,
        seenJokes,
        freshCount: freshJokes.length,
        currentJoke,
        loading: false
      })
      
      if (currentJoke) {
        this.checkStatus(currentJoke.id)
      }
    }
  },

  updateSeenStatus() {
    if (this.data.allJokes.length === 0) return
    
    const jokes = this.processJokes(this.data.allJokes)
    const { freshJokes, seenJokes } = this.splitBySeen(jokes)
    
    let currentJoke = this.data.currentJoke
    if (currentJoke && getSeenIds().includes(currentJoke.id)) {
      currentJoke = freshJokes.length > 0 ? freshJokes[Math.floor(Math.random() * freshJokes.length)] : null
    }
    
    this.setData({
      allJokes: jokes,
      freshJokes,
      seenJokes,
      freshCount: freshJokes.length,
      currentJoke
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
    const fresh = this.data.freshJokes
    if (fresh.length === 0) {
      wx.showToast({ title: '都看完了', icon: 'none' })
      return
    }
    
    const randomJoke = fresh[Math.floor(Math.random() * fresh.length)]
    markSeen(randomJoke.id)
    
    const { freshJokes, seenJokes } = this.splitBySeen(this.data.allJokes)
    
    this.setData({
      currentJoke: randomJoke,
      freshJokes,
      seenJokes,
      freshCount: freshJokes.length,
      liked: false,
      disliked: false
    })
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
    wx.showToast({ title: wasLiked ? '取消' : '喜欢', icon: 'none' })
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
    wx.showToast({ title: wasDisliked ? '取消' : '不喜欢', icon: 'none' })
  },

  toggleShowSeen() {
    this.setData({ showSeen: !this.data.showSeen })
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    wx.showToast({ title: newTheme === 'dark' ? '夜间模式' : '日间模式', icon: 'none' })
  },

  // 修复：传递所有图片数组
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({ 
      current: url, 
      urls: urls || [url] 
    })
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
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
