const { api } = require('../../utils/api.js')
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
    joke: null,
    moreJokes: [],
    liked: false,
    disliked: false,
    themeIcon: '🌙'
  },

  onLoad(options) {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJoke(options.id)
  },

  onShow() {
    if (this.data.joke) {
      this.refreshJoke()
    }
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  },

  processJoke(joke) {
    return {
      ...joke,
      color: CAT_COLORS[joke.category] || '#667eea',
      hasImage: joke.images && joke.images.length > 0,
      images: joke.images || []
    }
  },

  async loadJoke(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = this.processJoke(res.data)
      
      this.setData({ joke })
      this.checkStatus(id)
      this.loadMoreJokes(id)
      
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async refreshJoke() {
    try {
      const res = await api.getJokeById(this.data.joke.id)
      const joke = this.processJoke(res.data)
      this.setData({ joke })
    } catch (err) {}
  },

  async loadMoreJokes(currentId) {
    try {
      const res = await api.getJokes({ limit: 10 })
      const jokes = res.data.list
        .filter(j => j.id !== parseInt(currentId))
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(j => this.processJoke(j))
      
      this.setData({ moreJokes: jokes })
    } catch (err) {}
  },

  checkStatus(id) {
    const likes = wx.getStorageSync('userLikes') || []
    const dislikes = wx.getStorageSync('userDislikes') || []
    this.setData({
      liked: likes.includes(parseInt(id)),
      disliked: dislikes.includes(parseInt(id))
    })
  },

  async toggleLike() {
    const id = this.data.joke.id
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
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ liked: newLiked, joke })
      wx.showToast({ title: newLiked ? '已喜欢' : '取消喜欢', icon: 'none' })
    } catch (err) {
      const joke = this.data.joke
      joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
      this.setData({ liked: newLiked, joke })
    }
  },

  async toggleDislike() {
    const id = this.data.joke.id
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
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ disliked: newDisliked, joke })
      wx.showToast({ title: newDisliked ? '已不喜欢' : '取消不喜欢', icon: 'none' })
    } catch (err) {
      const joke = this.data.joke
      joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
      this.setData({ disliked: newDisliked, joke })
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
    wx.redirectTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goBack() {
    wx.navigateBack()
  },

  async onShareAppMessage() {
    const joke = this.data.joke
    if (!joke) return
    
    try {
      const res = await api.incrementShare(joke.id)
      joke.shares = res.data.shares
      this.setData({ joke })
    } catch (err) {
      joke.shares++
      this.setData({ joke })
    }
    
    return {
      title: `【哇哇笑】${joke.title}`,
      path: `/pages/detail/detail?id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  }
})
