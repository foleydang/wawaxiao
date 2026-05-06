// 主题切换

const THEMES = {
  dark: {
    navBg: '#0f0f23',
    navText: 'white'
  },
  light: {
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
  
  // 设置导航栏颜色
  wx.setNavigationBarColor({
    backgroundColor: theme.navBg,
    frontColor: theme.navText === 'white' ? '#ffffff' : '#000000',
    animation: { duration: 200, timingFunc: 'easeIn' }
  })
  
  // 设置TabBar颜色（仅对当前页面生效）
  if (themeName === 'light') {
    wx.setTabBarStyle({
      backgroundColor: '#f5f7fa',
      color: '#8888a8',
      selectedColor: '#1a1a2e',
      borderStyle: 'black'
    })
  } else {
    wx.setTabBarStyle({
      backgroundColor: '#0f0f23',
      color: '#8888a8',
      selectedColor: '#ffffff',
      borderStyle: 'white'
    })
  }
}

function initTheme() {
  applyTheme(getCurrentTheme())
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
