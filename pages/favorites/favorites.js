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
    loading: false
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

  async loadFavorites() {
    const likes = wx.getStorageSync('userLikes') || []
    
    if (likes.length === 0) {
      this.setData({ favorites: [] })
      return
    }
    
    this.setData({ loading: true })
    
    const cachedJokes = wx.getStorageSync('cachedJokes') || []
    const favorites = []
    
    // 逐个获取喜欢的笑话
    for (const id of likes) {
      // 先从缓存找
      let joke = cachedJokes.find(j => j.id === id)
      
      // 缓存没有，从API获取
      if (!joke) {
        try {
          const res = await api.getJokeById(id)
          if (res.success) {
            joke = res.data
          }
        } catch (err) {
          console.error('获取笑话失败:', id, err)
        }
      }
      
      if (joke) {
        favorites.push({
          ...joke,
          color: CAT_COLORS[joke.category] || '#667eea',
          preview: joke.content ? joke.content.split('\n')[0].substring(0, 40) : joke.title
        })
      }
    }
    
    this.setData({ 
      favorites,
      loading: false
    })
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

  deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    let likes = wx.getStorageSync('userLikes') || []
    likes = likes.filter(l => l !== id)
    wx.setStorageSync('userLikes', likes)
    
    // 同时从api中移除
    api.removeLikedJoke(id)
    
    this.loadFavorites()
    wx.showToast({ title: '已移除', icon: 'none' })
  },

  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
