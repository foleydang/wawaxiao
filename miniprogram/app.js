const { initTheme } = require('./utils/theme.js')

App({
  onLaunch() {
    initTheme()
    // 获取 openid（静默登录）
    this.silentLogin()
  },
  
  globalData: {
    openid: null
  },
  
  silentLogin() {
    // wawaxiao 不需要服务器登录，用本地固定 ID 即可
    // 优先读取已存的 openid，避免每次生成新 ID
    let openid = wx.getStorageSync('wawaxiao_openid')
    if (!openid) {
      openid = 'wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      wx.setStorageSync('wawaxiao_openid', openid)
    }
    this.globalData.openid = openid
    wx.setStorageSync('openid', openid)
  },
  
  getOpenid() {
    if (this.globalData.openid) return this.globalData.openid
    let openid = wx.getStorageSync('wawaxiao_openid')
    if (!openid) {
      openid = 'wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      wx.setStorageSync('wawaxiao_openid', openid)
    }
    this.globalData.openid = openid
    wx.setStorageSync('openid', openid)
    return openid
  }
})
