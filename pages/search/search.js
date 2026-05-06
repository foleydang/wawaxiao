const { api } = require('../../utils/api.js')
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

  processJokes(jokes) {
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      preview: j.content.split('\n')[0].substring(0, 40)
    }))
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  async onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return
    
    // 保存搜索历史
    let history = wx.getStorageSync('searchHistory') || []
    if (!history.includes(keyword)) {
      history.unshift(keyword)
      history = history.slice(0, 10)
      wx.setStorageSync('searchHistory', history)
      this.setData({ history })
    }
    
    // 搜索笑话（本地搜索）
    const allJokes = wx.getStorageSync('cachedJokes') || []
    const results = allJokes
      .filter(j => 
        j.title.toLowerCase().includes(keyword.toLowerCase()) ||
        j.content.toLowerCase().includes(keyword.toLowerCase())
      )
      .map(j => ({
        ...j,
        color: CAT_COLORS[j.category] || '#667eea',
        preview: j.content.split('\n')[0].substring(0, 40)
      }))
    
    this.setData({ results, searched: true })
  },

  clearInput() {
    this.setData({ keyword: '', results: [], searched: false })
  },

  clearHistory() {
    wx.setStorageSync('searchHistory', [])
    this.setData({ history: [] })
    wx.showToast({ title: '已清空', icon: 'none' })
  },

  searchHistory(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.onSearch()
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goBack() {
    wx.navigateBack()
  }
})
