const { api } = require('../../utils/api')

Page({
  data: {
    joke: null,
    userLikeCount: 0,      // 用户对这个笑话点了多少次喜欢
    userNeutralCount: 0,   // 用户对这个笑话点了多少次平
    userDislikeCount: 0,   // 用户对这个笑话点了多少次不喜欢
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
      
      // 从本地读取用户点击次数
      const userLikeCount = api.getUserCount(parseInt(id), 'like')
      const userNeutralCount = api.getUserCount(parseInt(id), 'neutral')
      const userDislikeCount = api.getUserCount(parseInt(id), 'dislike')
      
      this.setData({ 
        joke,
        userLikeCount,
        userNeutralCount,
        userDislikeCount
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async handleLike() {
    if (!this.data.joke) return
    
    try {
      const res = await api.like(this.data.joke.id)
      
      // 更新笑话统计
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      joke.score = res.data.score
      
      this.setData({ 
        joke,
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
    if (!this.data.joke) return
    
    try {
      const res = await api.neutral(this.data.joke.id)
      
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      joke.score = res.data.score
      
      this.setData({ 
        joke,
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
    if (!this.data.joke) return
    
    try {
      const res = await api.dislike(this.data.joke.id)
      
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      joke.score = res.data.score
      
      this.setData({ 
        joke,
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
    if (!this.data.joke) return
    
    return {
      title: this.data.joke.title,
      path: `/pages/detail/detail?id=${this.data.joke.id}`
    }
  }
})
