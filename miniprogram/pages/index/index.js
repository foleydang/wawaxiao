const { api } = require('../../utils/api')
const { formatJokes } = require('../../utils/format')

Page({
  data: {
    loading: true,
    loadError: false,
    favorited: false,
    jokes: [],
    currentJoke: null,
    hotJokes: [],
    todayNewCount: 0,
    freshCount: 0,
    totalCount: 0,  // 新增：总数量
    themeIcon: '🌙',
    pageClass: '',
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadData()
    this.initTheme()
  },

  initTheme() {
    const theme = wx.getStorageSync('theme') || 'dark'
    this.setData({
      pageClass: theme === 'light' ? 'light-mode' : '',
      themeIcon: theme === 'dark' ? '🌙' : '☀️'
    })
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功', icon: 'success', duration: 1000 })
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      
      const res = await api.getJokes({ limit: 20, page: 1 })
      const jokes = formatJokes(res.data.list)

      const hotRes = await api.getHotJokes()
      const hotJokes = formatJokes(hotRes.data || [])
      
      const stats = await api.getStats()
      const totalCount = stats.data.total || jokes.length
      
      // 计算未读数量（基于总数，不是当前加载的20条）
      const readIds = api.getReadJokes()
      const freshCount = totalCount - readIds.length
      
      const lastVisit = api.getLastVisitDate()
      const todayNewCount = (lastVisit && stats.data.latestDate > lastVisit) ? stats.data.todayCount : 0
      
      api.setLastVisitDate(stats.data.latestDate)
      
      this.setData({
        jokes,
        currentJoke: jokes[0] || null,
        hotJokes,
        freshCount: Math.max(0, freshCount),
        totalCount,
        todayNewCount,
        loading: false,
        loadError: false,
        hasMore: jokes.length === 20,
        favorited: jokes[0] ? api.getLocalLikedJokes().includes(jokes[0].id) : false
      })

      if (jokes[0]) {
        api.markAsRead(jokes[0].id)
      }

    } catch (err) {
      console.error('加载失败:', err)
      this.setData({ loading: false, loadError: true })
    }
  },

  async loadMore() {
    if (!this.data.hasMore) return
    
    try {
      wx.showLoading({ title: '加载中...' })
      
      const nextPage = this.data.page + 1
      const res = await api.getJokes({ limit: 20, page: nextPage })
      const newJokes = formatJokes(res.data.list)
      
      if (newJokes.length > 0) {
        this.setData({
          jokes: [...this.data.jokes, ...newJokes],
          page: nextPage,
          hasMore: newJokes.length === 20
        })
      } else {
        this.setData({ hasMore: false })
      }
      
      wx.hideLoading()
      
    } catch (err) {
      wx.hideLoading()
      console.error('加载更多失败:', err)
    }
  },

  // 核心修复：nextJoke 优先取未读的笑话；已加载的全读过且还有更多页时静默拉下一页
  async nextJoke() {
    let jokes = this.data.jokes
    if (!jokes || jokes.length === 0) return

    let readIds = api.getReadJokes()
    let unreadJokes = jokes.filter(j => !readIds.includes(j.id))

    // 已加载的全读过了，且还有更多页 → 静默拉取下一页再从未读里取
    if (unreadJokes.length === 0 && this.data.hasMore && !this.data.loading) {
      this.setData({ loading: true })
      try {
        const nextPage = this.data.page + 1
        const res = await api.getJokes({ limit: 20, page: nextPage })
        const newJokes = formatJokes(res.data.list)
        if (newJokes.length > 0) {
          this.setData({
            jokes: [...this.data.jokes, ...newJokes],
            page: nextPage,
            hasMore: newJokes.length === 20
          })
        } else {
          this.setData({ hasMore: false })
        }
      } catch (err) {
        console.error('nextJoke 加载更多失败:', err)
      } finally {
        this.setData({ loading: false })
      }
      jokes = this.data.jokes
      readIds = api.getReadJokes()
      unreadJokes = jokes.filter(j => !readIds.includes(j.id))
    }

    let nextJoke
    if (unreadJokes.length > 0) {
      // 按"踩数"升序排序，偏向少踩的分类（👎 过的同类往后排）
      const w = wx.getStorageSync('dislikedCats') || {}
      const sorted = [...unreadJokes].sort((a, b) => (w[a.category] || 0) - (w[b.category] || 0))
      // 从踩数最低的前 5 条里随机取，避免完全固定
      const pool = sorted.slice(0, Math.min(5, sorted.length))
      const randomIndex = Math.floor(Math.random() * pool.length)
      nextJoke = pool[randomIndex]
    } else {
      // 全部都读过了（已无更多页），随机循环
      const currentIndex = jokes.findIndex(j => j.id === this.data.currentJoke?.id)
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * jokes.length)
      } while (nextIndex === currentIndex && jokes.length > 1)
      nextJoke = jokes[nextIndex]
    }

    this.setData({ currentJoke: nextJoke })
    api.markAsRead(nextJoke.id)

    // 更新未读数量（基于总数）+ 当前笑话的收藏态
    const newReadIds = api.getReadJokes()
    const freshCount = this.data.totalCount - newReadIds.length
    this.setData({ freshCount: Math.max(0, freshCount), favorited: api.getLocalLikedJokes().includes(nextJoke.id) })
  },

  async toggleFavorite() {
    if (!this.data.currentJoke) return
    const id = this.data.currentJoke.id
    try {
      if (this.data.favorited) {
        await api.removeFavorite(id)
      } else {
        await api.addFavorite(id)
      }
      this.setData({ favorited: !this.data.favorited })
      wx.showToast({ title: this.data.favorited ? '已收藏' : '已取消收藏', icon: 'none', duration: 800 })
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleLike() {
    if (!this.data.currentJoke) return
    
    try {
      const res = await api.like(this.data.currentJoke.id)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      
      this.setData({ currentJoke: joke })
      
      wx.showToast({
        title: '❤️ 喜欢+1',
        icon: 'none',
        duration: 800
      })
      
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleNeutral() {
    if (!this.data.currentJoke) return
    
    try {
      const res = await api.neutral(this.data.currentJoke.id)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes
      
      this.setData({ currentJoke: joke })
      
      wx.showToast({
        title: '😐 平+1',
        icon: 'none',
        duration: 800
      })
      
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleDislike() {
    if (!this.data.currentJoke) return

    try {
      const res = await api.dislike(this.data.currentJoke.id)
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.neutrals = res.data.neutrals
      joke.dislikes = res.data.dislikes

      // 👎 记录该分类踩数，后续 nextJoke 降权少推同类
      const cat = joke.category
      if (cat) {
        const w = wx.getStorageSync('dislikedCats') || {}
        w[cat] = (w[cat] || 0) + 1
        wx.setStorageSync('dislikedCats', w)
      }

      this.setData({ currentJoke: joke })

      wx.showToast({
        title: '👎 不喜欢+1',
        icon: 'none',
        duration: 800
      })

    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goToSubmit() {
    wx.navigateTo({ url: '/pages/submit/submit' })
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({ current: url, urls: urls || [url] })
  },

  toggleTheme() {
    const current = wx.getStorageSync('theme') || 'dark'
    const newTheme = current === 'dark' ? 'light' : 'dark'
    wx.setStorageSync('theme', newTheme)
    
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: newTheme === 'dark' ? '🌙' : '☀️'
    })
  },

  onShareAppMessage() {
    if (!this.data.currentJoke) return
    return {
      title: '哇哇笑｜' + this.data.currentJoke.title,
      path: `/pages/detail/detail?id=${this.data.currentJoke.id}`
    }
  },

  onShareTimeline() {
    if (!this.data.currentJoke) return {}
    return {
      title: '哇哇笑｜' + this.data.currentJoke.title,
      query: 'id=' + this.data.currentJoke.id
    }
  }
})
