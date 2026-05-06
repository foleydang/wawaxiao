// 语音对话控制 - 微信同声传译插件

const plugin = requirePlugin("WechatSI")
let manager = null
let isListening = false
let audioContext = null

// 初始化语音识别管理器
function initManager() {
  if (!manager) {
    manager = plugin.getRecordRecognitionManager()
  }
  return manager
}

// 开始持续监听
function startListening(callback) {
  const manager = initManager()
  
  manager.onRecognize = (res) => {
    if (res.result) {
      const text = res.result.trim()
      console.log('识别结果:', text)
      
      // 解析用户意图
      const intent = parseIntent(text)
      if (intent) {
        callback(intent, text)
      }
    }
  }
  
  manager.onStart = () => {
    isListening = true
    console.log('开始监听')
  }
  
  manager.onStop = () => {
    isListening = false
    console.log('停止监听')
  }
  
  manager.onError = (err) => {
    console.log('识别错误:', err)
    isListening = false
  }
  
  // 开始识别（持续模式）
  manager.start({
    lang: 'zh_CN',
    continuous: true,  // 持续识别
    continuousDelay: 3000  // 3秒间隔
  })
  
  return true
}

// 停止监听
function stopListening() {
  if (manager && isListening) {
    manager.stop()
    isListening = false
  }
}

// 解析用户意图
function parseIntent(text) {
  // 下一个笑话
  if (text.includes('下一个') || text.includes('换一个') || text.includes('下一条')) {
    return 'next'
  }
  
  // 喜欢
  if (text.includes('喜欢') || text.includes('点赞') || text.includes('好看')) {
    return 'like'
  }
  
  // 不喜欢
  if (text.includes('不喜欢') || text.includes('无聊') || text.includes('不好笑')) {
    return 'dislike'
  }
  
  // 朗读
  if (text.includes('朗读') || text.includes('读') || text.includes('念') || text.includes('听')) {
    return 'read'
  }
  
  // 停止朗读
  if (text.includes('停') || text.includes('别读') || text.includes('安静')) {
    return 'stopRead'
  }
  
  // 再听一遍
  if (text.includes('再听') || text.includes('再来一遍') || text.includes('重复')) {
    return 'repeat'
  }
  
  // 退出语音模式
  if (text.includes('退出') || text.includes('关闭') || text.includes('停止监听')) {
    return 'exit'
  }
  
  // 返回
  if (text.includes('返回') || text.includes('回去') || text.includes('首页')) {
    return 'back'
  }
  
  return null
}

// 文字转语音（朗读笑话）
function textToSpeech(content, callback) {
  plugin.textToSpeech({
    lang: 'zh_CN',
    tts: true,
    content: content,
    success: (res) => {
      if (res.filename) {
        playAudio(res.filename, callback)
      }
    },
    fail: (err) => {
      console.log('语音合成失败:', err)
      callback && callback(false)
    }
  })
}

// 播放音频
function playAudio(src, callback) {
  if (!audioContext) {
    audioContext = wx.createInnerAudioContext()
  }
  
  audioContext.src = src
  audioContext.onPlay = () => {
    console.log('开始播放')
  }
  audioContext.onEnded = () => {
    console.log('播放结束')
    callback && callback(true)
  }
  audioContext.onError = (err) => {
    console.log('播放错误:', err)
    callback && callback(false)
  }
  
  audioContext.play()
}

// 停止播放
function stopAudio() {
  if (audioContext) {
    audioContext.stop()
  }
}

// 获取监听状态
function getListeningStatus() {
  return isListening
}

module.exports = {
  initManager,
  startListening,
  stopListening,
  textToSpeech,
  stopAudio,
  getListeningStatus,
  parseIntent
}
