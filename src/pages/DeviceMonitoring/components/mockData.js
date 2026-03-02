// 生成模拟时间轴数据
export const generateTimeData = (count, interval = 'hour') => {
  const now = new Date();
  const times = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now);
    
    if (interval === 'minute') {
      time.setMinutes(time.getMinutes() - i);
    } else if (interval === 'hour') {
      time.setHours(time.getHours() - i);
    } else if (interval === 'day') {
      time.setDate(time.getDate() - i);
    }
    
    // 格式化时间
    let formattedTime;
    if (interval === 'minute') {
      formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    } else if (interval === 'hour') {
      formattedTime = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:00`;
    } else {
      formattedTime = `${time.getMonth() + 1}/${time.getDate()}`;
    }
    
    times.push(formattedTime);
  }
  
  return times;
};

// 生成随机温度数据
export const generateTemperatureData = (count, min = 20, max = 80) => {
  const data = [];
  let lastValue = Math.floor(min + Math.random() * (max - min));
  
  for (let i = 0; i < count; i++) {
    // 增加一些波动，但保持在合理范围内
    const change = Math.floor(Math.random() * 5) - 2; // -2 到 2 之间的变化
    let newValue = lastValue + change;
    
    // 确保值在范围内
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    
    data.push(newValue);
    lastValue = newValue;
  }
  
  return data;
};

// 生成随机振动数据
export const generateVibrationData = (count, min = 0, max = 10) => {
  const data = [];
  let lastValue = min + Math.random() * (max - min);
  
  for (let i = 0; i < count; i++) {
    // 振动数据可能会有突然的峰值
    let newValue;
    const spike = Math.random() < 0.1; // 10%的几率出现峰值
    
    if (spike) {
      newValue = Math.max(min, Math.min(max, lastValue + Math.random() * max * 0.5));
    } else {
      const change = (Math.random() * 0.6) - 0.3; // -0.3 到 0.3 之间的变化
      newValue = Math.max(min, Math.min(max, lastValue + change));
    }
    
    data.push(parseFloat(newValue.toFixed(2)));
    lastValue = newValue;
  }
  
  return data;
};

// 生成功率数据
export const generatePowerData = (count, min = 80, max = 100) => {
  const data = [];
  let lastValue = min + Math.random() * (max - min);
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() * 4) - 2; // -2 到 2 之间的变化
    let newValue = Math.max(min, Math.min(max, lastValue + change));
    data.push(parseInt(newValue));
    lastValue = newValue;
  }
  
  return data;
};

// 生成效率数据
export const generateEfficiencyData = (count, min = 70, max = 100) => {
  const data = [];
  let trend = -0.05; // 缓慢下降的趋势
  let lastValue = max - Math.random() * 5; // 开始接近最大值
  
  for (let i = 0; i < count; i++) {
    const noise = (Math.random() * 2) - 1; // -1 到 1 之间的噪声
    let newValue = Math.max(min, Math.min(max, lastValue + noise + trend));
    data.push(parseInt(newValue));
    lastValue = newValue;
  }
  
  return data;
};

// 生成压力数据
export const generatePressureData = (count, min = 5, max = 9) => {
  const data = [];
  let lastValue = min + Math.random() * (max - min);
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() * 0.4) - 0.2; // -0.2 到 0.2 之间的变化
    let newValue = Math.max(min, Math.min(max, lastValue + change));
    data.push(parseFloat(newValue.toFixed(1)));
    lastValue = newValue;
  }
  
  return data;
};

// 生成湿度数据
export const generateHumidityData = (count, min = 40, max = 70) => {
  const data = [];
  let lastValue = min + Math.random() * (max - min);
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() * 4) - 2; // -2 到 2 之间的变化
    let newValue = Math.max(min, Math.min(max, lastValue + change));
    data.push(parseInt(newValue));
    lastValue = newValue;
  }
  
  return data;
};

// 生成完整的模拟数据集
export const generateMockDataset = (timeRange = '1h') => {
  let count, interval;
  
  switch (timeRange) {
    case '1h':
      count = 60;
      interval = 'minute';
      break;
    case '24h':
      count = 24;
      interval = 'hour';
      break;
    case '7d':
      count = 7;
      interval = 'day';
      break;
    default:
      count = 60;
      interval = 'minute';
  }
  
  // 生成时间轴
  const timeData = generateTimeData(count, interval);
  
  return {
    timeData,
    temperature: {
      data: generateTemperatureData(count, 20, 85),
      warning: 75,
      alert: 80,
      unit: '°C'
    },
    vibration: {
      data: generateVibrationData(count, 0, 12),
      warning: 8,
      alert: 10,
      unit: 'm/s²'
    },
    power: {
      data: generatePowerData(count, 80, 100),
      warning: 85,
      alert: 80,
      unit: '%'
    },
    efficiency: {
      data: generateEfficiencyData(count, 70, 100),
      warning: 75,
      alert: 70,
      unit: '%'
    },
    pressure: {
      data: generatePressureData(count, 5, 9),
      warning: 8.5,
      alert: 9,
      unit: 'MPa'
    },
    humidity: {
      data: generateHumidityData(count, 40, 70),
      warning: 65,
      alert: 70,
      unit: '%'
    }
  };
};

// 根据不同状态获取颜色
export const getStatusColor = (value, warning, alert) => {
  if (value >= alert) return '#FF4D4F'; // 报警颜色 - 红色
  if (value >= warning) return '#FAAD14'; // 警告颜色 - 橙色
  return '#52C41A'; // 正常颜色 - 绿色
};

// 获取当前状态文本
export const getStatusText = (value, warning, alert) => {
  if (value >= alert) return '报警';
  if (value >= warning) return '预警';
  return '正常';
};
