const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')
const { getCategoryColor, generatePreview } = require('../../utils/format.js')

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
    sortMode: 'desc',  // desc(点赞降序) | asc(点赞升序) | latest(最新)
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
    this.loadJokes().finally(() => wx.stopPullDownRefresh())
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
      color: getCategoryColor(j.category),
      preview: generatePreview(j.content, j.title),
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
          color: getCategoryColor(item.category),
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
    let filtered = category === '全部' ? [...jokes] : jokes.filter(j => j.category === category)

    if (this.data.sortMode === 'desc') {
      filtered = filtered.sort((a, b) => b.likes - a.likes)
    } else if (this.data.sortMode === 'asc') {
      filtered = filtered.sort((a, b) => a.likes - b.likes)
    } else {
      // 最新：按 id 降序（id 递增，越大越新）
      filtered = filtered.sort((a, b) => Number(b.id) - Number(a.id))
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
    const order = ['desc', 'asc', 'latest']
    const cur = order.indexOf(this.data.sortMode)
    const newMode = order[(cur + 1) % order.length]
    this.setData({
      sortMode: newMode,
      jokes: this.filterJokes(this.data.allJokes, this.data.currentCategory)
    })
    wx.showToast({
      title: newMode === 'desc' ? '点赞 ↓' : newMode === 'asc' ? '点赞 ↑' : '最新',
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
