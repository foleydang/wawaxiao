/* 三档评价（加文字，更美观） */
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
  padding: 20rpx 28rpx;  /* 加大padding */
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.92);
  background: rgba(255, 255, 255, 0.12);
}

.action-icon {
  font-size: 36rpx;  /* 加大图标 */
}

.action-label {
  font-size: 26rpx;  /* 新增：文字标签 */
  color: var(--text);
  font-weight: 500;
}

.action-num {
  font-size: 28rpx;  /* 加大数字 */
  font-weight: 600;
  color: var(--text-secondary);
}