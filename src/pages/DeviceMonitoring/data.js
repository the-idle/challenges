// 设备监控页面 mock 数据

export const mockDeviceList = [
  {
    id: 'DEV001',
    name: '电机A-001',
    type: '电机',
    status: 'online',
    location: 'A区-01',
    lastMaintenance: '2024-01-01',
    nextMaintenance: '2024-02-01',
    metrics: {
      temperature: 65,
      vibration: 2.1,
      power: 75,
      efficiency: 92
    }
  },
  {
    id: 'DEV002',
    name: '泵B-002',
    type: '泵',
    status: 'warning',
    location: 'B区-02',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-01-15',
    metrics: {
      temperature: 78,
      vibration: 2.8,
      pressure: 0.85,
      flow: 120
    }
  },
  {
    id: 'DEV003',
    name: '阀门C-003',
    type: '阀门',
    status: 'offline',
    location: 'C区-03',
    lastMaintenance: '2023-12-20',
    nextMaintenance: '2024-01-20',
    metrics: {
      temperature: 45,
      pressure: 0.6,
      position: 75,
      leakage: 0
    }
  },
  {
    id: 'DEV004',
    name: '传感器D-004',
    type: '传感器',
    status: 'online',
    location: 'A区-04',
    lastMaintenance: '2024-01-03',
    nextMaintenance: '2024-02-03',
    metrics: {
      temperature: 30,
      vibration: 1.2,
      signal: 98
    }
  },
  {
    id: 'DEV005',
    name: '风机E-005',
    type: '风机',
    status: 'warning',
    location: 'B区-05',
    lastMaintenance: '2023-12-28',
    nextMaintenance: '2024-01-28',
    metrics: {
      temperature: 55,
      vibration: 2.5,
      power: 60
    }
  },
  {
    id: 'DEV006',
    name: '压缩机F-006',
    type: '压缩机',
    status: 'online',
    location: 'C区-06',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05',
    metrics: {
      temperature: 90,
      vibration: 3.1,
      pressure: 1.2
    }
  },
  {
    id: 'DEV007',
    name: '加热器G-007',
    type: '加热器',
    status: 'online',
    location: 'D区-07',
    lastMaintenance: '2024-01-02',
    nextMaintenance: '2024-02-02',
    metrics: {
      temperature: 120,
      power: 80
    }
  },
  {
    id: 'DEV008',
    name: 'PLC-H-008',
    type: 'PLC',
    status: 'online',
    location: 'A区-08',
    lastMaintenance: '2024-01-04',
    nextMaintenance: '2024-02-04',
    metrics: {
      temperature: 40,
      signal: 99
    }
  },
  {
    id: 'DEV009',
    name: '变频器I-009',
    type: '变频器',
    status: 'warning',
    location: 'B区-09',
    lastMaintenance: '2023-12-30',
    nextMaintenance: '2024-01-30',
    metrics: {
      temperature: 70,
      vibration: 2.7,
      power: 85
    }
  },
  {
    id: 'DEV010',
    name: '控制器J-010',
    type: '控制器',
    status: 'offline',
    location: 'C区-10',
    lastMaintenance: '2023-12-25',
    nextMaintenance: '2024-01-25',
    metrics: {
      temperature: 50,
      signal: 95
    }
  },
  // 更多设备...
];

export const mockDeviceDetail = {
  id: 'DEV001',
  name: '电机A-001',
  type: '电机',
  model: 'Y2-280M-4',
  manufacturer: '西门子',
  installationDate: '2023-01-01',
  status: 'online',
  location: 'A区-01',
  lastMaintenance: '2024-01-01',
  nextMaintenance: '2024-02-01',
  metrics: {
    temperature: {
      current: 65,
      warning: 75,
      danger: 85,
      history: [
        { time: '2024-01-07 10:00', value: 62 },
        { time: '2024-01-07 11:00', value: 63 },
        { time: '2024-01-07 12:00', value: 65 },
        { time: '2024-01-07 13:00', value: 64 },
        { time: '2024-01-07 14:00', value: 65 }
      ]
    },
    vibration: {
      current: 2.1,
      warning: 2.5,
      danger: 3.5,
      history: [
        { time: '2024-01-07 10:00', value: 2.0 },
        { time: '2024-01-07 11:00', value: 2.1 },
        { time: '2024-01-07 12:00', value: 2.0 },
        { time: '2024-01-07 13:00', value: 2.1 },
        { time: '2024-01-07 14:00', value: 2.1 }
      ]
    },
    power: {
      current: 75,
      warning: 85,
      danger: 95,
      history: [
        { time: '2024-01-07 10:00', value: 72 },
        { time: '2024-01-07 11:00', value: 74 },
        { time: '2024-01-07 12:00', value: 75 },
        { time: '2024-01-07 13:00', value: 73 },
        { time: '2024-01-07 14:00', value: 75 }
      ]
    },
    efficiency: {
      current: 92,
      warning: 85,
      danger: 80,
      history: [
        { time: '2024-01-07 10:00', value: 93 },
        { time: '2024-01-07 11:00', value: 92 },
        { time: '2024-01-07 12:00', value: 91 },
        { time: '2024-01-07 13:00', value: 92 },
        { time: '2024-01-07 14:00', value: 92 }
      ]
    }
  },
  maintenanceHistory: [
    {
      id: 'M001',
      date: '2024-01-01',
      type: '定期维护',
      description: '更换轴承，清洁电机',
      operator: '张工',
      result: '正常'
    },
    {
      id: 'M002',
      date: '2023-12-01',
      type: '定期维护',
      description: '检查电机温度，测量振动',
      operator: '李工',
      result: '正常'
    }
  ],
  alarms: [
    {
      id: 'A001',
      time: '2024-01-07 14:30',
      type: '温度预警',
      level: 'warning',
      value: '75°C',
      threshold: '75°C',
      status: 'active'
    }
  ]
}; 