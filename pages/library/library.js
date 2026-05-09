const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

// 分类颜色映射
const CAT_COLORS = {
  '搞笑': '#f5576c',
  '弱智吧': '#667eea',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a',
  '职场': '#f093fb',
  '儿童': '#FF85A2',
  '经典': '#4ECDC4',
  'B站热门': '#fa709a',
  '糗事': '#f093fb',
  '动物': '#43e97b',
}

// 不需要的分类（名言等非笑话）
const FILTER_CATEGORIES = ['名言', '名言警句', '励志', '语录', '诗词']

Page({
  data: {
    pageClass: '',
    categories: [{ name: '全部', color: '#667eea', count: 0 }],
    currentCategory: '全部',
    allJokes: [],      // 已加载的全部笑话
    jokes: [],         // 当前显示的笑话
    total: 0,          // 总数（从API获取）
    page: 1,           // 当前页码
    pageSize: 100,     // 每页条数
    hasMore: true,     // 是否还有更多
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

  // 滚动到底部加载更多
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
      hasImage: j.images && j.images.length > 0,
      hasSeen: seenIds.includes(j.id)
    }))
  },

  // 从数据中动态构建分类
  buildCategories(jokes, total) {
    const catCounts = {}
    jokes.forEach(j => {
      const cat = j.category
      if (!FILTER_CATEGORIES.includes(cat)) {
        catCounts[cat] = (catCounts[cat] || 0) + 1
      }
    })
    
    const categories = [{ name: '全部', color: '#667eea', count: total }]
    
    Object.keys(catCounts)
      .filter(cat => !FILTER_CATEGORIES.includes(cat))
      .sort((a, b) => catCounts[b] - catCounts[a])
      .slice(0, 10)
      .forEach(cat => {
        categories.push({
          name: cat,
          color: CAT_COLORS[cat] || '#667eea',
          count: catCounts[cat]
        })
      })
    
    return categories
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getJokes({ limit: this.data.pageSize, page: 1 })
      const jokes = this.processJokes(res.data.list)
      const total = res.data.total || jokes.length
      
      const categories = this.buildCategories(jokes, total)
      
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
      const categories = this.buildCategories(jokes, jokes.length)
      this.setData({
        allJokes: jokes,
        jokes: this.filterJokes(jokes, '全部'),
        categories,
        total: jokes.length,
        loading: false
      })
    }
  },

  // 加载更多
  async loadMore() {
    if (!this.data.hasMore) return
    
    this.setData({ loadingMore: true })
    
    try {
      const nextPage = this.data.page + 1
      const res = await api.getJokes({ limit: this.data.pageSize, page: nextPage })
      const newJokes = this.processJokes(res.data.list)
      
      if (newJokes.length > 0) {
        const allJokes = [...this.data.allJokes, ...newJokes]
        const categories = this.buildCategories(allJokes, this.data.total)
        
        this.setData({
          allJokes,
          jokes: this.filterJokes(allJokes, this.data.currentCategory),
          categories,
          page: nextPage,
          hasMore: allJokes.length < this.data.total,
          loadingMore: false
        })
      } else {
        this.setData({ hasMore: false, loadingMore: false })
      }
      
    } catch (err) {
      console.error('加载更多失败:', err)
      this.setData({ loadingMore: false })
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
    
    // 按点赞数排序
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
