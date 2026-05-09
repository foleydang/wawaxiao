const { api } = require('../../utils/api')

Page({
  data: {
    joke: null,
    recommendJokes: [],
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
      const res = await api.getJokeById(id)
      const joke = res.data
      
      this.setData({ joke })
      
      // 加载推荐笑话
      this.loadRecommendJokes()
      
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async loadRecommendJokes() {
    try {
      const res = await api.getJokes({ limit: 50 })
      const allJokes = res.data.list
      
      // 排除当前笑话
      const currentId = this.data.joke?.id
      const otherJokes = allJokes.filter(j => j.id !== currentId)
      
      // 随机打乱并取前4个
      const shuffled = otherJokes.sort(() => Math.random() - 0.5)
      const recommendJokes = shuffled.slice(0, 4)
      
      this.setData({ recommendJokes })
    } catch (err) {
      console.error('加载推荐失败:', err)
    }
  },

  goBack() {
    wx.navigateBack()
  },

  async handleLike() {
    if (!this.data.joke) return
    
    try {
      const res = await api.like(this.data.joke.id)
      
      const joke = this.data.joke
      joke.likes = res.data.likes
      
      this.setData({ joke })
      wx.showToast({ title: '喜欢+1', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleNeutral() {
    if (!this.data.joke) return
    
    try {
      const res = await api.neutral(this.data.joke.id)
      
      const joke = this.data.joke
      joke.neutrals = res.data.neutrals
      
      this.setData({ joke })
      wx.showToast({ title: '平+1', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleDislike() {
    if (!this.data.joke) return
    
    try {
      const res = await api.dislike(this.data.joke.id)
      
      const joke = this.data.joke
      joke.dislikes = res.data.dislikes
      
      this.setData({ joke })
      wx.showToast({ title: '不喜欢+1', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.redirectTo({ url: `/pages/detail/detail?id=${id}` })
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