// 已看过存储 - 使用普通数组方案
// 更简单可靠，适合小程序环境

// 获取已看过的ID列表
function getSeenIds() {
  const seenIds = wx.getStorageSync('seenIds') || []
  return seenIds
}

// 标记已看过
function markSeen(id) {
  if (!id) return
  
  let seenIds = getSeenIds()
  if (!seenIds.includes(id)) {
    seenIds.push(id)
    wx.setStorageSync('seenIds', seenIds)
  }
}

// 检查是否已看过
function hasSeen(id) {
  if (!id) return false
  return getSeenIds().includes(id)
}

// 清空所有已看过记录
function clearAllSeen() {
  wx.setStorageSync('seenIds', [])
}

// 获取已看过数量
function getSeenCount() {
  return getSeenIds().length
}

module.exports = {
  getSeenIds,
  markSeen,
  hasSeen,
  clearAllSeen,
  getSeenCount
}
