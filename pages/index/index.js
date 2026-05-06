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
    todayNewJokes: [],  // 今日最新
    hotJokes: [],
    freshCount: 0,
    todayNewCount: 0,   // 今日新增数量
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
    this.refreshFreshCount()
  },

  onPullDownRefresh() {
    this.loadJokes()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  processJokes(jokes) {
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
    
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      hasImage: j.images && j.images.length > 0,
      images: j.images || [],
      isTodayNew: j.createdAt && j.createdAt >= today  // 今日最新标记
    }))
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: 200 })
      const jokes = this.processJokes(res.data.list || res.data)
      
      wx.setStorageSync('cachedJokes', jokes)
      
      this.setData({ allJokes: jokes })
      this.updateFreshCount()
      this.updateTodayNew()
      this.updateHotJokes()
      this.pickCurrentJoke()
      this.setData({ loading: false })
      
    } catch (err) {
      console.log('API加载失败，使用缓存:', err)
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      this.setData({ allJokes: jokes, loading: false })
      this.updateFreshCount()
      this.updateTodayNew()
      this.updateHotJokes()
      this.pickCurrentJoke()
    }
  },

  // 更新今日新增
  updateTodayNew() {
    const todayNewJokes = this.data.allJokes.filter(j => j.isTodayNew)
    this.setData({
      todayNewJokes,
      todayNewCount: todayNewJokes.length
    })
  },

  // 更新未看数量
  updateFreshCount() {
    const seenIds = getSeenIds()
    const freshJokes = this.data.allJokes.filter(j => !seenIds.includes(j.id))
    this.setData({
      freshJokes,
      freshCount: freshJokes.length
    })
  },

  // 刷新未看数量（onShow时调用）
  refreshFreshCount() {
    this.updateFreshCount()
    this.updateTodayNew()
  },

  // 更新热门推荐
  updateHotJokes() {
    const jokes = this.data.allJokes
    const likedJokes = jokes.filter(j => j.likes > 0)
    
    let hotJokes
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
    
    this.setData({ hotJokes })
  },

  // 选择当前笑话（优先今日最新）
  pickCurrentJoke() {
    const todayNewJokes = this.data.todayNewJokes
    const freshJokes = this.data.freshJokes
    
    // 优先显示今日最新且未看过的
    const todayNewFresh = todayNewJokes.filter(j => freshJokes.some(f => f.id === j.id))
    
    if (todayNewFresh.length > 0) {
      const currentJoke = todayNewFresh[0]
      this.setData({ currentJoke })
      this.checkStatus(currentJoke.id)
    } else if (freshJokes.length > 0) {
      // 如果今日最新都看过了，显示其他未看过的
      const currentJoke = freshJokes[0]
      this.setData({ currentJoke })
      this.checkStatus(currentJoke.id)
    } else if (this.data.allJokes.length > 0) {
      // 都看完了，随机显示一个
      const randomJoke = this.data.allJokes[Math.floor(Math.random() * this.data.allJokes.length)]
      this.setData({ currentJoke: randomJoke })
      this.checkStatus(randomJoke.id)
    } else {
      this.setData({ currentJoke: null })
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

  // 下一个笑话
  nextJoke() {
    const currentJoke = this.data.currentJoke
    if (!currentJoke) {
      wx.showToast({ title: '没有笑话了', icon: 'none' })
      return
    }
    
    // 标记当前笑话为已看过
    markSeen(currentJoke.id)
    
    // 更新未看列表
    this.updateFreshCount()
    this.updateTodayNew()
    
    // 选择下一个笑话
    const freshJokes = this.data.freshJokes
    
    if (freshJokes.length === 0) {
      wx.showToast({ title: '都看完了', icon: 'none' })
      this.setData({ currentJoke: null })
      return
    }
    
    // 随机选择一个未看过的笑话
    const nextJoke = freshJokes[Math.floor(Math.random() * freshJokes.length)]
    
    this.setData({
      currentJoke: nextJoke,
      liked: false,
      disliked: false
    })
    
    this.checkStatus(nextJoke.id)
    wx.showToast({ title: '换一个', icon: 'none', duration: 1000 })
  },

  async toggleLike() {
    const id = this.data.currentJoke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
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
    
    try {
      const res = await api.toggleLike(id, newLiked)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ liked: newLiked, currentJoke: joke })
    } catch (err) {
      console.log('API更新失败:', err)
      const joke = this.data.currentJoke
      joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
      this.setData({ liked: newLiked, currentJoke: joke })
    }
    
    wx.showToast({ title: newLiked ? '喜欢了' : '取消了', icon: 'none', duration: 1000 })
  },

  async toggleDislike() {
    const id = this.data.currentJoke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
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
    
    try {
      const res = await api.toggleDislike(id, newDisliked)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ disliked: newDisliked, currentJoke: joke })
    } catch (err) {
      console.log('API更新失败:', err)
      const joke = this.data.currentJoke
      joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
      this.setData({ disliked: newDisliked, currentJoke: joke })
    }
    
    wx.showToast({ title: newDisliked ? '不喜欢了' : '取消了', icon: 'none', duration: 1000 })
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

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goToLibrary() {
    wx.switchTab({ url: '/pages/library/library' })
  },

  async onShareAppMessage() {
    const joke = this.data.currentJoke
    if (!joke) return
    
    try {
      const res = await api.incrementShare(joke.id)
      joke.shares = res.data.shares
      this.setData({ currentJoke: joke })
    } catch (err) {
      joke.shares++
      this.setData({ currentJoke: joke })
    }
    
    return {
      title: `【哇哇笑】${joke.title}`,
      path: `/pages/detail/detail?id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  }
})
