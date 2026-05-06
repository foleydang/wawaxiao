const { api } = require('../../utils/api.js')

// 分类颜色
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
    todayJokes: [],   // 未看过的笑话
    seenJokes: [],    // 已看过的笑话
    filteredJokes: [], // 当前筛选显示的
    showModal: false,
    randomJoke: null,
    loading: true,
    showSeen: false   // 是否展开"再看一次"
  },

  onLoad() {
    this.loadJokes()
  },

  onShow() {
    this.updateSeenStatus()
  },

  onPullDownRefresh() {
    this.loadJokes()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  // 处理笑话数据
  processJokes(jokes) {
    const seenIds = wx.getStorageSync('seenJokes') || []
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      preview: j.content.length > 50 ? j.content.substring(0, 50) + '...' : j.content,
      hasSeen: seenIds.includes(j.id)
    }))
  },

  // 分类：未看过 vs 已看过
  categorizeJokes(jokes) {
    const seenIds = wx.getStorageSync('seenJokes') || []
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
        loading: false
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
        loading: false
      })
    }
  },

  // 更新已看过状态
  updateSeenStatus() {
    const jokes = this.processJokes(this.data.allJokes)
    const { todayJokes, seenJokes } = this.categorizeJokes(jokes)
    
    this.setData({
      allJokes: jokes,
      todayJokes,
      seenJokes,
      filteredJokes: this.filterByCategory(jokes)
    })
  },

  // 按分类筛选
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

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    // 记录已看过
    this.markAsSeen(id)
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  // 标记为已看过
  markAsSeen(id) {
    let seen = wx.getStorageSync('seenJokes') || []
    if (!seen.includes(id)) {
      seen = [id, ...seen].slice(0, 100) // 最多保留100条
      wx.setStorageSync('seenJokes', seen)
    }
  },

  // 随机笑话（优先未看过）
  showRandom() {
    const unseen = this.data.todayJokes
    const pool = unseen.length > 0 ? unseen : this.data.allJokes
    
    if (pool.length === 0) return
    
    const randomJoke = pool[Math.floor(Math.random() * pool.length)]
    this.markAsSeen(randomJoke.id)
    
    this.setData({
      showModal: true,
      randomJoke
    })
  },

  hideModal() {
    this.setData({ showModal: false })
    this.updateSeenStatus()
  },

  preventClose() {}
})
