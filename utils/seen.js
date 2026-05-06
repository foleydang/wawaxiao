// 已看过存储 - 位图(Bitmap)方案
// 支持1000+条笑话，仅需125字节存储空间

// 初始化位图（1000条笑话 = 125字节）
function initBitmap(size = 1000) {
  const byteCount = Math.ceil(size / 8)
  const str = '0'.repeat(byteCount)
  wx.setStorageSync('seenBitmap', str)
  return str
}

// 获取位图
function getBitmap() {
  return wx.getStorageSync('seenBitmap') || initBitmap()
}

// 标记已看过
function markSeen(id) {
  if (id < 1 || id > 1000) return
  
  let str = getBitmap()
  const byteIndex = Math.floor(id / 8)
  const bitIndex = id % 8
  
  // 转换为数组操作
  const bytes = str.split('').map(c => parseInt(c))
  bytes[byteIndex] = bytes[byteIndex] | (1 << bitIndex)
  
  // 存储回字符串
  wx.setStorageSync('seenBitmap', bytes.join(''))
}

// 检查是否已看过
function hasSeen(id) {
  if (id < 1 || id > 1000) return false
  
  const str = getBitmap()
  const byteIndex = Math.floor(id / 8)
  const bitIndex = id % 8
  
  const byte = parseInt(str[byteIndex]) || 0
  return (byte & (1 << bitIndex)) !== 0
}

// 获取所有已看过的ID列表
function getSeenIds() {
  const str = getBitmap()
  const seenIds = []
  
  for (let i = 1; i <= 1000; i++) {
    if (hasSeen(i)) seenIds.push(i)
  }
  
  return seenIds
}

// 清空所有已看过记录
function clearAllSeen() {
  initBitmap()
}

// 获取已看过数量
function getSeenCount() {
  return getSeenIds().length
}

module.exports = {
  initBitmap,
  markSeen,
  hasSeen,
  getSeenIds,
  clearAllSeen,
  getSeenCount
}
