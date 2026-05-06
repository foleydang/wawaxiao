// 主题切换

const THEMES = {
  dark: {
    navBg: '#0f0f23',
    navText: 'white',
    tabBg: '#0f0f23',
    tabColor: '#8888a8',
    tabSelected: '#ffffff'
  },
  light: {
    navBg: '#f8f9fa',
    navText: 'black',
    tabBg: '#f8f9fa',
    tabColor: '#888888',
    tabSelected: '#1a1a2e'
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
  
  // 设置TabBar颜色
  wx.setTabBarStyle({
    backgroundColor: theme.tabBg,
    color: theme.tabColor,
    selectedColor: theme.tabSelected,
    borderStyle: themeName === 'light' ? 'black' : 'white'
  })
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
