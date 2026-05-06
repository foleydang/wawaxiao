// pages/detail/detail.js
const { api } = require('../../utils/api.js')

Page({
  data: {
    joke: null,
    moreJokes: [],
    liked: false,
    likeLoading: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadJoke(id)
    this.checkLikeStatus(id)
  },

  async loadJoke(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = res.data
      
      // 获取更多推荐（从缓存中随机选）
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const otherJokes = cachedJokes.filter(j => j.id !== id)
      const shuffled = otherJokes.sort(() => Math.random() - 0.5)
      const moreJokes = shuffled.slice(0, 4)
      
      this.setData({
        joke,
        moreJokes
      })
      
      wx.setNavigationBarTitle({
        title: joke.title
      })
      
    } catch (err) {
      // 使用缓存数据
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const joke = cachedJokes.find(j => j.id === id)
      
      if (joke) {
        const otherJokes = cachedJokes.filter(j => j.id !== id)
        const shuffled = otherJokes.sort(() => Math.random() - 0.5)
        const moreJokes = shuffled.slice(0, 4)
        
        this.setData({
          joke,
          moreJokes
        })
        
        wx.setNavigationBarTitle({
          title: joke.title
        })
      } else {
        wx.showToast({ title: '笑话加载失败', icon: 'none' })
      }
    }
  },

  checkLikeStatus(id) {
    // 检查本地收藏状态
    const favorites = wx.getStorageSync('favorites') || []
    const liked = favorites.includes(id)
    this.setData({ liked })
  },

  async toggleLike() {
    if (this.data.likeLoading) return
    this.setData({ likeLoading: true })
    
    const favorites = wx.getStorageSync('favorites') || []
    const id = this.data.joke.id
    
    try {
      // 调用API点赞
      const res = await api.toggleLike(id)
      
      // 更新笑话的点赞数
      const joke = this.data.joke
      joke.likes = res.data.likes
      
      // 更新本地收藏
      let newFavorites
      if (this.data.liked) {
        newFavorites = favorites.filter(fid => fid !== id)
        wx.showToast({ title: '已取消喜欢', icon: 'none', duration: 1500 })
      } else {
        newFavorites = [...favorites, id]
        wx.showToast({ title: '已喜欢 ❤️', icon: 'none', duration: 1500 })
      }
      
      wx.setStorageSync('favorites', newFavorites)
      
      // 更新缓存中的笑话数据
      const cachedJokes = wx.getStorageSync('cachedJokes') || []
      const cachedIndex = cachedJokes.findIndex(j => j.id === id)
      if (cachedIndex >= 0) {
        cachedJokes[cachedIndex].likes = joke.likes
        wx.setStorageSync('cachedJokes', cachedJokes)
      }
      
      this.setData({
        liked: !this.data.liked,
        joke,
        likeLoading: false
      })
      
    } catch (err) {
      // 网络失败，只更新本地收藏
      let newFavorites
      if (this.data.liked) {
        newFavorites = favorites.filter(fid => fid !== id)
        wx.showToast({ title: '已取消收藏', icon: 'none', duration: 1500 })
      } else {
        newFavorites = [...favorites, id]
        wx.showToast({ title: '已收藏 ❤️', icon: 'none', duration: 1500 })
      }
      
      wx.setStorageSync('favorites', newFavorites)
      this.setData({
        liked: !this.data.liked,
        likeLoading: false
      })
    }
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
