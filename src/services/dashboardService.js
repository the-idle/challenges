// 模拟数据
const mockData = {
  statistics: {
    totalDevices: 256,
    onlineDevices: 240,
    warningDevices: 12,
    offlineDevices: 4,
    predictionAccuracy: 95.8
  },
  recentAlarms: [
    {
      id: 1,
      deviceId: 'DEV001',
      deviceName: '电机A-001',
      alarmType: '温度异常',
      alarmTime: '2024-01-07 19:10:01',
      alarmLevel: 'high',
      details: '温度超过阈值，当前温度：85°C'
    },
    {
      id: 2,
      deviceId: 'DEV002',
      deviceName: '泵B-002',
      alarmType: '压力波动',
      alarmTime: '2024-01-07 19:09:45',
      alarmLevel: 'medium',
      details: '压力波动超出正常范围，建议检查'
    },
    {
      id: 3,
      deviceId: 'DEV003',
      deviceName: '阀门C-003',
      alarmType: '通信中断',
      alarmTime: '2024-01-07 19:08:30',
      alarmLevel: 'high',
      details: '设备通信中断，请检查网络连接'
    }
  ]
};

/**
 * 获取仪表盘数据
 * @returns {Promise<Object>} 仪表盘数据
 */
export const getDashboardData = async () => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 返回模拟数据
    return mockData;
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    throw new Error('获取数据失败，请稍后重试');
  }
};

/**
 * 获取设备性能数据
 * @returns {Promise<Object>} 设备性能数据
 */
export const getDevicePerformance = async () => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      data: [
        { name: '正常运行', value: 180 },
        { name: '轻微异常', value: 48 },
        { name: '需要维护', value: 28 }
      ]
    };
  } catch (error) {
    console.error('获取设备性能数据失败:', error);
    throw new Error('获取数据失败，请稍后重试');
  }
};

/**
 * 获取告警统计数据
 * @returns {Promise<Object>} 告警统计数据
 */
export const getAlarmStatistics = async () => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      total: 156,
      high: 23,
      medium: 45,
      low: 88
    };
  } catch (error) {
    console.error('获取告警统计数据失败:', error);
    throw new Error('获取数据失败，请稍后重试');
  }
};

/**
 * 获取区域设备数据
 * @returns {Promise<Object>} 区域设备数据
 */
export const getRegionalDeviceData = async () => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      regions: [
        { name: '区域A', devices: 85, online: 80 },
        { name: '区域B', devices: 65, online: 62 },
        { name: '区域C', devices: 45, online: 42 },
        { name: '区域D', devices: 61, online: 56 }
      ]
    };
  } catch (error) {
    console.error('获取区域设备数据失败:', error);
    throw new Error('获取数据失败，请稍后重试');
  }
}; 