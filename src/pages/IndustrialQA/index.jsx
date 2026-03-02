import { useState, useRef, useEffect } from 'react';
import { Typography, Input, Button, Card, List, Avatar, Spin, Tag, Space, Empty, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, BulbOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getAIResponse, extractTags } from '../../services/aiService';
import { getQAHistory, addQAItem, updateQAItem } from '../../services/qaHistoryService';
import ReactMarkdown from 'react-markdown';
import './index.css';

// 模拟问答历史数据
const mockQAHistory = [
  {
    id: 1,
    question: '电机温度过高可能是什么原因？',
    answer: '电机温度过高可能由以下原因导致：\n1. 负载过大，超过电机额定功率\n2. 环境温度过高\n3. 冷却系统故障\n4. 轴承损坏或缺乏润滑\n\n建议检查以上几点，特别是确认电机的负载情况和冷却系统是否正常工作。',
    timestamp: '2025-06-03 13:23:45',
    tags: ['电机', '温度', '故障诊断']
  }
];

// 常见问题列表
const suggestedQuestions = [
  '如何提高设备维护效率？',
  '电机轴承过热的原因和解决方法',
  '工业机器人的常见故障及排除方法',
  '压力传感器的校准步骤',
  '如何识别和预防水泵气蚀现象'
];

const IndustrialQA = () => {
  const [question, setQuestion] = useState('');
  const [qaList, setQAList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  // 初始化时从 localStorage 加载问答历史
  useEffect(() => {
    const history = getQAHistory();
    if (history.length > 0) {
      setQAList(history);
    } else {
      setQAList(mockQAHistory);
    }
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [qaList]);

  // 聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 处理发送问题
  const handleSendQuestion = async () => {
    if (!question.trim() || loading) return;

    // 创建新的问答
    const newQuestion = {
      id: Date.now(),
      question: question.trim(),
      answer: '',
      timestamp: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      tags: ['处理中']
    };

    // 添加到问答列表和 localStorage
    setQAList(prev => [...prev, newQuestion]);
    addQAItem(newQuestion);
    setQuestion('');
    setLoading(true);

    try {
      // 调用 OpenRouter API
      const aiResponse = await getAIResponse(newQuestion.question);

      // 提取标签
      const responseTags = extractTags(newQuestion.question, aiResponse);

      // 更新问答记录
      const updatedItem = {
        ...newQuestion,
        answer: aiResponse,
        tags: responseTags.length > 0 ? responseTags : ['工业设备']
      };

      // 更新状态和 localStorage
      setQAList(prev => {
        const updated = [...prev];
        const index = updated.findIndex(item => item.id === newQuestion.id);
        if (index !== -1) {
          updated[index] = updatedItem;
        }
        return updated;
      });
      updateQAItem(newQuestion.id, updatedItem);
    } catch (error) {
      // 错误处理
      message.error(`获取回答失败: ${error.message}`);

      // 更新问答记录
      const errorItem = {
        ...newQuestion,
        answer: '抱歉，获取回答时出现错误。请稍后再试或联系系统管理员。',
        tags: ['错误']
      };

      // 更新状态和 localStorage
      setQAList(prev => {
        const updated = [...prev];
        const index = updated.findIndex(item => item.id === newQuestion.id);
        if (index !== -1) {
          updated[index] = errorItem;
        }
        return updated;
      });
      updateQAItem(newQuestion.id, errorItem);
    } finally {
      setLoading(false);
    }
  };

  // 渲染问答列表
  const renderQAList = () => {
    if (qaList.length === 0) {
      return <Empty description="暂无问答记录" />;
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={qaList}
        renderItem={(item) => (
          <div className="qa-item" key={item.id}>
            <div className="question-container">
              <div className="avatar-container">
                <Avatar size="small" icon={<UserOutlined />} />
              </div>
              <div className="content-container">
                <div className="question-header">
                  <Typography.Text strong>您的问题</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{item.timestamp}</Typography.Text>
                </div>
                <div className="question-content">
                  <Typography.Paragraph style={{ margin: 0 }}>{item.question}</Typography.Paragraph>
                </div>
              </div>
            </div>

            <div className="answer-container">
              <div className="avatar-container">
                <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
              </div>
              <div className="content-container">
                <div className="answer-header">
                  <Typography.Text strong>智能助手</Typography.Text>
                  <Space size={[0, 4]}>
                    {item.tags.map((tag, index) => (
                      <Tag key={index} color="blue" style={{ fontSize: '12px', padding: '0 4px' }}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
                <div className="answer-content">
                  <Typography.Text style={{ margin: 0 }}>
                    {loading && item.id === qaList[qaList.length - 1].id ? (
                      <>
                        <Spin size="small" style={{ marginRight: '8px' }} />
                        正在思考中...
                      </>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ol>,
                          li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                          code: ({ children }) => <code style={{
                            background: '#f5f5f5',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                          }}>{children}</code>,
                          pre: ({ children }) => <pre style={{
                            background: '#f5f5f5',
                            padding: '8px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            margin: '8px 0'
                          }}>{children}</pre>
                        }}
                      >
                        {item.answer}
                      </ReactMarkdown>
                    )}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </div>
        )}
      />
    );
  };

  // 渲染常见问题建议
  const renderSuggestedQuestions = () => {
    return (
      <Card
        className="suggested-questions-card"
        title={<><BulbOutlined /> 常见问题</>}
        size="small"
      >
        <List
          size="small"
          dataSource={suggestedQuestions}
          renderItem={item => (
            <div
              className="suggested-question-item"
              onClick={() => {
                setQuestion(item);
                // 自动聚焦到输入框
                document.querySelector('.input-container .ant-input').focus();
              }}
            >
              <Typography.Text style={{ fontSize: '13px' }}>
                <QuestionCircleOutlined style={{ marginRight: '6px' }} />
                {item}
              </Typography.Text>
            </div>
          )}
        />
      </Card>
    );
  };

  return (
    <div className="industrial-qa-container">
      <div className="qa-header">
        <Typography.Title level={4} style={{ margin: '0 0 4px 0' }}>工业智问</Typography.Title>
        <Typography.Text type="secondary">
          利用大模型技术，解答工业设备相关问题，提供专业的故障诊断和维护建议。
        </Typography.Text>
      </div>

      <div className="qa-content">
        <div className="qa-main">
          <Card className="qa-list-card" title="问答历史" size="small">
            {qaList.length > 0 ? (
              <List
                dataSource={qaList}
                renderItem={(item) => (
                  <div className="qa-item" key={item.id}>
                    <div className="question-container">
                      <div className="avatar-container">
                        <Avatar size="small" icon={<UserOutlined />} />
                      </div>
                      <div className="content-container">
                        <div className="question-header">
                          <Typography.Text strong>您的问题</Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{item.timestamp}</Typography.Text>
                        </div>
                        <div className="question-content">
                          <Typography.Text style={{ margin: 0 }}>{item.question}</Typography.Text>
                        </div>
                      </div>
                    </div>

                    <div className="answer-container">
                      <div className="avatar-container">
                        <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
                      </div>
                      <div className="content-container">
                        <div className="answer-header">
                          <Typography.Text strong>智能助手</Typography.Text>
                          <Space size={[0, 4]}>
                            {item.tags.map((tag, index) => (
                              <Tag key={index} color="blue" style={{ fontSize: '12px', padding: '0 4px' }}>{tag}</Tag>
                            ))}
                          </Space>
                        </div>
                        <div className="answer-content">
                          <Typography.Text style={{ margin: 0 }}>
                            {loading && item.id === qaList[qaList.length - 1].id ? (
                              <>
                                <Spin size="small" style={{ marginRight: '8px' }} />
                                正在思考中...
                              </>
                            ) : (
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                                  ul: ({ children }) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ul>,
                                  ol: ({ children }) => <ol style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ol>,
                                  li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                                  code: ({ children }) => <code style={{
                                    background: '#f5f5f5',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    fontFamily: 'monospace'
                                  }}>{children}</code>,
                                  pre: ({ children }) => <pre style={{
                                    background: '#f5f5f5',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    margin: '8px 0'
                                  }}>{children}</pre>
                                }}
                              >
                                {item.answer}
                              </ReactMarkdown>
                            )}
                          </Typography.Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />
            ) : (
              <Empty description="暂无问答记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            <div ref={messageEndRef} />
          </Card>

          <div className="input-container">
            <Input.TextArea
              placeholder="请输入您的工业设备相关问题..."
              autoSize={{ minRows: 2, maxRows: 4 }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendQuestion();
                }
              }}
              disabled={loading}
              style={{ fontSize: '14px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendQuestion}
              disabled={loading || !question.trim()}
              size="middle"
            >
              发送
            </Button>
          </div>
        </div>

        <div className="qa-sidebar">
          {renderSuggestedQuestions()}
        </div>
      </div>
    </div>
  );
};

export default IndustrialQA;
