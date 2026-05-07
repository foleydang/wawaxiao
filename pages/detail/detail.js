const { api } = require('../../utils/api')

Page({
  data: {
    joke: null,
    userRating: null,  // 用户当前评价（本地）
    themeIcon: '🌙',
    pageClass: ''
  },

  onLoad(options) {
    this.loadJoke(options.id)
    this.initTheme()
  },

  initTheme() {
    const theme = wx.getStorageSync('theme') || 'dark'
    this.setData({
      pageClass: theme === 'light' ? 'light-mode' : '',
      themeIcon: theme === 'dark' ? '🌙' : '☀️'
    })
  },

  async loadJoke(id) {
    try {
      // 加载笑话详情
      const res = await api.getJokeById(id)
      const joke = res.data
      
      // 从本地存储获取用户评价
      const userRating = api.getUserRating(parseInt(id))
      
      this.setData({ joke, userRating })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async handleLike() {
    await this.handleRate('like')
  },

  async handleNeutral() {
    await this.handleRate('neutral')
  },

  async handleDislike() {
    await this.handleRate('dislike')
  },

  async handleRate(newRating) {
    if (!this.data.joke) return
    
    const jokeId = this.data.joke.id
    const prevRating = this.data.userRating
    
    // 如果点击的是当前评价，则取消评价
    const actualNewRating = prevRating === newRating ? null : newRating
    
    try {
      // 调用API更新笑话统计
      const res = await api.rate(jokeId, prevRating, actualNewRating)
      
      // 更新笑话统计
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      joke.score = res.data.score
      
      // 本地存储用户评价
      api.setUserRating(jokeId, actualNewRating)
      
      this.setData({ joke, userRating: actualNewRating })
      
      wx.showToast({ title: res.message, icon: 'none' })
      
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
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
    if (!this.data.joke) return
    
    return {
      title: this.data.joke.title,
      path: `/pages/detail/detail?id=${this.data.joke.id}`
    }
  }
})
