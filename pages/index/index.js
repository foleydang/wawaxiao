const { api } = require('../../utils/api.js')

// 颜色配置（代替emoji）
const CATEGORY_COLORS = {
  '全部': { color: '#667eea', gradient: '#667eea, #764ba2' },
  '职场': { color: '#f093fb', gradient: '#f093fb, #f5576c' },
  '生活': { color: '#4facfe', gradient: '#4facfe, #00f2fe' },
  '家庭': { color: '#43e97b', gradient: '#43e97b, #38f9d7' },
  '校园': { color: '#fa709a', gradient: '#fa709a, #fee140' }
}

Page({
  data: {
    categories: [
      { name: '全部', count: 30, color: '#667eea' },
      { name: '职场', count: 8, color: '#f093fb' },
      { name: '生活', count: 9, color: '#4facfe' },
      { name: '家庭', count: 7, color: '#43e97b' },
      { name: '校园', count: 6, color: '#fa709a' }
    ],
    currentCategory: '全部',
    jokes: [],
    hotJokes: [],
    showModal: false,
    randomJoke: null,
    loading: true,
    stats: { total: 30, hotCount: 14 },
    favoritesCount: 0
  },

  onLoad() {
    this.loadData()
    this.loadStats()
    this.loadFavoritesCount()
  },

  onShow() {
    this.loadFavoritesCount()
  },

  onPullDownRefresh() {
    this.loadData()
    this.loadStats()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  // 给笑话添加颜色和预览
  processJokes(jokes) {
    return jokes.map(j => ({
      ...j,
      color: CATEGORY_COLORS[j.category]?.color || '#667eea',
      gradient: CATEGORY_COLORS[j.category]?.gradient || '#667eea, #764ba2',
      preview: j.content.length > 60 ? j.content.substring(0, 60) + '...' : j.content
    }))
  },

  async loadData() {
    this.setData({ loading: true })
    
    try {
      const jokesRes = await api.getJokes({ category: this.data.currentCategory, limit: 20 })
      const hotRes = await api.getHotJokes()
      
      const jokes = this.processJokes(jokesRes.data.list)
      const hotJokes = this.processJokes(hotRes.data).slice(0, 5)
      
      this.setData({
        jokes,
        hotJokes,
        loading: false
      })
      
      wx.setStorageSync('cachedJokes', jokes)
      wx.setStorageSync('cachedHot', hotJokes)
      
    } catch (err) {
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const cachedHot = wx.getStorageSync('cachedHot') || []
      
      this.setData({
        jokes: cachedJokes,
        hotJokes: cachedHot.slice(0, 5),
        loading: false
      })
    }
  },

  async loadStats() {
    try {
      const res = await api.getStats()
      this.setData({ stats: res.data })
    } catch (err) {}
  },

  loadFavoritesCount() {
    const favorites = wx.getStorageSync('favorites') || []
    this.setData({ favoritesCount: favorites.length })
  },

  async switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category, loading: true })
    await this.loadData()
  },

  refreshHot() {
    const hotJokes = this.data.hotJokes
    if (hotJokes.length > 0) {
      const shuffled = [...hotJokes].sort(() => Math.random() - 0.5)
      this.setData({ hotJokes: shuffled })
    }
    wx.showToast({ title: '已刷新', icon: 'none' })
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  showSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  async showRandomJoke() {
    try {
      const res = await api.getRandomJoke()
      const randomJoke = this.processJokes([res.data])[0]
      this.setData({ showModal: true, randomJoke })
    } catch (err) {
      const jokes = this.data.jokes
      if (jokes.length > 0) {
        const random = jokes[Math.floor(Math.random() * jokes.length)]
        this.setData({ showModal: true, randomJoke: random })
      }
    }
  },

  async getAnotherRandom() {
    await this.showRandomJoke()
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  preventClose() {},
  
  onShareAppMessage() {
    return { title: '哇哇笑', path: '/pages/index/index' }
  }
})
