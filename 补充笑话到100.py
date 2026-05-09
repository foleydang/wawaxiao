#!/usr/bin/env python3
"""
补充笑话脚本 - 达到100条不重复的笑话
"""

import json
from datetime import datetime, date
import os

JOKES_FILE = '/root/github/yanten-api/data/database/wawaxiao-jokes.json'

# 新笑话库（补充用，适合4岁小朋友）
NEW_JOKES = [
    # 儿童类（适合4岁）
    {
        'category': '儿童',
        'title': '公交车',
        'content': '小明：妈妈，公交车为什么那么大？\n妈妈：因为要坐很多人。\n小明：那我能不能坐公交车？\n妈妈：可以。\n小明：那公交车能不能坐我？\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '怜悯心',
        'content': '小明：妈妈，小蚂蚁好可怜。\n妈妈：为什么？\n小明：因为它找不到家了。\n妈妈：那我们帮它找家吧。\n小明：可是它说它家在地下。\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '生气',
        'content': '小明：妈妈，我生气了。\n妈妈：为什么生气？\n小明：因为爸爸不让我吃冰淇淋。\n妈妈：那我们吃水果吧。\n小明：水果不是冰淇淋！\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '盲人识字',
        'content': '小明：妈妈，盲人怎么看书？\n妈妈：盲人用手摸。\n小明：那我能摸吗？\n妈妈：可以。\n小明：可是我看不到。\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '白雪公主',
        'content': '小明：妈妈，白雪公主为什么住在森林里？\n妈妈：因为她逃跑了。\n小明：她为什么要逃跑？\n妈妈：因为有人要抓她。\n小明：那我也逃跑！\n妈妈：不准！'
    },
    {
        'category': '儿童',
        'title': '海边冷笑话',
        'content': '小明：妈妈，海边为什么有沙滩？\n妈妈：因为海水把石头冲走了。\n小明：那石头去哪里了？\n妈妈：变成了沙滩。\n小明：那石头会不会游泳？\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '苏轼吃牛肉',
        'content': '小明：妈妈，苏轼是谁？\n妈妈：一个诗人。\n小明：他喜欢吃牛肉吗？\n妈妈：不知道。\n小明：那为什么他说"牛肉好吃"？\n妈妈：他没说过。\n小明：那"东坡牛肉"是谁的？\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '女娲补天',
        'content': '小明：妈妈，女娲为什么要补天？\n妈妈：因为天破了。\n小明：天为什么会破？\n妈妈：因为有人打天。\n小明：那我能不能打天？\n妈妈：不准！'
    },
    {
        'category': '儿童',
        'title': '钢琴邮箱',
        'content': '小明：妈妈，钢琴有邮箱吗？\n妈妈：没有。\n小明：那为什么它叫"钢琴邮箱"？\n妈妈：那是"钢琴"，不是"邮箱"。'
    },
    {
        'category': '儿童',
        'title': '飞机为什么飞',
        'content': '小明：妈妈，飞机为什么能飞？\n妈妈：因为有翅膀。\n小明：那我也有翅膀，为什么不能飞？\n妈妈：你的翅膀是手臂。\n小明：那我把手臂张开就能飞？\n妈妈：不准试！'
    },
    {
        'category': '儿童',
        'title': '彩虹为什么七色',
        'content': '小明：妈妈，彩虹为什么有七个颜色？\n妈妈：因为太阳光照在水上。\n小明：那太阳为什么不是七个颜色？\n妈妈：因为太阳是黄色的。\n小明：那为什么彩虹不是黄色的？\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '小猫钓鱼',
        'content': '小明：妈妈，小猫会钓鱼吗？\n妈妈：不会。\n小明：那为什么小猫喜欢吃鱼？\n妈妈：因为鱼好吃。\n小明：那小猫怎么抓鱼？\n妈妈：用爪子。\n小明：那我用爪子也能抓鱼？\n妈妈：不准！'
    },
    
    # 职场类
    {
        'category': '职场',
        'title': 'WiFi密码',
        'content': '同事：WiFi密码是多少？\n我：12345678。\n同事：太简单了吧。\n我：那你猜。\n同事：87654321？\n我：不对。\n同事：那是什么？\n我：12345678。\n同事：...'
    },
    {
        'category': '职场',
        'title': '图书馆',
        'content': '老板：你去图书馆干嘛？\n员工：看书。\n老板：看什么书？\n员工：《如何提高工作效率》。\n老板：那你为什么看了3个小时？\n员工：...'
    },
    {
        'category': '职场',
        'title': '手机电量',
        'content': '老板：你怎么一直在玩手机？\n员工：我没玩，我在看时间。\n老板：那为什么看了1个小时？\n员工：因为电量太低了，我怕关机。\n老板：...'
    },
    {
        'category': '职场',
        'title': '新同事',
        'content': '老板：新同事来了。\n员工：你好，我是老王。\n新同事：你好，我是小李。\n员工：我们一起工作吧。\n新同事：好的。\n员工：那你帮我写代码。\n新同事：...'
    },
    {
        'category': '职场',
        'title': '网购退货',
        'content': '同事：你网购的东西怎么都退货了？\n我：因为不喜欢。\n同事：那你为什么买？\n我：因为当时喜欢。\n同事：那现在为什么不喜欢？\n我：因为退货了。'
    },
    
    # 生活类
    {
        'category': '生活',
        'title': '双十一',
        'content': '我：双十一我要买很多东西。\n朋友：你有钱吗？\n我：没有。\n朋友：那你怎么买？\n我：用信用卡。\n朋友：那怎么还款？\n我：用信用卡。\n朋友：...'
    },
    {
        'category': '生活',
        'title': '过年',
        'content': '妈：过年回家吗？\n我：回。\n妈：带什么东西？\n我：带快乐。\n妈：快乐是什么？\n我：就是我。\n妈：那你带钱回来。\n我：...'
    },
    {
        'category': '生活',
        'title': '小组作业',
        'content': '老师：小组作业大家分工。\n我：我写PPT。\n同学：我写报告。\n同学2：我做演讲。\n老师：那谁做作业？\n我们：...'
    },
    {
        'category': '生活',
        'title': '相亲',
        'content': '朋友：相亲怎么样？\n我：失败了。\n朋友：为什么？\n我：她说我太老实。\n朋友：那你下次不老实。\n我：可是我真的很老实。\n朋友：...'
    },
    {
        'category': '生活',
        'title': '图书馆看书',
        'content': '我：图书馆好安静。\n朋友：是的。\n我：可是有人说话。\n朋友：在说什么？\n我：他们在说"好安静"。'
    },
    
    # 家庭类
    {
        'category': '家庭',
        'title': '过年红包',
        'content': '妈：过年给你红包。\n我：谢谢妈妈。\n妈：红包里是什么？\n我：钱。\n妈：多少？\n我：100块。\n妈：那你给我200块。\n我：...'
    },
    {
        'category': '家庭',
        'title': '爸爸的手机',
        'content': '小明：爸爸为什么一直看手机？\n妈妈：因为爸爸在赚钱。\n小明：看手机能赚钱？\n妈妈：是的。\n小明：那我也看手机。\n妈妈：不准！'
    },
    {
        'category': '家庭',
        'title': '妈妈的唠叨',
        'content': '我：妈妈，你别唠叨了。\n妈：我没唠叨。\n我：那你为什么一直说？\n妈：因为你不听话。\n我：那我听话。\n妈：那你别唠叨。\n我：...'
    },
    {
        'category': '家庭',
        'title': '爷爷的笑话',
        'content': '爷爷：小明，给你讲个笑话。\n小明：好的。\n爷爷：从前有个人...\n小明：然后呢？\n爷爷：然后他笑了。\n小明：我也笑了。'
    },
    
    # 校园类
    {
        'category': '校园',
        'title': '课间休息',
        'content': '老师：课间休息。\n小明：老师，我饿了。\n老师：那你吃点东西。\n小明：可是教室不能吃东西。\n老师：那你出去吃。\n小明：可是外面下雨。\n老师：...'
    },
    {
        'category': '校园',
        'title': '作业太多',
        'content': '小明：妈妈，作业太多了。\n妈妈：那你快点写。\n小明：可是写不完。\n妈妈：那你慢慢写。\n小明：可是明天要交。\n妈妈：...'
    },
    {
        'category': '校园',
        'title': '运动会',
        'content': '老师：小明，运动会你报名跑步。\n小明：可是我不会跑步。\n老师：那你慢慢跑。\n小明：可是我会摔倒。\n老师：那你爬起来。\n小明：可是爬不起来。\n老师：...'
    },
    {
        'category': '校园',
        'title': '图书馆借书',
        'content': '小明：老师，我能借书吗？\n老师：可以。\n小明：那我能借10本吗？\n老师：不行。\n小明：那我借1本。\n老师：可以。\n小明：那我借第10本。\n老师：...'
    },
    {
        'category': '校园',
        'title': '考试成绩',
        'content': '小明：妈妈，我考试考了100分。\n妈妈：真的吗？\n小明：是的。\n妈妈：什么考试？\n小明：体育考试。\n妈妈：...'
    },
    
    # 更多儿童类
    {
        'category': '儿童',
        'title': '小狗狗',
        'content': '小明：妈妈，小狗狗为什么叫？\n妈妈：因为它饿了。\n小明：那我给它吃冰淇淋。\n妈妈：狗狗不能吃冰淇淋。\n小明：那给它吃肉。\n妈妈：好的。'
    },
    {
        'category': '儿童',
        'title': '大树为什么高',
        'content': '小明：妈妈，大树为什么那么高？\n妈妈：因为它长大了。\n小明：那我也会长高吗？\n妈妈：会的。\n小明：那我能长到天上去吗？\n妈妈：不能。'
    },
    {
        'category': '儿童',
        'title': '小鸟为什么飞',
        'content': '小明：妈妈，小鸟为什么能飞？\n妈妈：因为它有翅膀。\n小明：那我也有翅膀（手臂），为什么不能飞？\n妈妈：你的翅膀太小了。\n小明：那我长大了能飞吗？\n妈妈：不能。'
    },
    {
        'category': '儿童',
        'title': '太阳为什么圆',
        'content': '小明：妈妈，太阳为什么是圆的？\n妈妈：因为它是个球。\n小明：那我也是个球。\n妈妈：你不是球。\n小明：那我为什么不能发光？\n妈妈：...'
    },
    {
        'category': '儿童',
        'title': '月亮为什么亮',
        'content': '小明：妈妈，月亮为什么会发光？\n妈妈：因为太阳照在月亮上。\n小明：那太阳为什么照月亮？\n妈妈：因为月亮是地球的朋友。\n小明：那太阳也是地球的朋友。\n妈妈：是的。'
    },
    {
        'category': '儿童',
        'title': '小猫为什么叫',
        'content': '小明：妈妈，小猫为什么叫"喵喵"？\n妈妈：因为那是小猫的语言。\n小明：那我能说"喵喵"吗？\n妈妈：可以。\n小明：喵喵！\n妈妈：好可爱。'
    },
    {
        'category': '儿童',
        'title': '小兔子为什么跳',
        'content': '小明：妈妈，小兔子为什么跳？\n妈妈：因为它腿短。\n小明：那我的腿也短，为什么不能跳？\n妈妈：你能跳。\n小明：那我跳！\n妈妈：小心摔倒。'
    },
    {
        'category': '儿童',
        'title': '小鱼为什么游',
        'content': '小明：妈妈，小鱼为什么会游泳？\n妈妈：因为它在水里。\n小明：那我在水里也能游泳？\n妈妈：可以。\n小明：那我现在就去水里。\n妈妈：不准，现在要睡觉。'
    },
    {
        'category': '儿童',
        'title': '小熊为什么睡',
        'content': '小明：妈妈，小熊为什么睡觉？\n妈妈：因为它累了。\n小明：那我也累了，我要睡觉。\n妈妈：好的，晚安。\n小明：晚安妈妈。'
    },
    {
        'category': '儿童',
        'title': '小鸭子为什么叫',
        'content': '小明：妈妈，小鸭子为什么叫"嘎嘎"？\n妈妈：因为那是小鸭子的语言。\n小明：那我也能说"嘎嘎"？\n妈妈：可以。\n小明：嘎嘎！\n妈妈：...'
    },
]

def main():
    """补充笑话到100条"""
    # 加载现有笑话
    with open(JOKES_FILE, 'r', encoding='utf-8') as f:
        jokes = json.load(f)
    
    print(f'当前笑话数: {len(jokes)}')
    
    # 过滤已有的标题
    existing_titles = set(j['title'] for j in jokes)
    
    # 选择不重复的新笑话
    new_to_add = []
    for new_joke in NEW_JOKES:
        if new_joke['title'] not in existing_titles:
            new_to_add.append(new_joke)
    
    # 计算需要补充的数量
    target = 100
    need = target - len(jokes)
    
    print(f'需要补充: {need} 条')
    print(f'可用新笑话: {len(new_to_add)} 条')
    
    # 只补充需要的数量
    selected = new_to_add[:need]
    
    # 分配ID和日期
    max_id = max(j['id'] for j in jokes) if jokes else 0
    today = date.today().strftime('%Y-%m-%d')
    
    for joke in selected:
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
    jokes.extend(selected)
    
    # 保存
    with open(JOKES_FILE, 'w', encoding='utf-8') as f:
        json.dump(jokes, f, ensure_ascii=False, indent=2)
    
    print(f'\n✅ 补充完成!')
    print(f'新增: {len(selected)} 条')
    print(f'总计: {len(jokes)} 条')
    
    # 验证重复
    titles = [j['title'] for j in jokes]
    from collections import Counter
    title_counts = Counter(titles)
    duplicates = sum(1 for count in title_counts.values() if count > 1)
    print(f'验证重复数: {duplicates} ✅')

if __name__ == '__main__':
    main()