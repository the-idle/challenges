import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, ConfigProvider, theme, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './styles.css';
import * as XLSX from 'xlsx';
import { getDeviceList, getOrderQuantityStats } from '../../api/devic';

// 导入模拟数据
import {
  mockKeyMetrics,
  mockTimeSeriesData,
  mockMaintenanceRecords,
} from './data.js';

// 导入子组件
import Header from './components/Header';
import DeviceMap from './components/DeviceMap';
import KeyMetrics from './components/KeyMetrics';
import TimeSeriesChart from './components/TimeSeriesChart';

import AlertPanel from './components/AlertPanel';
import OperationPanel from './components/OperationPanel';
import EventFlow from './components/EventFlow';
import DeviceDetail from './components/DeviceDetail';

if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

const WS_FRESH_WINDOW_MS = 5000;
const POLL_INTERVAL_WS_FRESH_MS = 15000;
const POLL_INTERVAL_WS_DISCONNECTED_MS = 3000;
const POLL_INTERVAL_PAGE_HIDDEN_MS = 60000;

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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

const formatTime = (date) =>
  date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

const resolveApiBase = () => {
  const envBaseURL = import.meta.env.VITE_API_BASE_URL;
  if (envBaseURL && String(envBaseURL).trim()) {
    return String(envBaseURL).trim().replace(/\/$/, '');
  }
  return 'http://localhost:8080/api';
};

const resolveWsEndpoint = () => {
  const envWsUrl = import.meta.env.VITE_WS_URL;
  if (envWsUrl && String(envWsUrl).trim()) {
    return String(envWsUrl).trim().replace(/\/$/, '');
  }
  const base = resolveApiBase().replace(/\/$/, '');
  if (base.endsWith('/api')) {
    return `${base.slice(0, -4)}/ws`;
  }
  return `${base}/ws`;
};

const readNumber = (registers, key) => {
  const value = registers?.[key];
  return value === undefined ? null : toNumber(value, null);
};

const readBoolean = (registers, key) => {
  const value = registers?.[key];
  if (value === undefined) return null;
  return toBoolean(value);
};

const integerRegisterKeys = new Set([
  'd150_robot_pos_x',
  'd151_robot_pos_y',
  'd152_robot_pos_z',
  'd153_robot_pos_a',
  'd154_servo_position',
  'd156_axis_fault',
  'd800_robot_axis_a1',
  'd801_robot_axis_a2',
  'd802_robot_axis_a3',
  'd805_robot_axis_a4',
  'd1010_lift_belt_time',
  'd1012_sorting_belt_time'
]);

const normalizeRegisterValue = (key, value) => {
  if (value === null || value === undefined || value === '') return value;
  if (typeof value === 'boolean') return value;
  const n = toNumber(value, null);
  if (n === null) return value;
  if (Math.abs(n) < 1e-6) return 0;
  if (integerRegisterKeys.has(key)) return Math.round(n);
  return Number(n.toFixed(3));
};

const normalizeRegisters = (registers = {}) => Object.fromEntries(
  Object.entries(registers).map(([key, value]) => [key, normalizeRegisterValue(key, value)])
);

const buildKeyMetrics = (registers) => {
  if (!registers || Object.keys(registers).length === 0) {
    return [...mockKeyMetrics];
  }
  const runIndicator = readBoolean(registers, 'y3_run_indicator');
  const servoSpeed = readNumber(registers, 'd1062_servo_auto_speed');
  const servoDistance = readNumber(registers, 'd1060_servo_step_distance');
  const liftTime = readNumber(registers, 'd1010_lift_belt_time');
  const sortTime = readNumber(registers, 'd1012_sorting_belt_time');
  return [
    {
      id: 'metric-run-indicator',
      title: 'Y3运行指示灯',
      value: runIndicator ? 1 : 0,
      unit: '',
      threshold: 1,
      status: runIndicator ? 'normal' : 'error',
      displayValue: runIndicator ? '运行' : '停止'
    },
    {
      id: 'metric-servo-speed',
      title: 'D1062伺服自动速度',
      value: servoSpeed ?? 0,
      unit: '',
      threshold: Math.max(1, Math.abs(servoSpeed ?? 0)),
      status: 'normal'
    },
    {
      id: 'metric-servo-distance',
      title: 'D1060伺服一格距离',
      value: servoDistance ?? 0,
      unit: '',
      threshold: Math.max(1, Math.abs(servoDistance ?? 0)),
      status: 'normal'
    },
    {
      id: 'metric-lift-time',
      title: 'D1010提升带时间',
      value: liftTime ?? 0,
      unit: '',
      threshold: Math.max(1, Math.abs(liftTime ?? 0)),
      status: 'normal'
    },
    {
      id: 'metric-sort-time',
      title: 'D1012分拣带时间',
      value: sortTime ?? 0,
      unit: '',
      threshold: Math.max(1, Math.abs(sortTime ?? 0)),
      status: 'normal'
    }
  ];
};

const buildRobotSnapshot = (registers) => ({
  position: {
    x: readNumber(registers, 'd150_robot_pos_x'),
    y: readNumber(registers, 'd151_robot_pos_y'),
    z: readNumber(registers, 'd152_robot_pos_z'),
    a: readNumber(registers, 'd153_robot_pos_a')
  },
  joints: {
    a1: readNumber(registers, 'd800_robot_axis_a1'),
    a2: readNumber(registers, 'd801_robot_axis_a2'),
    a3: readNumber(registers, 'd802_robot_axis_a3'),
    a4: readNumber(registers, 'd805_robot_axis_a4')
  },
  status: {
    moving: readBoolean(registers, 'm514_robot_in_action'),
    standby: readBoolean(registers, 'm515_robot_standby'),
    fault: readBoolean(registers, 'm513_robot_fault')
  }
});

const buildDeviceAlerts = (registers, device) => {
  if (!registers) {
    return [];
  }
  const now = formatTime(new Date());
  const alerts = [];
  if (readBoolean(registers, 'm513_robot_fault')) {
    alerts.push({
      id: 'alert-m513',
      deviceId: device?.deviceId,
      deviceName: device?.deviceName,
      level: 'high',
      type: '机器人故障',
      summary: 'M513机器人故障',
      time: now
    });
  }
  const axisFault = readNumber(registers, 'd156_axis_fault');
  if (axisFault && axisFault !== 0) {
    alerts.push({
      id: 'alert-d156',
      deviceId: device?.deviceId,
      deviceName: device?.deviceName,
      level: 'high',
      type: '轴故障',
      summary: 'D156轴故障',
      time: now
    });
  }
  if (readBoolean(registers, 'x2_emergency_stop')) {
    alerts.push({
      id: 'alert-x2',
      deviceId: device?.deviceId,
      deviceName: device?.deviceName,
      level: 'high',
      type: '急停触发',
      summary: 'X2急停',
      time: now
    });
  }
  if (readBoolean(registers, 'm21_total_emergency_stop')) {
    alerts.push({
      id: 'alert-m21',
      deviceId: device?.deviceId,
      deviceName: device?.deviceName,
      level: 'high',
      type: '总急停',
      summary: 'M21总急停',
      time: now
    });
  }
  const safePosition = readBoolean(registers, 'm510_safe_position');
  if (safePosition === false) {
    alerts.push({
      id: 'alert-m510',
      deviceId: device?.deviceId,
      deviceName: device?.deviceName,
      level: 'medium',
      type: '安全位异常',
      summary: 'M510安全位异常',
      time: now
    });
  }
  return alerts;
};

const pushTimeSeries = (previous, nextValues = []) => {
  const nextLabel = new Date().toTimeString().slice(0, 5);
  const nextTimestamps = [...previous.timestamps.slice(1), nextLabel];
  return {
    timestamps: nextTimestamps,
    series: previous.series.map((item, index) => ({
      ...item,
      values: [
        ...item.values.slice(1),
        Number.isFinite(Number(nextValues[index]))
          ? Number(nextValues[index])
          : Number(item.values[item.values.length - 1] ?? 0)
      ]
    }))
  };
};

const hasValidRegisters = (registers) =>
  Boolean(registers && Object.keys(registers).length > 0);

const defaultPackageStats = {
  totalOrders: 0,
  totalItemsSold: 0,
  pendingOrders: 0,
  pendingItemsQuantity: 0
};

const BigScreen = ({ visible, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [primaryDevice, setPrimaryDevice] = useState(null);
  const [deviceDetailVisible, setDeviceDetailVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [apiStatus, setApiStatus] = useState('connected');
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [wsLatencyMs, setWsLatencyMs] = useState(null);
  const [isPageVisible, setIsPageVisible] = useState(() => document.visibilityState === 'visible');
  const [maintenanceRecords, setMaintenanceRecords] = useState([...mockMaintenanceRecords]);
  const [hasRealtimeData, setHasRealtimeData] = useState(false);

  const [keyMetrics, setKeyMetrics] = useState([...mockKeyMetrics]);
  const [timeSeriesData, setTimeSeriesData] = useState({ ...mockTimeSeriesData });
  const [deviceAlerts, setDeviceAlerts] = useState([]);
  const [packageEvents] = useState([]);
  const [packageStats, setPackageStats] = useState({ ...defaultPackageStats });
  const [robotSnapshot, setRobotSnapshot] = useState(buildRobotSnapshot({}));
  const realtimePollingRef = useRef(false);
  const realtimeTimerRef = useRef(null);
  const wsClientRef = useRef(null);
  const wsRealtimeSubscriptionRef = useRef(null);
  const wsReconnectTimerRef = useRef(null);
  const wsReconnectAttemptRef = useRef(0);
  const wsLastRefreshRef = useRef(0);
  const wsLastMessageAtRef = useRef(0);
  const latestSnapshotTsRef = useRef(0);
  const statsLastFetchedAtRef = useRef(0);
  const latestRegistersRef = useRef({});
  const primaryDeviceRef = useRef(null);
  const deviceCodeRef = useRef('PLC_H5U_01');

  const updateFromSnapshot = useCallback((baseDevice) => {
    const registers = normalizeRegisters(baseDevice?.registers || {});
    if (!hasValidRegisters(registers)) {
      return false;
    }
    const snapshotTsRaw = Number(baseDevice?.snapshotTimestamp ?? Date.now());
    const snapshotTs = Number.isFinite(snapshotTsRaw) && snapshotTsRaw > 0 ? snapshotTsRaw : Date.now();
    if (latestSnapshotTsRef.current > 0 && snapshotTs + 1000 < latestSnapshotTsRef.current) {
      return false;
    }
    const metrics = buildKeyMetrics(registers);
    const servoPosition = readNumber(registers, 'd154_servo_position');
    const robotPosZ = readNumber(registers, 'd152_robot_pos_z');
    setPrimaryDevice(baseDevice);
    primaryDeviceRef.current = baseDevice;
    latestRegistersRef.current = registers;
    if (baseDevice) {
      deviceCodeRef.current = baseDevice.deviceId || baseDevice.deviceCode || deviceCodeRef.current;
      setSelectedDevice((prev) => prev ?? baseDevice);
    }
    setKeyMetrics(metrics);
    setTimeSeriesData((prev) => pushTimeSeries(prev, [servoPosition, robotPosZ]));
    setRobotSnapshot(buildRobotSnapshot(registers));
    setDeviceAlerts(buildDeviceAlerts(registers, baseDevice));
    setHasRealtimeData(true);
    latestSnapshotTsRef.current = Math.max(latestSnapshotTsRef.current, snapshotTs);
    return true;
  }, []);

  const buildRegistersFromRealtimePayload = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    const merged = {
      ...(latestRegistersRef.current || {})
    };
    let changed = false;
    const digital = payload?.digital || {};
    Object.entries(digital).forEach(([key, value]) => {
      merged[key] = toBoolean(value);
      changed = true;
    });
    const analog = payload?.analog || {};
    Object.entries(analog).forEach(([key, value]) => {
      merged[key] = normalizeRegisterValue(key, value);
      changed = true;
    });
    const encoder = payload?.encoder || {};
    Object.entries(encoder).forEach(([key, value]) => {
      merged[key] = normalizeRegisterValue(key, value);
      changed = true;
    });
    if (!changed) {
      return null;
    }
    return merged;
  }, []);

  const applyRealtimePayload = useCallback((payload) => {
    const mergedRegisters = buildRegistersFromRealtimePayload(payload);
    if (!mergedRegisters) {
      return false;
    }
    const currentDevice = primaryDeviceRef.current || {};
    const deviceId = payload?.deviceCode || currentDevice.deviceId || deviceCodeRef.current;
    const nextDevice = {
      ...currentDevice,
      deviceId,
      deviceName: currentDevice.deviceName || '分拣PLC-H5U-01',
      registers: mergedRegisters,
      snapshotTimestamp: Number(payload?.pushTimestamp ?? payload?.timestamp ?? Date.now())
    };
    return updateFromSnapshot(nextDevice);
  }, [buildRegistersFromRealtimePayload, updateFromSnapshot]);

  const refreshLatestSnapshot = useCallback(async () => {
    if (realtimePollingRef.current) {
      return;
    }
    realtimePollingRef.current = true;
    try {
      const now = Date.now();
      const wsHealthy = wsStatus === 'connected' && now - wsLastMessageAtRef.current < WS_FRESH_WINDOW_MS;
      const shouldPullDevice = !wsHealthy || !hasRealtimeData;
      if (now - statsLastFetchedAtRef.current >= 5000) {
        const statsResult = await Promise.allSettled([getOrderQuantityStats()]);
        if (statsResult[0]?.status === 'fulfilled') {
          setPackageStats(statsResult[0].value);
          statsLastFetchedAtRef.current = now;
        }
      }
      if (shouldPullDevice) {
        const response = await getDeviceList();
        const rows = response?.rows || [];
        const baseDevice = rows[0] || null;
        if (baseDevice) {
          const updated = updateFromSnapshot(baseDevice);
          if (!updated && !hasRealtimeData) {
            setApiStatus('disconnected');
            return;
          }
        }
      }
      setApiStatus('connected');
    } catch {
      setApiStatus('disconnected');
    } finally {
      realtimePollingRef.current = false;
    }
  }, [hasRealtimeData, updateFromSnapshot, wsStatus]);

  const scheduleRefreshFromWs = useCallback(() => {
    const now = Date.now();
    if (now - wsLastRefreshRef.current < 500) {
      return;
    }
    wsLastRefreshRef.current = now;
    refreshLatestSnapshot();
  }, [refreshLatestSnapshot]);

  const connectWebSocket = useCallback(() => {
    if (wsReconnectTimerRef.current) {
      clearTimeout(wsReconnectTimerRef.current);
      wsReconnectTimerRef.current = null;
    }
    if (wsClientRef.current) {
      wsClientRef.current.deactivate();
      wsClientRef.current = null;
    }
    const client = new Client({
      webSocketFactory: () => new SockJS(resolveWsEndpoint()),
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000
    });
    wsClientRef.current = client;

    client.onConnect = () => {
      setWsStatus('connected');
      setWsLatencyMs(null);
      wsReconnectAttemptRef.current = 0;
      if (wsRealtimeSubscriptionRef.current) {
        wsRealtimeSubscriptionRef.current.unsubscribe();
      }
      wsRealtimeSubscriptionRef.current = client.subscribe(`/topic/realtime/${deviceCodeRef.current}`, (message) => {
        try {
          const payload = message?.body ? JSON.parse(message.body) : {};
          const timestampRaw = Number(payload?.pushTimestamp ?? payload?.timestamp);
          if (Number.isFinite(timestampRaw) && timestampRaw > 0) {
            const normalizedTs = timestampRaw < 1_000_000_000_000 ? timestampRaw * 1000 : timestampRaw;
            setWsLatencyMs(Math.max(0, Date.now() - normalizedTs));
          } else {
            setWsLatencyMs(null);
          }
          const applied = applyRealtimePayload(payload);
          wsLastMessageAtRef.current = Date.now();
          if (!applied) {
            scheduleRefreshFromWs();
          }
        } catch {
          setWsLatencyMs(null);
          scheduleRefreshFromWs();
        }
      });
      scheduleRefreshFromWs();
    };

    client.onStompError = () => {
      setWsStatus('disconnected');
      setWsLatencyMs(null);
      wsLastMessageAtRef.current = 0;
    };

    client.onWebSocketError = () => {
      setWsStatus('disconnected');
      setWsLatencyMs(null);
    };

    client.onWebSocketClose = () => {
      setWsStatus('disconnected');
      setWsLatencyMs(null);
      wsLastMessageAtRef.current = 0;
      if (wsRealtimeSubscriptionRef.current) {
        wsRealtimeSubscriptionRef.current.unsubscribe();
        wsRealtimeSubscriptionRef.current = null;
      }
      if (visible) {
        wsReconnectAttemptRef.current += 1;
        const delay = Math.min(15000, 1000 + wsReconnectAttemptRef.current * 1000);
        wsReconnectTimerRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      }
    };

    client.activate();
  }, [applyRealtimePayload, scheduleRefreshFromWs, visible]);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    let disposed = false;
    const pollLatest = async () => {
      if (disposed) {
        return;
      }
      await refreshLatestSnapshot();
      if (!disposed) {
        const wsFresh = wsStatus === 'connected' && Date.now() - wsLastMessageAtRef.current < WS_FRESH_WINDOW_MS;
        const nextDelay = !isPageVisible
          ? POLL_INTERVAL_PAGE_HIDDEN_MS
          : (wsFresh ? POLL_INTERVAL_WS_FRESH_MS : POLL_INTERVAL_WS_DISCONNECTED_MS);
        realtimeTimerRef.current = setTimeout(pollLatest, nextDelay);
      }
    };
    pollLatest();
    return () => {
      disposed = true;
      if (realtimeTimerRef.current) {
        clearTimeout(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
    };
  }, [visible, wsStatus, isPageVisible, refreshLatestSnapshot]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    connectWebSocket();
    return () => {
      if (wsReconnectTimerRef.current) {
        clearTimeout(wsReconnectTimerRef.current);
        wsReconnectTimerRef.current = null;
      }
      wsReconnectAttemptRef.current = 0;
      if (wsRealtimeSubscriptionRef.current) {
        wsRealtimeSubscriptionRef.current.unsubscribe();
        wsRealtimeSubscriptionRef.current = null;
      }
      if (wsClientRef.current) {
        wsClientRef.current.deactivate();
        wsClientRef.current = null;
      }
      setWsStatus('disconnected');
    };
  }, [visible, connectWebSocket]);

  const handleDeviceClick = (alert) => {
    if (!primaryDevice) {
      return;
    }
    setSelectedDevice({
      ...primaryDevice,
      summary: alert.summary,
      type: alert.type,
      status: alert.level === 'high' ? 'fault' : alert.level === 'medium' ? 'warning' : 'normal',
      diagnosisTime: alert.time
    });
    setDeviceDetailVisible(true);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleMaintenance = () => {
    console.log('维护设备:', selectedDevice);
  };

  const handleAddMaintenance = (newRecord) => {
    setMaintenanceRecords((prev) => [newRecord, ...prev]);
  };

  const handleExportData = () => {
    const data = maintenanceRecords.map(record => ({
      时间: record.time.split(' ')[0],
      设备: record.deviceId,
      操作人: record.operator,
      操作内容: record.action
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '维护记录');
    XLSX.writeFile(workbook, `维护记录_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const themeConfig = isDarkMode
    ? {
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00a8ff',
          colorBgBase: '#050d19',
          colorBgContainer: '#0a1f3c',
          colorText: '#e0e0e0',
          colorTextSecondary: '#a6b0c3',
          colorBorder: 'rgba(0, 168, 255, 0.2)'
        },
        components: {
          Modal: {
            contentBg: '#0a1f3c',
            headerBg: '#0a1f3c',
            footerBg: '#0a1f3c',
            titleColor: '#4fc3f7'
          },
          Table: {
            headerBg: 'rgba(0, 168, 255, 0.1)',
            headerColor: '#4fc3f7',
            rowHoverBg: 'rgba(0, 168, 255, 0.05)',
            borderColor: 'rgba(0, 168, 255, 0.1)'
          },
          Select: {
            selectorBg: 'rgba(0, 168, 255, 0.1)',
            optionSelectedBg: 'rgba(0, 168, 255, 0.2)'
          }
        }
      }
    : {
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorBgBase: '#f0f2f5',
          colorBgContainer: '#ffffff',
          colorText: '#1f1f1f',
          colorTextSecondary: '#595959',
          colorBorder: '#d9d9d9'
        },
        components: {
          Modal: {
            contentBg: '#ffffff',
            headerBg: '#ffffff',
            footerBg: '#ffffff',
            titleColor: '#1f1f1f'
          },
          Table: {
            headerBg: '#f5faff',
            headerColor: '#1f1f1f',
            rowHoverBg: 'rgba(24, 144, 255, 0.06)',
            borderColor: '#e6eaf0'
          },
          Select: {
            selectorBg: '#ffffff',
            optionSelectedBg: '#e6f4ff'
          }
        }
      };

  return (
    <ConfigProvider
      theme={themeConfig}
    >
      <Modal
        title={null}
        open={visible}
        onCancel={onClose}
        footer={null}
        width="100vw"
        style={{ top: 0, padding: 0, margin: 0, maxWidth: '100vw' }}
        styles={{
          body: {
            padding: 0,
            margin: 0,
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
          }
        }}
        wrapClassName="big-screen-modal-wrapper"
        className="big-screen-modal"
        destroyOnHidden
        maskClosable={false}
        keyboard={false}
        closable
      >
        <div className="big-screen-container" data-theme={isDarkMode ? 'dark' : 'light'}>
          {!hasRealtimeData ? (
            <div className="realtime-data-loading">
              <Spin size="large" tip="等待PLC实时数据..." />
            </div>
          ) : null}
          {/* 顶部区域 */}
          <Header
            title="工业机器人软袋小包药品柔性智能监控系统"
            currentTime={currentTime}
            apiStatus={apiStatus}
            wsStatus={wsStatus}
            wsLatencyMs={wsLatencyMs}
            isDarkMode={isDarkMode}
            onThemeChange={setIsDarkMode}
          />

          <div className="big-screen-content">
            {/* 左侧区域 */}
            <div className="left-panel">
              <div className="metrics-section">
                <div className="panel-title">
                  <ReloadOutlined style={{ marginRight: '8px', fontSize: '18px', color: '#4fc3f7' }} />
                  <span>设备情况</span>
                </div>
                <KeyMetrics metrics={keyMetrics} />
              </div>
              {/* 实时视频模块 */}
              <div className="realtime-video-container">
                <div className="panel-title">
                  <span role="img" aria-label="video" style={{ marginRight: '8px', fontSize: '18px', color: '#4fc3f7' }}>📹</span>
                  <span>机器人实时位姿</span>
                </div>
                <div className="robot-status-panel">
                  <div className="robot-status-section">
                    <div className="robot-status-title">笛卡尔坐标</div>
                    <div className="robot-status-grid">
                      <div className="robot-status-item">X：{robotSnapshot.position.x ?? '-'}</div>
                      <div className="robot-status-item">Y：{robotSnapshot.position.y ?? '-'}</div>
                      <div className="robot-status-item">Z：{robotSnapshot.position.z ?? '-'}</div>
                      <div className="robot-status-item">A：{robotSnapshot.position.a ?? '-'}</div>
                    </div>
                  </div>
                  <div className="robot-status-section">
                    <div className="robot-status-title">关节角度</div>
                    <div className="robot-status-grid">
                      <div className="robot-status-item">A1：{robotSnapshot.joints.a1 ?? '-'}</div>
                      <div className="robot-status-item">A2：{robotSnapshot.joints.a2 ?? '-'}</div>
                      <div className="robot-status-item">A3：{robotSnapshot.joints.a3 ?? '-'}</div>
                      <div className="robot-status-item">A4：{robotSnapshot.joints.a4 ?? '-'}</div>
                    </div>
                  </div>
                  <div className="robot-status-section">
                    <div className="robot-status-title">机器人状态</div>
                    <div className="robot-status-grid">
                      <div className={`robot-status-item ${robotSnapshot.status.moving ? 'status-on' : 'status-off'}`}>动作中：{robotSnapshot.status.moving ? '是' : '否'}</div>
                      <div className={`robot-status-item ${robotSnapshot.status.standby ? 'status-on' : 'status-off'}`}>待机：{robotSnapshot.status.standby ? '是' : '否'}</div>
                      <div className={`robot-status-item ${robotSnapshot.status.fault ? 'status-error' : 'status-off'}`}>故障：{robotSnapshot.status.fault ? '是' : '否'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <EventFlow events={packageEvents} packageStats={packageStats} />
            </div>

            {/* 中间区域 */}
            <div className="center-panel">
              <div className="center-flex-col">
                <div className="center-area1">
                  <DeviceMap />
                </div>
                <div className="center-area2">
                  <TimeSeriesChart
                    data={timeSeriesData}
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>

            {/* 右侧区域 */}
            <div className="right-panel">
              <AlertPanel alerts={deviceAlerts} onAlertClick={handleDeviceClick} />
              <OperationPanel
                maintenanceRecords={maintenanceRecords}
                onMaintenance={handleMaintenance}
                onExportData={handleExportData}
                selectedDevice={selectedDevice}
                onAddMaintenance={handleAddMaintenance}
              />
            </div>
          </div>
        </div>

        {/* 设备详情弹窗 */}
        <DeviceDetail
          visible={deviceDetailVisible}
          device={selectedDevice}
          onClose={() => setDeviceDetailVisible(false)}
          isDarkMode={isDarkMode}
        />
      </Modal>
    </ConfigProvider>
  );
};

export default BigScreen;
