import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './styles.css';
import * as XLSX from 'xlsx';
import {
  getAIDiagnosisAlerts,
  getRobotPackageSnapshot,
  subscribeAIDiagnosisAlerts,
  subscribeRobotPackageEvents
} from '../../api/alarm';

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

const BigScreen = ({ visible, onClose }) => {
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

  // 更新时间展示
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
    const metricTimer = setInterval(() => {
      setKeyMetrics((prev) =>
        prev.map((metric) => {
          const delta = metric.title.includes('在线率')
            ? (Math.random() * 1.5 - 0.6)
            : (Math.random() * 2 - 0.8);
          let nextValue = Number((metric.value + delta).toFixed(1));
          if (metric.title.includes('在线率')) {
            nextValue = Math.max(85, Math.min(99.5, nextValue));
          } else if (metric.title.includes('温度')) {
            nextValue = Math.max(40, Math.min(88, nextValue));
          } else if (metric.title.includes('振动')) {
            nextValue = Math.max(1, Math.min(8, nextValue));
          } else if (metric.title.includes('故障')) {
            nextValue = Math.max(5, Math.min(20, nextValue));
          }
          const isOnlineRate = metric.title.includes('在线率');
          const status = isOnlineRate
            ? (nextValue < metric.threshold ? 'warning' : 'normal')
            : (nextValue > metric.threshold ? 'warning' : 'normal');
          return {
            ...metric,
            value: nextValue,
            status
          };
        })
      );
    }, 5000);

    return () => clearInterval(metricTimer);
  }, []);

  useEffect(() => {
    const seriesTimer = setInterval(() => {
      setTimeSeriesData((prev) => {
        const now = new Date();
        const timeLabel = now.toTimeString().slice(0, 5);
        const lastTemp = prev.temperature[prev.temperature.length - 1] ?? 60;
        const lastVibration = prev.vibration[prev.vibration.length - 1] ?? 3;
        const nextTemp = Math.max(38, Math.min(95, Math.round(lastTemp + (Math.random() * 6 - 3))));
        const nextVibrationValue = Math.max(0.8, Math.min(9.5, +(lastVibration + (Math.random() * 0.8 - 0.4)).toFixed(1)));
        const nextTimestamps = [...prev.timestamps.slice(1), timeLabel];
        const nextTemperature = [...prev.temperature.slice(1), nextTemp];
        const nextVibration = [...prev.vibration.slice(1), nextVibrationValue];
        return {
          timestamps: nextTimestamps,
          temperature: nextTemperature,
          vibration: nextVibration
        };
      });
    }, 10000);

    return () => clearInterval(seriesTimer);
  }, []);

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

  return (
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
      <div className="big-screen-container">
        {/* 顶部区域 */}
        <Header
          title="工业机器人软袋小包药品柔性智能监控系统"
          currentTime={currentTime}
          apiStatus={apiStatus}
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
      />
    </Modal>
  );
};

export default BigScreen;
