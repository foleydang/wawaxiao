<!-- 三档评价（加文字，更美观） -->
      <view class="card-actions">
        <view class="action-btn" bindtap="handleLike">
          <text class="action-icon">👍</text>
          <text class="action-label">喜欢</text>
          <text class="action-num">{{joke.likes}}</text>
        </view>
        
        <view class="action-btn" bindtap="handleNeutral">
          <text class="action-icon">😐</text>
          <text class="action-label">平</text>
          <text class="action-num">{{joke.neutrals}}</text>
        </view>
        
        <view class="action-btn" bindtap="handleDislike">
          <text class="action-icon">👎</text>
          <text class="action-label">不喜欢</text>
          <text class="action-num">{{joke.dislikes}}</text>
        </view>
      </view>