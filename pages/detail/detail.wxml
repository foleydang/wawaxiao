<!--pages/detail/detail.wxml - 和首页一样的风格 + 推荐笑话 -->
<view class="page-wrapper {{pageClass}}">
  <!-- 顶部 -->
  <view class="header">
    <view class="brand">
      <view class="brand-dot"></view>
      <text class="brand-name">哇哇笑</text>
    </view>
    
    <view class="header-right">
      <view class="theme-btn glass btn-press" bindtap="toggleTheme">
        <text class="theme-icon">{{themeIcon}}</text>
      </view>
    </view>
  </view>

  <!-- 笑话卡片 -->
  <view class="section" wx:if="{{joke}}">
    <view class="recommend-card glass">
      <view class="card-color"></view>
      
      <view class="card-meta">
        <view class="meta-dot"></view>
        <text class="meta-cat">{{joke.category}}</text>
        <text class="meta-date">{{joke.date}}</text>
      </view>
      
      <text class="card-title">{{joke.title}}</text>
      <text class="card-content">{{joke.content}}</text>
      
      <!-- 三档评价 -->
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
  </view>

  <!-- 推荐笑话 -->
  <view class="section" wx:if="{{recommendJokes.length > 0}}">
    <view class="section-header">
      <view class="section-left">
        <view class="section-dot recommend"></view>
        <text class="section-title">猜你想看</text>
      </view>
      <text class="section-count">{{recommendJokes.length}}条推荐</text>
    </view>
    
    <view class="hot-list">
      <view class="hot-item glass btn-press" 
        wx:for="{{recommendJokes}}" 
        wx:key="id"
        bindtap="goToDetail"
        data-id="{{item.id}}"
      >
        <text class="hot-title">{{item.title}}</text>
        <text class="hot-likes">👍{{item.likes}}</text>
      </view>
    </view>
  </view>
</view>