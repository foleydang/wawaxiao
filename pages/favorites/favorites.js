const { api } = require('../../utils/api.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a',
  '搞笑': '#f5576c',
  '弱智吧': '#667eea',
  '儿童': '#FF85A2',
  '动物': '#43e97b'
}

Page({
  data: {
    pageClass: '',
    favorites: [],
    themeIcon: '🌙',
    loading: false,
    page: 1,
    hasMore: true
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

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async loadFavorites() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getFavorites(1, 50)
      const favorites = (res.data.list || []).map(j => ({
        ...j,
        color: CAT_COLORS[j.category] || '#667eea',
        preview: j.content ? j.content.split('\n')[0].substring(0, 40) : j.title
      }))
      
      this.setData({
        favorites,
        page: 1,
        hasMore: (res.data.total || 0) > 50,
        loading: false
      })
    } catch (err) {
      // 后端失败时，使用本地缓存作为 fallback
      const likes = api.getLocalLikedJokes()
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const favorites = []
      
      for (const id of likes) {
        const joke = cachedJokes.find(j => j.id === id)
        if (joke) {
          favorites.push({
            ...joke,
            color: CAT_COLORS[joke.category] || '#667eea',
            preview: joke.content ? joke.content.split('\n')[0].substring(0, 40) : joke.title
          })
        }
      }
      
      this.setData({ favorites, loading: false })
    }
  },

  async loadMore() {
    if (!this.data.hasMore) return
    
    try {
      const nextPage = this.data.page + 1
      const res = await api.getFavorites(nextPage, 50)
      const newFavs = (res.data.list || []).map(j => ({
        ...j,
        color: CAT_COLORS[j.category] || '#667eea',
        preview: j.content ? j.content.split('\n')[0].substring(0, 40) : j.title
      }))
      
      this.setData({
        favorites: [...this.data.favorites, ...newFavs],
        page: nextPage,
        hasMore: this.data.favorites.length + newFavs.length < (res.data.total || 0)
      })
    } catch (err) {
      console.error('加载更多失败:', err)
    }
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
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    
    try {
      await api.removeFavorite(id)
      wx.showToast({ title: '已移除', icon: 'none' })
      this.loadFavorites()
    } catch (err) {
      wx.showToast({ title: '移除失败', icon: 'none' })
    }
  },

  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
