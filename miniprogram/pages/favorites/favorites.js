const { api } = require('../../utils/api.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')
const { getCategoryColor, generatePreview } = require('../../utils/format.js')
const app = getApp()

Page({
  data: {
    pageClass: '',
    favorites: [],
    themeIcon: '🌙',
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadFavorites()
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadFavorites()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async loadFavorites() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getFavorites(1, 50)
      const rawList = res.data.list || []
      const favorites = rawList.map(j => ({
        ...j,
        color: getCategoryColor(j.category),
        preview: generatePreview(j.content, j.title)
      }))

      // 成功路径同步写一份 cachedJokes，避免兜底分支依赖 library 页才能填充导致空列表
      const cached = wx.getStorageSync('cachedJokes') || []
      const cachedMap = new Map(cached.map(j => [j.id, j]))
      for (const j of rawList) cachedMap.set(j.id, j)
      wx.setStorageSync('cachedJokes', Array.from(cachedMap.values()))

      this.setData({
        favorites,
        page: 1,
        hasMore: (res.data.total || 0) > 50,
        loading: false
      })
    } catch (err) {
      // 后端失败时，使用本地缓存作为 fallback
      const likes = api.getLocalLikedJokes()
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const favorites = []
      
      for (const id of likes) {
        const joke = cachedJokes.find(j => j.id === id)
        if (joke) {
          favorites.push({
            ...joke,
            color: getCategoryColor(joke.category),
            preview: generatePreview(joke.content, joke.title)
          })
        }
      }
      
      this.setData({ favorites, loading: false })
    }
  },

  async loadMore() {
    if (!this.data.hasMore) return
    
    try {
      const nextPage = this.data.page + 1
      const res = await api.getFavorites(nextPage, 50)
      const newFavs = (res.data.list || []).map(j => ({
        ...j,
        color: getCategoryColor(j.category),
        preview: generatePreview(j.content, j.title)
      }))
      
      this.setData({
        favorites: [...this.data.favorites, ...newFavs],
        page: nextPage,
        hasMore: this.data.favorites.length + newFavs.length < (res.data.total || 0)
      })
    } catch (err) {
      console.error('加载更多失败:', err)
    }
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
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async deleteFavorite(e) {
    const id = e.currentTarget.dataset.id
    
    try {
      await api.removeFavorite(id)
      wx.showToast({ title: '已移除', icon: 'none' })
      this.loadFavorites()
    } catch (err) {
      wx.showToast({ title: '移除失败', icon: 'none' })
    }
  },

  goToIndex() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  // 备份收藏：收藏按本机 openid 存在服务端，复制设备号可在新设备恢复
  backupFavorites() {
    const openid = app.getOpenid()
    if (!openid) return wx.showToast({ title: '设备号未就绪', icon: 'none' })
    wx.setClipboardData({
      data: openid,
      success: () => wx.showToast({ title: '设备号已复制，换手机时用它恢复收藏', icon: 'none', duration: 3000 })
    })
  },

  // 换设备恢复：粘贴之前备份的设备号，重置 openid 后重新拉取服务端收藏
  restoreFavorites() {
    wx.showModal({
      title: '恢复收藏',
      content: '请粘贴你备份的设备号',
      editable: true,
      placeholderText: 'wx_xxx_xxx',
      success: (res) => {
        if (!res.confirm) return
        const code = (res.content || '').trim()
        if (!code) return wx.showToast({ title: '请输入设备号', icon: 'none' })
        wx.setStorageSync('wawaxiao_openid', code)
        wx.setStorageSync('openid', code)
        app.globalData.openid = code
        wx.showToast({ title: '已恢复，正在加载收藏', icon: 'success' })
        this.loadFavorites()
      }
    })
  }
})
