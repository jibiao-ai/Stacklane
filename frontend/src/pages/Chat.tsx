import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Stop as StopIcon,
  SmartToy as AgentIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Extension as McpIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  mcpTools?: string[];
}

const mockAgents = [
  { id: '1', name: '客服助手', avatar: '🤖', model: 'GPT-4', mcpTools: ['web-search', 'knowledge-base'], color: '#165DFF' },
  { id: '2', name: '代码助手', avatar: '💻', model: 'Claude-3', mcpTools: ['code-executor', 'github-api'], color: '#722ED1' },
  { id: '3', name: '数据分析师', avatar: '📊', model: 'DeepSeek-V3', mcpTools: ['sql-query', 'chart-gen'], color: '#00B42A' },
  { id: '4', name: '文档撰写', avatar: '✍️', model: 'Qwen-72B', mcpTools: ['pdf-reader', 'file-manager'], color: '#FF7D00' },
  { id: '5', name: '翻译专家', avatar: '🌐', model: 'GPT-4', mcpTools: ['translate-api'], color: '#14C9C9' },
];

const initialMessages: Message[] = [
  {
    id: '1', role: 'system', content: '',
    timestamp: new Date(Date.now() - 600000),
  },
  {
    id: '2', role: 'user', content: '帮我优化一下 Stacklane 平台的产品介绍文案',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '3', role: 'assistant',
    content: '好的！这是优化后的版本：\n\n**Stacklane — 企业级 AI 模型运行平台**\n\n🚀 一键部署，分钟级上线。从模型导入到生产发布，Stacklane 让 AI 落地像搭积木一样简单。\n\n✨ 核心能力：\n• 智能 GPU 调度 — 自动编排算力，最大化利用率\n• 多模型编排 — 支持 vLLM、GPUStack、TensorRT-LLM\n• 全链路可观测 — 从推理延迟到 Token 消耗一目了然\n• 多租户隔离 — 企业级安全与资源隔离\n\n告别繁琐的基础设施管理，专注于创造 AI 的无限可能。\n\n需要我针对特定场景（如官网、融资 BP、技术文档）进一步调整吗？',
    timestamp: new Date(Date.now() - 280000), tokens: 234, mcpTools: ['knowledge-base'],
  },
];

const Chat: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('1');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAgent = mockAgents.find(a => a.id === selectedAgent)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  const simulateStream = (text: string) => {
    setIsStreaming(true);
    setStreamText('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < text.length) {
        setStreamText(prev => prev + text[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        const newMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: text,
          timestamp: new Date(),
          tokens: Math.floor(text.length * 1.3),
          mcpTools: Math.random() > 0.5 ? [currentAgent.mcpTools[0]] : undefined,
        };
        setMessages(prev => [...prev, newMsg]);
        setStreamText('');
      }
    }, 20);
    return interval;
  };

  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate AI response after a brief delay
    setTimeout(() => {
      const responses = [
        '收到，让我来帮你处理这个任务。\n\n根据你的需求，我进行了以下分析...\n\n1. **问题定位** — 已定位到核心问题\n2. **方案设计** — 推荐使用以下方案\n3. **实施步骤** — 具体执行步骤如下\n\n需要我继续深入某个环节吗？',
        '这是一个很好的问题！我来为你详细解答：\n\n首先，我们需要考虑以下几个方面：\n\n• **性能优化** — 通过缓存和并发控制提升响应速度\n• **安全性** — 确保数据传输加密和访问控制\n• **可扩展性** — 模块化设计支持水平扩展\n\n我已经通过 MCP 工具获取了相关资料，可以为你生成完整的实施方案。',
        '好的，我已经分析完毕。以下是结果摘要：\n\n📊 **分析报告**\n\n| 指标 | 当前值 | 目标值 | 差距 |\n|------|--------|--------|------|\n| 响应时间 | 245ms | <100ms | -145ms |\n| 吞吐量 | 1.2K QPS | 5K QPS | +3.8K |\n| 成功率 | 99.2% | 99.9% | +0.7% |\n\n建议优先优化响应时间，具体方案我可以进一步展开。',
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      streamIntervalRef.current = simulateStream(response);
    }, 500);
  };

  const handleStop = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    if (streamText) {
      const partialMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: streamText + '\n\n*[已中止]*',
        timestamp: new Date(),
        tokens: Math.floor(streamText.length * 1.3),
      };
      setMessages(prev => [...prev, partialMsg]);
    }
    setIsStreaming(false);
    setStreamText('');
  };

  const handleClear = () => {
    setMessages([]);
    setStreamText('');
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#1D2129' }}>
            {t('chat.title')}
          </Typography>
          <Typography sx={{ color: '#86909C', fontSize: '0.85rem', mt: 0.5 }}>
            {t('chat.subtitle')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {/* Agent selector */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              sx={{
                borderRadius: 2, fontSize: '0.82rem',
                '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 },
              }}
            >
              {mockAgents.map(agent => (
                <MenuItem key={agent.id} value={agent.id} sx={{ fontSize: '0.82rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{agent.avatar}</span>
                    <span>{agent.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title={t('chat.clearHistory')}>
            <IconButton size="small" onClick={handleClear} sx={{ color: '#86909C' }}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('chat.settings')}>
            <IconButton size="small" sx={{ color: '#86909C' }}>
              <SettingsIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chat box container */}
      <Paper sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        borderRadius: 3, border: '1px solid #E5E6EB',
        overflow: 'hidden', bgcolor: '#fff',
      }}>
        {/* Chat header bar */}
        <Box sx={{
          px: 2.5, py: 1.5,
          borderBottom: '1px solid #E5E6EB',
          display: 'flex', alignItems: 'center', gap: 1.5,
          bgcolor: '#FAFBFC',
        }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '1rem', bgcolor: `${currentAgent.color}15` }}>
            {currentAgent.avatar}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1D2129' }}>
                {currentAgent.name}
              </Typography>
              <Chip
                label={currentAgent.model}
                size="small"
                sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#F2F3F5', color: '#4E5969' }}
              />
              {isStreaming && (
                <Chip
                  label={t('chat.generating')}
                  size="small"
                  sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#E8FFEA', color: '#00B42A' }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
              <McpIcon sx={{ fontSize: 11, color: '#86909C' }} />
              <Typography sx={{ fontSize: '0.68rem', color: '#86909C' }}>
                MCP: {currentAgent.mcpTools.join(', ')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00B42A' }} />
            <Typography sx={{ fontSize: '0.68rem', color: '#00B42A' }}>{t('chat.online')}</Typography>
          </Box>
        </Box>

        {/* Streaming progress */}
        {isStreaming && (
          <LinearProgress sx={{ height: 2, '& .MuiLinearProgress-bar': { bgcolor: '#165DFF' } }} />
        )}

        {/* Messages area */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          {/* Welcome message if empty */}
          {messages.length === 0 && !isStreaming && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 2, fontSize: '2rem', bgcolor: `${currentAgent.color}10` }}>
                {currentAgent.avatar}
              </Avatar>
              <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1D2129', mb: 0.5 }}>
                {t('chat.welcomeTitle', { agent: currentAgent.name })}
              </Typography>
              <Typography sx={{ color: '#86909C', fontSize: '0.85rem', mb: 3, maxWidth: 400, mx: 'auto' }}>
                {t('chat.welcomeDesc')}
              </Typography>
              {/* Quick prompts */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[t('chat.quickPrompt1'), t('chat.quickPrompt2'), t('chat.quickPrompt3')].map((prompt, i) => (
                  <Chip
                    key={i}
                    label={prompt}
                    onClick={() => setInputValue(prompt)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: '#F2F3F5', color: '#4E5969',
                      fontSize: '0.78rem', height: 32,
                      '&:hover': { bgcolor: '#E8F0FF', color: '#165DFF' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Message list */}
          {messages.filter(m => m.role !== 'system').map((msg) => (
            <Box key={msg.id} sx={{
              display: 'flex', mb: 2.5,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 1.5,
            }}>
              <Avatar sx={{
                width: 32, height: 32,
                bgcolor: msg.role === 'user' ? '#165DFF' : `${currentAgent.color}12`,
                fontSize: msg.role === 'user' ? '0.8rem' : '1rem',
              }}>
                {msg.role === 'user' ? <PersonIcon sx={{ fontSize: 18, color: '#fff' }} /> : currentAgent.avatar}
              </Avatar>
              <Box sx={{ maxWidth: '72%' }}>
                <Paper sx={{
                  p: 2, borderRadius: 2.5,
                  bgcolor: msg.role === 'user' ? '#165DFF' : '#F7F8FA',
                  color: msg.role === 'user' ? '#fff' : '#1D2129',
                  border: msg.role === 'user' ? 'none' : '1px solid #E5E6EB',
                  boxShadow: 'none',
                }}>
                  <Typography sx={{
                    fontSize: '0.85rem', lineHeight: 1.75,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    '& strong': { fontWeight: 700 },
                  }}>
                    {msg.content}
                  </Typography>
                </Paper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, px: 0.5 }}>
                  <Typography sx={{ fontSize: '0.65rem', color: '#C9CDD4' }}>
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  {msg.tokens && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#C9CDD4' }}>
                      {msg.tokens} tokens
                    </Typography>
                  )}
                  {msg.mcpTools && msg.mcpTools.length > 0 && (
                    <Chip
                      icon={<McpIcon sx={{ fontSize: '10px !important' }} />}
                      label={msg.mcpTools.join(', ')}
                      size="small"
                      sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#F2F3F5' }}
                    />
                  )}
                  {msg.role === 'assistant' && (
                    <Tooltip title={t('chat.copy')}>
                      <IconButton
                        size="small"
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        sx={{ width: 18, height: 18 }}
                      >
                        <CopyIcon sx={{ fontSize: 11, color: '#C9CDD4' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          ))}

          {/* Streaming message */}
          {isStreaming && streamText && (
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '1rem', bgcolor: `${currentAgent.color}12` }}>
                {currentAgent.avatar}
              </Avatar>
              <Box sx={{ maxWidth: '72%' }}>
                <Paper sx={{
                  p: 2, borderRadius: 2.5,
                  bgcolor: '#F7F8FA', border: '1px solid #E5E6EB',
                  boxShadow: 'none',
                }}>
                  <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                    {streamText}
                    <Box component="span" sx={{
                      display: 'inline-block', width: 2, height: 16, bgcolor: '#165DFF',
                      ml: 0.5, animation: 'blink 1s infinite', verticalAlign: 'middle',
                    }} />
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Box sx={{
          px: 2.5, py: 2,
          borderTop: '1px solid #E5E6EB',
          bgcolor: '#fff',
        }}>
          <Box sx={{
            display: 'flex', alignItems: 'flex-end', gap: 1,
            p: 1.5, borderRadius: 3,
            border: '2px solid #E5E6EB',
            bgcolor: '#FAFBFC',
            transition: 'all 0.2s',
            '&:focus-within': {
              borderColor: '#165DFF',
              bgcolor: '#fff',
              boxShadow: '0 0 0 3px rgba(22, 93, 255, 0.08)',
            },
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={t('chat.inputPlaceholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.88rem', lineHeight: 1.6 } }}
              disabled={isStreaming}
            />
            {isStreaming ? (
              <Tooltip title={t('chat.interrupt')}>
                <IconButton
                  onClick={handleStop}
                  sx={{
                    bgcolor: '#F53F3F', color: '#fff', width: 38, height: 38,
                    '&:hover': { bgcolor: '#CB2634' },
                    flexShrink: 0,
                  }}
                >
                  <StopIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Enter 发送 · Shift+Enter 换行">
                <IconButton
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  sx={{
                    bgcolor: inputValue.trim() ? '#165DFF' : '#E5E6EB',
                    color: '#fff', width: 38, height: 38,
                    '&:hover': { bgcolor: '#0E42D2' },
                    '&.Mui-disabled': { bgcolor: '#E5E6EB', color: '#C9CDD4' },
                    flexShrink: 0,
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, px: 0.5 }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#C9CDD4' }}>
              Enter {t('chat.sendHint')} · Shift+Enter {t('chat.newLine')}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Typography sx={{ fontSize: '0.68rem', color: '#C9CDD4' }}>
              {t('chat.messagesCount')}: {messages.filter(m => m.role !== 'system').length}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography sx={{ fontSize: '0.68rem', color: '#C9CDD4' }}>
              Tokens: {messages.reduce((acc, m) => acc + (m.tokens || 0), 0)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default Chat;
