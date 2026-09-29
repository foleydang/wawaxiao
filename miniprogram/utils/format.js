// utils/format.js
// 笑话数据格式化工具：统一分类颜色映射和预览文本生成

// 分类颜色映射（统一管理，避免在多个页面重复定义）
const CAT_COLORS = {
  '职场': '#f093fb',
  '生活': '#4facfe',
  '家庭': '#43e97b',
  '校园': '#fa709a',
  '搞笑': '#f5576c',
  '弱智吧': '#667eea',
  '儿童': '#FF85A2',
  '动物': '#43e97b',
  '经典': '#4ECDC4',
  '糗事': '#f093fb',
  '恋爱': '#f093fb'
}

// 默认颜色
const DEFAULT_COLOR = '#667eea'

// 获取分类颜色
function getCategoryColor(category) {
  return CAT_COLORS[category] || DEFAULT_COLOR
}

// 生成预览文本（安全处理 content 为 null/undefined 的情况）
function generatePreview(content, title, maxLen = 40) {
  if (!content) return title || ''
  const firstLine = content.split('\n')[0]
  if (firstLine.length > maxLen) {
    return firstLine.substring(0, maxLen) + '...'
  }
  return firstLine
}

// 格式化单条笑话：添加 color 和 preview 字段
function formatJoke(joke) {
  if (!joke) return joke
  return {
    ...joke,
    // 计数兜底为 0，避免后端缺字段时显示空白
    likes: Number(joke.likes) || 0,
    neutrals: Number(joke.neutrals) || 0,
    dislikes: Number(joke.dislikes) || 0,
    color: getCategoryColor(joke.category),
    preview: generatePreview(joke.content, joke.title)
  }
}

// 批量格式化笑话
function formatJokes(jokes) {
  if (!Array.isArray(jokes)) return []
  return jokes.map(formatJoke)
}

module.exports = {
  CAT_COLORS,
  DEFAULT_COLOR,
  getCategoryColor,
  generatePreview,
  formatJoke,
  formatJokes
}
