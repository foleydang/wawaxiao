// POST /like/:id - 累计点赞
router.post('/like/:id', (req, res) => {
  const jokeId = parseInt(req.params.id);
  
  const jokes = getJokes();
  const joke = jokes.find(j => j.id === jokeId);
  if (!joke) return res.json({ success: false, message: '笑话不存在' });
  
  joke.likes = (joke.likes || 0) + 1;
  saveJokes(jokes);
  
  res.json({
    success: true,
    data: {
      likes: joke.likes,
      neutrals: joke.neutrals || 0,
      dislikes: joke.dislikes || 0
    },
    message: '喜欢+1'
  });
});

// POST /neutral/:id - 累计平价
router.post('/neutral/:id', (req, res) => {
  const jokeId = parseInt(req.params.id);
  
  const jokes = getJokes();
  const joke = jokes.find(j => j.id === jokeId);
  if (!joke) return res.json({ success: false, message: '笑话不存在' });
  
  joke.neutrals = (joke.neutrals || 0) + 1;
  saveJokes(jokes);
  
  res.json({
    success: true,
    data: {
      likes: joke.likes || 0,
      neutrals: joke.neutrals,
      dislikes: joke.dislikes || 0
    },
    message: '平+1'
  });
});

// POST /dislike/:id - 累计不喜欢
router.post('/dislike/:id', (req, res) => {
  const jokeId = parseInt(req.params.id);
  
  const jokes = getJokes();
  const joke = jokes.find(j => j.id === jokeId);
  if (!joke) return res.json({ success: false, message: '笑话不存在' });
  
  joke.dislikes = (joke.dislikes || 0) + 1;
  saveJokes(jokes);
  
  res.json({
    success: true,
    data: {
      likes: joke.likes || 0,
      neutrals: joke.neutrals || 0,
      dislikes: joke.dislikes
    },
    message: '不喜欢+1'
  });
});

module.exports = router;