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
    page: 1,  // 新增：分页
    hasMore: true  // 新增：是否有更多
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

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功', icon: 'success', duration: 1000 })
    })
  },

  // 滚动加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      
      // 分页加载：每次20条
      const res = await api.getJokes({ limit: 20, page: 1 })
      const jokes = res.data.list
      
      const hotRes = await api.getHotJokes()
      
      // 计算未读数量
      const readIds = api.getReadJokes()
      const freshCount = jokes.filter(j => !readIds.includes(j.id)).length
      
      // 检查今日新笑话
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
        hasMore: jokes.length === 20  // 如果返回20条，说明还有更多
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

  // 加载更多
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

  async handleLike() {
    if (!this.data.currentJoke) return
    
    try {
      const res = await api.like(this.data.currentJoke.id)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      
      this.setData({ currentJoke: joke })
      
      // 点赞动画（高优先级优化）
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
      
      // 点赞动画
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
      
      // 点赞动画
      wx.showToast({
        title: '👎 不喜欢+1',
        icon: 'none',
        duration: 800
      })
      
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
    
    // 更新未读数量
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