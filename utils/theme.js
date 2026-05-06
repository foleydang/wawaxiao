// 主题切换工具

const THEMES = {
  dark: {
    name: 'dark',
    label: '夜间模式',
    icon: '🌙',
    // CSS变量值
    vars: {
      '--bg': '#0f0f23',
      '--bg-light': '#1a1a2e',
      '--card': 'rgba(255,255,255,0.05)',
      '--border': 'rgba(255,255,255,0.1)',
      '--text': '#ffffff',
      '--text-secondary': 'rgba(255,255,255,0.7)',
      '--text-muted': 'rgba(255,255,255,0.4)',
      '--primary': '#667eea',
      '--accent': '#f093fb'
    }
  },
  light: {
    name: 'light',
    label: '日间模式',
    icon: '☀️',
    vars: {
      '--bg': '#f5f7fa',
      '--bg-light': '#ffffff',
      '--card': 'rgba(0,0,0,0.02)',
      '--border': 'rgba(0,0,0,0.08)',
      '--text': '#1a1a2e',
      '--text-secondary': 'rgba(0,0,0,0.6)',
      '--text-muted': 'rgba(0,0,0,0.3)',
      '--primary': '#667eea',
      '--accent': '#f093fb'
    }
  }
}

function getCurrentTheme() {
  return wx.getStorageSync('theme') || 'dark'
}

function setTheme(themeName) {
  wx.setStorageSync('theme', themeName)
  
  // 更新页面样式
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    currentPage.setData({ 
      currentTheme: themeName,
      themeIcon: THEMES[themeName].icon
    })
  }
}

function toggleTheme() {
  const current = getCurrentTheme()
  const newTheme = current === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
  return newTheme
}

function getThemeVars(themeName) {
  return THEMES[themeName || getCurrentTheme()].vars
}

function getThemeIcon() {
  return THEMES[getCurrentTheme()].icon
}

module.exports = {
  THEMES,
  getCurrentTheme,
  setTheme,
  toggleTheme,
  getThemeVars,
  getThemeIcon
}
