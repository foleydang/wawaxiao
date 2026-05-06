// 主题切换工具 - 小程序动态切换方案

const THEMES = {
  dark: {
    name: 'dark',
    label: '夜间模式',
    navBar: {
      backgroundColor: '#0f0f23',
      textStyle: 'white'
    }
  },
  light: {
    name: 'light',
    label: '日间模式',
    navBar: {
      backgroundColor: '#f5f7fa',
      textStyle: 'black'
    }
  }
}

function getCurrentTheme() {
  return wx.getStorageSync('theme') || 'dark'
}

function setTheme(themeName) {
  wx.setStorageSync('theme', themeName)
  
  // 设置导航栏颜色
  const theme = THEMES[themeName]
  wx.setNavigationBarColor({
    backgroundColor: theme.navBar.backgroundColor,
    frontColor: theme.navBar.textStyle === 'white' ? '#ffffff' : '#000000',
    animation: { duration: 200, timingFunc: 'easeIn' }
  })
  
  // 设置页面class
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const page = pages[pages.length - 1]
    page.setData({ 
      currentTheme: themeName,
      themeIcon: themeName === 'dark' ? '🌙' : '☀️'
    })
  }
}

function toggleTheme() {
  const current = getCurrentTheme()
  const newTheme = current === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
  return newTheme
}

function getThemeIcon() {
  return getCurrentTheme() === 'dark' ? '🌙' : '☀️'
}

function initTheme() {
  const themeName = getCurrentTheme()
  const theme = THEMES[themeName]
  
  // 初始化导航栏
  wx.setNavigationBarColor({
    backgroundColor: theme.navBar.backgroundColor,
    frontColor: theme.navBar.textStyle === 'white' ? '#ffffff' : '#000000',
    animation: { duration: 0 }
  })
  
  return themeName
}

module.exports = {
  getCurrentTheme,
  setTheme,
  toggleTheme,
  getThemeIcon,
  initTheme
}
