import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import './login.css';
import { saveAuth } from '@/utils/auth';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { message: messageApi } = App.useApp();

  // 登录
  const onFinish = (values) => {
    console.log('Login values:', values);
    setLoading(true);
    
    // 模拟API调用延迟
    setTimeout(() => {
      if (values.username === 'admin' && values.password === '123456') {
        // 保存账号、密码和模拟token（带过期时间）
        saveAuth({ username: values.username, password: values.password });
        message.success('登录成功');
        // 使用 replace 模式进行导航，防止用户返回到登录页
        navigate('/', { replace: true });
      } else {
        message.error('用户名或密码错误');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 60% 40%, #e0e7ff 60%, #0A1F3C 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle cx="80%" cy="20%" r="120" fill="#0A1F3C22" />
          <rect x="-60" y="70%" width="300" height="300" rx="80" fill="#0A1F3C11" />
          <circle cx="10%" cy="90%" r="80" fill="#0A1F3C18" />
        </svg>
      </div>
      <Card
        style={{
          width: 440,
          height: 420,
          boxShadow: '0 8px 32px rgba(10,31,60,0.18)',
          borderRadius: 16,
          zIndex: 1,
          background: 'rgba(255,255,255,0.98)',
          border: '1px solid #e0e7ff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: '#0A1F3C', marginBottom: 8 }} />
          <Title level={3} style={{ marginBottom: 0, color: '#0A1F3C', letterSpacing: 2 }}>设备预测性维护系统</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>Industrial Predictive Maintenance</Text>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          style={{ marginTop: 16 }}
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#0A1F3C' }} />}
              placeholder="用户名"
              size="large"
              autoFocus
              className="no-focus-effect"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#0A1F3C' }} />}
              placeholder="密码"
              size="large"
              className="no-focus-effect"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ borderRadius: 8, background: '#0A1F3C', border: 'none' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            账号：admin 密码：123456
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
