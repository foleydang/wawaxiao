// GET /jokes - 分页支持
router.get('/jokes', (req, res) => {
  const { category = '全部', page = 1, limit = 20, date, recentDays } = req.query;
  let jokes = getJokes().filter(j => j.status === 'approved');
  
  // 分类筛选
  if (category !== '全部') {
    jokes = jokes.filter(j => j.category === category);
  }
  
  // 日期筛选
  if (date) {
    jokes = jokes.filter(j => j.date === date);
  }
  
  // 最近几天
  if (recentDays) {
    const cutoff = new Date(Date.now() - parseInt(recentDays) * 24 * 60 * 60 * 1000);
    jokes = jokes.filter(j => new Date(j.date) >= cutoff);
  }
  
  // 分页处理
  const total = jokes.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paginatedJokes = jokes.slice(offset, offset + parseInt(limit));
  
  // 添加评分
  paginatedJokes.forEach(joke => {
    joke.score = (joke.likes || 0) - (joke.dislikes || 0);
  });
  
  res.json({
    success: true,
    data: {
      list: paginatedJokes,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      hasMore: parseInt(page) < totalPages
    }
  });
});