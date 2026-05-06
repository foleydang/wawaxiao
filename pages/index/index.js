const { api } = require('../../utils/api.js')
const { markSeen, getSeenIds } = require('../../utils/seen.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    pageClass: '',
    currentJoke: null,
    allJokes: [],
    freshJokes: [],
    hotJokes: [],
    freshCount: 0,
    liked: false,
    disliked: false,
    loading: true,
    themeIcon: '🌙'
  },

  onLoad() {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJokes()
  },

  onShow() {
    // 每次显示都重新加载最新数据
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJokes()  // 关键修改：每次onShow都刷新数据
  },

  processJokes(jokes) {
    return jokes.map(j => ({
      ...j,
      color: CAT_COLORS[j.category] || '#667eea',
      hasImage: j.images && j.images.length > 0,
      images: j.images || []
    }))
  },

  async loadJokes() {
    this.setData({ loading: true })
    
    try {
      // 从API获取最新数据（包含真实的likes/dislikes/shares）
      const res = await api.getJokes({ limit: 100 })
      const jokes = this.processJokes(res.data.list || res.data)
      
      // 更新缓存
      wx.setStorageSync('cachedJokes', jokes)
      
      this.updateData(jokes)
      this.setData({ loading: false })
      
    } catch (err) {
      console.log('API加载失败，使用缓存:', err)
      const cached = wx.getStorageSync('cachedJokes') || []
      const jokes = this.processJokes(cached)
      this.updateData(jokes)
      this.setData({ loading: false })
    }
  },

  updateData(jokes) {
    if (!jokes || jokes.length === 0) return
    
    const seenIds = getSeenIds()
    const freshJokes = jokes.filter(j => !seenIds.includes(j.id))
    
    // 热门推荐：优先显示有likes的笑话
    let hotJokes
    const likedJokes = jokes.filter(j => j.likes > 0)
    if (likedJokes.length >= 4) {
      hotJokes = likedJokes.sort((a, b) => b.likes - a.likes).slice(0, 4)
    } else if (likedJokes.length > 0) {
      const randomOthers = jokes.filter(j => j.likes === 0)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4 - likedJokes.length)
      hotJokes = [...likedJokes.sort((a, b) => b.likes - a.likes), ...randomOthers]
    } else {
      hotJokes = jokes.sort(() => Math.random() - 0.5).slice(0, 4)
    }
    
    // 当前笑话：优先显示未看过的
    let currentJoke = null
    if (this.data.currentJoke) {
      // 保持当前笑话，但更新数据
      const updated = jokes.find(j => j.id === this.data.currentJoke.id)
      if (updated) {
        currentJoke = updated
      }
    }
    
    if (!currentJoke && freshJokes.length > 0) {
      currentJoke = freshJokes[0]
    } else if (!currentJoke && jokes.length > 0) {
      currentJoke = jokes[Math.floor(Math.random() * jokes.length)]
    }
    
    this.setData({
      allJokes: jokes,
      freshJokes,
      hotJokes,
      freshCount: freshJokes.length,
      currentJoke
    })
    
    if (currentJoke) {
      this.checkStatus(currentJoke.id)
    }
  },

  checkStatus(id) {
    const likes = wx.getStorageSync('userLikes') || []
    const dislikes = wx.getStorageSync('userDislikes') || []
    this.setData({
      liked: likes.includes(id),
      disliked: dislikes.includes(id)
    })
  },

  nextJoke() {
    const seenIds = getSeenIds()
    const freshJokes = this.data.allJokes.filter(j => !seenIds.includes(j.id))
    
    if (freshJokes.length === 0) {
      wx.showToast({ title: '都看完了', icon: 'none' })
      this.setData({
        currentJoke: null,
        freshJokes: [],
        freshCount: 0
      })
      return
    }
    
    const randomJoke = freshJokes[Math.floor(Math.random() * freshJokes.length)]
    markSeen(randomJoke.id)
    
    const newSeenIds = getSeenIds()
    const newFreshJokes = this.data.allJokes.filter(j => !newSeenIds.includes(j.id))
    
    this.setData({
      currentJoke: randomJoke,
      freshJokes: newFreshJokes,
      freshCount: newFreshJokes.length,
      liked: false,
      disliked: false
    })
    
    this.checkStatus(randomJoke.id)
  },

  async toggleLike() {
    const id = this.data.currentJoke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
    // 如果之前不喜欢，先取消
    if (dislikes.includes(id)) {
      dislikes = dislikes.filter(d => d !== id)
      wx.setStorageSync('userDislikes', dislikes)
      this.setData({ disliked: false })
      await api.toggleDislike(id, false)
    }
    
    const wasLiked = this.data.liked
    const newLiked = !wasLiked
    
    if (wasLiked) {
      likes = likes.filter(l => l !== id)
    } else {
      likes.push(id)
    }
    
    wx.setStorageSync('userLikes', likes)
    
    // 调用API更新数据库
    try {
      const res = await api.toggleLike(id, newLiked)
      // 使用API返回的真实数据更新
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ liked: newLiked, currentJoke: joke })
    } catch (err) {
      console.log('API更新失败，本地已保存:', err)
      // API失败时本地估算
      const joke = this.data.currentJoke
      joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
      this.setData({ liked: newLiked, currentJoke: joke })
    }
  },

  async toggleDislike() {
    const id = this.data.currentJoke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
    // 如果之前喜欢，先取消
    if (likes.includes(id)) {
      likes = likes.filter(l => l !== id)
      wx.setStorageSync('userLikes', likes)
      this.setData({ liked: false })
      await api.toggleLike(id, false)
    }
    
    const wasDisliked = this.data.disliked
    const newDisliked = !wasDisliked
    
    if (wasDisliked) {
      dislikes = dislikes.filter(d => d !== id)
    } else {
      dislikes.push(id)
    }
    
    wx.setStorageSync('userDislikes', dislikes)
    
    // 调用API更新数据库
    try {
      const res = await api.toggleDislike(id, newDisliked)
      // 使用API返回的真实数据更新
      const joke = this.data.currentJoke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ disliked: newDisliked, currentJoke: joke })
    } catch (err) {
      console.log('API更新失败，本地已保存:', err)
      // API失败时本地估算
      const joke = this.data.currentJoke
      joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
      this.setData({ disliked: newDisliked, currentJoke: joke })
    }
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({ current: url, urls: urls || [url] })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    markSeen(id)
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  async onShareAppMessage() {
    const joke = this.data.currentJoke
    if (!joke) return
    
    // 调用API更新分享数
    try {
      const res = await api.incrementShare(joke.id)
      joke.shares = res.data.shares
      this.setData({ currentJoke: joke })
    } catch (err) {
      joke.shares++
      this.setData({ currentJoke: joke })
    }
    
    return {
      title: `【哇哇笑】${joke.title}`,
      path: `/pages/detail/detail?id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  }
})
