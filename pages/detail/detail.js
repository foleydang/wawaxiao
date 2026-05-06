const { api } = require('../../utils/api.js')

Page({
  data: {
    joke: null,
    moreJokes: [],
    liked: false,
    likeLoading: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadJoke(id)
    this.checkLikeStatus(id)
  },

  async loadJoke(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = res.data
      
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const otherJokes = cachedJokes.filter(j => j.id !== id)
      const shuffled = otherJokes.sort(() => Math.random() - 0.5)
      const moreJokes = shuffled.slice(0, 4)
      
      this.setData({ joke, moreJokes })
      wx.setNavigationBarTitle({ title: joke.title })
      
    } catch (err) {
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const joke = cachedJokes.find(j => j.id === id)
      
      if (joke) {
        const otherJokes = cachedJokes.filter(j => j.id !== id)
        const shuffled = otherJokes.sort(() => Math.random() - 0.5)
        const moreJokes = shuffled.slice(0, 4)
        
        this.setData({ joke, moreJokes })
        wx.setNavigationBarTitle({ title: joke.title })
      }
    }
  },

  checkLikeStatus(id) {
    const favorites = wx.getStorageSync('favorites') || []
    this.setData({ liked: favorites.includes(id) })
  },

  formatDate(timestamp) {
    if (!timestamp) return '刚刚'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff/60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff/3600000) + '小时前'
    return date.toLocaleDateString()
  },

  async toggleLike() {
    if (this.data.likeLoading) return
    this.setData({ likeLoading: true })
    
    const favorites = wx.getStorageSync('favorites') || []
    const id = this.data.joke.id
    
    try {
      const res = await api.toggleLike(id)
      const joke = this.data.joke
      joke.likes = res.data.likes
      
      let newFavorites
      if (this.data.liked) {
        newFavorites = favorites.filter(fid => fid !== id)
        wx.showToast({ title: '已取消喜欢', icon: 'none' })
      } else {
        newFavorites = [...favorites, id]
        wx.showToast({ title: '已喜欢 ❤️', icon: 'none' })
      }
      
      wx.setStorageSync('favorites', newFavorites)
      
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const cachedIndex = cachedJokes.findIndex(j => j.id === id)
      if (cachedIndex >= 0) {
        cachedJokes[cachedIndex].likes = joke.likes
        wx.setStorageSync('cachedJokes', cachedJokes)
      }
      
      this.setData({ liked: !this.data.liked, joke, likeLoading: false })
      
    } catch (err) {
      let newFavorites
      if (this.data.liked) {
        newFavorites = favorites.filter(fid => fid !== id)
        wx.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        newFavorites = [...favorites, id]
        wx.showToast({ title: '已收藏 ❤️', icon: 'none' })
      }
      
      wx.setStorageSync('favorites', newFavorites)
      this.setData({ liked: !this.data.liked, likeLoading: false })
    }
  },

  shareJoke() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  goToDetail(e) {
    wx.redirectTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.joke.title} - 哇哇笑`,
      path: `/pages/detail/detail?id=${this.data.joke.id}`
    }
  }
})
