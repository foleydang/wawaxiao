/* pages/detail/detail.wxss - 完整版 */

/* 基础样式 */
.page-wrapper {
  min-height: 100vh;
  padding-bottom: calc(40rpx + var(--safe-bottom));
  background: var(--bg);
  color: var(--text);
}

.page-wrapper.light-mode {
  background: #f8f9fa !important;
  color: #1a1a2e !important;
}

.page-wrapper.light-mode .glass {
  background: rgba(0,0,0,0.04) !important;
  border-color: rgba(0,0,0,0.1) !important;
}

.page-wrapper.light-mode .brand-name,
.page-wrapper.light-mode .section-title,
.page-wrapper.light-mode .card-title,
.page-wrapper.light-mode .recommend-title {
  color: #1a1a2e !important;
}

.page-wrapper.light-mode .meta-cat,
.page-wrapper.light-mode .card-content,
.page-wrapper.light-mode .section-count,
.page-wrapper.light-mode .action-num,
.page-wrapper.light-mode .recommend-meta {
  color: #555555 !important;
}

/* 顶部 */
.header {
  padding: calc(56rpx + var(--safe-top)) 28rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.brand-name {
  font-size: 36rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.header-right {
  display: flex;
  gap: 16rpx;
}

.glass {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.btn-press {
  transition: transform 0.15s ease;
}

.btn-press:active {
  transform: scale(0.92);
}

.theme-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-icon {
  font-size: 20px;
}

/* Section */
.section {
  padding: 0 28rpx 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 4rpx;
}

.section-dot.recommend {
  background: #9C27B0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
}

.section-count {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* 卡片 */
.recommend-card {
  position: relative;
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
}

.card-color {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.meta-dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.meta-cat {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.meta-date {
  font-size: 24rpx;
  color: rgba(100, 100, 100, 0.6);
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.4;
}

/* 标题和内容之间的间距 */
.title-divider {
  height: 24rpx;
}

.card-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 32rpx;
}

/* 三档评价 */
.card-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding-top: 24rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.92);
  background: rgba(255, 255, 255, 0.12);
}

.action-icon {
  font-size: 32rpx;
}

.action-num {
  font-size: 24rpx;
  font-weight: 500;
}

/* 推荐笑话（两行两列） */
.recommend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.recommend-item {
  padding: 24rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.recommend-title {
  font-size: 28rpx;
  font-weight: 500;
}

.recommend-meta {
  font-size: 22rpx;
  color: var(--text-secondary);
}