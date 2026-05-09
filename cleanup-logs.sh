#!/bin/bash
# 日志清理脚本

LOG_DIR="/root/logs"
RETENTION_DAYS=7

echo "[$(date)] 开始清理日志..."

# 清理超过7天的日志
find $LOG_DIR -name "*.log" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null

# 显示当前日志大小
if [ -d "$LOG_DIR" ]; then
  SIZE=$(du -sh $LOG_DIR 2>/dev/null | cut -f1)
  echo "当前日志大小: $SIZE"
fi

echo "[$(date)] 日志清理完成"