const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

const CAT_COLORS = {
  '搞笑': '#f5576c',
  '弱智吧': '#667eea',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a',
  '职场': '#f093fb',
  '儿童': '#FF85A2',
  '经典': '#4ECDC4',
  '糗事': '#f093fb',
  '动物': '#43e97b',
}

Page({
  data: {
    pageClass: '',
    categories: [{ name: '全部', color: '#667eea', count: 0 }],
    currentCategory: '全部',
    allJokes: [],
    jokes: [],
    total: 0,
    page: 1,
    pageSize: 100,
    hasMore: true,
    loading: false,
    loadingMore: false,
    themeIcon: '🌙',
    sortDesc: true,
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
    this.setData({ page: 1, allJokes: [], hasMore: true })
    this.loadJokes()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  processJokes(jokes) {
    const seenIds = getSeenIds()
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      preview: j.content.split('\n')[0].substring(0, 40) + (j.content.length > 40 ? '...' : ''),
      hasSeen: seenIds.includes(j.id)
    }))
  },

  // 核心修复：使用API返回的分类统计（不是本地统计）
  buildCategories(categoryCounts, total) {
    const categories = [{ name: '全部', color: '#667eea', count: total }]
    
    if (categoryCounts) {
      categoryCounts.forEach(item => {
        categories.push({
          name: item.category,
          color: CAT_COLORS[item.category] || '#667eea',
          count: item.count
        })
      })
    }
    
    return categories
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: this.data.pageSize, page: 1 })
      const jokes = this.processJokes(res.data.list)
      const total = res.data.total || jokes.length
      
      // 关键修复：使用API返回的分类统计
      const categories = this.buildCategories(res.data.categoryCounts, total)
      
      wx.setStorageSync('cachedJokes', jokes)
      
      this.setData({
        allJokes: jokes,
        jokes: this.filterJokes(jokes, '全部'),
        categories,
        total,
        page: 1,
        hasMore: jokes.length < total,
        loading: false
      })
      
    } catch (err) {
      console.error('加载失败:', err)
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      this.setData({
        allJokes: jokes,
        jokes: this.filterJokes(jokes, '全部'),
        categories: [{ name: '全部', color: '#667eea', count: jokes.length }],
        total: jokes.length,
        loading: false
      })
    }
  },

  async loadMore() {
    if (!this.data.hasMore) return
    
    this.setData({ loadingMore: true })
    
    try {
      const nextPage = this.data.page + 1
      const res = await api.getJokes({ limit: this.data.pageSize, page: nextPage })
      const newJokes = this.processJokes(res.data.list)
      
      if (newJokes.length > 0) {
        const allJokes = [...this.data.allJokes, ...newJokes]
        this.setData({
          allJokes,
          jokes: this.filterJokes(allJokes, this.data.currentCategory),
          page: nextPage,
          hasMore: allJokes.length < this.data.total
        })
      } else {
        this.setData({ hasMore: false })
      }
      
      this.setData({ loadingMore: false })
      
    } catch (err) {
      this.setData({ loadingMore: false })
      console.error('加载更多失败:', err)
    }
  },

  updateSeenStatus() {
    if (this.data.allJokes.length === 0) return
    const jokes = this.processJokes(this.data.allJokes)
    this.setData({
      jokes: this.filterJokes(jokes, this.data.currentCategory)
    })
  },

  filterJokes(jokes, category) {
    let filtered = category === '全部' ? jokes : jokes.filter(j => j.category === category)
    
    if (this.data.sortDesc) {
      filtered = filtered.sort((a, b) => b.likes - a.likes)
    } else {
      filtered = filtered.sort((a, b) => a.likes - b.likes)
    }
    
    return filtered
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      jokes: this.filterJokes(this.data.allJokes, category)
    })
  },

  toggleSort() {
    const newSortDesc = !this.data.sortDesc
    this.setData({
      sortDesc: newSortDesc,
      jokes: this.filterJokes(this.data.allJokes, this.data.currentCategory)
    })
    wx.showToast({
      title: newSortDesc ? '点赞 ↓' : '点赞 ↑',
      icon: 'none',
      duration: 800
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
