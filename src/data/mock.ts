import type { Training } from '../types/training'
export const student = { name: '小林', teacher: '陈老师' }
export const trainings: Training[] = [
  {
    id: 'picture-naming', version: 2, title: '看图命名', category: '图片表达', duration: 5,
    format: '5 道图片录音题', summary: '看一看熟悉的物品，用自己的节奏说出名称。',
    goal: '观察图片并说出名称，练习自然开口和表达。',
    preparation: '每道题录制一段回答，停止后可试听或重录。无需追求速度，图片仅用于练习，不进行评分。',
    questions: ['apple', 'cup', 'cat', 'umbrella', 'ball'].map((id, index) => ({
      id, title: `图片 ${index + 1}`, image: { src: `/training-images/${id}.svg`, alt: ['一个红色苹果', '一只带把手的杯子', '一只坐着的猫', '一把撑开的雨伞', '一个足球'][index]! },
      instruction: '请观察图片，说出图中物品的名称。点击录音，按自己的节奏回答。',
      interaction: 'audio', required: true,
    })),
  },
  {
    id: 'text-reading', version: 2, title: '文字朗读', category: '朗读练习', duration: 5,
    format: '5 道文字录音题', summary: '读几句日常短句，练习舒适、自然的表达。',
    goal: '用舒适的音量朗读短句，感受呼吸与表达的配合。',
    preparation: '先看清文字再开始录音，每句可反复试听和重录，不进行语音识别或评分。',
    questions: [
      { id: 'morning', text: '早上好，今天的阳光很温暖。' },
      { id: 'water', text: '我想喝一杯温水，然后休息一下。' },
      { id: 'walk', text: '傍晚的时候，我们一起去公园散步。' },
      { id: 'listen', text: '谢谢你耐心听我说话。' },
      { id: 'pace', text: '我可以按照自己的节奏，把想法慢慢说完。' },
    ].map((item, index) => ({ ...item, title: `短句 ${index + 1}`, instruction: '请自然朗读上面的句子。读完后停止录音，可以先试听再继续。', interaction: 'audio', required: true })),
  },
  {
    id: 'soft-palate', version: 2, title: '软腭发音训练', category: '肌群与发音', duration: 5,
    format: '4 个步骤', summary: '从轻柔发音开始，找到舒适的表达节奏。',
    goal: '感受软腭抬起时的发音状态，尝试在放松的状态下自然发音。',
    preparation: '找一个安静、舒适的位置坐好，放松肩颈。按自己的节奏练习，感到不适时可以暂停。',
    questions: [
      { id: 'prepare', interaction: 'read', required: false, title: '准备动作', instruction: '放松肩膀和下颌，自然呼吸。轻轻张口，感受口腔内的空间，不必用力。' },
      { id: 'ao', interaction: 'practice', required: false, title: 'ao 发音练习', instruction: '用舒适的音量轻轻发出「ao」。每次发音后稍作休息，按自己的节奏重复。' },
      { id: 'er', interaction: 'practice', required: false, title: 'er 发音练习', instruction: '自然发出「er」，留意发音时的感受，不追求速度，也不必反复纠正自己。' },
      { id: 'recording', interaction: 'audio', required: false, title: '录音练习', instruction: '用舒适的音量读出 ao、er。点击开始录音并允许麦克风权限，结束后点击停止，试听后决定是否重新录制。' },
    ],
  },
  {
    id: 'expression', version: 2, title: '表达前的放松练习', category: '心理训练', duration: 3,
    format: '3 个阅读步骤', summary: '留意此刻的感受，给自己一点表达的空间。',
    goal: '觉察表达前的情绪，用温和的方式看待自己的表达体验。',
    preparation: '这里没有标准答案。你可以慢慢想，也可以随时返回首页。',
    questions: [
      { id: 'feelings', interaction: 'read', required: false, title: '觉察感受', instruction: '准备开口时，你的感受更接近平静、期待，还是有些紧张？先留意它，不急着改变。' },
      { id: 'reflection', interaction: 'read', required: false, title: '回顾一次表达', instruction: '想一想最近一次让你感觉轻松的交流。当时的环境或对方的回应，有什么让你感到舒适？' },
      { id: 'encouragement', interaction: 'read', required: false, title: '给自己一句鼓励', instruction: '试着对自己说一句温和的话，例如「我可以慢慢说完」。阅读并尝试后，标记完成即可，不需要填写答案。' },
    ],
  },
]
export const teacherMessage = '今天也不用着急。练习时多留意身体的感受，找到舒服的节奏，比说得快更重要。'
export const recentCourse = { title: '认识发音与呼吸', chapter: '第 2 节 · 自然呼吸的节奏', progress: 35 }


