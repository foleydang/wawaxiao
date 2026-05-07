const { api } = require('../../utils/api')

Page({
  data: {
    loading: true,
    jokes: [],
    currentJoke: null,
    hotJokes: [],
    todayNewCount: 0,
    freshCount: 0,
    themeIcon: '🌙',
    pageClass: ''
  },

  onLoad() {
    this.loadData()
    this.initTheme()
  },

  initTheme() {
    const theme = wx.getStorageSync('theme') || 'dark'
    this.setData({
      pageClass: theme === 'light' ? 'light-mode' : '',
      themeIcon: theme === 'dark' ? '🌙' : '☀️'
    })
  },

  async loadData() {
    try {
      const res = await api.getJokes({ limit: 50 })
      const jokes = res.data.list
      
      const hotRes = await api.getHotJokes()
      
      // 计算未读数量（修复bug）
      const readIds = api.getReadJokes()
      const freshCount = jokes.filter(j => !readIds.includes(j.id)).length
      
      // 检查今日新笑话
      const stats = await api.getStats()
      const lastVisit = api.getLastVisitDate()
      const todayNewCount = (lastVisit && stats.data.latestDate > lastVisit) ? stats.data.todayCount : 0
      
      // 更新最后访问日期
      api.setLastVisitDate(stats.data.latestDate)
      
      this.setData({
        jokes,
        currentJoke: jokes[0] || null,
        hotJokes: hotRes.data || [],
        freshCount,
        todayNewCount,
        loading: false
      })
      
      if (jokes[0]) {
        api.markAsRead(jokes[0].id)
      }
      
    } catch (err) {
      console.error('加载失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async handleLike() {
    if (!this.data.currentJoke) return
    
    try {
      const res = await api.like(this.data.currentJoke.id)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      
      this.setData({ currentJoke: joke })
      wx.showToast({ title: '喜欢+1', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleNeutral() {
    if (!this.data.currentJoke) return
    
    try {
      const res = await api.neutral(this.data.currentJoke.id)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      
      this.setData({ currentJoke: joke })
      wx.showToast({ title: '平+1', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleDislike() {
    if (!this.data.currentJoke) return
    
    try {
      const res = await api.dislike(this.data.currentJoke.id)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      
      this.setData({ currentJoke: joke })
      wx.showToast({ title: '不喜欢+1', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  nextJoke() {
    const jokes = this.data.jokes
    if (!jokes || jokes.length === 0) return
    
    const currentIndex = jokes.findIndex(j => j.id === this.data.currentJoke?.id)
    const nextIndex = (currentIndex + 1) % jokes.length
    
    const nextJoke = jokes[nextIndex]
    this.setData({ currentJoke: nextJoke })
    
    api.markAsRead(nextJoke.id)
    
    // 更新未读数量（修复bug）
    const readIds = api.getReadJokes()
    const freshCount = jokes.filter(j => !readIds.includes(j.id)).length
    this.setData({ freshCount })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({ current: url, urls: urls || [url] })
  },

  toggleTheme() {
    const current = wx.getStorageSync('theme') || 'dark'
    const newTheme = current === 'dark' ? 'light' : 'dark'
    wx.setStorageSync('theme', newTheme)
    
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: newTheme === 'dark' ? '🌙' : '☀️'
    })
  },

  onShareAppMessage() {
    if (!this.data.currentJoke) return
    
    return {
      title: this.data.currentJoke.title,
      path: '/pages/index/index'
    }
  }
})
