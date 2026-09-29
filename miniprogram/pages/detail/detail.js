const { api } = require('../../utils/api')

Page({
  data: {
    joke: null,
    recommendJokes: [],
    favorited: false,
    fontScale: 1,
    contentFont: '30rpx',
    themeIcon: '🌙',
    pageClass: ''
  },

  onLoad(options) {
    const fs = wx.getStorageSync('fontScale') || 1
    this.setData({ fontScale: fs, contentFont: Math.round(30 * fs) + 'rpx' })
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

      this.setData({ joke, favorited: api.getLocalLikedJokes().includes(id) })
      this.loadRecommendJokes()

    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async loadRecommendJokes() {
    try {
      const res = await api.getJokes({ limit: 50 })
      const allJokes = res.data.list
      
      const currentId = this.data.joke?.id
      const otherJokes = allJokes.filter(j => j.id !== currentId)
      
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

  async toggleFavorite() {
    if (!this.data.joke) return
    const id = this.data.joke.id
    try {
      if (this.data.favorited) {
        await api.removeFavorite(id)
      } else {
        await api.addFavorite(id)
      }
      this.setData({ favorited: !this.data.favorited })
      wx.showToast({ title: this.data.favorited ? '已收藏' : '已取消收藏', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleLike() {
    if (!this.data.joke) return
    
    try {
      const res = await api.like(this.data.joke.id)
      
      // 立即更新数据
      const joke = { ...this.data.joke }
      joke.likes = res.data.likes || (joke.likes + 1)
      
      this.setData({ joke })
      
      wx.showToast({ title: '❤️ 喜欢+1', icon: 'none', duration: 800 })
      
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleNeutral() {
    if (!this.data.joke) return
    
    try {
      const res = await api.neutral(this.data.joke.id)
      
      // 立即更新数据
      const joke = { ...this.data.joke }
      joke.neutrals = res.data.neutrals || (joke.neutrals + 1)
      
      this.setData({ joke })
      
      wx.showToast({ title: '😐 平+1', icon: 'none', duration: 800 })
      
    } catch (err) {
      console.error('neutral失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleDislike() {
    if (!this.data.joke) return
    
    try {
      const res = await api.dislike(this.data.joke.id)
      
      // 立即更新数据
      const joke = { ...this.data.joke }
      joke.dislikes = res.data.dislikes || (joke.dislikes + 1)
      
      this.setData({ joke })
      
      wx.showToast({ title: '👎 不喜欢+1', icon: 'none', duration: 800 })
      
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

  // 字号调整（A-/A+，全局存储）
  adjustFont(e) {
    const d = parseFloat(e.currentTarget.dataset.d) || 0
    let fs = Math.max(0.85, Math.min(1.4, this.data.fontScale + d))
    wx.setStorageSync('fontScale', fs)
    this.setData({ fontScale: fs, contentFont: Math.round(30 * fs) + 'rpx' })
  },

  // 举报内容（前端入口，记录后给反馈；真提交需后端）
  reportJoke() {
    if (!this.data.joke) return
    wx.showActionSheet({
      itemList: ['内容不当', '垃圾/广告', '其他问题'],
      success: () => {
        wx.showToast({ title: '已记录，感谢反馈', icon: 'success' })
      }
    })
  },

  onShareAppMessage() {
    if (!this.data.joke) return
    return {
      title: '哇哇笑｜' + this.data.joke.title,
      path: `/pages/detail/detail?id=${this.data.joke.id}`
    }
  },

  onShareTimeline() {
    if (!this.data.joke) return {}
    return {
      title: '哇哇笑｜' + this.data.joke.title,
      query: 'id=' + this.data.joke.id
    }
  }
})