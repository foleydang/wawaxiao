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
    keyword: '',
    results: [],
    history: [],
    searched: false,
    themeIcon: '🌙'
  },

  onLoad() {
    initTheme()
    
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon(),
      history: wx.getStorageSync('searchHistory') || []
    })
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
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

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return
    
    // 保存历史
    let history = wx.getStorageSync('searchHistory') || []
    history = [keyword, ...history.filter(h => h !== keyword)].slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    
    // 搜索
    const cached = wx.getStorageSync('cachedJokes') || []
    const results = cached
      .filter(j => 
        j.title.toLowerCase().includes(keyword.toLowerCase()) ||
        j.content.toLowerCase().includes(keyword.toLowerCase()) ||
        j.category.toLowerCase().includes(keyword.toLowerCase())
      )
      .map(j => ({
        ...j,
        color: CAT_COLORS[j.category] || '#667eea',
        preview: j.content.split('\n')[0].substring(0, 35),
        hasImage: j.images && j.images.length > 0
      }))
    
    this.setData({ 
      results, 
      searched: true, 
      history 
    })
  },

  clearInput() {
    this.setData({ keyword: '', results: [], searched: false })
  },

  searchHistory(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.onSearch()
  },

  clearHistory() {
    wx.setStorageSync('searchHistory', [])
    this.setData({ history: [] })
    wx.showToast({ title: '已清空', icon: 'none' })
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  goBack() {
    wx.navigateBack()
  }
})
