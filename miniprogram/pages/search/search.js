const { api } = require('../../utils/api')

Page({
  data: {
    history: [],  // 搜索历史
    hotKeywords: ['搞笑', '校园', '职场', '生活', '家庭', '动物'],
    keyword: '',
    results: null,
    searchedKeyword: '',
    loading: false,
    themeIcon: '🌙',
    pageClass: ''
  },

  onLoad() {
    this.loadHistory()
    this.initTheme()
  },

  initTheme() {
    const theme = wx.getStorageSync('theme') || 'dark'
    this.setData({
      pageClass: theme === 'light' ? 'light-mode' : '',
      themeIcon: theme === 'dark' ? '🌙' : '☀️'
    })
  },

  loadHistory() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ history })
  },

  saveHistory(keyword) {
    const history = wx.getStorageSync('searchHistory') || []
    const newHistory = [keyword, ...history.filter(k => k !== keyword)].slice(0, 10)
    wx.setStorageSync('searchHistory', newHistory)
    this.setData({ history: newHistory })
  },

  clearHistory() {
    wx.removeStorageSync('searchHistory')
    this.setData({ history: [] })
    wx.showToast({ title: '已清除', icon: 'success' })
  },

  handleInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  handleSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      wx.showToast({ title: '请输入关键词', icon: 'none' })
      return
    }
    
    this.saveHistory(keyword)
    this.search(keyword)
  },

  searchHotKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.saveHistory(keyword)
    this.search(keyword)
  },

  searchHistoryKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.search(keyword)
  },

  async search(keyword) {
    this.setData({ loading: true })
    
    try {
      // 服务端搜索全部笑话
      const res = await api.searchJokes(keyword)
      const results = res.data || []

      this.setData({
        results,
        searchedKeyword: keyword,
        loading: false
      })

      if (results.length > 0) {
        wx.showToast({ title: `找到${results.length}条笑话`, icon: 'success' })
      }
      // 无结果时不弹 toast，让空状态大块引导（热词+历史）接管

    } catch (err) {
      wx.showToast({ title: '搜索失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  toggleTheme() {
    const current = wx.getStorageSync('theme') || 'dark'
    const newTheme = current === 'dark' ? 'light' : 'dark'
    wx.setStorageSync('theme', newTheme)
    
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: newTheme === 'dark' ? '🌙' : '☀️'
    })
  }
})