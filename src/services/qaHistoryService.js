// 问答历史服务 - 处理问答历史的存储和检索

const QA_HISTORY_KEY = 'industrialQAHistory';

/**
 * 获取问答历史
 * @returns {Array} - 问答历史数组
 */
export const getQAHistory = () => {
  try {
    const storedHistory = localStorage.getItem(QA_HISTORY_KEY);
    if (storedHistory) {
      return JSON.parse(storedHistory);
    }
    return [];
  } catch (error) {
    console.error('获取问答历史失败:', error);
    return [];
  }
};

/**
 * 保存问答历史
 * @param {Array} history - 要保存的问答历史数组
 * @returns {boolean} - 保存是否成功
 */
export const saveQAHistory = (history) => {
  try {
    localStorage.setItem(QA_HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('保存问答历史失败:', error);
    return false;
  }
};

/**
 * 添加新的问答记录
 * @param {Object} qaItem - 新的问答记录
 * @returns {boolean} - 添加是否成功
 */
export const addQAItem = (qaItem) => {
  try {
    const history = getQAHistory();
    history.push(qaItem);
    return saveQAHistory(history);
  } catch (error) {
    console.error('添加问答记录失败:', error);
    return false;
  }
};

/**
 * 更新问答记录
 * @param {number} id - 问答记录ID
 * @param {Object} updatedItem - 更新后的问答记录
 * @returns {boolean} - 更新是否成功
 */
export const updateQAItem = (id, updatedItem) => {
  try {
    const history = getQAHistory();
    const index = history.findIndex(item => item.id === id);
    if (index !== -1) {
      history[index] = updatedItem;
      return saveQAHistory(history);
    }
    return false;
  } catch (error) {
    console.error('更新问答记录失败:', error);
    return false;
  }
}; 