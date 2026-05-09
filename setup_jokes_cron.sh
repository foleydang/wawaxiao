#!/bin/bash
# 定时任务：每天凌晨3点爬取笑话

# 添加到 crontab
(crontab -l 2>/dev/null | grep -v "jokes_fetcher"; echo "0 3 * * * cd /root/github/yanten-api && /usr/bin/python3 src/scripts/jokes_fetcher.py >> /root/logs/jokes_fetch.log 2>&1") | crontab -

echo "✅ 定时任务已添加"
echo ""
echo "定时任务列表："
crontab -l | grep jokes_fetcher

echo ""
echo "执行时间：每天凌晨3点"
echo "日志文件：/root/logs/jokes_fetch.log"