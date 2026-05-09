// 笑话API路由 - 添加到 family-memo/server/src/routes/wawaxiao.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 数据文件路径
const JOKES_FILE = path.join(__dirname, '../../database/wawaxiao-jokes.json');
const LIKES_FILE = path.join(__dirname, '../../database/wawaxiao-likes.json');

// 初始化数据文件
function initFiles() {
  if (!fs.existsSync(JOKES_FILE)) {
    const initialJokes = [
      { id: 1, category: '职场', title: '程序员面试', content: '面试官：你期望薪资是多少？\n程序员：3万。\n面试官：我们公司可以给你5万，还有期权，年终奖6个月，免费三餐，带薪休假。\n程序员：真的吗？\n面试官：假的，是你先跟我开玩笑的。', likes: 2847, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 2, category: '生活', title: '减肥计划', content: '我决定减肥了。\n第一天：晚上不吃饭！\n第二天：中午少吃点！\n第三天：早上起来跑两圈！\n第四天：点外卖的时候跟老板说少放点油。\n第五天：算了，胖着也挺好的。', likes: 1923, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 3, category: '家庭', title: '妈妈的逻辑', content: '我：妈，我饿了。\n妈：饿了不会自己做饭？\n我：妈，我做饭。\n妈：你会做什么？别把厨房烧了。\n我：妈，那我点外卖。\n妈：天天外卖，不知道自己煮点健康的东西吃。\n我：妈那你帮我做点呗？\n妈：我养你这么大是来伺候你的？', likes: 3156, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 4, category: '校园', title: '考试秘诀', content: '老师：小明，这次考试你怎么又考了0分？\n小明：老师，您不是说要诚实吗？\n老师：什么意思？\n小明：我不会的题，我都没好意思抄别人的。', likes: 2234, status: 'approved', createdAt: Date.now() },
      { id: 5, category: '职场', title: '准时下班', content: '老板：小张啊，你怎么每天准时下班？\n小张：因为我要回家啊。\n老板：回家干嘛？\n小张：睡觉啊。\n老板：睡那么早干嘛？\n小张：养足精神明天准时下班。', likes: 4521, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 6, category: '生活', title: '网购哲学', content: '我：这件衣服500块好贵啊，不买了。\n我：点个外卖加配送费？没门！\n我：买个视频会员？等等再找找免费资源。\n我：奶茶25一杯？来两杯！\n我：??', likes: 1678, status: 'approved', createdAt: Date.now() },
      { id: 7, category: '家庭', title: '爸爸的智慧', content: '儿子：爸爸，我长大了想当程序员。\n爸爸：挺好的，你会修电脑吗？\n儿子：不会...\n爸爸：那你会做网站吗？\n儿子：不太会...\n爸爸：那你怎么当程序员？\n儿子：我会写Bug啊！\n爸爸：...', likes: 2089, status: 'approved', createdAt: Date.now() },
      { id: 8, category: '校园', title: '英语考试', content: '英语考试，翻译"Good good study, day day up"。\n学生：好好学习，天天向上。\n老师：正确。\n学生：老师，那为什么我爸说这是中式英语，不要乱用？\n老师：你爸是对的，但考试就是考这个。', likes: 1345, status: 'approved', createdAt: Date.now() },
      { id: 9, category: '生活', title: '健身卡', content: '办了健身卡后：\n第1周：一周去5次\n第2周：一周去3次\n第3周：一周去1次\n第4周：洗澡时想起来健身卡\n第2个月：帮朋友办卡时想起来\n第6个月：在钱包翻到健身卡时想起来\n第12个月：续卡提醒短信来了\n我：续！这次一定去！', likes: 2567, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 10, category: '职场', title: '开会', content: '开会ing...\n老板：大家畅所欲言，有什么说什么。\n内心OS：说多了你嫌我事多，说少了你嫌我不积极，说得不对你嫌我能力不行...\n嘴上：我觉得老板说得对。', likes: 3892, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 11, category: '家庭', title: '催婚', content: '我妈：你看你表妹，比你小三岁，孩子都会打酱油了。\n我：妈，那是表妹，我打酱油的时候她还在玩泥巴呢。\n我妈：那你现在呢？\n我：...我在看你打酱油。', likes: 1456, status: 'approved', createdAt: Date.now() },
      { id: 12, category: '生活', title: '早起', content: '我决定每天早起！\n闹钟定在6点。\n6点：闹钟响了，关掉，再睡5分钟。\n6点05分：再睡5分钟。\n6点10分：再睡5分钟。\n7点30分：完了完了迟到了！\n之后：明天一定早起！', likes: 2134, status: 'approved', createdAt: Date.now() },
      { id: 13, category: '校园', title: '数学课', content: '数学老师：小明，你说说1+1等于几？\n小明：等于2。\n老师：很好！那你再说说，1+2等于几？\n小明：等于3。\n老师：非常棒！那2+2等于几？\n小明：等于4。\n老师：小明，你今天表现得很好！\n小明：老师，我知道您在表扬我，但我还是觉得您好像在测试我的计算器。', likes: 987, status: 'approved', createdAt: Date.now() },
      { id: 14, category: '职场', title: '加班费', content: '老板：小王，这个项目需要加班赶一下。\n小王：好的，有加班费吗？\n老板：年轻人不要太计较钱，要看重成长的机会。\n小王：老板，那您给我个成长的机会，我请您加班？\n老板：......', likes: 3245, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 15, category: '生活', title: '省钱攻略', content: '我的省钱计划：\n1. 不买新衣服 ✓\n2. 不喝奶茶 ✓\n3. 自己做饭 ✓\n4. 不网购 ✓\n\n省下来的钱：\n买了一堆收纳盒整理不买的东西。\n买了厨房用品做那几顿饭。\n买了运动装备准备跑步（然后没跑）。\n\n结论：省钱真的很花钱。', likes: 2876, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 16, category: '家庭', title: 'WiFi密码', content: '回家过年。\n奶奶：乖孙，你帮我看看这个WiFi怎么连不上？\n我：好的奶奶，密码是多少？\n奶奶：我不知道啊，是你叔叔设置的。\n我：那我帮您改一个简单的。\n奶奶：好呀好呀。\n我改完密码后告诉奶奶：密码是88888888。\n奶奶：太好了，我记住了。\n第二天...\n奶奶：乖孙，WiFi怎么又连不上了？\n我：密码是88888888。\n奶奶：对啊，我输的就是88888888。\n我检查了一下...奶奶输了8个0。', likes: 3456, isHot: true, status: 'approved', createdAt: Date.now() },
      { id: 17, category: '校园', title: '图书馆', content: '图书馆里。\n男生：同学，你占着这个位置一直玩手机，不觉得浪费资源吗？\n女生：那我学习的时候你又在打游戏，你也不觉得浪费资源吗？\n男生：......\n女生：再说了，图书馆资源就是给人用的，我用我浪费，关你什么事？\n男生：你说得对，那我继续玩手机了。', likes: 1234, status: 'approved', createdAt: Date.now() },
      { id: 18, category: '生活', title: '手机电量', content: '手机电量99%：太满了，用一会儿。\n手机电量80%：还不错，继续玩。\n手机电量50%：哦，只有一半了。\n手机电量20%：赶紧找充电器！\n手机电量10%：啊啊啊啊怎么这么快！！！\n手机电量1%：完蛋了完蛋了要关机了！\n手机关机：好吧，该睡觉了。', likes: 2789, status: 'approved', createdAt: Date.now() },
      { id: 19, category: '职场', title: 'PPT', content: '同事：这个PPT你能帮我做一下吗？\n我：好的，你需要什么内容？\n同事：你看着办。\n我做完了发过去。\n同事：这不对那不对，重新做。\n我：你具体要什么？\n同事：你看着办。\n我：......\n最后：我把鼠标给他：那你来"看着办"。', likes: 1987, status: 'approved', createdAt: Date.now() },
      { id: 20, category: '家庭', title: '洗碗', content: '妈妈：今天谁洗碗？\n我、爸爸、弟弟：（装作很忙的样子）\n妈妈：好，那我来洗。\n我、爸爸、弟弟：（内心松了一口气）\n妈妈洗完后...\n妈妈：今天谁洗碗？\n我们：您不是洗了吗？\n妈妈：我洗的是碗，我还能把锅也洗了？还有灶台？还有厨房地板？\n我们：......\n下次：我们抢着洗碗（只洗碗）。\n妈妈：你们真乖（然后自己把剩下的都做了）。', likes: 2345, status: 'approved', createdAt: Date.now() }
    ];
    fs.writeFileSync(JOKES_FILE, JSON.stringify(initialJokes, null, 2));
  }
  
  if (!fs.existsSync(LIKES_FILE)) {
    fs.writeFileSync(LIKES_FILE, JSON.stringify({}, null, 2));
  }
}

initFiles();

// 读取笑话数据
function getJokes() {
  try {
    return JSON.parse(fs.readFileSync(JOKES_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

// 读取点赞数据
function getLikes() {
  try {
    return JSON.parse(fs.readFileSync(LIKES_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

// 保存笑话数据
function saveJokes(jokes) {
  fs.writeFileSync(JOKES_FILE, JSON.stringify(jokes, null, 2));
}

// 保存点赞数据
function saveLikes(likes) {
  fs.writeFileSync(LIKES_FILE, JSON.stringify(likes, null, 2));
}

// ========== API接口 ==========

// GET /api/wawaxiao/jokes - 获取笑话列表
router.get('/jokes', (req, res) => {
  const { category = '全部', page = 1, limit = 20 } = req.query;
  let jokes = getJokes().filter(j => j.status === 'approved');
  
  if (category !== '全部') {
    jokes = jokes.filter(j => j.category === category);
  }
  
  // 按热度排序
  jokes.sort((a, b) => b.likes - a.likes);
  
  // 分页
  const start = (page - 1) * limit;
  const paginatedJokes = jokes.slice(start, start + limit);
  
  res.json({
    success: true,
    data: {
      list: paginatedJokes,
      total: jokes.length,
      page: parseInt(page),
      limit: parseInt(limit),
      categories: ['全部', '职场', '生活', '家庭', '校园']
    }
  });
});

// GET /api/wawaxiao/hot - 获取热门笑话
router.get('/hot', (req, res) => {
  const jokes = getJokes()
    .filter(j => j.status === 'approved' && j.isHot)
    .sort((a, b) => b.likes - a.likes);
  
  res.json({
    success: true,
    data: jokes
  });
});

// GET /api/wawaxiao/random - 获取随机笑话
router.get('/random', (req, res) => {
  const jokes = getJokes().filter(j => j.status === 'approved');
  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  
  res.json({
    success: true,
    data: randomJoke
  });
});

// GET /api/wawaxiao/jokes/:id - 获取单个笑话
router.get('/jokes/:id', (req, res) => {
  const jokes = getJokes();
  const joke = jokes.find(j => j.id === parseInt(req.params.id));
  
  if (!joke) {
    return res.json({ success: false, message: '笑话不存在' });
  }
  
  res.json({
    success: true,
    data: joke
  });
});

// POST /api/wawaxiao/like/:id - 点赞
router.post('/like/:id', (req, res) => {
  const userId = req.body.userId || req.ip || 'anonymous';
  const jokeId = parseInt(req.params.id);
  
  const likes = getLikes();
  const key = `${userId}_${jokeId}`;
  
  // 防止重复点赞（可以取消）
  if (likes[key]) {
    // 取消点赞
    delete likes[key];
    const jokes = getJokes();
    const joke = jokes.find(j => j.id === jokeId);
    if (joke) {
      joke.likes = Math.max(0, joke.likes - 1);
      saveJokes(jokes);
    }
    saveLikes(likes);
    
    return res.json({
      success: true,
      data: { liked: false, likes: joke?.likes || 0 },
      message: '已取消点赞'
    });
  }
  
  // 新点赞
  likes[key] = true;
  const jokes = getJokes();
  const joke = jokes.find(j => j.id === jokeId);
  if (joke) {
    joke.likes += 1;
    // 自动标记热门
    if (joke.likes >= 2000) {
      joke.isHot = true;
    }
    saveJokes(jokes);
  }
  saveLikes(likes);
  
  res.json({
    success: true,
    data: { liked: true, likes: joke?.likes || 0 },
    message: '点赞成功'
  });
});

// POST /api/wawaxiao/jokes - 提交新笑话（UGC）
router.post('/jokes', (req, res) => {
  const { category, title, content, author } = req.body;
  
  if (!category || !title || !content) {
    return res.json({ success: false, message: '请填写完整信息' });
  }
  
  // 内容长度限制
  if (title.length > 50 || content.length > 500) {
    return res.json({ success: false, message: '标题或内容过长' });
  }
  
  const jokes = getJokes();
  const newId = jokes.length > 0 ? Math.max(...jokes.map(j => j.id)) + 1 : 1;
  
  const newJoke = {
    id: newId,
    category,
    title,
    content,
    author: author || '匿名用户',
    likes: 0,
    isHot: false,
    status: 'pending', // 待审核
    createdAt: Date.now()
  };
  
  jokes.push(newJoke);
  saveJokes(jokes);
  
  res.json({
    success: true,
    data: newJoke,
    message: '提交成功，等待审核'
  });
});

// GET /api/wawaxiao/stats - 统计数据
router.get('/stats', (req, res) => {
  const jokes = getJokes();
  const approved = jokes.filter(j => j.status === 'approved');
  const pending = jokes.filter(j => j.status === 'pending');
  
  const categoryStats = {};
  approved.forEach(j => {
    categoryStats[j.category] = (categoryStats[j.category] || 0) + 1;
  });
  
  res.json({
    success: true,
    data: {
      total: approved.length,
      pending: pending.length,
      categories: categoryStats,
      hotCount: approved.filter(j => j.isHot).length
    }
  });
});

// ========== 管理接口（需要密码验证） ==========

// GET /api/wawaxiao/admin/pending - 获取待审核笑话
router.get('/admin/pending', (req, res) => {
  const { password } = req.query;
  
  // 简单密码验证（建议改用更安全的方式）
  if (password !== 'wawaxiao2024') {
    return res.json({ success: false, message: '密码错误' });
  }
  
  const jokes = getJokes().filter(j => j.status === 'pending');
  
  res.json({
    success: true,
    data: jokes
  });
});

// POST /api/wawaxiao/admin/approve/:id - 审核通过
router.post('/admin/approve/:id', (req, res) => {
  const { password } = req.body;
  
  if (password !== 'wawaxiao2024') {
    return res.json({ success: false, message: '密码错误' });
  }
  
  const jokes = getJokes();
  const joke = jokes.find(j => j.id === parseInt(req.params.id));
  
  if (!joke) {
    return res.json({ success: false, message: '笑话不存在' });
  }
  
  joke.status = 'approved';
  saveJokes(jokes);
  
  res.json({
    success: true,
    message: '审核通过'
  });
});

// DELETE /api/wawaxiao/admin/reject/:id - 拒绝/删除
router.delete('/admin/reject/:id', (req, res) => {
  const { password } = req.body;
  
  if (password !== 'wawaxiao2024') {
    return res.json({ success: false, message: '密码错误' });
  }
  
  const jokes = getJokes();
  const index = jokes.findIndex(j => j.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.json({ success: false, message: '笑话不存在' });
  }
  
  jokes.splice(index, 1);
  saveJokes(jokes);
  
  res.json({
    success: true,
    message: '已删除'
  });
});

module.exports = router;