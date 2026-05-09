/* index.wxss - 日期标签样式 */

/* ... 其他样式保持不变 ... */

/* 卡片元信息 */
.card-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.meta-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #667eea;
}

.meta-cat {
  font-size: 24rpx;
  color: rgba(102, 126, 234, 0.9);
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

/* 日期标签（和分类一样的小标签样式） */
.meta-date {
  font-size: 24rpx;
  color: rgba(100, 100, 100, 0.7);
  background: rgba(100, 100, 100, 0.08);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

.meta-badge {
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, #FF6B6B, #FF4757);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Light mode 日期标签 */
.page-wrapper.light-mode .meta-date {
  color: rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.05);
}