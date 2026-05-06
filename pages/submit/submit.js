const { api } = require('../../utils/api.js')

const CATEGORIES = [
  { name: '职场', color: '#f093fb' },
  { name: '生活', color: '#4facfe' },
  { name: '家庭', color: '#43e97b' },
  { name: '校园', color: '#fa709a' }
]

Page({
  data: {
    categories: CATEGORIES,
    form: { category: '生活', title: '', content: '' },
    canSubmit: false,
    showSuccess: false
  },

  checkCanSubmit() {
    const { category, title, content } = this.data.form
    this.setData({ canSubmit: title.length >= 2 && content.length >= 10 })
  },

  selectCategory(e) {
    this.setData({ 'form.category': e.currentTarget.dataset.category })
  },

  inputTitle(e) {
    this.setData({ 'form.title': e.detail.value })
    this.checkCanSubmit()
  },

  inputContent(e) {
    this.setData({ 'form.content': e.detail.value })
    this.checkCanSubmit()
  },

  async submitJoke() {
    if (!this.data.canSubmit) return
    wx.showLoading({ title: '提交中' })
    try {
      await api.submitJoke(this.data.form)
      wx.hideLoading()
      this.setData({ showSuccess: true, form: { category: '生活', title: '', content: '' }, canSubmit: false })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '失败', icon: 'none' })
    }
  },

  hideSuccess() {
    this.setData({ showSuccess: false })
  },

  preventClose() {}
})
