const { api } = require('../../utils/api.js')

Page({
  data: {
    categories: [
      { name: '全部', icon: '🌟', count: 20 },
      { name: '职场', icon: '💼', count: 5 },
      { name: '生活', icon: '🌈', count: 6 },
      { name: '家庭', icon: '🏠', count: 5 },
      { name: '校园', icon: '📚', count: 4 }
    ],
    currentCategory: '全部',
    jokes: [],
    hotJokes: [],
    showModal: false,
    randomJoke: null,
    loading: true,
    stats: { total: 30, hotCount: 12 },
    favoritesCount: 0,
    page: 1,
    hasMore: true
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
    this.setData({ page: 1, hasMore: true })
    this.loadData()
    this.loadStats()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  async loadData() {
    this.setData({ loading: true })
    
    try {
      const jokesRes = await api.getJokes({ category: this.data.currentCategory, limit: 20 })
      const hotRes = await api.getHotJokes()
      
      this.setData({
        jokes: jokesRes.data.list,
        hotJokes: hotRes.data.slice(0, 5),
        loading: false,
        hasMore: jokesRes.data.list.length >= 20
      })
      
      wx.setStorageSync('cachedJokes', jokesRes.data.list)
      wx.setStorageSync('cachedHot', hotRes.data)
      
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
    this.setData({ currentCategory: category, page: 1, loading: true })
    await this.loadData()
  },

  refreshHot() {
    const hotJokes = this.data.hotJokes
    if (hotJokes.length > 0) {
      const shuffled = [...hotJokes].sort(() => Math.random() - 0.5)
      this.setData({ hotJokes: shuffled })
    }
    wx.showToast({ title: '换了一批~', icon: 'none' })
  },

  async loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({ page: this.data.page + 1, loading: true })
    
    try {
      const res = await api.getJokes({ category: this.data.currentCategory, page: this.data.page, limit: 20 })
      this.setData({
        jokes: [...this.data.jokes, ...res.data.list],
        loading: false,
        hasMore: res.data.list.length >= 20
      })
    } catch (err) {
      this.setData({ loading: false, hasMore: false })
    }
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
      this.setData({ showModal: true, randomJoke: res.data })
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
    return { title: '哇哇笑 - 每天开心一笑！', path: '/pages/index/index' }
  }
})
