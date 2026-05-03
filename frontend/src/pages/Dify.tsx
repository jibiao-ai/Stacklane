import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Tabs, Tab, IconButton, LinearProgress, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Tooltip, Switch, Badge, Divider
} from '@mui/material';
import {
  Link as LinkIcon, LinkOff, Sync, PlayArrow, Stop, Settings,
  CheckCircle, Error as ErrorIcon, CloudSync, Apps, AccountTree,
  Timeline, Add, Refresh, Visibility, Delete, Edit, Speed,
  TrendingUp, Assessment, Hub
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dify: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [configDialog, setConfigDialog] = useState(false);

  // Mock data
  const connection = {
    status: 'connected',
    url: 'https://dify.internal:3000',
    version: '0.8.3',
    lastSync: '2026-05-02 14:32:15',
    appsCount: 8,
    workflowsCount: 5,
    totalExecutions: 12450
  };

  const apps = [
    { id: 1, name: 'Customer Support Agent', difyAppId: 'app-cs-001', type: 'chat', status: 'active', model: 'gpt-4o', calls: 8920, avgLatency: 1.2, successRate: 99.1, lastUsed: '2026-05-02', description: 'Multi-language customer support with FAQ and ticket escalation' },
    { id: 2, name: 'Code Review Assistant', difyAppId: 'app-cr-002', type: 'completion', status: 'active', model: 'claude-3.5-sonnet', calls: 4560, avgLatency: 2.8, successRate: 98.5, lastUsed: '2026-05-02', description: 'Automated code review with security analysis and best practices' },
    { id: 3, name: 'Document Summarizer', difyAppId: 'app-ds-003', type: 'workflow', status: 'active', model: 'deepseek-v3', calls: 3200, avgLatency: 3.5, successRate: 97.8, lastUsed: '2026-05-01', description: 'Extract key insights from long documents with structured output' },
    { id: 4, name: 'Data Analyst Bot', difyAppId: 'app-da-004', type: 'chat', status: 'active', model: 'qwen-max', calls: 2100, avgLatency: 1.8, successRate: 96.2, lastUsed: '2026-05-02', description: 'Natural language to SQL, chart generation, trend analysis' },
    { id: 5, name: 'Knowledge Base QA', difyAppId: 'app-kb-005', type: 'chat', status: 'inactive', model: 'gpt-4o-mini', calls: 1680, avgLatency: 0.9, successRate: 94.5, lastUsed: '2026-04-28', description: 'RAG-based Q&A over internal knowledge base documents' },
    { id: 6, name: 'Email Composer', difyAppId: 'app-ec-006', type: 'completion', status: 'active', model: 'claude-3.5-haiku', calls: 5230, avgLatency: 0.6, successRate: 99.4, lastUsed: '2026-05-02', description: 'Professional email drafting with tone adjustment' },
    { id: 7, name: 'Meeting Minutes Generator', difyAppId: 'app-mm-007', type: 'workflow', status: 'active', model: 'deepseek-v3', calls: 890, avgLatency: 4.2, successRate: 95.8, lastUsed: '2026-05-01', description: 'Audio/text to structured meeting minutes with action items' },
    { id: 8, name: 'Translation Engine', difyAppId: 'app-te-008', type: 'completion', status: 'active', model: 'qwen-max', calls: 7800, avgLatency: 0.4, successRate: 99.7, lastUsed: '2026-05-02', description: 'High-quality multi-language translation with context awareness' },
  ];

  const workflows = [
    { id: 1, name: 'Customer Onboarding Pipeline', steps: 6, status: 'running', executions: 234, successRate: 97.2, avgDuration: '45s', lastRun: '2026-05-02 13:45:00', trigger: 'webhook' },
    { id: 2, name: 'Content Moderation Flow', steps: 4, status: 'running', executions: 1890, successRate: 99.1, avgDuration: '12s', lastRun: '2026-05-02 14:30:00', trigger: 'api' },
    { id: 3, name: 'Document Processing Chain', steps: 8, status: 'running', executions: 567, successRate: 95.8, avgDuration: '120s', lastRun: '2026-05-02 12:15:00', trigger: 'schedule' },
    { id: 4, name: 'Lead Scoring Workflow', steps: 5, status: 'paused', executions: 1230, successRate: 96.5, avgDuration: '30s', lastRun: '2026-05-01 18:00:00', trigger: 'webhook' },
    { id: 5, name: 'Report Generation Pipeline', steps: 7, status: 'running', executions: 89, successRate: 98.9, avgDuration: '180s', lastRun: '2026-05-02 09:00:00', trigger: 'schedule' },
  ];

  const executions = [
    { id: 1, workflow: 'Content Moderation Flow', status: 'success', duration: '11.2s', tokens: 2340, cost: '$0.012', startTime: '2026-05-02 14:30:12', input: 'User message moderation check' },
    { id: 2, workflow: 'Customer Onboarding Pipeline', status: 'success', duration: '43.8s', tokens: 8900, cost: '$0.045', startTime: '2026-05-02 14:28:45', input: 'New user registration flow' },
    { id: 3, workflow: 'Document Processing Chain', status: 'failed', duration: '15.3s', tokens: 3200, cost: '$0.016', startTime: '2026-05-02 14:25:00', input: 'PDF parsing error - corrupted file' },
    { id: 4, workflow: 'Content Moderation Flow', status: 'success', duration: '9.8s', tokens: 1890, cost: '$0.009', startTime: '2026-05-02 14:22:33', input: 'Image + text moderation' },
    { id: 5, workflow: 'Report Generation Pipeline', status: 'success', duration: '178.5s', tokens: 45600, cost: '$0.228', startTime: '2026-05-02 14:20:00', input: 'Weekly KPI report generation' },
    { id: 6, workflow: 'Lead Scoring Workflow', status: 'success', duration: '28.4s', tokens: 5670, cost: '$0.028', startTime: '2026-05-02 14:15:20', input: 'Batch lead evaluation - 50 records' },
  ];

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'chat': return '#165DFF';
      case 'completion': return '#722ED1';
      case 'workflow': return '#0FC6C2';
      default: return '#86909C';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': case 'running': case 'success': case 'connected': return 'success';
      case 'inactive': case 'paused': return 'default';
      case 'failed': case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#165DFF', mb: 0.5 }}>
            Dify 集成
          </Typography>
          <Typography variant="body1" color="text.secondary">
            LLM 应用平台集成 - 应用管理、工作流编排、执行监控
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Sync />} sx={{ borderRadius: 2 }}>
            同步应用
          </Button>
          <Button variant="contained" startIcon={<Settings />} onClick={() => setConfigDialog(true)} sx={{ borderRadius: 2 }}>
            连接配置
          </Button>
        </Box>
      </Box>

      {/* Connection Status Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f0f5ff 0%, #e8f4f8 100%)', border: '1px solid #d9e8ff' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#165DFF', borderRadius: 2 }}>
                <Hub sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight={600}>Dify Platform</Typography>
                  <Chip 
                    icon={<CheckCircle sx={{ fontSize: 14 }} />}
                    label="Connected" 
                    color="success" 
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {connection.url} · Version {connection.version} · Last sync: {connection.lastSync}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="#165DFF">{connection.appsCount}</Typography>
                <Typography variant="caption" color="text.secondary">应用数</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="#722ED1">{connection.workflowsCount}</Typography>
                <Typography variant="caption" color="text.secondary">工作流</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color="#0FC6C2">{(connection.totalExecutions / 1000).toFixed(1)}k</Typography>
                <Typography variant="caption" color="text.secondary">总执行次数</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <Apps />, label: '活跃应用', value: apps.filter(a => a.status === 'active').length, total: apps.length, color: '#165DFF' },
          { icon: <AccountTree />, label: '运行中工作流', value: workflows.filter(w => w.status === 'running').length, total: workflows.length, color: '#722ED1' },
          { icon: <Speed />, label: '平均延迟', value: '1.8s', color: '#FF7D00' },
          { icon: <TrendingUp />, label: '总调用量', value: '34.4k', color: '#00B42A' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 44, height: 44 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{stat.value}{stat.total ? <Typography component="span" variant="body2" color="text.secondary"> / {stat.total}</Typography> : null}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 0, borderBottom: '1px solid #e8e8e8' }}>
        <Tab icon={<Apps sx={{ fontSize: 18 }} />} iconPosition="start" label="应用管理" />
        <Tab icon={<AccountTree sx={{ fontSize: 18 }} />} iconPosition="start" label="工作流" />
        <Tab icon={<Timeline sx={{ fontSize: 18 }} />} iconPosition="start" label="执行记录" />
        <Tab icon={<Assessment sx={{ fontSize: 18 }} />} iconPosition="start" label="统计分析" />
      </Tabs>

      {/* Tab: Apps */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          {apps.map((app) => (
            <Grid item xs={12} md={6} lg={4} key={app.id}>
              <Card sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(22,93,255,0.12)', transform: 'translateY(-2px)' } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: `${getTypeColor(app.type)}15`, color: getTypeColor(app.type), fontSize: 14, fontWeight: 700 }}>
                        {app.type === 'chat' ? '💬' : app.type === 'workflow' ? '🔄' : '⚡'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>{app.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{app.difyAppId}</Typography>
                      </Box>
                    </Box>
                    <Chip label={app.status} size="small" color={getStatusColor(app.status) as any} sx={{ fontWeight: 500, fontSize: 11 }} />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {app.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={app.type} size="small" sx={{ bgcolor: `${getTypeColor(app.type)}15`, color: getTypeColor(app.type), fontWeight: 500, fontSize: 11 }} />
                    <Chip label={app.model} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">调用次数</Typography>
                      <Typography variant="body2" fontWeight={600}>{app.calls.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">延迟</Typography>
                      <Typography variant="body2" fontWeight={600}>{app.avgLatency}s</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">成功率</Typography>
                      <Typography variant="body2" fontWeight={600} color={app.successRate >= 98 ? '#00B42A' : app.successRate >= 95 ? '#FF7D00' : '#F53F3F'}>{app.successRate}%</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab: Workflows */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f0f0f0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600 }}>工作流名称</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>步骤数</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>触发方式</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>执行次数</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>成功率</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>平均耗时</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.map((wf) => (
                <TableRow key={wf.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountTree sx={{ fontSize: 18, color: '#722ED1' }} />
                      <Typography variant="body2" fontWeight={500}>{wf.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${wf.steps} steps`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={wf.trigger} size="small" sx={{ bgcolor: wf.trigger === 'webhook' ? '#e8f4ff' : wf.trigger === 'api' ? '#f0e8ff' : '#e8ffe8', color: wf.trigger === 'webhook' ? '#165DFF' : wf.trigger === 'api' ? '#722ED1' : '#00B42A', fontWeight: 500, fontSize: 11 }} />
                  </TableCell>
                  <TableCell>{wf.executions.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={wf.successRate} sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: wf.successRate >= 98 ? '#00B42A' : '#FF7D00' } }} />
                      <Typography variant="body2" fontWeight={500}>{wf.successRate}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{wf.avgDuration}</TableCell>
                  <TableCell>
                    <Chip label={wf.status} size="small" color={getStatusColor(wf.status) as any} sx={{ fontWeight: 500, fontSize: 11 }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="运行"><IconButton size="small" color="primary"><PlayArrow fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="查看"><IconButton size="small"><Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="编辑"><IconButton size="small"><Edit fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab: Executions */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f0f0f0' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 600 }}>工作流</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>耗时</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Token 用量</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>费用</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>开始时间</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>描述</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executions.map((exec) => (
                <TableRow key={exec.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{exec.workflow}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={exec.status === 'success' ? <CheckCircle sx={{ fontSize: 14 }} /> : <ErrorIcon sx={{ fontSize: 14 }} />}
                      label={exec.status} 
                      size="small" 
                      color={getStatusColor(exec.status) as any}
                      sx={{ fontWeight: 500, fontSize: 11 }} 
                    />
                  </TableCell>
                  <TableCell>{exec.duration}</TableCell>
                  <TableCell>{exec.tokens.toLocaleString()}</TableCell>
                  <TableCell>{exec.cost}</TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{exec.startTime}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>{exec.input}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab: Statistics */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>应用调用排行</Typography>
                {apps.sort((a, b) => b.calls - a.calls).slice(0, 5).map((app, i) => (
                  <Box key={app.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none' }}>
                    <Typography variant="body2" sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: i < 3 ? '#165DFF' : '#e8e8e8', color: i < 3 ? '#fff' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{i + 1}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>{app.name}</Typography>
                      <LinearProgress variant="determinate" value={(app.calls / apps[0].calls) * 100} sx={{ height: 4, borderRadius: 2, mt: 0.5 }} />
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="#165DFF">{app.calls.toLocaleString()}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>模型使用分布</Typography>
                {[
                  { model: 'gpt-4o', calls: 10600, color: '#165DFF' },
                  { model: 'qwen-max', calls: 9900, color: '#FF7D00' },
                  { model: 'deepseek-v3', calls: 4090, color: '#00B42A' },
                  { model: 'claude-3.5-sonnet', calls: 4560, color: '#722ED1' },
                  { model: 'claude-3.5-haiku', calls: 5230, color: '#0FC6C2' },
                ].map((m, i) => (
                  <Box key={m.model} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: m.color }} />
                    <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>{m.model}</Typography>
                    <Typography variant="body2" fontWeight={600}>{m.calls.toLocaleString()} calls</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Token 消耗趋势 (近7天)</Typography>
                {['05-02', '05-01', '04-30', '04-29', '04-28', '04-27', '04-26'].map((date, i) => {
                  const tokens = [245000, 198000, 312000, 178000, 256000, 189000, 220000][i];
                  const max = 312000;
                  return (
                    <Box key={date} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 40 }}>{date}</Typography>
                      <LinearProgress variant="determinate" value={(tokens / max) * 100} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#f0f5ff', '& .MuiLinearProgress-bar': { bgcolor: '#165DFF', borderRadius: 4 } }} />
                      <Typography variant="caption" fontWeight={500} sx={{ width: 50, textAlign: 'right' }}>{(tokens / 1000).toFixed(0)}k</Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>费用概览</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="#165DFF">$128</Typography>
                    <Typography variant="caption" color="text.secondary">本月费用</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="#00B42A">$4.2</Typography>
                    <Typography variant="caption" color="text.secondary">今日费用</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} color="#FF7D00">1.6M</Typography>
                    <Typography variant="caption" color="text.secondary">本月 Token</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  预计本月总费用 $185，较上月增长 12%
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Config Dialog */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dify 连接配置</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Dify URL" defaultValue="https://dify.internal:3000" variant="outlined" />
            <TextField fullWidth label="API Key" defaultValue="app-sk-**********************" type="password" variant="outlined" />
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              连接状态: 已连接 · Version 0.8.3
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>取消</Button>
          <Button variant="outlined" color="error" startIcon={<LinkOff />}>断开连接</Button>
          <Button variant="contained" startIcon={<CheckCircle />}>保存配置</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dify;
