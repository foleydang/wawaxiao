const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

// 分类颜色映射
const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a',
  '弱智吧': '#667eea',
  '经典': '#4ECDC4',
  '程序员': '#f5576c',
  '英文翻译': '#FF85A2',
  'B站热门': '#fa709a',
  '微博热搜': '#f093fb',
  '知乎热榜': '#667eea',
  '贴吧热门': '#43e97b',
  '网络笑话': '#4facfe',
  '翻译笑话': '#FF85A2',
}

// 不需要的分类（名言、励志等不是笑话）
const FILTER_CATEGORIES = ['名言', '名言警句', '励志', '语录', '诗词']

Page({
  data: {
    pageClass: '',
    categories: [{ name: '全部', color: '#667eea', count: 0 }],
    currentCategory: '全部',
    allJokes: [],
    jokes: [],
    loading: true,
    themeIcon: '🌙',
    sortDesc: true,  // true: 从高到低, false: 从低到高
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

  // 从数据中动态获取分类
  buildCategories(jokes) {
    // 统计各分类数量
    const catCounts = {}
    jokes.forEach(j => {
      const cat = j.category
      // 过滤掉不需要的分类
      if (!FILTER_CATEGORIES.includes(cat)) {
        catCounts[cat] = (catCounts[cat] || 0) + 1
      }
    })
    
    // 转换为分类列表
    const categories = [{ name: '全部', color: '#667eea', count: jokes.length }]
    
    Object.keys(catCounts)
      .filter(cat => !FILTER_CATEGORIES.includes(cat))
      .sort((a, b) => catCounts[b] - catCounts[a])  // 按数量排序
      .forEach(cat => {
        categories.push({
          name: cat,
          color: CAT_COLORS[cat] || '#667eea',
          count: catCounts[cat]
        })
      })
    
    return categories.slice(0, 10)  // 最多显示10个分类
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      // 加载全部笑话
      const res = await api.getJokes({ limit: 500 })
      const jokes = this.processJokes(res.data.list)
      
      // 动态构建分类
      const categories = this.buildCategories(jokes)
      
      wx.setStorageSync('cachedJokes', jokes)
      
      this.setData({
        allJokes: jokes,
        jokes: this.filterJokes(jokes, '全部'),
        categories,
        loading: false
      })
      
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      const categories = this.buildCategories(jokes)
      this.setData({
        allJokes: jokes,
        jokes: this.filterJokes(jokes, '全部'),
        categories,
        loading: false
      })
    }
  },

  updateSeenStatus() {
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

  // 切换排序方向
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
