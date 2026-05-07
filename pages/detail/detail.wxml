<!--pages/detail/detail.wxml-->
<view class="container {{pageClass}}">
  <view class="joke-card" wx:if="{{joke}}">
    <view class="joke-header">
      <text class="joke-title">{{joke.title}}</text>
      <text class="joke-category">{{joke.category}}</text>
      <text class="joke-date">{{joke.date}}</text>
    </view>
    
    <view class="joke-content">
      <text>{{joke.content}}</text>
    </view>
    
    <!-- 累计评价 -->
    <view class="rating-section">
      <view class="rating-stats">
        <text class="likes">👍 {{joke.likes}}</text>
        <text class="neutrals">😐 {{joke.neutrals}}</text>
        <text class="dislikes">👎 {{joke.dislikes}}</text>
        <text class="score">评分: {{joke.score}}</text>
      </view>
      
      <view class="rating-buttons">
        <button class="rating-btn like-btn" bindtap="handleLike">
          👍 喜欢
          <text class="count" wx:if="{{userLikeCount > 0}}">（{{userLikeCount}}）</text>
        </button>
        
        <button class="rating-btn neutral-btn" bindtap="handleNeutral">
          😐 平
          <text class="count" wx:if="{{userNeutralCount > 0}}">（{{userNeutralCount}}）</text>
        </button>
        
        <button class="rating-btn dislike-btn" bindtap="handleDislike">
          👎 不喜欢
          <text class="count" wx:if="{{userDislikeCount > 0}}">（{{userDislikeCount}}）</text>
        </button>
      </view>
    </view>
  </view>
  
  <view class="theme-toggle" bindtap="toggleTheme">
    <text class="theme-icon">{{themeIcon}}</text>
  </view>
</view>