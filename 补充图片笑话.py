#!/usr/bin/env python3
"""
补充带图片的笑话 - 高优先级优化
"""

import json
from datetime import datetime, date
import random

JOKES_FILE = '/root/github/yanten-api/data/database/wawaxiao-jokes.json'

# 带图片的笑话补充库
IMAGE_JOKES = [
    {
        'category': '儿童',
        'title': '小兔子吃萝卜',
        'content': '小兔子：妈妈，我要吃萝卜！\n兔妈妈：萝卜好贵哦。\n小兔子：那我不吃了。\n兔妈妈：好孩子。\n小兔子：妈妈，我要吃冰淇淋！\n兔妈妈：买！',
        'images': ['https://picsum.photos/400/300?random=1'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小猫咪抓鱼',
        'content': '小猫咪：妈妈，我要抓鱼！\n猫妈妈：河里没有鱼。\n小猫咪：那我抓什么？\n猫妈妈：抓老鼠。\n小猫咪：老鼠不好吃。\n猫妈妈：那吃鱼食。\n小猫咪：鱼食是什么？',
        'images': ['https://picsum.photos/400/300?random=2'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小狗狗追蝴蝶',
        'content': '小狗狗：蝴蝶飞走了！\n主人：追不上。\n小狗狗：我再追。\n主人：蝴蝶飞得太快。\n小狗狗：那我慢慢追。\n主人：好的，慢慢追。',
        'images': ['https://picsum.photos/400/300?random=3'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小猪睡觉',
        'content': '小猪：妈妈，我要睡觉。\n猪妈妈：好，睡吧。\n小猪：可是我睡不着。\n猪妈妈：那就数羊。\n小猪：羊在哪里？\n猪妈妈：在心里。',
        'images': ['https://picsum.photos/400/300?random=4'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小鸟唱歌',
        'content': '小鸟：妈妈，我要唱歌。\n鸟妈妈：好，唱吧。\n小鸟：可是我不会唱。\n鸟妈妈：那就学。\n小鸟：学什么？\n鸟妈妈：学妈妈。',
        'images': ['https://picsum.photos/400/300?random=5'],
        'hasImage': True
    },
    {
        'category': '生活',
        'title': '做饭',
        'content': '老公：老婆，你做饭好吃吗？\n老婆：好吃。\n老公：那你做给我吃。\n老婆：可是我没有食材。\n老公：那我买。\n老婆：好，你买，我做。',
        'images': ['https://picsum.photos/400/300?random=6'],
        'hasImage': True
    },
    {
        'category': '生活',
        'title': '洗衣服',
        'content': '老婆：老公，你洗衣服吗？\n老公：洗。\n老婆：那你洗我的衣服。\n老公：好。\n老婆：可是洗衣机坏了。\n老公：那用手洗。\n老婆：用手洗太累。',
        'images': ['https://picsum.photos/400/300?random=7'],
        'hasImage': True
    },
    {
        'category': '生活',
        'title': '打扫卫生',
        'content': '老公：老婆，我们要打扫卫生吗？\n老婆：要。\n老公：那你打扫。\n老婆：可是我累了。\n老公：那我打扫。\n老婆：好，你打扫，我休息。',
        'images': ['https://picsum.photos/400/300?random=8'],
        'hasImage': True
    },
    {
        'category': '家庭',
        'title': '爸爸讲故事',
        'content': '儿子：爸爸，讲故事。\n爸爸：好，讲什么故事？\n儿子：讲小兔子。\n爸爸：从前有个小兔子...\n儿子：然后呢？\n爸爸：然后它长大了。',
        'images': ['https://picsum.photos/400/300?random=9'],
        'hasImage': True
    },
    {
        'category': '家庭',
        'title': '妈妈教做菜',
        'content': '女儿：妈妈，教我做菜。\n妈妈：好，做什么？\n女儿：做鸡蛋。\n妈妈：先打鸡蛋。\n女儿：怎么打？\n妈妈：用筷子打。',
        'images': ['https://picsum.photos/400/300?random=10'],
        'hasImage': True
    },
    {
        'category': '校园',
        'title': '小明上课',
        'content': '老师：小明，你来回答。\n小明：我不会。\n老师：那你认真听。\n小明：可是我听不懂。\n老师：那就问同学。\n小明：同学也不会。',
        'images': ['https://picsum.photos/400/300?random=11'],
        'hasImage': True
    },
    {
        'category': '校园',
        'title': '运动会',
        'content': '小明：老师，我运动会跑步。\n老师：好，加油。\n小明：可是我跑不动。\n老师：那就慢慢跑。\n小明：慢慢跑会输。\n老师：输赢不重要。',
        'images': ['https://picsum.photos/400/300?random=12'],
        'hasImage': True
    },
    {
        'category': '职场',
        'title': '开会',
        'content': '老板：今天开会。\n员工：好。\n老板：讨论一个问题。\n员工：什么问题？\n老板：为什么开会浪费时间？\n员工：...',
        'images': ['https://picsum.photos/400/300?random=13'],
        'hasImage': True
    },
    {
        'category': '职场',
        'title': '加班',
        'content': '老板：今天加班。\n员工：为什么？\n老板：因为工作没做完。\n员工：可是我累了。\n老板：累了也要加班。\n员工：那加多少？\n老板：加到你做完。',
        'images': ['https://picsum.photos/400/300?random=14'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小鸭子游泳',
        'content': '小鸭子：妈妈，我要游泳！\n鸭妈妈：河里太冷了。\n小鸭子：那我要游。\n鸭妈妈：好，小心点。\n小鸭子：我游！\n鸭妈妈：别游太快。',
        'images': ['https://picsum.photos/400/300?random=15'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小乌龟比赛',
        'content': '小乌龟：妈妈，我要比赛！\n龟妈妈：和谁比赛？\n小乌龟：和小兔子。\n龟妈妈：小兔子太快了。\n小乌龟：我慢慢跑。\n龟妈妈：好，慢慢跑。',
        'images': ['https://picsum.photos/400/300?random=16'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小蚂蚁搬家',
        'content': '小蚂蚁：妈妈，我要搬家！\n蚁妈妈：为什么要搬家？\n小蚂蚁：房子太小了。\n蚁妈妈：那慢慢搬。\n小蚂蚁：我搬不动。\n蚁妈妈：那就分几次搬。',
        'images': ['https://picsum.photos/400/300?random=17'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小蜜蜂采蜜',
        'content': '小蜜蜂：妈妈，我要采蜜！\n蜂妈妈：花在哪里？\n小蜜蜂：花园里。\n蜂妈妈：花园很远。\n小蜜蜂：那我慢慢飞。\n蜂妈妈：好，慢慢飞。',
        'images': ['https://picsum.photos/400/300?random=18'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小蝴蝶飞舞',
        'content': '小蝴蝶：妈妈，我要飞舞！\n蝶妈妈：风吹太大了。\n小蝴蝶：那我要飞。\n蝶妈妈：小心点。\n小蝴蝶：我飞！\n蝶妈妈：别飞太高。',
        'images': ['https://picsum.photos/400/300?random=19'],
        'hasImage': True
    },
    {
        'category': '儿童',
        'title': '小青蛙跳',
        'content': '小青蛙：妈妈，我要跳！\n蛙妈妈：池塘太小了。\n小青蛙：那我要跳。\n蛙妈妈：好，小心点。\n小青蛙：我跳！\n蛙妈妈：别跳太远。',
        'images': ['https://picsum.photos/400/300?random=20'],
        'hasImage': True
    },
]

def main():
    """补充带图片的笑话"""
    # 加载现有笑话
    with open(JOKES_FILE, 'r', encoding='utf-8') as f:
        jokes = json.load(f)
    
    print(f'当前笑话数: {len(jokes)}')
    
    # 统计现有图片笑话
    has_images = sum(1 for j in jokes if j.get('hasImage'))
    print(f'现有图片笑话: {has_images}条')
    
    # 过滤已有的标题
    existing_titles = set(j['title'] for j in jokes)
    
    # 选择不重复的笑话
    new_to_add = []
    for new_joke in IMAGE_JOKES:
        if new_joke['title'] not in existing_titles:
            new_to_add.append(new_joke)
    
    print(f'可用新笑话: {len(new_to_add)}条')
    
    # 分配ID和日期
    max_id = max(j['id'] for j in jokes) if jokes else 0
    today = date.today().strftime('%Y-%m-%d')
    
    for joke in new_to_add:
        max_id += 1
        joke['id'] = max_id
        joke['likes'] = 0
        joke['neutrals'] = 0
        joke['dislikes'] = 0
        joke['shares'] = 0
        joke['isHot'] = False
        joke['status'] = 'approved'
        joke['createdAt'] = int(datetime.now().timestamp() * 1000)
        joke['date'] = today
    
    # 合并
    jokes.extend(new_to_add)
    
    # 保存
    with open(JOKES_FILE, 'w', encoding='utf-8') as f:
        json.dump(jokes, f, ensure_ascii=False, indent=2)
    
    print(f'\n✅ 补充完成!')
    print(f'新增: {len(new_to_add)}条')
    print(f'总计: {len(jokes)}条')
    print(f'图片笑话: {has_images + len(new_to_add)}条')

if __name__ == '__main__':
    main()