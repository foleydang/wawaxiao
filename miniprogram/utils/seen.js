// 已看过存储 - 使用普通数组方案 + 大小上限
// 适合小程序环境，防止 storage 无限增长

const MAX_SEEN_SIZE = 500; // 最多记录500条，超出时淘汰最旧的

// 获取已看过的ID列表
function getSeenIds() {
  return wx.getStorageSync('seenIds') || []
}

// 标记已看过
function markSeen(id) {
  if (!id) return
  
  let seenIds = getSeenIds()
  if (!seenIds.includes(id)) {
    seenIds.push(id)
    // 超过上限时，淘汰前半部分最旧的记录
    if (seenIds.length > MAX_SEEN_SIZE) {
      seenIds = seenIds.slice(seenIds.length - MAX_SEEN_SIZE)
    }
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
