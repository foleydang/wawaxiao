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
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadFavorites()
  },

  loadFavorites() {
    const cached = wx.getStorageSync('cachedJokes') || []
    const likes = wx.getStorageSync('userLikes') || []
    
    const favorites = cached
      .filter(j => likes.includes(j.id))
      .map(j => ({
        ...j,
        color: CAT_COLORS[j.category] || '#667eea',
        preview: j.content.split('\n')[0].substring(0, 35),
        hasImage: j.images && j.images.length > 0
      }))
    
    this.setData({ favorites })
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    wx.showToast({ title: newTheme === 'dark' ? '夜间模式' : '日间模式', icon: 'none' })
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    let likes = wx.getStorageSync('userLikes') || []
    
    likes = likes.filter(l => l !== id)
    wx.setStorageSync('userLikes', likes)
    
    this.loadFavorites()
    wx.showToast({ title: '已取消喜欢', icon: 'none' })
  }
})
