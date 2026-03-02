// 维护建议页面 mock 数据

export const mockMaintenanceSuggestions = [
  {
    id: 'MS001',
    deviceId: 'DEV001',
    deviceName: '电机A-001',
    type: '预测性维护',
    priority: 'high',
    reason: '振动值持续上升，预计将在3天内超过警戒值',
    suggestion: '建议检查轴承状态，必要时更换轴承',
    predictedFailureTime: '2024-01-10',
    confidence: 0.92,
    status: 'pending'
  },
  {
    id: 'MS002',
    deviceId: 'DEV002',
    deviceName: '泵B-002',
    type: '预防性维护',
    priority: 'medium',
    reason: '运行时间已达到维护周期',
    suggestion: '建议进行常规维护，包括清洁和润滑',
    predictedFailureTime: '2024-01-15',
    confidence: 0.85,
    status: 'pending'
  },
  {
    id: 'MS003',
    deviceId: 'DEV003',
    deviceName: '阀门C-003',
    type: '故障修复',
    priority: 'high',
    reason: '检测到压力异常，存在泄漏风险',
    suggestion: '立即停机检查阀门密封',
    predictedFailureTime: '2024-01-08',
    confidence: 0.95,
    status: 'pending'
  },
  {
    id: 'MS004',
    deviceId: 'DEV004',
    deviceName: '传感器D-004',
    type: '更换部件',
    priority: 'low',
    reason: '信号丢失，传感器老化',
    suggestion: '更换新传感器',
    predictedFailureTime: '2024-01-20',
    confidence: 0.78,
    status: 'pending'
  },
  {
    id: 'MS005',
    deviceId: 'DEV005',
    deviceName: '风机E-005',
    type: '预防性维护',
    priority: 'medium',
    reason: '累计运行时间超标',
    suggestion: '清洁风机叶片，检查轴承',
    predictedFailureTime: '2024-01-18',
    confidence: 0.81,
    status: 'pending'
  },
  // 更多建议...
];

export const mockMaintenanceHistory = [
  {
    id: 'MH001',
    deviceId: 'DEV001',
    deviceName: '电机A-001',
    type: '定期维护',
    date: '2024-01-01',
    operator: '张工',
    description: '更换轴承，清洁电机',
    result: '正常',
    cost: 1200,
    duration: 4
  },
  {
    id: 'MH002',
    deviceId: 'DEV002',
    deviceName: '泵B-002',
    type: '故障维修',
    date: '2023-12-15',
    operator: '李工',
    description: '更换密封圈，调整压力',
    result: '正常',
    cost: 800,
    duration: 2
  },
  {
    id: 'MH003',
    deviceId: 'DEV003',
    deviceName: '阀门C-003',
    type: '故障修复',
    date: '2023-12-20',
    operator: '王工',
    description: '修复阀门泄漏',
    result: '正常',
    cost: 600,
    duration: 3
  },
  {
    id: 'MH004',
    deviceId: 'DEV004',
    deviceName: '传感器D-004',
    type: '更换部件',
    date: '2023-12-25',
    operator: '赵工',
    description: '更换温度传感器',
    result: '正常',
    cost: 300,
    duration: 1
  },
  {
    id: 'MH005',
    deviceId: 'DEV005',
    deviceName: '风机E-005',
    type: '定期维护',
    date: '2023-12-28',
    operator: '钱工',
    description: '清洁风机叶片',
    result: '正常',
    cost: 400,
    duration: 2
  },
  // 更多历史...
];

export const mockMaintenanceDetail = {
  id: 'MS001',
  deviceId: 'DEV001',
  deviceName: '电机A-001',
  type: '预测性维护',
  priority: 'high',
  reason: '振动值持续上升，预计将在3天内超过警戒值',
  suggestion: '建议检查轴承状态，必要时更换轴承',
  predictedFailureTime: '2024-01-10',
  confidence: 0.92,
  status: 'pending',
  metrics: {
    vibration: {
      current: 2.8,
      warning: 2.5,
      danger: 3.5,
      trend: 'up',
      history: [
        { time: '2024-01-01', value: 2.0 },
        { time: '2024-01-02', value: 2.2 },
        { time: '2024-01-03', value: 2.4 },
        { time: '2024-01-04', value: 2.6 },
        { time: '2024-01-05', value: 2.8 }
      ]
    },
    temperature: {
      current: 75,
      warning: 75,
      danger: 85,
      trend: 'stable',
      history: [
        { time: '2024-01-01', value: 72 },
        { time: '2024-01-02', value: 73 },
        { time: '2024-01-03', value: 74 },
        { time: '2024-01-04', value: 74 },
        { time: '2024-01-05', value: 75 }
      ]
    }
  },
  maintenanceHistory: [
    {
      id: 'MH001',
      date: '2024-01-01',
      type: '定期维护',
      operator: '张工',
      description: '更换轴承，清洁电机',
      result: '正常',
      cost: 1200,
      duration: 4
    },
    {
      id: 'MH003',
      date: '2023-12-20',
      type: '故障修复',
      operator: '王工',
      description: '修复阀门泄漏',
      result: '正常',
      cost: 600,
      duration: 3
    }
  ]
}; 