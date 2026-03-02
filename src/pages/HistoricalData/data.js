// 历史数据页面 mock 数据

export const mockDeviceList = [
  { id: 'DEV001', name: '电机A-001', type: '电机' },
  { id: 'DEV002', name: '泵B-002', type: '泵' },
  { id: 'DEV003', name: '阀门C-003', type: '阀门' },
  { id: 'DEV004', name: '变频器D-004', type: '变频器' },
  { id: 'DEV005', name: 'PLC-E005', type: 'PLC' },
  { id: 'DEV006', name: '风机F-006', type: '风机' },
  { id: 'DEV007', name: '压缩机G-007', type: '压缩机' },
  { id: 'DEV008', name: '加热器H-008', type: '加热器' },
  { id: 'DEV009', name: '传感器I-009', type: '传感器' },
  { id: 'DEV010', name: '控制器J-010', type: '控制器' }
];

export const mockHistoricalData = {
  timestamps: [
    '2024-01-01 08:00', '2024-01-01 12:00', '2024-01-01 16:00',
    '2024-01-02 08:00', '2024-01-02 12:00', '2024-01-02 16:00',
    '2024-01-03 08:00', '2024-01-03 12:00', '2024-01-03 16:00',
    '2024-01-04 08:00', '2024-01-04 12:00', '2024-01-04 16:00',
    '2024-01-05 08:00', '2024-01-05 12:00', '2024-01-05 16:00',
    '2024-01-06 08:00', '2024-01-06 12:00', '2024-01-06 16:00',
    '2024-01-07 08:00', '2024-01-07 12:00', '2024-01-07 16:00'
  ],
  metrics: {
    temperature: Array.from({ length: 20 }, (_, i) => ({ time: `2024-01-${String(1 + Math.floor(i / 3)).padStart(2, '0')} ${['08:00', '12:00', '16:00'][i % 3]}`, value: 60 + Math.round(Math.random() * 20) })),
    vibration: Array.from({ length: 20 }, (_, i) => ({ time: `2024-01-${String(1 + Math.floor(i / 3)).padStart(2, '0')} ${['08:00', '12:00', '16:00'][i % 3]}`, value: 1.5 + Math.random() * 2 })),
    power: Array.from({ length: 20 }, (_, i) => ({ time: `2024-01-${String(1 + Math.floor(i / 3)).padStart(2, '0')} ${['08:00', '12:00', '16:00'][i % 3]}`, value: 70 + Math.round(Math.random() * 10) })),
    efficiency: Array.from({ length: 20 }, (_, i) => ({ time: `2024-01-${String(1 + Math.floor(i / 3)).padStart(2, '0')} ${['08:00', '12:00', '16:00'][i % 3]}`, value: 85 + Math.round(Math.random() * 10) })),
    faultRate: Array.from({ length: 20 }, (_, i) => ({ time: `2024-01-${String(1 + Math.floor(i / 3)).padStart(2, '0')} ${['08:00', '12:00', '16:00'][i % 3]}`, value: Math.round(2 + Math.random() * 8) }))
  },
  alarms: [
    { id: 'A001', time: '2024-01-05 12:00', type: '温度预警', level: 'warning', value: '85°C', threshold: '80°C', status: 'active' },
    { id: 'A002', time: '2024-01-06 16:00', type: '振动异常', level: 'critical', value: '4.2mm/s', threshold: '3.5mm/s', status: 'active' }
  ]
}; 