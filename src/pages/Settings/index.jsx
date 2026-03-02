import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Space,
  Table,
  Switch,
  Select,
  InputNumber,
  Modal,
  Typography,
  Divider,
  Popconfirm,
  message,
  Tag,
  Tooltip
} from 'antd';
import {
  KeyOutlined,
  SettingOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  QuestionCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { mockSystemSettings, mockThresholdSettings, mockUserList } from './data.js';
import './index.css';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Settings = () => {
  const [thresholdForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [thresholdSettings, setThresholdSettings] = useState(mockThresholdSettings);
  const [userList, setUserList] = useState(mockUserList);
  const [addUserVisible, setAddUserVisible] = useState(false);

  // 编辑阈值行
  const handleEditThreshold = (record) => {
    thresholdForm.setFieldsValue({
      ...record
    });
    setEditingKey(record.id);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingKey('');
  };

  // 保存阈值设置
  const handleSaveThreshold = async (id) => {
    try {
      const row = await thresholdForm.validateFields();
      const newData = [...thresholdSettings];
      const index = newData.findIndex((item) => id === item.id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setThresholdSettings(newData);
        setEditingKey('');
        message.success('阈值设置保存成功');
      }
    } catch (errInfo) {
      console.error('验证失败:', errInfo);
    }
  };

  // 添加用户
  const handleAddUser = (values) => {
    const newUser = {
      id: `user_${Date.now()}`,
      ...values,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUserList([...userList, newUser]);
    setAddUserVisible(false);
    message.success('用户添加成功');
  };

  // 删除用户
  const handleDeleteUser = (id) => {
    setUserList(userList.filter(user => user.id !== id));
    message.success('用户删除成功');
  };

  // 阈值表格列定义
  const thresholdColumns = [
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: '15%',
      editable: false,
    },
    {
      title: '参数名称',
      dataIndex: 'paramName',
      key: 'paramName',
      width: '15%',
      editable: false,
    },
    {
      title: '警告阈值',
      dataIndex: 'warningThreshold',
      key: 'warningThreshold',
      width: '15%',
      editable: true,
    },
    {
      title: '危险阈值',
      dataIndex: 'dangerThreshold',
      key: 'dangerThreshold',
      width: '15%',
      editable: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
      editable: false,
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: '10%',
      editable: true,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="enabled"
            valuePropName="checked"
            style={{ margin: 0 }}
          >
            <Switch />
          </Form.Item>
        ) : (
          <Switch
            checked={record.enabled}
            disabled
          />
        );
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: '20%',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleSaveThreshold(record.id)}
              size="small"
            >
              保存
            </Button>
            <Button
              onClick={handleCancelEdit}
              size="small"
            >
              取消
            </Button>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditThreshold(record)}
            disabled={editingKey !== ''}
            size="small"
          >
            编辑
          </Button>
        );
      },
    },
  ];

  // 用户表格列定义
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === 'admin' ? 'red' : role === 'operator' ? 'blue' : 'green';
        let text = role === 'admin' ? '管理员' : role === 'operator' ? '操作员' : '观察者';

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) => {
            message.success(`用户${checked ? '启用' : '禁用'}成功`);
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              message.info('编辑用户功能开发中');
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 检查是否正在编辑该行
  const isEditing = (record) => record.id === editingKey;

  // 合并单元格配置
  const mergedColumns = thresholdColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // 可编辑单元格
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
  }) => {
    let inputNode = <Input />;

    if (dataIndex === 'warningThreshold' || dataIndex === 'dangerThreshold') {
      inputNode = <InputNumber min={0} max={1000} />;
    } else if (dataIndex === 'enabled') {
      return <td {...restProps}>{children}</td>;
    }

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `请输入 ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const items = [
    {
      key: 'threshold',
      label: (
        <span>
          <DatabaseOutlined />
          设备参数配置
        </span>
      ),
      children: (
        <Card variant="outlined">
          <Title level={3}>设备参数配置</Title>
          <Paragraph>
            配置各类设备的监控参数阈值，当设备运行数据超过这些阈值时，系统会触发相应的警告或预警。
          </Paragraph>

          <Form form={thresholdForm} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              bordered
              dataSource={thresholdSettings}
              columns={mergedColumns}
              rowKey="id"
              pagination={false}
              rowClassName={(record) => isEditing(record) ? 'editable-row' : ''}
            />
          </Form>
        </Card>
      ),
    },
    {
      key: 'user',
      label: (
        <span>
          <UserOutlined />
          用户权限管理
        </span>
      ),
      children: (
        <Card variant="outlined">
          <Title level={3}>用户权限管理</Title>
          <Paragraph>
            管理系统用户及其权限，包括管理员、操作员和观察者等不同角色。
          </Paragraph>

          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddUserVisible(true)}
            >
              添加用户
            </Button>
          </div>

          <Table
            dataSource={userList}
            columns={userColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Tabs defaultActiveKey="threshold" items={items} />

      <Modal
        title="添加用户"
        open={addUserVisible}
        onCancel={() => setAddUserVisible(false)}
        footer={null}
        width={600}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'auto'
          }
        }}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleAddUser}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认密码" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="operator">操作员</Option>
              <Option value="viewer">观察者</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue="active"
          >
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea rows={4} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setAddUserVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings; 