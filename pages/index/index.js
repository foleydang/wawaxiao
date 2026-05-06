const { api } = require('../../utils/api.js')
const { markSeen, hasSeen, getSeenIds } = require('../../utils/seen.js')
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
      { name: '全部', color: '#667eea', count: 0 },
      { name: '职场', color: '#f093fb', count: 0 },
      { name: '生活', color: '#4facfe', count: 0 },
      { name: '家庭', color: '#43e97b', count: 0 },
      { name: '校园', color: '#fa709a', count: 0 }
    ],
    currentCategory: '全部',
    allJokes: [],
    todayJokes: [],    // 未看过的（真正的新鲜）
    seenJokes: [],      // 已看过的
    filteredJokes: [],
    showModal: false,
    randomJoke: null,
    loading: true,
    showSeen: false,
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
  },

  onPullDownRefresh() {
    this.loadJokes()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  processJokes(jokes) {
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      preview: j.content.split('\n')[0].substring(0, 35),
      hasImage: j.images && j.images.length > 0
    }))
  },

  splitBySeen(jokes) {
    const seenIds = getSeenIds()
    const todayJokes = jokes.filter(j => !seenIds.includes(j.id))  // 未看过
    const seenJokes = jokes.filter(j => seenIds.includes(j.id))     // 已看过
    return { todayJokes, seenJokes }
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: 50 })
      const jokes = this.processJokes(res.data.list)
      const { todayJokes, seenJokes } = this.splitBySeen(jokes)
      
      // 更新分类计数（只计算未看过）
      const cats = this.data.categories.map(c => ({
        ...c,
        count: c.name === '全部' 
          ? todayJokes.length 
          : todayJokes.filter(j => j.category === c.name).length
      }))
      
      this.setData({
        allJokes: jokes,
        todayJokes,
        seenJokes,
        filteredJokes: this.filterByCategory(jokes),
        categories: cats,
        loading: false
      })
      
      wx.setStorageSync('cachedJokes', jokes)
      
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      const { todayJokes, seenJokes } = this.splitBySeen(jokes)
      
      const cats = this.data.categories.map(c => ({
        ...c,
        count: c.name === '全部' 
          ? todayJokes.length 
          : todayJokes.filter(j => j.category === c.name).length
      }))
      
      this.setData({
        allJokes: jokes,
        todayJokes,
        seenJokes,
        filteredJokes: this.filterByCategory(jokes),
        categories: cats,
        loading: false
      })
    }
  },

  updateSeenStatus() {
    const jokes = this.processJokes(this.data.allJokes)
    const { todayJokes, seenJokes } = this.splitBySeen(jokes)
    
    const cats = this.data.categories.map(c => ({
      ...c,
      count: c.name === '全部' 
        ? todayJokes.length 
        : todayJokes.filter(j => j.category === c.name).length
    }))
    
    this.setData({
      allJokes: jokes,
      todayJokes,
      seenJokes,
      filteredJokes: this.filterByCategory(jokes),
      categories: cats
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
    const { todayJokes, seenJokes } = this.splitBySeen(filteredJokes)
    
    const cats = this.data.categories.map(c => ({
      ...c,
      count: c.name === '全部' 
        ? todayJokes.length 
        : todayJokes.filter(j => j.category === c.name).length
    }))
    
    this.setData({
      currentCategory: category,
      filteredJokes,
      todayJokes,
      seenJokes,
      categories: cats
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
    // 优先未看过的
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

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({ current: url, urls: [url] })
  },

  preventClose() {}
})
