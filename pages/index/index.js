const { api } = require('../../utils/api.js')
const { markSeen, hasSeen, getSeenCount } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon } = require('../../utils/theme.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    categories: [
      { name: '全部', color: '#667eea' },
      { name: '职场', color: '#f093fb' },
      { name: '生活', color: '#4facfe' },
      { name: '家庭', color: '#43e97b' },
      { name: '校园', color: '#fa709a' }
    ],
    currentCategory: '全部',
    allJokes: [],
    todayJokes: [],
    seenJokes: [],
    filteredJokes: [],
    showModal: false,
    randomJoke: null,
    loading: true,
    showSeen: false,
    seenCount: 0,
    currentTheme: 'dark',
    themeIcon: '🌙'
  },

  onLoad() {
    this.setData({
      currentTheme: getCurrentTheme(),
      themeIcon: getThemeIcon()
    })
    this.loadJokes()
  },

  onShow() {
    this.updateSeenStatus()
    this.setData({ 
      seenCount: getSeenCount(),
      currentTheme: getCurrentTheme(),
      themeIcon: getThemeIcon()
    })
  },

  onPullDownRefresh() {
    this.loadJokes()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  processJokes(jokes) {
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      preview: j.content.split('\n')[0].substring(0, 40) + '...',
      hasImage: j.images && j.images.length > 0,
      hasSeen: hasSeen(j.id)
    }))
  },

  categorizeJokes(jokes) {
    const seenIds = getSeenIds()
    const todayJokes = jokes.filter(j => !seenIds.includes(j.id))
    const seenJokes = jokes.filter(j => seenIds.includes(j.id))
    return { todayJokes, seenJokes }
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: 50 })
      const jokes = this.processJokes(res.data.list)
      const { todayJokes, seenJokes } = this.categorizeJokes(jokes)
      
      this.setData({
        allJokes: jokes,
        todayJokes,
        seenJokes,
        filteredJokes: this.filterByCategory(jokes),
        loading: false,
        seenCount: getSeenCount()
      })
      
      wx.setStorageSync('cachedJokes', jokes)
      
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      const { todayJokes, seenJokes } = this.categorizeJokes(jokes)
      
      this.setData({
        allJokes: jokes,
        todayJokes,
        seenJokes,
        filteredJokes: this.filterByCategory(jokes),
        loading: false,
        seenCount: getSeenCount()
      })
    }
  },

  updateSeenStatus() {
    const jokes = this.processJokes(this.data.allJokes)
    const { todayJokes, seenJokes } = this.categorizeJokes(jokes)
    
    this.setData({
      allJokes: jokes,
      todayJokes,
      seenJokes,
      filteredJokes: this.filterByCategory(jokes),
      seenCount: getSeenCount()
    })
  },

  filterByCategory(jokes) {
    const cat = this.data.currentCategory
    if (cat === '全部') return jokes
    return jokes.filter(j => j.category === cat)
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    const filteredJokes = this.filterByCategory(this.data.allJokes)
    const { todayJokes, seenJokes } = this.categorizeJokes(filteredJokes)
    
    this.setData({
      currentCategory: category,
      filteredJokes,
      todayJokes,
      seenJokes
    })
  },

  toggleShowSeen() {
    this.setData({ showSeen: !this.data.showSeen })
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      currentTheme: newTheme,
      themeIcon: newTheme === 'dark' ? '🌙' : '☀️'
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
  },

  showRandom() {
    const unseen = this.data.todayJokes
    const pool = unseen.length > 0 ? unseen : this.data.allJokes
    
    if (pool.length === 0) return
    
    const randomJoke = pool[Math.floor(Math.random() * pool.length)]
    markSeen(randomJoke.id)
    
    this.setData({ showModal: true, randomJoke })
  },

  hideModal() {
    this.setData({ showModal: false })
    this.updateSeenStatus()
  },

  preventClose() {}
})

function getSeenIds() {
  const str = wx.getStorageSync('seenBitmap') || ''
  return str ? str.split(',').map(Number) : []
}
