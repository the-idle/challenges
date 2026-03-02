// AI 服务 - 使用 OpenRouter API 接口

// 固定的API配置
const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1-0528-qwen3-8b';
const SYSTEM_PROMPT = 'You are a professional industrial equipment maintenance and troubleshooting expert. Please provide professional and accurate answers to user questions. The answers should be concise, highlight key points, and provide practical suggestions whenever possible.';

const SITE_URL = window.location.origin;
const SITE_NAME = 'Industrial Intelligence Platform'; // 使用英文名称避免编码问题

/**
 * 向 OpenRouter API 发送问题并获取回答
 * @param {string} question - 用户问题
 * @returns {Promise<string>} - AI 回答
 */
export const getAIResponse = async (question) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: question
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求失败');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '抱歉，无法获取回答';
  } catch (error) {
    console.error('AI 服务错误:', error);
    throw new Error(`获取AI回答失败: ${error.message}`);
  }
};

/**
 * 从回答中提取相关标签
 * @param {string} question - 用户问题
 * @param {string} answer - AI 回答
 * @returns {string[]} - 提取的标签数组
 */
export const extractTags = (question, answer) => {
  // 简单的标签提取逻辑，实际项目中可以使用更复杂的算法或调用专门的API
  const combinedText = `${question} ${answer}`.toLowerCase();
  const tagMap = {
    '电机': ['电机', '马达', '转子', '定子', '电动机'],
    '温度': ['温度', '过热', '发热', '冷却'],
    '振动': ['振动', '抖动', '晃动'],
    '压力': ['压力', '气压', '液压', '压强'],
    '润滑': ['润滑', '油', '脂', '摩擦'],
    '故障诊断': ['故障', '问题', '诊断', '排查'],
    '维护保养': ['维护', '保养', '维修', '养护'],
    '效率优化': ['效率', '优化', '提升', '改进'],
    '安全': ['安全', '防护', '保护', '风险']
  };

  const resultTags = [];

  Object.entries(tagMap).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      resultTags.push(tag);
    }
  });

  // 限制标签数量
  return resultTags.slice(0, 3);
};
