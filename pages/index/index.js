// pages/index/index.js
const { api } = require('../../utils/api.js')

Page({
  data: {
    categories: [{ name: '全部', icon: '🌟' }, { name: '职场', icon: '💼' }, { name: '生活', icon: '🌈' }, { name: '家庭', icon: '🏠' }, { name: '校园', icon: '📚' }],
    currentCategory: '全部',
    jokes: [],
    hotJoke: null,
    showModal: false,
    randomJoke: null,
    loading: true,
    stats: null
  },

  onLoad() {
    this.loadData()
    this.loadStats()
  },

  onPullDownRefresh() {
    this.loadData()
    this.loadStats()
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      })
    }, 500)
  },

  async loadData() {
    this.setData({ loading: true })
    
    try {
      // 加载笑话列表
      const jokesRes = await api.getJokes({ category: this.data.currentCategory, limit: 50 })
      
      // 加载热门笑话
      const hotRes = await api.getHotJokes()
      const randomHot = hotRes.data[Math.floor(Math.random() * hotRes.data.length)]
      
      this.setData({
        jokes: jokesRes.data.list,
        hotJoke: randomHot,
        loading: false
      })
      
      // 缓存数据
      wx.setStorageSync('cachedJokes', jokesRes.data.list)
      wx.setStorageSync('cachedHot', hotRes.data)
      
    } catch (err) {
      console.log('加载失败，使用缓存数据:', err)
      
      // 尽量使用缓存数据
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const cachedHot = wx.getStorageSync('cachedHot') || []
      const randomHot = cachedHot.length > 0 ? cachedHot[Math.floor(Math.random() * cachedHot.length)] : null
      
      this.setData({
        jokes: cachedJokes,
        hotJoke: randomHot || cachedJokes[0],
        loading: false
      })
      
      if (cachedJokes.length === 0) {
        wx.showToast({
          title: '网络加载失败',
          icon: 'none'
        })
      }
    }
  },

  async loadStats() {
    try {
      const res = await api.getStats()
      this.setData({ stats: res.data })
    } catch (err) {
      console.log('统计加载失败:', err)
    }
  },

  async switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category, loading: true })
    
    try {
      const res = await api.getJokes({ category, limit: 50 })
      this.setData({
        jokes: res.data.list,
        loading: false
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  refreshJokes() {
    // 刷新热门
    const hotJokes = wx.getStorageSync('cachedHot') || this.data.jokes.filter(j => j.isHot)
    if (hotJokes.length > 0) {
      let randomHot = hotJokes[Math.floor(Math.random() * hotJokes.length)]
      while (randomHot.id === this.data.hotJoke?.id && hotJokes.length > 1) {
        randomHot = hotJokes[Math.floor(Math.random() * hotJokes.length)]
      }
      this.setData({ hotJoke: randomHot })
    }
    
    wx.showToast({
      title: '换了一个~',
      icon: 'none',
      duration: 1000
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  async showRandomJoke() {
    try {
      const res = await api.getRandomJoke()
      this.setData({
        showModal: true,
        randomJoke: res.data
      })
    } catch (err) {
      wx.showToast({ title: '获取失败', icon: 'none' })
    }
  },

  async getAnotherRandom() {
    try {
      const res = await api.getRandomJoke()
      this.setData({ randomJoke: res.data })
    } catch (err) {
      // 使用本地数据
      const jokes = this.data.jokes
      if (jokes.length > 0) {
        let random = jokes[Math.floor(Math.random() * jokes.length)]
        while (random.id === this.data.randomJoke?.id && jokes.length > 1) {
          random = jokes[Math.floor(Math.random() * jokes.length)]
        }
        this.setData({ randomJoke: random })
      }
    }
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  preventClose() {
    // 阻止事件冒泡
  },

  onShareAppMessage() {
    return {
      title: '哇哇笑 - 每天开心一笑！',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  },

  onShareTimeline() {
    return {
      title: '哇哇笑 - 每天开心一笑！',
      query: '',
      imageUrl: '/images/share.png'
    }
  }
})
