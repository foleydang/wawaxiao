// pages/index/index.js
const { jokes: allJokes, categories, getJokes, getHotJokes, getRandomJoke } = require('../../utils/jokes.js')

Page({
  data: {
    categories: categories,
    currentCategory: '全部',
    jokes: [],
    hotJoke: null,
    showModal: false,
    randomJoke: null
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      })
    }, 500)
  },

  loadData() {
    const hotJokes = getHotJokes()
    const randomHot = hotJokes[Math.floor(Math.random() * hotJokes.length)]
    
    this.setData({
      jokes: getJokes('全部'),
      hotJoke: randomHot
    })
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      jokes: getJokes(category)
    })
  },

  refreshJokes() {
    // 换一批热门
    const hotJokes = getHotJokes()
    let randomHot = hotJokes[Math.floor(Math.random() * hotJokes.length)]
    
    // 避免重复
    while (randomHot.id === this.data.hotJoke.id && hotJokes.length > 1) {
      randomHot = hotJokes[Math.floor(Math.random() * hotJokes.length)]
    }
    
    this.setData({ hotJoke: randomHot })
    
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

  showRandomJoke() {
    const randomJoke = getRandomJoke()
    this.setData({
      showModal: true,
      randomJoke: randomJoke
    })
  },

  getAnotherRandom() {
    let randomJoke = getRandomJoke()
    while (randomJoke.id === this.data.randomJoke.id) {
      randomJoke = getRandomJoke()
    }
    this.setData({ randomJoke })
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