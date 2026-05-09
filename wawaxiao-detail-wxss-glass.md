/* pages/detail/detail.wxss - 和首页一样的风格 */

/* 复用首页的样式 */
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

.page-wrapper.light-mode .card-title,
.page-wrapper.light-mode .brand-name {
  color: #1a1a2e !important;
}

.page-wrapper.light-mode .meta-cat,
.page-wrapper.light-mode .card-content,
.page-wrapper.light-mode .action-num,
.page-wrapper.light-mode .meta-date {
  color: #555555 !important;
}

/* 顶部 */
.header {
  padding: calc(56rpx + var(--safe-top)) 28rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 卡片（和首页一样） */
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
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.card-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 32rpx;
}

/* 三档评价（和首页一样） */
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