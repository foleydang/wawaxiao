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
    hotJokes: [],
    freshCount: 0,
    liked: false,
    disliked: false,
    loading: true,
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
      const res = await api.getJokes({ limit: 100 })
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
    
    // 热门推荐逻辑
    let hotJokes
    const likedJokes = jokes.filter(j => j.likes > 0)
    if (likedJokes.length >= 4) {
      hotJokes = likedJokes.sort((a, b) => b.likes - a.likes).slice(0, 4)
    } else if (likedJokes.length > 0) {
      const randomOthers = jokes.filter(j => j.likes === 0)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4 - likedJokes.length)
      hotJokes = [...likedJokes.sort((a, b) => b.likes - a.likes), ...randomOthers]
    } else {
      hotJokes = jokes.sort(() => Math.random() - 0.5).slice(0, 4)
    }
    
    let currentJoke = freshJokes.length > 0 ? freshJokes[0] : null
    
    if (this.data.currentJoke && seenIds.includes(this.data.currentJoke.id)) {
      currentJoke = freshJokes.length > 0 ? freshJokes[Math.floor(Math.random() * freshJokes.length)] : null
    }
    
    this.setData({
      allJokes: jokes,
      freshJokes,
      hotJokes,
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
    
    const randomJoke = freshJokes[Math.floor(Math.random() * freshJokes.length)]
    markSeen(randomJoke.id)
    
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

  async toggleLike() {
    const id = this.data.currentJoke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
    // 如果之前不喜欢，先取消
    if (dislikes.includes(id)) {
      dislikes = dislikes.filter(d => d !== id)
      wx.setStorageSync('userDislikes', dislikes)
      this.setData({ disliked: false })
      await api.toggleDislike(id, false)
    }
    
    const wasLiked = this.data.liked
    const newLiked = !wasLiked
    
    if (wasLiked) {
      likes = likes.filter(l => l !== id)
    } else {
      likes.push(id)
    }
    
    wx.setStorageSync('userLikes', likes)
    
    const joke = this.data.currentJoke
    joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
    
    this.setData({ liked: newLiked, currentJoke: joke })
    
    // 同步到数据库
    try {
      await api.toggleLike(id, newLiked)
    } catch (err) {
      console.log('API更新失败，本地已保存')
    }
  },

  async toggleDislike() {
    const id = this.data.currentJoke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
    // 如果之前喜欢，先取消
    if (likes.includes(id)) {
      likes = likes.filter(l => l !== id)
      wx.setStorageSync('userLikes', likes)
      this.setData({ liked: false })
      await api.toggleLike(id, false)
    }
    
    const wasDisliked = this.data.disliked
    const newDisliked = !wasDisliked
    
    if (wasDisliked) {
      dislikes = dislikes.filter(d => d !== id)
    } else {
      dislikes.push(id)
    }
    
    wx.setStorageSync('userDislikes', dislikes)
    
    const joke = this.data.currentJoke
    joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
    
    this.setData({ disliked: newDisliked, currentJoke: joke })
    
    // 同步到数据库
    try {
      await api.toggleDislike(id, newDisliked)
    } catch (err) {
      console.log('API更新失败，本地已保存')
    }
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
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

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  async onShareAppMessage() {
    const joke = this.data.currentJoke
    if (!joke) return
    
    joke.shares++
    this.setData({ currentJoke: joke })
    
    // 同步到数据库
    try {
      await api.incrementShare(joke.id)
    } catch (err) {
      console.log('分享数更新失败')
    }
    
    return {
      title: `【哇哇笑】${joke.title}`,
      path: `/pages/detail/detail?id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  }
})
