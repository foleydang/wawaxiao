<!--pages/detail/detail.wxml - 和首页统一 -->
<view class="container {{pageClass}}">
  <view class="joke-card" wx:if="{{joke}}">
    <!-- 标题行 -->
    <view class="joke-header">
      <text class="joke-title">{{joke.title}}</text>
    </view>
    
    <!-- 分类和日期（小标签样式，和首页一样） -->
    <view class="card-meta">
      <view class="meta-dot"></view>
      <text class="meta-cat">{{joke.category}}</text>
      <text class="meta-date">{{joke.date}}</text>
    </view>
    
    <!-- 内容 -->
    <view class="joke-content">
      <text>{{joke.content}}</text>
    </view>
    
    <!-- 三档评价（和首页一样的样式） -->
    <view class="card-actions">
      <view class="action-btn" bindtap="handleLike">
        <text class="action-icon">👍</text>
        <text class="action-num">{{joke.likes}}</text>
      </view>
      
      <view class="action-btn" bindtap="handleNeutral">
        <text class="action-icon">😐</text>
        <text class="action-num">{{joke.neutrals}}</text>
      </view>
      
      <view class="action-btn" bindtap="handleDislike">
        <text class="action-icon">👎</text>
        <text class="action-num">{{joke.dislikes}}</text>
      </view>
    </view>
  </view>
  
  <view class="theme-toggle" bindtap="toggleTheme">
    <text class="theme-icon">{{themeIcon}}</text>
  </view>
</view>