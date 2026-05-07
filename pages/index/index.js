const { api } = require('../../utils/api')

Page({
  data: {
    jokes: [],
    currentJoke: null,
    userLikeCount: 0,
    userNeutralCount: 0,
    userDislikeCount: 0,
    themeIcon: '🌙',
    pageClass: '',
    showDetail: false
  },

  onLoad() {
    this.loadJokes()
    this.initTheme()
  },

  initTheme() {
    const theme = wx.getStorageSync('theme') || 'dark'
    this.setData({
      pageClass: theme === 'light' ? 'light-mode' : '',
      themeIcon: theme === 'dark' ? '🌙' : '☀️'
    })
  },

  async loadJokes() {
    try {
      const res = await api.getJokes({ limit: 20 })
      this.setData({ jokes: res.data.list })
      
      if (res.data.list.length > 0) {
        this.showJokeDetail(res.data.list[0].id)
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async showJokeDetail(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = res.data
      
      const userLikeCount = api.getUserCount(parseInt(id), 'like')
      const userNeutralCount = api.getUserCount(parseInt(id), 'neutral')
      const userDislikeCount = api.getUserCount(parseInt(id), 'dislike')
      
      this.setData({
        currentJoke: joke,
        userLikeCount,
        userNeutralCount,
        userDislikeCount,
        showDetail: true
      })
      
      api.markAsRead(id)
    } catch (err) {
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
      joke.score = res.data.score
      
      this.setData({
        currentJoke: joke,
        userLikeCount: res.userLikeCount
      })
      
      wx.showToast({
        title: `喜欢+1（已点${res.userLikeCount}次）`,
        icon: 'none'
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
      joke.score = res.data.score
      
      this.setData({
        currentJoke: joke,
        userNeutralCount: res.userNeutralCount
      })
      
      wx.showToast({
        title: `平+1（已点${res.userNeutralCount}次）`,
        icon: 'none'
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
      joke.score = res.data.score
      
      this.setData({
        currentJoke: joke,
        userDislikeCount: res.userDislikeCount
      })
      
      wx.showToast({
        title: `不喜欢+1（已点${res.userDislikeCount}次）`,
        icon: 'none'
      })
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
    if (!this.data.currentJoke) return
    
    return {
      title: this.data.currentJoke.title,
      path: `/pages/index/index`
    }
  }
})
