#!/bin/bash
# 设置 OSS 定时备份

# 创建日志目录
mkdir -p ~/logs

# 添加 cron 任务（每小时备份）
(crontab -l 2>/dev/null | grep -v "yanten-api backup"; echo "0 * * * * cd ~/github/yanten-api && /usr/bin/node src/scripts/backup-to-oss.js >> ~/logs/backup.log 2>&1") | crontab -

# 验证 cron 任务
echo "✅ 定时备份已设置"
echo ""
echo "定时任务："
crontab -l | grep backup

echo ""
echo "日志文件：~/logs/backup.log"