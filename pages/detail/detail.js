// pages/detail/detail.js
const { getJokeById, jokes } = require('../../utils/jokes.js')

Page({
  data: {
    joke: null,
    moreJokes: [],
    liked: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    const joke = getJokeById(id)
    
    if (joke) {
      // 获取随机推荐（排除当前）
      const otherJokes = jokes.filter(j => j.id !== id)
      const shuffled = otherJokes.sort(() => Math.random() - 0.5)
      const moreJokes = shuffled.slice(0, 4)
      
      // 检查是否已收藏
      const favorites = wx.getStorageSync('favorites') || []
      const liked = favorites.includes(id)
      
      this.setData({
        joke,
        moreJokes,
        liked
      })
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: joke.title
      })
    }
  },

  toggleLike() {
    const favorites = wx.getStorageSync('favorites') || []
    const id = this.data.joke.id
    let newFavorites
    
    if (this.data.liked) {
      // 取消收藏
      newFavorites = favorites.filter(fid => fid !== id)
      wx.showToast({
        title: '已取消喜欢',
        icon: 'none',
        duration: 1500
      })
    } else {
      // 添加收藏
      newFavorites = [...favorites, id]
      wx.showToast({
        title: '已喜欢 ❤️',
        icon: 'none',
        duration: 1500
      })
    }
    
    wx.setStorageSync('favorites', newFavorites)
    this.setData({ liked: !this.data.liked })
  },

  shareJoke() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.redirectTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.joke.title} - 哇哇笑`,
      path: `/pages/detail/detail?id=${this.data.joke.id}`,
      imageUrl: '/images/share.png'
    }
  },

  onShareTimeline() {
    return {
      title: `${this.data.joke.title} - 哇哇笑`,
      query: `id=${this.data.joke.id}`,
      imageUrl: '/images/share.png'
    }
  }
})