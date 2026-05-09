#!/bin/bash
# 服务器监控脚本

echo "=== Yanten API 服务监控 ==="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "1. PM2 进程状态"
pm2 list | grep yanten-api

echo ""
echo "2. API 健康检查"
curl -s https://yanten.top/api/health | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'状态: {d[\"status\"]}')
print(f'运行: {d[\"uptimeFormatted\"]}')
print(f'内存: {d[\"memory\"][\"used\"]}')
print(f'数据库: {d[\"database\"][\"size\"]}')
print(f'环境: {d[\"environment\"]}')
"

echo ""
echo "3. 哇哇笑数据统计"
curl -s https://yanten.top/api/wawaxiao/stats | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'笑话总数: {d[\"data\"][\"total\"]}')
print(f'点赞: {d[\"data\"][\"totalLikes\"]}')
print(f'分享: {d[\"data\"][\"totalShares\"]}')
"

echo ""
echo "4. 服务器资源"
echo "CPU负载: $(awk '{print $1}' /proc/loadavg)"
echo "内存使用: $(free -h | awk '/Mem:/ {print $3}')"
echo "磁盘使用: $(df -h / | awk 'NR==2 {print $3 \" / \" $2}')"

echo ""
echo "5. 定时任务"
crontab -l | grep -E "(backup|cleanup)" | wc -l
echo "个定时任务在运行"

echo ""
echo "=== 监控完成 ==="