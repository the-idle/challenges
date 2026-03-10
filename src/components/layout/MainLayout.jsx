import { useState, useEffect } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  DesktopOutlined,
  HistoryOutlined,
  ToolOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // 菜单项配置
  const menuItems = [
    {
      key: '/bigscreen',
      icon: <FullscreenOutlined />,
      label: '可视化大屏',
    },
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '系统概览',
    },
    {
      key: '/device-monitoring',
      icon: <DesktopOutlined />,
      label: '设备监控',
    },
    {
      key: '/historical-data',
      icon: <HistoryOutlined />,
      label: '历史数据',
    },
    {
      key: '/maintenance-suggestions',
      icon: <ToolOutlined />,
      label: '维护建议',
    },
    {
      key: '/industrial-qa',
      icon: <RobotOutlined />,
      label: '工业智问',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 处理退出登录
  const handleLogout = () => {
    // 清除token和过期时间
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    // 跳转到登录页
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    }
  };

  // 处理菜单点击事件
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10,
          height: '100vh',
          overflow: 'hidden',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: collapsed ? '16px' : '20px',
            color: '#1890ff',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
            {collapsed ? 'PDM' : '设备预测性维护系统'}
          </h1>
        </div>
        <div style={{ height: 'calc(100vh - 48px)', overflow: 'auto' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            background: colorBgContainer,
            padding: 0,
            boxShadow: '0 1px 4px #f0f1f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 48,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '18px', width: 48, height: 48 }}
          />

          {/* 当前时间显示 */}
          <div className="current-time">
            <Text style={{ fontSize: '16px', fontWeight: 500, color: '#1890ff' }}>{currentTime}</Text>
          </div>

          {/* 用户信息展示模块 */}
          <div style={{ marginRight: 32 }}>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <Space>
                <Avatar size={32} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500, color: '#0A1F3C' }}>admin</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content style={{
          margin: '6px 12px',
          padding: '10px 12px',
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 'calc(100vh - 60px)', /* 100vh - header height - reduced margins */
          height: 'calc(100vh - 60px)',
          overflow: 'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>

      {/* 全局样式 */}
      <style jsx="true">{`
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        /* 自定义滚动条样式 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        /* 时间显示样式 */
        .current-time {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(24, 144, 255, 0.05);
          padding: 4px 12px;
          border-radius: 4px;
          margin: 0 20px;
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
