const { api } = require('../../utils/api.js')

Page({
  data: {
    favorites: []
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    this.loadFavorites()
  },

  async loadFavorites() {
    const favoriteIds = wx.getStorageSync('favorites') || []
    
    try {
      // 尝试从缓存获取完整数据
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const favorites = favoriteIds.map(id => cachedJokes.find(j => j.id === id)).filter(Boolean)
      
      this.setData({ favorites })
    } catch (err) {
      console.log('加载收藏失败:', err)
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    const favorites = wx.getStorageSync('favorites') || []
    const newFavorites = favorites.filter(fid => fid !== id)
    
    wx.setStorageSync('favorites', newFavorites)
    wx.showToast({ title: '已取消收藏', icon: 'none' })
    
    this.loadFavorites()
  },

  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    return {
      title: '哇哇笑 - 每天开心一笑！',
      path: '/pages/index/index'
    }
  }
})
