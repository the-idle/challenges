import request from '@/utils/request';

const DEFAULT_DEVICE_CODE = 'PLC_H5U_01';
const DEFAULT_DEVICE_NAME = '分拣PLC-H5U-01';
const DEFAULT_PRODUCTION_LINE = '分拣产线-01';
const DEFAULT_MOCK_FILE = 'e:\\demo\\lsfszls\\材料\\modbus_watch_history_2026-03-08T11-44-14-100Z.json';
const TARGET_DEVICE_CODE = import.meta.env.VITE_DEVICE_CODE || DEFAULT_DEVICE_CODE;
const OFFLINE_MOCK = (import.meta.env.VITE_OFFLINE_MOCK ?? 'false') === 'true';
const OFFLINE_MOCK_FILE = import.meta.env.VITE_OFFLINE_MOCK_FILE || DEFAULT_MOCK_FILE;

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return Boolean(value);
};

const evaluateDeviceStatus = (registers = {}) => {
  const hasFault = toBoolean(registers.x2_emergency_stop)
    || toBoolean(registers.m513_robot_fault)
    || toBoolean(registers.m21_total_emergency_stop);
  if (hasFault) return '故障';
  const hasWarning = (toNumber(registers.d154_servo_position) ?? 0) > 15000
    || (toNumber(registers.d1062_servo_auto_speed) ?? 0) > 800
    || (toNumber(registers.d1064_servo_auto_acceleration) ?? 0) > 2500;
  return hasWarning ? '预警' : '正常';
};

const deriveTemperature = (registers = {}, robotAxis = {}) => {
  const axisA2 = toNumber(robotAxis.a2 ?? registers.d801_robot_axis_a2);
  if (axisA2 !== null) {
    return Number((35 + Math.abs(axisA2)).toFixed(2));
  }
  const servoPosition = toNumber(registers.d154_servo_position);
  if (servoPosition !== null) {
    return Number((30 + Math.abs(servoPosition % 30)).toFixed(2));
  }
  return 35;
};

const deriveVibration = (registers = {}, robotAxis = {}) => {
  const axisA3 = toNumber(robotAxis.a3 ?? registers.d802_robot_axis_a3);
  if (axisA3 !== null) {
    return Number((Math.abs(axisA3) / 18).toFixed(2));
  }
  const speed = toNumber(registers.d1062_servo_auto_speed);
  if (speed !== null) {
    return Number((speed / 400).toFixed(2));
  }
  return 0.8;
};

const pad = (value) => String(value).padStart(2, '0');

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
};

const formatTimeLabel = (date) => {
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${m}-${d} ${h}:${mm}`;
};

const createMetricHistory = (current, spread) => {
  const safeCurrent = toNumber(current) ?? 0;
  return Array.from({ length: 12 }, (_, index) => {
    const time = new Date(Date.now() - (11 - index) * 5 * 60 * 1000);
    const wave = Math.sin((index / 11) * Math.PI * 2) * spread;
    return {
      time: formatTimeLabel(time),
      value: Number((safeCurrent + wave).toFixed(2))
    };
  });
};

const unwrapPayload = (payload) => {
  if (!payload) return payload;
  if (Array.isArray(payload)) return payload;
  if (payload.registers || payload.rows) return payload;
  if (payload.data !== undefined) return unwrapPayload(payload.data);
  return payload;
};

const buildLatestParams = (useOffline = OFFLINE_MOCK) => {
  const params = {};
  if (useOffline) {
    params.offlineMock = true;
    if (OFFLINE_MOCK_FILE) {
      params.mockFile = OFFLINE_MOCK_FILE;
    }
  }
  return params;
};

const loadLatestSnapshot = async (deviceCode) => {
  const response = await request({
    url: `/device/${deviceCode}/latest`,
    method: 'get',
    params: buildLatestParams()
  });
  let snapshot = unwrapPayload(response) || {};
  const registers = snapshot?.registers || {};
  if (OFFLINE_MOCK && Object.keys(registers).length === 0) {
    const liveResponse = await request({
      url: `/device/${deviceCode}/latest`,
      method: 'get',
      params: buildLatestParams(false)
    });
    snapshot = unwrapPayload(liveResponse) || snapshot;
  }
  return snapshot;
};

const mapDeviceRow = (device, snapshot) => {
  const registers = snapshot?.registers || {};
  const robotAxis = snapshot?.robotAxis || {};
  return {
    deviceId: device.deviceCode || DEFAULT_DEVICE_CODE,
    deviceName: device.deviceName || device.deviceCode || DEFAULT_DEVICE_NAME,
    status: evaluateDeviceStatus(registers),
    temperature: deriveTemperature(registers, robotAxis),
    vibration: deriveVibration(registers, robotAxis),
    productionLine: DEFAULT_PRODUCTION_LINE,
    lastMaintenance: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    registers,
    robotPosition: snapshot?.robotPosition || {},
    robotAxis,
    snapshotTimestamp: snapshot?.timestamp || Date.now()
  };
};

const toHealthStatus = (status) => {
  if (status === '故障') return 'fault';
  if (status === '预警') return 'warning';
  return 'normal';
};

export const getDeviceList = async () => {
  try {
    const device = {
      deviceCode: TARGET_DEVICE_CODE,
      deviceName: DEFAULT_DEVICE_NAME,
      enabled: true
    };
    const snapshot = await loadLatestSnapshot(TARGET_DEVICE_CODE);
    const rows = [mapDeviceRow(device, snapshot)];
    return { code: 200, rows };
  } catch (error) {
    return {
      code: 200,
      rows: [{
        deviceId: TARGET_DEVICE_CODE,
        deviceName: DEFAULT_DEVICE_NAME,
        status: '正常',
        temperature: 35,
        vibration: 0.8,
        productionLine: DEFAULT_PRODUCTION_LINE,
        lastMaintenance: formatDate(new Date()),
        registers: {},
        robotPosition: {},
        robotAxis: {},
        snapshotTimestamp: Date.now()
      }],
      error
    };
  }
};

export const getDeviceDetail = async (id) => {
  const listRes = await getDeviceList();
  const rows = listRes.rows || [];
  const base = rows.find((item) => item.deviceId === id) || rows[0];
  if (!base) {
    return { code: 200, data: null };
  }
  const temperature = base.temperature ?? 35;
  const vibration = base.vibration ?? 0.8;
  const speed = toNumber(base.registers?.d1062_servo_auto_speed) ?? 50;
  const efficiency = Math.max(60, Math.min(99, Number((92 - vibration * 3).toFixed(2))));
  const detail = {
    id: base.deviceId,
    name: base.deviceName,
    model: 'MELSEC-H5U',
    manufacturer: 'Mitsubishi',
    installationDate: formatDate(new Date('2025-01-01T00:00:00+08:00')),
    status: toHealthStatus(base.status),
    location: base.productionLine,
    lastMaintenance: base.lastMaintenance || formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    nextMaintenance: formatDate(new Date(Date.now() + 27 * 24 * 60 * 60 * 1000)),
    metrics: {
      temperature: {
        current: temperature,
        warning: 70,
        danger: 80,
        history: createMetricHistory(temperature, 1.8)
      },
      vibration: {
        current: vibration,
        warning: 2.2,
        danger: 3.2,
        history: createMetricHistory(vibration, 0.16)
      },
      power: {
        current: Number(Math.min(98, Math.max(20, speed / 10)).toFixed(2)),
        warning: 85,
        danger: 95,
        history: createMetricHistory(Math.min(98, Math.max(20, speed / 10)), 2.8)
      },
      efficiency: {
        current: efficiency,
        warning: 85,
        danger: 80,
        history: createMetricHistory(efficiency, 1.6)
      }
    },
    alarms: [],
    registers: base.registers,
    robotPosition: base.robotPosition,
    robotAxis: base.robotAxis
  };
  return { code: 200, data: detail };
};
