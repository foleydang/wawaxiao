const { api } = require('../../utils/api.js')

Page({
  data: {
    categories: ['职场', '生活', '家庭', '校园'],
    form: {
      category: '生活',
      title: '',
      content: '',
      author: ''
    },
    canSubmit: false,
    showSuccess: false
  },

  onInputChange() {
    const { category, title, content } = this.data.form
    const canSubmit = category && title.length >= 2 && content.length >= 10
    this.setData({ canSubmit })
  },

  selectCategory(e) {
    this.setData({ 'form.category': e.currentTarget.dataset.category })
    this.onInputChange()
  },

  inputTitle(e) {
    this.setData({ 'form.title': e.detail.value })
    this.onInputChange()
  },

  inputContent(e) {
    this.setData({ 'form.content': e.detail.value })
    this.onInputChange()
  },

  inputAuthor(e) {
    this.setData({ 'form.author': e.detail.value })
  },

  async submitJoke() {
    if (!this.data.canSubmit) return
    
    wx.showLoading({ title: '提交中...' })
    
    try {
      await api.submitJoke(this.data.form)
      
      wx.hideLoading()
      
      this.setData({
        showSuccess: true,
        form: {
          category: '生活',
          title: '',
          content: '',
          author: ''
        },
        canSubmit: false
      })
      
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '提交失败',
        icon: 'none'
      })
    }
  },

  hideSuccess() {
    this.setData({ showSuccess: false })
  },

  preventClose() {}
})
