// pages/favorites/favorites.js
const { api } = require('../../utils/api.js')

Page({
  data: {
    favorites: []
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    // 每次显示页面时重新加载（因为可能从详情页取消收藏了）
    this.loadFavorites()
  },

  loadFavorites() {
    const favoriteIds = wx.getStorageSync('favorites') || []
    
    // 从缓存中获取笑话数据
    const cachedJokes = wx.getStorageSync('cachedJokes') || []
    const favorites = favoriteIds.map(id => cachedJokes.find(j => j.id === id)).filter(Boolean)
    
    this.setData({ favorites })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    const favorites = wx.getStorageSync('favorites') || []
    const newFavorites = favorites.filter(fid => fid !== id)
    wx.setStorageSync('favorites', newFavorites)
    
    wx.showToast({
      title: '已取消收藏',
      icon: 'none',
      duration: 1500
    })
    
    this.loadFavorites()
  },

  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage() {
    return {
      title: '哇哇笑 - 每天开心一笑！',
      path: '/pages/index/index'
    }
  }
})
