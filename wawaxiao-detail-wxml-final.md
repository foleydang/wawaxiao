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
    
    <!-- 三档评价（按钮和数量在一起，原本样式） -->
    <view class="rating-actions">
      <view class="rating-btn" bindtap="handleLike">
        <text class="rating-icon">👍</text>
        <text class="rating-num">{{joke.likes}}</text>
      </view>
      
      <view class="rating-btn" bindtap="handleNeutral">
        <text class="rating-icon">😐</text>
        <text class="rating-num">{{joke.neutrals}}</text>
      </view>
      
      <view class="rating-btn" bindtap="handleDislike">
        <text class="rating-icon">👎</text>
        <text class="rating-num">{{joke.dislikes}}</text>
      </view>
    </view>
  </view>
  
  <view class="theme-toggle" bindtap="toggleTheme">
    <text class="theme-icon">{{themeIcon}}</text>
  </view>
</view>