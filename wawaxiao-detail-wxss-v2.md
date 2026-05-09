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

.rating-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.rating-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 14px;
}

.likes {
  color: #4CAF50;
}

.neutrals {
  color: #9E9E9E;
}

.dislikes {
  color: #F44336;
}

.score {
  color: #2196F3;
  font-weight: bold;
}

.rating-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.rating-btn {
  flex: 1;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s;
}

.like-btn {
  background: #e8f5e9;
  color: #4CAF50;
  border: 2px solid #4CAF50;
}

.like-btn .count {
  color: #2E7D32;
  font-size: 12px;
}

.neutral-btn {
  background: #f5f5f5;
  color: #9E9E9E;
  border: 2px solid #9E9E9E;
}

.neutral-btn .count {
  color: #616161;
  font-size: 12px;
}

.dislike-btn {
  background: #ffebee;
  color: #F44336;
  border: 2px solid #F44336;
}

.dislike-btn .count {
  color: #C62828;
  font-size: 12px;
}

.rating-btn:active {
  transform: scale(0.95);
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