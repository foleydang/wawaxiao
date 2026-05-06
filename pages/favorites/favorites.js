const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: { favorites: [] },

  onLoad() { this.loadFavorites() },
  onShow() { this.loadFavorites() },

  loadFavorites() {
    const favs = wx.getStorageSync('favorites') || []
    const cached = wx.getStorageSync('cachedJokes') || []
    const favorites = favs.map(id => cached.find(j => j.id === id)).filter(Boolean).map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      preview: j.content.split('\n')[0].substring(0, 35) + '...'
    }))
    this.setData({ favorites })
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    const favs = wx.getStorageSync('favorites') || []
    wx.setStorageSync('favorites', favs.filter(f => f !== id))
    this.loadFavorites()
    wx.showToast({ title: '已取消', icon: 'none' })
  },

  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
