import { useState, useEffect, useRef } from 'react';
import { Modal, ConfigProvider, theme } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './styles.css';
import * as XLSX from 'xlsx';
import {
  getAIDiagnosisAlerts,
  getRobotPackageSnapshot,
  subscribeAIDiagnosisAlerts,
  subscribeRobotPackageEvents
} from '../../api/alarm';
import { getDeviceList } from '../../api/devic';

// 导入模拟数据
import {
  mockKeyMetrics,
  mockTimeSeriesData,
  mockMaintenanceRecords,
} from './data.js';

const realtimeGif = '/jxb.gif';

// 导入子组件
import Header from './components/Header';
import DeviceMap from './components/DeviceMap';
import KeyMetrics from './components/KeyMetrics';
import TimeSeriesChart from './components/TimeSeriesChart';

import AlertPanel from './components/AlertPanel';
import OperationPanel from './components/OperationPanel';
import EventFlow from './components/EventFlow';
import DeviceDetail from './components/DeviceDetail';

const LEVEL_TO_STATUS = {
  high: 'fault',
  medium: 'warning',
  low: 'normal'
};

const createPackageStats = (events) => {
  const total = events.length;
  const abnormal = events.filter((item) => item.result === 'abnormal').length;
  const ok = total - abnormal;
  const passRate = total > 0 ? ((ok / total) * 100).toFixed(1) : '0.0';
  return {
    total,
    ok,
    abnormal,
    passRate
  };
};

const normalizeAlertToDevice = (alert) => {
  if (!alert) {
    return null;
  }
  return {
    id: alert.deviceId || alert.id,
    deviceId: alert.deviceId || alert.id,
    name: alert.deviceName || alert.name,
    deviceName: alert.deviceName || alert.name,
    status: alert.statusCode || LEVEL_TO_STATUS[alert.level] || alert.status || 'warning',
    level: alert.level,
    type: alert.type,
    summary: alert.summary || alert.type,
    rootCause: alert.rootCause,
    recommendation: alert.recommendation,
    confidence: alert.confidence,
    diagnosisTime: alert.time,
    temperature: alert.temperature ?? '-',
    vibration: alert.vibration ?? '-'
  };
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const buildKeyMetrics = (rows) => {
  const total = rows.length;
  if (total === 0) {
    return [...mockKeyMetrics];
  }
  const normalCount = rows.filter((item) => item.status === '正常').length;
  const warningCount = rows.filter((item) => item.status === '预警').length;
  const faultCount = rows.filter((item) => item.status === '故障').length;
  const avgTemperature = rows.reduce((sum, item) => sum + toNumber(item.temperature), 0) / total;
  const avgVibration = rows.reduce((sum, item) => sum + toNumber(item.vibration), 0) / total;
  const onlineRate = (normalCount / total) * 100;
  const faultRate = ((warningCount + faultCount) / total) * 100;
  return [
    { id: 'metric-001', title: '设备在线率', value: Number(onlineRate.toFixed(1)), unit: '%', threshold: 90, status: onlineRate >= 90 ? 'normal' : 'warning' },
    { id: 'metric-002', title: '平均温度', value: Number(avgTemperature.toFixed(1)), unit: '℃', threshold: 80, status: avgTemperature > 80 ? 'warning' : 'normal' },
    { id: 'metric-003', title: '平均振动', value: Number(avgVibration.toFixed(2)), unit: 'm/s²', threshold: 6, status: avgVibration > 6 ? 'warning' : 'normal' },
    { id: 'metric-004', title: '故障率', value: Number(faultRate.toFixed(1)), unit: '%', threshold: 15, status: faultRate > 15 ? 'warning' : 'normal' }
  ];
};

const pushTimeSeries = (previous, temperatureValue, vibrationValue) => {
  const nextLabel = new Date().toTimeString().slice(0, 5);
  const nextTimestamps = [...previous.timestamps.slice(1), nextLabel];
  const nextTemperature = [...previous.temperature.slice(1), Number(temperatureValue.toFixed(1))];
  const nextVibration = [...previous.vibration.slice(1), Number(vibrationValue.toFixed(2))];
  return {
    timestamps: nextTimestamps,
    temperature: nextTemperature,
    vibration: nextVibration
  };
};

const BigScreen = ({ visible, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetailVisible, setDeviceDetailVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [apiStatus, setApiStatus] = useState('connected');
  const [aiAgentStatus, setAiAgentStatus] = useState('connected');
  const [robotStatus, setRobotStatus] = useState('connected');
  const [maintenanceRecords, setMaintenanceRecords] = useState([...mockMaintenanceRecords]);

  const [keyMetrics, setKeyMetrics] = useState([...mockKeyMetrics]);
  const [timeSeriesData, setTimeSeriesData] = useState({ ...mockTimeSeriesData });
  const [aiAlerts, setAiAlerts] = useState([]);
  const [packageEvents, setPackageEvents] = useState([]);
  const [packageStats, setPackageStats] = useState({
    total: 0,
    ok: 0,
    abnormal: 0,
    passRate: '0.0'
  });
  const realtimePollingRef = useRef(false);
  const realtimeTimerRef = useRef(null);

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
    setApiStatus(aiAgentStatus === 'connected' && robotStatus === 'connected' ? 'connected' : 'disconnected');
  }, [aiAgentStatus, robotStatus]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    let disposed = false;
    const pollLatest = async () => {
      if (disposed || realtimePollingRef.current) {
        return;
      }
      realtimePollingRef.current = true;
      try {
        const response = await getDeviceList();
        const rows = response?.rows || [];
        const metrics = buildKeyMetrics(rows);
        const avgTemperatureMetric = metrics.find((item) => item.id === 'metric-002');
        const avgVibrationMetric = metrics.find((item) => item.id === 'metric-003');
        setKeyMetrics(metrics);
        setTimeSeriesData((prev) =>
          pushTimeSeries(
            prev,
            avgTemperatureMetric?.value ?? 0,
            avgVibrationMetric?.value ?? 0
          )
        );
        setApiStatus('connected');
      } catch {
        setApiStatus('disconnected');
      } finally {
        realtimePollingRef.current = false;
        if (!disposed) {
          realtimeTimerRef.current = setTimeout(pollLatest, 2000);
        }
      }
    };
    pollLatest();
    return () => {
      disposed = true;
      realtimePollingRef.current = false;
      if (realtimeTimerRef.current) {
        clearTimeout(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    let mounted = true;
    getAIDiagnosisAlerts()
      .then((res) => {
        if (!mounted) {
          return;
        }
        const rows = res?.rows || [];
        setAiAlerts(rows);
        if (rows.length > 0) {
          setSelectedDevice(normalizeAlertToDevice(rows[0]));
        }
      })
      .catch(() => {
        if (mounted) {
          setAiAgentStatus('disconnected');
        }
      });
    getRobotPackageSnapshot()
      .then((res) => {
        if (!mounted) {
          return;
        }
        const rows = res?.rows || [];
        setPackageEvents(rows);
        setPackageStats(createPackageStats(rows));
      })
      .catch(() => {
        if (mounted) {
          setRobotStatus('disconnected');
        }
      });

    const unsubscribeDiagnosis = subscribeAIDiagnosisAlerts(
      (payload) => {
        if (!mounted) {
          return;
        }
        setAiAlerts((prev) => [payload, ...prev].slice(0, 20));
      },
      setAiAgentStatus
    );
    const unsubscribePackages = subscribeRobotPackageEvents(
      (payload) => {
        if (!mounted) {
          return;
        }
        setPackageEvents((prev) => {
          const nextEvents = [payload, ...prev].slice(0, 30);
          setPackageStats(createPackageStats(nextEvents));
          return nextEvents;
        });
      },
      setRobotStatus
    );

    return () => {
      mounted = false;
      unsubscribeDiagnosis();
      unsubscribePackages();
    };
  }, [visible]);

  const handleDeviceClick = (device) => {
    setSelectedDevice(normalizeAlertToDevice(device));
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
          {/* 顶部区域 */}
          <Header
            title="工业机器人软袋小包药品柔性智能监控系统"
            currentTime={currentTime}
            apiStatus={apiStatus}
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
                  <span>实时视频</span>
                </div>
                <img
                  className="realtime-video"
                  src={realtimeGif}
                  alt="实时监控"
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    background: '#000'
                  }}
                />
                {/* 可扩展摄像头切换等功能 */}
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
              <AlertPanel alerts={aiAlerts} onAlertClick={handleDeviceClick} />
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
