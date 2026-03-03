// 前端模拟告警数据，移除后端请求依赖

const mockAlarms = [
  { id: 'A001', deviceId: 'D-002', deviceName: '泵B-002', type: '温度预警', level: 'warning', time: '2025-10-10 10:15:20', status: 'active' },
  { id: 'A002', deviceId: 'D-005', deviceName: '风机E-005', type: '振动异常', level: 'warning', time: '2025-10-10 10:10:05', status: 'active' },
  { id: 'A003', deviceId: 'D-003', deviceName: '阀门C-003', type: '设备故障', level: 'error', time: '2025-10-10 09:58:42', status: 'active' },
];

const aiDiagnosisTemplates = [
  {
    deviceId: 'D-002',
    deviceName: '泵B-002',
    type: '轴承磨损风险',
    level: 'high',
    rootCause: '振动频谱出现高频峰值，轴承外圈疑似磨损',
    recommendation: '2小时内安排停机检查，优先更换轴承并复测振动',
    confidence: 0.93,
    temperature: 83,
    vibration: 6.2
  },
  {
    deviceId: 'D-005',
    deviceName: '风机E-005',
    type: '冷却效率下降',
    level: 'medium',
    rootCause: '叶轮积尘导致风量下降，电机温升持续抬高',
    recommendation: '本班次内执行清洁并核验电流曲线',
    confidence: 0.86,
    temperature: 76,
    vibration: 3.7
  },
  {
    deviceId: 'D-009',
    deviceName: '变频器I-009',
    type: '功率模块异常',
    level: 'high',
    rootCause: '输出谐波波动增大，IGBT温度接近保护阈值',
    recommendation: '切换备机并检查散热风道与驱动板',
    confidence: 0.91,
    temperature: 88,
    vibration: 1.8
  },
  {
    deviceId: 'D-001',
    deviceName: '电机A-001',
    type: '润滑状态变差',
    level: 'low',
    rootCause: '润滑周期接近上限，摩擦因子有上升趋势',
    recommendation: '24小时内补充润滑脂并复核运行噪声',
    confidence: 0.78,
    temperature: 69,
    vibration: 2.9
  }
];

const packageStations = ['上料工位', '视觉检测工位', '并联机器人抓取工位', '下料工位'];
const packageAbnormalReasons = ['条码识别失败', '重量偏差超限', '封口外观异常'];

const levelToStatus = {
  high: 'fault',
  medium: 'warning',
  low: 'normal'
};

const pad = (value) => String(value).padStart(2, '0');

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const formatTime = (date) => {
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${hour}:${minute}:${second}`;
};

const createDiagnosisAlert = (template, idSeed = Date.now()) => {
  const now = new Date();
  return {
    id: `AI-${idSeed}`,
    alertId: `AI-${idSeed}`,
    source: 'ai-agent',
    time: formatDateTime(now),
    summary: `${template.type}，置信度${Math.round(template.confidence * 100)}%`,
    status: 'active',
    ...template,
    statusCode: levelToStatus[template.level] || 'warning'
  };
};

const createPackageEvent = (index = Date.now()) => {
  const now = new Date();
  const isAnomaly = Math.random() < 0.16;
  const station = packageStations[Math.floor(Math.random() * packageStations.length)];
  const packageId = `PKG-${now.getHours()}${pad(now.getMinutes())}${pad(now.getSeconds())}-${index % 1000}`;
  const weight = +(Math.random() * 5 + 22).toFixed(1);
  const reason = packageAbnormalReasons[Math.floor(Math.random() * packageAbnormalReasons.length)];
  return {
    id: `PKG-EVT-${Date.now()}-${index}`,
    time: formatTime(now),
    packageId,
    station,
    weight,
    result: isAnomaly ? 'abnormal' : 'ok',
    type: isAnomaly ? 'warning' : 'success',
    content: isAnomaly ? reason : '抓取完成并通过检测'
  };
};

export const getAlarmList = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ code: 200, rows: mockAlarms }), 200);
  });
};

export const getAlarmDetail = (id) => {
  return new Promise((resolve) => {
    const found = mockAlarms.find(a => a.id === id) || mockAlarms[0];
    setTimeout(() => resolve({ code: 200, data: found }), 200);
  });
};

export const getAIDiagnosisAlerts = () => {
  return new Promise((resolve) => {
    const rows = aiDiagnosisTemplates
      .map((template, index) => createDiagnosisAlert(template, Date.now() - index * 30000))
      .sort((a, b) => (a.time < b.time ? 1 : -1));
    setTimeout(() => resolve({ code: 200, rows }), 220);
  });
};

export const subscribeAIDiagnosisAlerts = (onMessage, onStatusChange) => {
  onStatusChange && onStatusChange('connected');
  const timer = setInterval(() => {
    const template = aiDiagnosisTemplates[Math.floor(Math.random() * aiDiagnosisTemplates.length)];
    const levelRoll = Math.random();
    const level = levelRoll > 0.82 ? 'high' : levelRoll > 0.35 ? 'medium' : 'low';
    const confidence = Number((0.72 + Math.random() * 0.26).toFixed(2));
    const payload = createDiagnosisAlert(
      {
        ...template,
        level,
        confidence,
        statusCode: levelToStatus[level]
      },
      Date.now()
    );
    onMessage && onMessage(payload);
  }, 8000);

  const externalEventHandler = (event) => {
    if (event?.detail) {
      onMessage && onMessage(event.detail);
    }
  };
  window.addEventListener('ai-diagnosis-alert', externalEventHandler);

  return () => {
    clearInterval(timer);
    window.removeEventListener('ai-diagnosis-alert', externalEventHandler);
    onStatusChange && onStatusChange('disconnected');
  };
};

export const getRobotPackageSnapshot = () => {
  return new Promise((resolve) => {
    const events = Array.from({ length: 8 }, (_, index) => createPackageEvent(index)).reverse();
    setTimeout(() => resolve({ code: 200, rows: events }), 180);
  });
};

export const subscribeRobotPackageEvents = (onMessage, onStatusChange) => {
  onStatusChange && onStatusChange('connected');
  const timer = setInterval(() => {
    onMessage && onMessage(createPackageEvent(Date.now()));
  }, 3000);

  const externalEventHandler = (event) => {
    if (event?.detail) {
      onMessage && onMessage(event.detail);
    }
  };
  window.addEventListener('robot-package-event', externalEventHandler);

  return () => {
    clearInterval(timer);
    window.removeEventListener('robot-package-event', externalEventHandler);
    onStatusChange && onStatusChange('disconnected');
  };
};
