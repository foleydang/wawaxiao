const { api } = require('../../utils/api.js')
const { getCurrentTheme, toggleTheme, getThemeIcon, initTheme } = require('../../utils/theme.js')

Page({
  data: {
    pageClass: '',
    themeIcon: '🌙',
    categories: ['搞笑', '生活', '职场', '家庭', '校园', '动物'],
    currentCat: '搞笑',
    title: '',
    content: '',
    titleLen: 0,
    contentLen: 0,
    canSubmit: false,
    submitting: false,
    mySubmits: []
  },

  onLoad() {
    initTheme()
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
    this.loadMySubmits()
  },

  onShow() {
    this.setData({
      pageClass: getCurrentTheme() === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  },

  pickCat(e) {
    this.setData({ currentCat: e.currentTarget.dataset.cat })
  },

  onTitleInput(e) {
    const title = e.detail.value
    this.setData({
      title,
      titleLen: title.length,
      canSubmit: title.trim().length > 0 && this.data.content.trim().length > 0 && !this.data.submitting
    })
  },

  onContentInput(e) {
    const content = e.detail.value
    this.setData({
      content,
      contentLen: content.length,
      canSubmit: this.data.title.trim().length > 0 && content.trim().length > 0 && !this.data.submitting
    })
  },

  async doSubmit() {
    if (!this.data.canSubmit || this.data.submitting) return

    this.setData({ submitting: true, canSubmit: false })

    try {
      const res = await api.submitJoke({
        title: this.data.title.trim(),
        content: this.data.content.trim(),
        category: this.data.currentCat,
        openid: api.getOpenid()
      })

      if (res.success) {
        wx.showToast({ title: '投稿成功！', icon: 'success' })
        this.setData({
          title: '',
          content: '',
          titleLen: 0,
          contentLen: 0,
          canSubmit: false
        })
        this.loadMySubmits()
      } else {
        wx.showToast({ title: res.message || '投稿失败', icon: 'none' })
      }
    } catch (err) {
      wx.showToast({ title: '网络错误', icon: 'none' })
    }

    this.setData({ submitting: false })
  },

  async loadMySubmits() {
    try {
      const res = await api.getMySubmits()
      this.setData({ mySubmits: res.data.list || [] })
    } catch (err) {
      console.error('加载投稿失败:', err)
    }
  },

  toggleTheme() {
    const newTheme = toggleTheme()
    this.setData({
      pageClass: newTheme === 'light' ? 'light-mode' : '',
      themeIcon: getThemeIcon()
    })
  }
})
