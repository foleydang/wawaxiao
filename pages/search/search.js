const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    keyword: '',
    history: [],
    results: [],
    hasSearch: false
  },

  onLoad() {
    this.setData({ history: wx.getStorageSync('searchHistory') || [] })
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  clearKeyword() {
    this.setData({ keyword: '', hasSearch: false, results: [] })
  },

  onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return
    
    let history = wx.getStorageSync('searchHistory') || []
    history = [keyword, ...history.filter(h => h !== keyword)].slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    this.setData({ history })
    
    const cached = wx.getStorageSync('cachedJokes') || []
    const results = cached.filter(j => j.title.includes(keyword) || j.content.includes(keyword)).map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      matchContent: j.content.substring(0, 50)
    }))
    
    this.setData({ results, hasSearch: true })
  },

  searchHistory(e) {
    this.setData({ keyword: e.currentTarget.dataset.keyword })
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
