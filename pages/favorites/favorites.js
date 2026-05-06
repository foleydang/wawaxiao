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
    favorites: [],
    themeIcon: '🌙'
  },

  onLoad() {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadFavorites()
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadFavorites()
  },

  loadFavorites() {
    const likes = wx.getStorageSync('userLikes') || []
    const allJokes = wx.getStorageSync('cachedJokes') || []
    
    const favorites = likes.map(id => {
      const joke = allJokes.find(j => j.id === id)
      if (!joke) return null
      return {
        ...joke,
        color: CAT_COLORS[joke.category] || '#667eea',
        preview: joke.content.split('\n')[0].substring(0, 40)
      }
    }).filter(Boolean)
    
    this.setData({ favorites })
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    let likes = wx.getStorageSync('userLikes') || []
    likes = likes.filter(l => l !== id)
    wx.setStorageSync('userLikes', likes)
    
    this.loadFavorites()
    wx.showToast({ title: '已移除', icon: 'none' })
  },

  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
