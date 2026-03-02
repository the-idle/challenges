export const mockMaintenanceSuggestions = [
  {
    id: 1,
    deviceId: 'DEV001',
    deviceName: '注塑机A',
    faultType: '轴承磨损',
    processStatus: 'pending',
    estimatedTime: '2025-07-15',
    confidence: 92,
    status: 'pending',
    riskLevel: 'severe'
  },
  {
    id: 2,
    deviceId: 'DEV002',
    deviceName: '冷却系统B',
    faultType: '温控异常',
    processStatus: 'processing',
    estimatedTime: '2025-08-01',
    confidence: 85,
    status: 'pending',
    riskLevel: 'moderate'
  },
  {
    id: 3,
    deviceId: 'DEV003',
    deviceName: '包装机C',
    faultType: '电机过热',
    processStatus: 'completed',
    estimatedTime: '2025-09-10',
    confidence: 78,
    status: 'pending',
    riskLevel: 'minor'
  }
];

export const mockMaintenanceHistory = [
  {
    id: 1,
    date: '2024-01-01',
    type: '定期维护',
    operator: '张工',
    status: '已完成',
    description: '按计划进行定期维护检查'
  },
  {
    id: 2,
    date: '2023-12-20',
    type: '故障维修',
    operator: '李工',
    status: '已完成',
    description: '处理温控系统异常'
  }
];

export const mockMaintenanceDetail = {
  predictedFailure: {
    probability: 0.92,
    timeWindow: '预计1-2周内',
    impact: '高',
    suggestedActions: [
      '更换轴承组件',
      '检查润滑系统',
      '校准传感器'
    ]
  },
  currentStatus: {
    temperature: '85°C',
    vibration: '2.5mm/s',
    noise: '75dB',
    lastInspection: '2025-05-15'
  },
  maintenanceWindow: {
    start: '2025-06-10',
    end: '2025-06-12',
    duration: '4小时',
    requiredPersonnel: ['机械工程师', '电气工程师']
  }
};
