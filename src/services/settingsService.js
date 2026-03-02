// 设置服务 - 处理系统设置的存储和检索

import { mockSystemSettings } from '../pages/Settings/data';

/**
 * 获取系统设置
 * @returns {Object} - 系统设置对象
 */
export const getSystemSettings = () => {
  try {
    const storedSettings = localStorage.getItem('systemSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return mockSystemSettings;
  } catch (error) {
    console.error('获取系统设置失败:', error);
    return mockSystemSettings;
  }
};

/**
 * 保存系统设置
 * @param {Object} settings - 要保存的设置对象
 * @returns {boolean} - 保存是否成功
 */
export const saveSystemSettings = (settings) => {
  try {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('保存系统设置失败:', error);
    return false;
  }
};

/**
 * 获取阈值设置
 * @returns {Array} - 阈值设置数组
 */
export const getThresholdSettings = () => {
  try {
    const storedSettings = localStorage.getItem('thresholdSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return [];
  } catch (error) {
    console.error('获取阈值设置失败:', error);
    return [];
  }
};

/**
 * 保存阈值设置
 * @param {Array} settings - 要保存的阈值设置数组
 * @returns {boolean} - 保存是否成功
 */
export const saveThresholdSettings = (settings) => {
  try {
    localStorage.setItem('thresholdSettings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('保存阈值设置失败:', error);
    return false;
  }
};

/**
 * 获取用户列表
 * @returns {Array} - 用户列表数组
 */
export const getUserList = () => {
  try {
    const storedUsers = localStorage.getItem('userList');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    return [];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return [];
  }
};

/**
 * 保存用户列表
 * @param {Array} users - 要保存的用户列表数组
 * @returns {boolean} - 保存是否成功
 */
export const saveUserList = (users) => {
  try {
    localStorage.setItem('userList', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('保存用户列表失败:', error);
    return false;
  }
}; 