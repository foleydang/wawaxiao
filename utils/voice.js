// 语音控制 - 使用小程序原生API（无需插件）

let recorderManager = null
let audioContext = null
let isListening = false

// 初始化录音管理器
function initRecorder() {
  if (!recorderManager) {
    recorderManager = wx.getRecorderManager()
  }
  return recorderManager
}

// 开始录音监听（持续模式）
function startListening(callback) {
  const recorder = initRecorder()
  
  recorder.onStart(() => {
    isListening = true
    console.log('录音开始')
  })
  
  recorder.onStop((res) => {
    isListening = false
    console.log('录音结束', res)
    
    // 这里需要调用语音识别API（如科大讯飞/百度）
    // 暂时用关键词匹配模拟
    if (callback) {
      // 模拟识别结果（实际需要接入语音识别服务）
      callback('wait', '录音完成，等待识别')
    }
  })
  
  recorder.onError((err) => {
    isListening = false
    console.log('录音错误', err)
  })
  
  // 开始录音
  recorder.start({
    format: 'mp3',
    duration: 60000,  // 最长60秒
    sampleRate: 16000,
    numberOfChannels: 1
  })
  
  return true
}

// 停止录音
function stopListening() {
  if (recorderManager && isListening) {
    recorderManager.stop()
    isListening = false
  }
}

// 朗读笑话（使用在线TTS服务）
function textToSpeech(text, callback) {
  // 方案1：使用第三方TTS API（需要服务器支持）
  // 方案2：使用微信小程序内置播放能力
  
  // 暂时用提示代替（需要接入真实TTS服务）
  console.log('需要TTS服务朗读:', text)
  
  wx.showToast({
    title: '朗读功能需要接入语音服务',
    icon: 'none',
    duration: 2000
  })
  
  if (callback) callback(false)
}

// 停止播放
function stopAudio() {
  if (audioContext) {
    audioContext.stop()
  }
}

// 播放音频文件
function playAudio(src, callback) {
  if (!audioContext) {
    audioContext = wx.createInnerAudioContext()
  }
  
  audioContext.src = src
  audioContext.onEnded(() => {
    console.log('播放结束')
    if (callback) callback(true)
  })
  audioContext.onError((err) => {
    console.log('播放错误', err)
    if (callback) callback(false)
  })
  
  audioContext.play()
}

// 解析用户意图（关键词匹配）
function parseIntent(text) {
  if (!text) return null
  
  if (text.includes('下一个') || text.includes('换一个') || text.includes('下一条')) {
    return 'next'
  }
  if (text.includes('喜欢') || text.includes('点赞')) {
    return 'like'
  }
  if (text.includes('不喜欢') || text.includes('无聊')) {
    return 'dislike'
  }
  if (text.includes('朗读') || text.includes('读') || text.includes('念')) {
    return 'read'
  }
  if (text.includes('退出') || text.includes('关闭')) {
    return 'exit'
  }
  if (text.includes('返回') || text.includes('回去')) {
    return 'back'
  }
  
  return null
}

// 获取监听状态
function getListeningStatus() {
  return isListening
}

module.exports = {
  initRecorder,
  startListening,
  stopListening,
  textToSpeech,
  stopAudio,
  playAudio,
  parseIntent,
  getListeningStatus
}
