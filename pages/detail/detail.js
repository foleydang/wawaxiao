const { api } = require('../../utils/api.js')
const { markSeen, hasSeen } = require('../../utils/seen.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    joke: { color: '#667eea', likes: 0, dislikes: 0, shares: 0 },
    moreJokes: [],
    liked: false,
    disliked: false
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadJoke(id)
    this.checkUserStatus(id)
    this.startTime = Date.now()
  },

  onUnload() {
    const time = Math.round((Date.now() - this.startTime) / 1000)
    if (time >= 3 && this.data.joke.id) {
      markSeen(this.data.joke.id)
    }
  },

  processJoke(j) {
    return {
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      likes: j.likes || 0,
      dislikes: j.dislikes || 0,
      shares: j.shares || 0
    }
  },

  async loadJoke(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = this.processJoke(res.data)
      
      const cached = wx.getStorageSync('cachedJokes') || []
      const more = cached.filter(j => j.id !== id).slice(0, 4).map(this.processJoke)
      
      this.setData({ joke, moreJokes: more })
    } catch (err) {
      const cached = wx.getStorageSync('cachedJokes') || []
      const joke = cached.find(j => j.id === id)
      if (joke) {
        const more = cached.filter(j => j.id !== id).slice(0, 4).map(this.processJoke)
        this.setData({ joke: this.processJoke(joke), moreJokes: more })
      }
    }
  },

  checkUserStatus(id) {
    const userId = this.getUserId()
    const likes = wx.getStorageSync(`likes_${userId}`) || []
    const dislikes = wx.getStorageSync(`dislikes_${userId}`) || []
    
    this.setData({
      liked: likes.includes(id),
      disliked: dislikes.includes(id)
    })
  },

  getUserId() {
    let userId = wx.getStorageSync('userId')
    if (!userId) {
      userId = 'user_' + Date.now()
      wx.setStorageSync('userId', userId)
    }
    return userId
  },

  async toggleLike() {
    const id = this.data.joke.id
    const userId = this.getUserId()
    
    let likes = wx.getStorageSync(`likes_${userId}`) || []
    let dislikes = wx.getStorageSync(`dislikes_${userId}`) || []
    
    // 如果已不喜欢，先取消
    if (dislikes.includes(id)) {
      dislikes = dislikes.filter(d => d !== id)
      wx.setStorageSync(`dislikes_${userId}`, dislikes)
      this.setData({ disliked: false })
    }
    
    // 更新本地状态
    const wasLiked = this.data.liked
    if (wasLiked) {
      likes = likes.filter(l => l !== id)
    } else {
      likes = [...likes, id]
    }
    wx.setStorageSync(`likes_${userId}`, likes)
    
    // 更新页面显示的数字
    const joke = this.data.joke
    joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
    
    this.setData({
      liked: !wasLiked,
      joke
    })
    
    // 同步到服务器
    try {
      await api.toggleLike(id, !wasLiked)
    } catch (err) {}
    
    wx.showToast({ title: wasLiked ? '已取消' : '已喜欢', icon: 'none', duration: 1000 })
  },

  async toggleDislike() {
    const id = this.data.joke.id
    const userId = this.getUserId()
    
    let likes = wx.getStorageSync(`likes_${userId}`) || []
    let dislikes = wx.getStorageSync(`dislikes_${userId}`) || []
    
    // 如果已喜欢，先取消
    if (likes.includes(id)) {
      likes = likes.filter(l => l !== id)
      wx.setStorageSync(`likes_${userId}`, likes)
      this.setData({ liked: false })
    }
    
    // 更新本地状态
    const wasDisliked = this.data.disliked
    if (wasDisliked) {
      dislikes = dislikes.filter(d => d !== id)
    } else {
      dislikes = [...dislikes, id]
    }
    wx.setStorageSync(`dislikes_${userId}`, dislikes)
    
    // 更新页面显示的数字
    const joke = this.data.joke
    joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
    
    this.setData({
      disliked: !wasDisliked,
      joke
    })
    
    // 同步到服务器
    try {
      await api.toggleDislike(id, !wasDisliked)
    } catch (err) {}
    
    wx.showToast({ title: wasDisliked ? '已取消' : '已不喜欢', icon: 'none', duration: 1000 })
  },

  async shareJoke() {
    // 增加分享次数
    const joke = this.data.joke
    joke.shares += 1
    this.setData({ joke })
    
    // 同步到服务器
    try {
      await api.incrementShare(joke.id)
    } catch (err) {}
    
    wx.showShareMenu({ menus: ['shareAppMessage'] })
  },

  goBack() { wx.navigateBack() },

  goToDetail(e) {
    wx.redirectTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.joke.title,
      path: `/pages/detail/detail?id=${this.data.joke.id}`,
      imageUrl: '/images/share.png'
    }
  }
})
