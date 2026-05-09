/* 热门推荐样式（放大） */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.hot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;  /* 放大：24rpx → 28rpx */
  border-radius: 16rpx;
}

.hot-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.hot-title {
  font-size: 32rpx;  /* 放大：28rpx → 32rpx */
  font-weight: 600;
}

.hot-category {
  font-size: 24rpx;  /* 新增：显示分类 */
  color: var(--text-secondary);
}

.hot-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.hot-icon {
  font-size: 36rpx;  /* 放大：不显示 → 36rpx */
}

.hot-likes {
  font-size: 28rpx;  /* 放大：24rpx → 28rpx */
  font-weight: 500;
  color: var(--text-secondary);
}