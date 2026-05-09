/* pages/detail/detail.wxss */
.container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container.light-mode {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.joke-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.joke-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.joke-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.joke-category {
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 12px;
}

.joke-date {
  font-size: 12px;
  color: #999;
}

.joke-content {
  font-size: 16px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 30px;
}

/* 三档评价（按钮和数量在一起） */
.rating-actions {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #e0e0e0;
}

.rating-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 30px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
}

.rating-btn:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 0.08);
}

.rating-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.rating-num {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-icon {
  font-size: 24px;
}