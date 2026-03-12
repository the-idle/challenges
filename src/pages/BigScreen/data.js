// 模拟设备数据
export const mockDeviceLocations = [
  { id: 'device-A-001', name: '设备A-001', x: 35, y: 38, status: 'normal', temperature: 45, vibration: 2.3 },
  { id: 'device-A-002', name: '设备A-002', x: 85, y: 32, status: 'warning', temperature: 78, vibration: 4.5 },
  { id: 'device-B-002', name: '设备B-002', x: 52, y: 62, status: 'error', temperature: 92, vibration: 7.8 },
  { id: 'device-B-003', name: '设备B-003', x: 63, y: 69, status: 'error', temperature: 92, vibration: 7.8 },
  { id: 'device-C-001', name: '设备C-001', x: 15, y: 23, status: 'normal', temperature: 51, vibration: 1.9 },
  { id: 'device-C-002', name: '设备C-002', x: 16, y: 47, status: 'warning', temperature: 75, vibration: 5.2 },
  { id: 'device-C-003', name: '设备C-003', x: 35, y: 77, status: 'warning', temperature: 75, vibration: 5.2 },
  { id: 'device-C-004', name: '设备C-004', x: 25, y: 70, status: 'warning', temperature: 75, vibration: 5.2 },
  { id: 'device-D-001', name: '设备D-001', x: 76, y: 23, status: 'normal', temperature: 48, vibration: 2.1 },
  { id: 'device-D-002', name: '设备D-002', x: 70, y: 48, status: 'error', temperature: 95, vibration: 8.3 },
  { id: 'device-D-003', name: '设备D-003', x: 90, y: 68, status: 'error', temperature: 95, vibration: 8.3 },
  { id: 'device-D-004', name: '设备D-004', x: 83, y: 88, status: 'error', temperature: 95, vibration: 8.3 },
];

// 模拟关键指标数据
export const mockKeyMetrics = [
  { id: 'metric-run-indicator', title: 'M33运行指示灯', value: 0, unit: '', threshold: 1, status: 'error', displayValue: '停止' },
  { id: 'metric-servo-speed', title: 'D1062伺服自动速度', value: 0, unit: '', threshold: 1, status: 'normal' },
  { id: 'metric-servo-distance', title: 'D1060伺服一格距离', value: 0, unit: '', threshold: 1, status: 'normal' },
  { id: 'metric-lift-time', title: 'D1010提升带时间', value: 0, unit: '', threshold: 1, status: 'normal' },
  { id: 'metric-sort-time', title: 'D1012分拣带时间', value: 0, unit: '', threshold: 1, status: 'normal' },
];

// 模拟温度和振动数据
export const mockTimeSeriesData = {
  timestamps: Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - 24 + i);
    return date.toISOString().substring(11, 16);
  }),
  series: [
    {
      name: 'D154伺服位置',
      unit: '',
      color: '#1890FF',
      areaStartColor: 'rgba(24, 144, 255, 0.4)',
      areaEndColor: 'rgba(24, 144, 255, 0.1)',
      values: Array.from({ length: 24 }, () => 0)
    },
    {
      name: 'D152机器人位置Z',
      unit: '',
      color: '#FAAD14',
      areaStartColor: 'rgba(250, 173, 20, 0.4)',
      areaEndColor: 'rgba(250, 173, 20, 0.1)',
      values: Array.from({ length: 24 }, () => 0)
    }
  ]
};

// 模拟故障预警数据
export const mockAlerts = [
  { id: 'alert-001', deviceId: 'device-003', deviceName: '设备B-001', type: '轴承磨损', level: 'high', time: '2025-05-29 20:15:32' },
  { id: 'alert-002', deviceId: 'device-008', deviceName: '设备D-002', type: '温度过高', level: 'high', time: '2025-05-29 19:42:18' },
  { id: 'alert-003', deviceId: 'device-002', deviceName: '设备A-002', type: '振动异常', level: 'medium', time: '2025-05-29 18:30:45' },
  { id: 'alert-004', deviceId: 'device-005', deviceName: '设备C-001', type: '电流波动', level: 'medium', time: '2025-05-29 17:22:10' },
  { id: 'alert-005', deviceId: 'device-001', deviceName: '设备A-001', type: '润滑油不足', level: 'low', time: '2025-05-29 15:10:05' },
];

// 模拟维护记录
export const mockMaintenanceRecords = [
  { id: 'maint-001', deviceId: 'device-003', time: '2025-05-28 14:30:22', operator: '张工程师', action: '更换轴承' },
  { id: 'maint-002', deviceId: 'device-005', time: '2025-05-27 11:15:48', operator: '李技术员', action: '调整电机' },
  { id: 'maint-003', deviceId: 'device-008', time: '2025-05-26 09:40:33', operator: '王维修师', action: '降温处理' },
  { id: 'maint-004', deviceId: 'device-002', time: '2025-05-25 16:20:15', operator: '赵工程师', action: '紧固螺栓' },
  { id: 'maint-005', deviceId: 'device-001', time: '2025-05-24 10:05:42', operator: '刘技术员', action: '添加润滑油' },
  { id: 'maint-006', deviceId: 'device-004', time: '2025-05-23 15:40:18', operator: '陈工程师', action: '系统校准' },
  { id: 'maint-007', deviceId: 'device-006', time: '2025-05-22 09:25:33', operator: '吴技术员', action: '更换滤芯' },
  { id: 'maint-008', deviceId: 'device-007', time: '2025-05-21 14:15:27', operator: '黄维修师', action: '电路检修' },
  { id: 'maint-009', deviceId: 'device-003', time: '2025-05-20 11:30:42', operator: '张工程师', action: '传感器更新' },
  { id: 'maint-010', deviceId: 'device-008', time: '2025-05-19 16:55:19', operator: '王维修师', action: '散热器更换' },
  { id: 'maint-011', deviceId: 'device-002', time: '2025-05-18 10:20:36', operator: '赵工程师', action: '软件升级' },
  { id: 'maint-012', deviceId: 'device-005', time: '2025-05-17 13:45:51', operator: '李技术员', action: '电机清洁' },
  { id: 'maint-013', deviceId: 'device-001', time: '2025-05-16 09:10:24', operator: '刘技术员', action: '安全检查' },
  { id: 'maint-014', deviceId: 'device-007', time: '2025-05-15 15:35:48', operator: '黄维修师', action: '电源维护' },
  { id: 'maint-015', deviceId: 'device-004', time: '2025-05-14 11:50:33', operator: '陈工程师', action: '性能测试' },
];

// 中国地图数据（简化版，仅包含主要省份中心点）
// 模拟设备事件流数据
export const mockEventFlowData = [
  { time: '19:10:01', deviceId: '设备A-001', content: '正常启动', type: 'success' },
  { time: '19:09:45', deviceId: '设备B-002', content: '温度偏高', type: 'warning' },
  { time: '19:08:30', deviceId: '设备C-003', content: '故障停机', type: 'error' },
  { time: '19:07:12', deviceId: '设备A-001', content: '维护完成', type: 'success' },
  { time: '19:06:55', deviceId: '设备D-002', content: '系统升级', type: 'success' },
  { time: '19:05:40', deviceId: '设备B-001', content: '振动异常', type: 'warning' },
  { time: '19:04:22', deviceId: '设备C-002', content: '电源故障', type: 'error' },
  { time: '19:03:15', deviceId: '设备A-002', content: '定期检查', type: 'success' },
  { time: '19:02:08', deviceId: '设备D-001', content: '传感器校准', type: 'success' },
  { time: '19:01:30', deviceId: '设备B-003', content: '温度过高', type: 'warning' },
  { time: '19:00:45', deviceId: '设备C-001', content: '紧急停机', type: 'error' },
  { time: '18:59:20', deviceId: '设备A-003', content: '运行正常', type: 'success' },
];
