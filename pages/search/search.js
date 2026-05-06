const { api } = require('../../utils/api.js')

Page({
  data: {
    keyword: '',
    history: [],
    hotKeywords: ['程序员', '减肥', '妈妈', '老板', '加班', '外卖', '相亲', '考试'],
    results: [],
    hasSearch: false
  },

  onLoad() {
    this.loadHistory()
  },

  loadHistory() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ history })
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  clearKeyword() {
    this.setData({ keyword: '', hasSearch: false, results: [] })
  },

  async onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return
    
    // 保存搜索历史
    let history = wx.getStorageSync('searchHistory') || []
    history = history.filter(h => h !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    this.setData({ history })
    
    // 搜索
    wx.showLoading({ title: '搜索中...' })
    
    try {
      // 从缓存中搜索
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const results = cachedJokes.filter(j => {
        return j.title.includes(keyword) || j.content.includes(keyword)
      }).map(j => ({
        ...j,
        matchContent: this.getMatchContent(j.content, keyword)
      }))
      
      this.setData({ results, hasSearch: true })
      wx.hideLoading()
      
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '搜索失败', icon: 'none' })
    }
  },

  getMatchContent(content, keyword) {
    const index = content.indexOf(keyword)
    if (index === -1) return content.substring(0, 60) + '...'
    
    const start = Math.max(0, index - 20)
    const end = Math.min(content.length, index + keyword.length + 40)
    return content.substring(start, end) + (end < content.length ? '...' : '')
  },

  searchHistory(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.onSearch()
  },

  searchKeyword(e) {
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
  }
})
