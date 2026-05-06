// 主题切换 - 使用页面实例动态修改

const THEMES = {
  dark: {
    name: 'dark',
    label: '夜间模式',
    navBg: '#0f0f23',
    navText: 'white'
  },
  light: {
    name: 'light',
    label: '日间模式',
    navBg: '#f5f7fa',
    navText: 'black'
  }
}

function getCurrentTheme() {
  return wx.getStorageSync('theme') || 'dark'
}

function toggleTheme() {
  const current = getCurrentTheme()
  const newTheme = current === 'dark' ? 'light' : 'dark'
  applyTheme(newTheme)
  return newTheme
}

function applyTheme(themeName) {
  wx.setStorageSync('theme', themeName)
  
  const theme = THEMES[themeName]
  
  // 1. 设置导航栏颜色
  wx.setNavigationBarColor({
    backgroundColor: theme.navBg,
    frontColor: theme.navText === 'white' ? '#ffffff' : '#000000',
    animation: { duration: 200, timingFunc: 'easeIn' }
  })
  
  // 2. 设置页面根元素的class（通过页面实例）
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const page = pages[pages.length - 1]
    
    // 小程序：通过setData触发页面重新渲染
    // 同时需要在页面wxml中使用page-class绑定
    page.setData({
      pageClass: themeName === 'light' ? 'light-mode' : ''
    })
  }
}

function initTheme() {
  const themeName = getCurrentTheme()
  applyTheme(themeName)
}

function getThemeIcon() {
  return getCurrentTheme() === 'dark' ? '🌙' : '☀️'
}

module.exports = {
  getCurrentTheme,
  toggleTheme,
  applyTheme,
  initTheme,
  getThemeIcon
}
