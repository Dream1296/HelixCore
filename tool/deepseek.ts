// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-7bd987a3fae7440983b6d6d6e203b08d'
});

let data = `{
  words_result: [
    { words: '10:14:14' },
    { words: 'HD' },
    { words: '4G' },
    { words: '4G' },
    { words: '2' },
    { words: '29%' },
    { words: '<' },
    { words: '隐私' },
    { words: '...' },
    { words: 'Dream1296' },
    { words: '2025/03/0418:56-19:01平顶山市·晴·5℃' },
    { words: '户外跑步' },
    { words: 'PB' },
    { words: '1.02' },
    { words: '最快配速' },
    { words: '新纪录' },
    { words: '公里' },
    { words: "成绩05'06'" },
    { words: '莲花盆1桥' },
    { words: '全屏' },
    { words: '视频' },
    { words: '慢' },
    { words: '快' },
    { words: '盆2桥' },
    { words: '水库路' },
    { words: '获得了1个跑步路线成绩' },
    { words: '>' },
    { words: '运动数据' },
    { words: '查看详情' },
    { words: '训练时长' },
    { words: '平均配速m' },
    { words: '运动消耗' },
    { words: '00:05:14' },
    { words: "05'04”" },
    { words: '56' },
    { words: '千卡' },
    { words: '总时长' },
    { words: '运动负荷' },
    { words: '平均心率í' },
    { words: '00:05:16' },
    { words: '11' },
    { words: '154次/分' },
    { words: '平均步频' },
    { words: '平均功率í' },
    { words: '平均步幅' },
    { words: '174' },
    { words: '217' },
    { words: '112' },
    { words: '米' },
    { words: '7' },
    { words: '发布动态到社区' }
  ],
  words_result_num: 51,
  log_id: 1897197076368480800
}
`;

let con = `我将我的运动记录截屏通过orc进行识别，然后现在获取识别结果，请帮我从中分析出对于数据,并输出一个json字符串记录这些数据，只输出json字符串。${data}`

export  async function deep() {
  const completion = await openai.chat.completions.create({
    messages: [
        { role: 'user', content: "你好" },],
    model: "deepseek-reasoner",
    // stream:true
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}


deep()