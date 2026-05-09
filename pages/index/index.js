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
    pageClass: '',
    page: 1,
    hasMore: true
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

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功', icon: 'success', duration: 1000 })
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      
      const res = await api.getJokes({ limit: 20, page: 1 })
      const jokes = res.data.list
      
      const hotRes = await api.getHotJokes()
      
      const readIds = api.getReadJokes()
      const freshCount = jokes.filter(j => !readIds.includes(j.id)).length
      
      const stats = await api.getStats()
      const lastVisit = api.getLastVisitDate()
      const todayNewCount = (lastVisit && stats.data.latestDate > lastVisit) ? stats.data.todayCount : 0
      
      api.setLastVisitDate(stats.data.latestDate)
      
      this.setData({
        jokes,
        currentJoke: jokes[0] || null,
        hotJokes: hotRes.data || [],
        freshCount,
        todayNewCount,
        loading: false,
        hasMore: jokes.length === 20
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

  async loadMore() {
    if (!this.data.hasMore) return
    
    try {
      wx.showLoading({ title: '加载中...' })
      
      const nextPage = this.data.page + 1
      const res = await api.getJokes({ limit: 20, page: nextPage })
      const newJokes = res.data.list
      
      if (newJokes.length > 0) {
        this.setData({
          jokes: [...this.data.jokes, ...newJokes],
          page: nextPage,
          hasMore: newJokes.length === 20
        })
      } else {
        this.setData({ hasMore: false })
      }
      
      wx.hideLoading()
      
    } catch (err) {
      wx.hideLoading()
      console.error('加载更多失败:', err)
    }
  },

  // 核心修复：nextJoke 随机取未读的笑话
  nextJoke() {
    const jokes = this.data.jokes
    if (!jokes || jokes.length === 0) return
    
    const readIds = api.getReadJokes()
    
    // 找出所有未读的笑话
    const unreadJokes = jokes.filter(j => !readIds.includes(j.id))
    
    let nextJoke
    
    if (unreadJokes.length > 0) {
      // 有未读的，随机取一个未读的
      const randomIndex = Math.floor(Math.random() * unreadJokes.length)
      nextJoke = unreadJokes[randomIndex]
    } else {
      // 都读过了，随机取一个（循环使用）
      const currentIndex = jokes.findIndex(j => j.id === this.data.currentJoke?.id)
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * jokes.length)
      } while (nextIndex === currentIndex && jokes.length > 1)
      nextJoke = jokes[nextIndex]
      
      // 提示用户都读过了
      wx.showToast({ title: '今日推荐已看完', icon: 'none', duration: 1500 })
    }
    
    this.setData({ currentJoke: nextJoke })
    api.markAsRead(nextJoke.id)
    
    // 更新未读数量
    const newReadIds = [...readIds, nextJoke.id]
    const freshCount = jokes.filter(j => !newReadIds.includes(j.id)).length
    this.setData({ freshCount })
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
      
      wx.showToast({
        title: '❤️ 喜欢+1',
        icon: 'none',
        duration: 800
      })
      
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
      
      wx.showToast({
        title: '😐 平+1',
        icon: 'none',
        duration: 800
      })
      
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
      
      wx.showToast({
        title: '👎 不喜欢+1',
        icon: 'none',
        duration: 800
      })
      
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
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
