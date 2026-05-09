// GET /hot - 热门推荐（降低条件）
router.get('/hot', (req, res) => {
  let jokes = getJokes()
    .filter(j => j.status === 'approved')
    .map(joke => ({
      ...joke,
      score: (joke.likes || 0) - (joke.dislikes || 0)
    }))
    // 降低条件：score >= 0 就可以推荐（或者改成随机推荐）
    .filter(j => j.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);  // 只取前5个
  
  res.json({ success: true, data: jokes });
});