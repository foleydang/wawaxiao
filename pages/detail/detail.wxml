<!--pages/detail/detail.wxml-->
<view class="container {{pageClass}}">
  <view class="joke-card" wx:if="{{joke}}">
    <view class="joke-header">
      <text class="joke-title">{{joke.title}}</text>
      <text class="joke-category">{{joke.category}}</text>
    </view>
    
    <view class="joke-content">
      <text>{{joke.content}}</text>
    </view>
    
    <!-- 三档评价 -->
    <view class="rating-section">
      <view class="rating-stats">
        <text class="likes">👍 {{joke.likes}}</text>
        <text class="neutrals">😐 {{joke.neutrals}}</text>
        <text class="dislikes">👎 {{joke.dislikes}}</text>
      </view>
      
      <view class="rating-buttons">
        <button 
          class="rating-btn like-btn {{userRating === 'like' ? 'active' : ''}}"
          bindtap="handleLike"
        >
          👍 喜欢
        </button>
        
        <button 
          class="rating-btn neutral-btn {{userRating === 'neutral' ? 'active' : ''}}"
          bindtap="handleNeutral"
        >
          😐 平
        </button>
        
        <button 
          class="rating-btn dislike-btn {{userRating === 'dislike' ? 'active' : ''}}"
          bindtap="handleDislike"
        >
          👎 不喜欢
        </button>
      </view>
      
      <view class="rating-hint">
        <text>评分: {{joke.score > 0 ? '+' : ''}}{{joke.score}}</text>
      </view>
    </view>
  </view>
  
  <view class="theme-toggle" bindtap="toggleTheme">
    <text class="theme-icon">{{themeIcon}}</text>
  </view>
</view>