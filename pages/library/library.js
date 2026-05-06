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
    this.updateSeenStatus()
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
      const res = await api.getJokes({ limit: 50 })
      const jokes = this.processJokes(res.data.list)
      
      const cats = this.data.categories.map(c => ({
        ...c,
        count: c.name === '全部' 
          ? jokes.length 
          : jokes.filter(j => j.category === c.name).length
      }))
      
      this.setData({
        allJokes: jokes,
        jokes: this.filterByCategory(jokes),
        categories: cats,
        loading: false
      })
      
      wx.setStorageSync('cachedJokes', jokes)
      
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      
      const cats = this.data.categories.map(c => ({
        ...c,
        count: c.name === '全部' 
          ? jokes.length 
          : jokes.filter(j => j.category === c.name).length
      }))
      
      this.setData({
        allJokes: jokes,
        jokes: this.filterByCategory(jokes),
        categories: cats,
        loading: false
      })
    }
  },

  updateSeenStatus() {
    if (this.data.allJokes.length === 0) return
    
    const jokes = this.processJokes(this.data.allJokes)
    this.setData({
      allJokes: jokes,
      jokes: this.filterByCategory(jokes)
    })
  },

  filterByCategory(jokes) {
    const cat = this.data.currentCategory
    if (cat === '全部') return jokes
    return jokes.filter(j => j.category === cat)
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    
    this.setData({
      currentCategory: category,
      jokes: this.filterByCategory(this.data.allJokes)
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
    markSeen(id)
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})
