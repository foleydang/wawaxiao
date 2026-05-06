const { api } = require('../../utils/api.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')
const voice = require('../../utils/voice.js')

const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a'
}

Page({
  data: {
    pageClass: '',
    joke: null,
    moreJokes: [],
    liked: false,
    disliked: false,
    themeIcon: '🌙',
    voiceMode: false,
    voiceStatus: '点击开启语音控制',
    voiceHint: '说"下一个"、"喜欢"、"朗读"'
  },

  onLoad(options) {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadJoke(options.id)
  },

  onShow() {
    // 重新加载当前笑话获取最新数据
    if (this.data.joke) {
      this.refreshJoke()
    }
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  },

  onUnload() {
    if (this.data.voiceMode) {
      voice.stopListening()
      voice.stopAudio()
    }
  },

  processJoke(joke) {
    return {
      ...joke,
      color: CAT_COLORS[joke.category] || '#667eea',
      hasImage: joke.images && joke.images.length > 0,
      images: joke.images || []
    }
  },

  async loadJoke(id) {
    try {
      const res = await api.getJokeById(id)
      const joke = this.processJoke(res.data)
      
      this.setData({ joke })
      this.checkStatus(id)
      this.loadMoreJokes(id)
      
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async refreshJoke() {
    try {
      const res = await api.getJokeById(this.data.joke.id)
      const joke = this.processJoke(res.data)
      this.setData({ joke })
    } catch (err) {}
  },

  async loadMoreJokes(currentId) {
    try {
      const res = await api.getJokes({ limit: 10 })
      const jokes = res.data.list
        .filter(j => j.id !== parseInt(currentId))
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(j => this.processJoke(j))
      
      this.setData({ moreJokes: jokes })
    } catch (err) {}
  },

  checkStatus(id) {
    const likes = wx.getStorageSync('userLikes') || []
    const dislikes = wx.getStorageSync('userDislikes') || []
    this.setData({
      liked: likes.includes(parseInt(id)),
      disliked: dislikes.includes(parseInt(id))
    })
  },

  toggleVoiceMode() {
    if (this.data.voiceMode) {
      voice.stopListening()
      voice.stopAudio()
      this.setData({
        voiceMode: false,
        voiceStatus: '点击开启语音控制',
        voiceHint: '说"下一个"、"喜欢"、"朗读"'
      })
      wx.showToast({ title: '语音模式已关闭', icon: 'none' })
    } else {
      voice.initManager()
      voice.startListening((intent, text) => {
        this.handleVoiceIntent(intent, text)
      })
      
      this.setData({
        voiceMode: true,
        voiceStatus: '🟢 正在聆听...',
        voiceHint: '说"下一个"、"喜欢"、"朗读"、"退出"'
      })
      
      wx.showToast({ title: '语音模式已开启', icon: 'none', duration: 2000 })
    }
  },

  handleVoiceIntent(intent, text) {
    switch (intent) {
      case 'next':
        wx.showToast({ title: '切换下一个', icon: 'none' })
        this.goToRandomJoke()
        break
      case 'like':
        wx.showToast({ title: '喜欢', icon: 'none' })
        this.toggleLike()
        break
      case 'dislike':
        wx.showToast({ title: '不喜欢', icon: 'none' })
        this.toggleDislike()
        break
      case 'read':
        wx.showToast({ title: '朗读笑话', icon: 'none' })
        this.readJoke()
        break
      case 'stopRead':
        voice.stopAudio()
        wx.showToast({ title: '停止朗读', icon: 'none' })
        break
      case 'repeat':
        wx.showToast({ title: '再听一遍', icon: 'none' })
        this.readJoke()
        break
      case 'exit':
        this.toggleVoiceMode()
        break
      case 'back':
        wx.navigateBack()
        break
    }
  },

  readJoke() {
    const joke = this.data.joke
    if (!joke) return
    
    const content = `${joke.title}。\n${joke.content}`
    voice.textToSpeech(content)
  },

  goToRandomJoke() {
    const allJokes = wx.getStorageSync('cachedJokes') || []
    const currentId = this.data.joke.id
    const otherJokes = allJokes.filter(j => j.id !== currentId)
    
    if (otherJokes.length === 0) {
      voice.textToSpeech('没有更多笑话了')
      return
    }
    
    const randomJoke = otherJokes[Math.floor(Math.random() * otherJokes.length)]
    voice.stopAudio()
    
    wx.redirectTo({
      url: `/pages/detail/detail?id=${randomJoke.id}`,
      success: () => {
        if (this.data.voiceMode) {
          setTimeout(() => this.readJoke(), 1000)
        }
      }
    })
  },

  async toggleLike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
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
    
    // 调用API并使用返回的真实数据
    try {
      const res = await api.toggleLike(id, newLiked)
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ liked: newLiked, joke })
      
      if (this.data.voiceMode) {
        voice.textToSpeech(newLiked ? '已喜欢' : '取消喜欢')
      }
    } catch (err) {
      const joke = this.data.joke
      joke.likes = wasLiked ? joke.likes - 1 : joke.likes + 1
      this.setData({ liked: newLiked, joke })
    }
  },

  async toggleDislike() {
    const id = this.data.joke.id
    let likes = wx.getStorageSync('userLikes') || []
    let dislikes = wx.getStorageSync('userDislikes') || []
    
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
    
    try {
      const res = await api.toggleDislike(id, newDisliked)
      const joke = this.data.joke
      joke.likes = res.data.likes
      joke.dislikes = res.data.dislikes
      this.setData({ disliked: newDisliked, joke })
      
      if (this.data.voiceMode) {
        voice.textToSpeech(newDisliked ? '已不喜欢' : '取消不喜欢')
      }
    } catch (err) {
      const joke = this.data.joke
      joke.dislikes = wasDisliked ? joke.dislikes - 1 : joke.dislikes + 1
      this.setData({ disliked: newDisliked, joke })
    }
  },

  playVoice() {
    this.readJoke()
    wx.showToast({ title: '正在朗读', icon: 'none' })
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
    wx.redirectTo({ url: `/pages/detail/detail?id=${id}` })
  },

  goBack() {
    if (this.data.voiceMode) {
      voice.stopListening()
      voice.stopAudio()
    }
    wx.navigateBack()
  },

  async onShareAppMessage() {
    const joke = this.data.joke
    if (!joke) return
    
    try {
      const res = await api.incrementShare(joke.id)
      joke.shares = res.data.shares
      this.setData({ joke })
    } catch (err) {
      joke.shares++
      this.setData({ joke })
    }
    
    return {
      title: `【哇哇笑】${joke.title}`,
      path: `/pages/detail/detail?id=${joke.id}`,
      imageUrl: joke.hasImage ? joke.images[0] : ''
    }
  }
})
