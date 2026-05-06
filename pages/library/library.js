const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
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
    categories: [
      { name: '全部', color: '#667eea', count: 0 },
      { name: '职场', color: '#f093fb', count: 0 },
      { name: '生活', color: '#4facfe', count: 0 },
      { name: '家庭', color: '#43e97b', count: 0 },
      { name: '校园', color: '#fa709a', count: 0 }
    ],
    currentCategory: '全部',
    allJokes: [],
    jokes: [],
    loading: true,
    themeIcon: '🌙'
  },

  onLoad() {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJokes()
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJokes()
  },

  onPullDownRefresh() {
    this.loadJokes()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  processJokes(jokes) {
    const seenIds = getSeenIds()
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      preview: j.content.split('\n')[0].substring(0, 40),
      hasImage: j.images && j.images.length > 0,
      hasSeen: seenIds.includes(j.id)
    }))
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: 100 })
      const jokes = this.processJokes(res.data.list)
      
      const categories = this.data.categories.map(cat => ({
        ...cat,
        count: cat.name === '全部' ? jokes.length : jokes.filter(j => j.category === cat.name).length
      }))
      
      wx.setStorageSync('cachedJokes', jokes)
      
      this.setData({
        allJokes: jokes,
        jokes: this.filterJokes(jokes, this.data.currentCategory),
        categories,
        loading: false
      })
      
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      this.setData({
        allJokes: jokes,
        jokes: this.filterJokes(jokes, this.data.currentCategory),
        loading: false
      })
    }
  },

  filterJokes(jokes, category) {
    if (category === '全部') return jokes.sort((a, b) => b.likes - a.likes)
    return jokes.filter(j => j.category === category).sort((a, b) => b.likes - a.likes)
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      jokes: this.filterJokes(this.data.allJokes, category)
    })
    wx.showToast({ title: category, icon: 'none', duration: 1000 })
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
    markSeen(id)
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})
