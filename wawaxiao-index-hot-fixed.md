<!-- 热门推荐 -->
<view class="section" wx:if="{{!loading && hotJokes.length > 0}}">
  <view class="section-header">
    <view class="section-left">
      <view class="section-dot hot"></view>
      <text class="section-title">热门推荐</text>
    </view>
    <text class="section-count">{{hotJokes.length}}条热门</text>
  </view>
  
  <view class="hot-list">
    <view class="hot-item glass btn-press" 
      wx:for="{{hotJokes}}" 
      wx:key="id"
      bindtap="goToDetail"
      data-id="{{item.id}}"
    >
      <view class="hot-left">
        <text class="hot-title">{{item.title}}</text>
        <text class="hot-category">{{item.category}}</text>
      </view>
      <view class="hot-right">
        <text class="hot-icon">👍</text>
        <text class="hot-likes">{{item.likes}}</text>
      </view>
    </view>
  </view>
</view>