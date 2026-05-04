import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Psychology as ModelIcon,
  CallSplit as ConditionIcon,
  Loop as LoopIcon,
  Schedule as ScheduleIcon,
  Api as ApiIcon,
  Approval as ApprovalIcon,
  Warning as AlertIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Send as PublishIcon,
  Visibility as PreviewIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  MoreVert as MoreIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from '@mui/icons-material';

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  status: 'idle' | 'running' | 'success' | 'error';
  config: Record<string, any>;
}

interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: number;
  category: string;
}

const nodeTypes = [
  { type: 'model_call', label: 'Model Call', sublabel: '模型调用', icon: <ModelIcon />, color: '#722ED1' },
  { type: 'agent_call', label: 'Agent Call', sublabel: '智能体调用', icon: <AgentIcon />, color: '#722ED1' },
  { type: 'condition', label: 'Condition', sublabel: '条件判断', icon: <ConditionIcon />, color: '#FF7D00' },
  { type: 'loop', label: 'Loop', sublabel: '循环', icon: <LoopIcon />, color: '#00B42A' },
  { type: 'schedule', label: 'Schedule', sublabel: '调度', icon: <ScheduleIcon />, color: '#165DFF' },
  { type: 'api', label: 'API', sublabel: 'API 调用', icon: <ApiIcon />, color: '#165DFF' },
  { type: 'approval', label: 'Approval', sublabel: '审批', icon: <ApprovalIcon />, color: '#FF7D00' },
  { type: 'alert', label: 'Alert', sublabel: '告警', icon: <AlertIcon />, color: '#F53F3F' },
];

const mockNodes: WorkflowNode[] = [
  { id: '1', type: 'schedule', label: 'Schedule', sublabel: '定时触发', x: 400, y: 60, status: 'success', config: { cron: '0 */6 * * *' } },
  { id: '2', type: 'model_call', label: 'Model Call', sublabel: '文本生成', x: 400, y: 180, status: 'running', config: { model: 'GPT-3.5', temperature: 0.7 } },
  { id: '3', type: 'condition', label: 'Condition', sublabel: '条件判断', x: 250, y: 320, status: 'idle', config: { expression: 'result.confidence > 0.8' } },
  { id: '4', type: 'agent_call', label: 'Agent Call', sublabel: '代码审查', x: 550, y: 320, status: 'idle', config: { agent: 'code-review-agent' } },
  { id: '5', type: 'alert', label: 'Alert End', sublabel: '流程结束', x: 150, y: 460, status: 'idle', config: {} },
  { id: '6', type: 'approval', label: 'Approval', sublabel: '人工审批', x: 400, y: 460, status: 'idle', config: { approvers: ['admin'] } },
  { id: '7', type: 'api', label: 'API', sublabel: '回调通知', x: 600, y: 460, status: 'idle', config: { url: 'https://webhook.site/...' } },
  { id: '8', type: 'alert', label: 'Alert', sublabel: '异常告警', x: 400, y: 580, status: 'idle', config: { channel: 'feishu' } },
];

const mockEdges: WorkflowEdge[] = [
  { id: 'e1', from: '1', to: '2' },
  { id: 'e2', from: '2', to: '3', label: 'Yes' },
  { id: 'e3', from: '2', to: '4', label: 'No' },
  { id: 'e4', from: '3', to: '5' },
  { id: 'e5', from: '3', to: '6', label: 'No' },
  { id: 'e6', from: '4', to: '6' },
  { id: 'e7', from: '4', to: '7' },
  { id: 'e8', from: '6', to: '8' },
];

const mockTemplates: WorkflowTemplate[] = [
  { id: '1', name: '智能分析工作流', description: '自动化数据分析与报告生成', nodes: 8, category: 'analysis' },
  { id: '2', name: '客服工单处理', description: '自动分类、路由和响应客户工单', nodes: 12, category: 'service' },
  { id: '3', name: '代码审查流程', description: '自动代码扫描、审查和合并', nodes: 6, category: 'development' },
  { id: '4', name: '内容审核流水线', description: '多模态内容自动审核与标记', nodes: 10, category: 'content' },
];

const Workflow: React.FC = () => {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<WorkflowNode[]>(mockNodes);
  const [edges] = useState<WorkflowEdge[]>(mockEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(mockNodes[1]);
  const [zoom, setZoom] = useState(100);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getNodeColor = (type: string) => {
    return nodeTypes.find(n => n.type === type)?.color || '#165DFF';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#165DFF';
      case 'success': return '#00B42A';
      case 'error': return '#F53F3F';
      default: return '#C9CDD4';
    }
  };

  const handleDragStart = (type: string) => {
    setDraggedNodeType(type);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nodeType = nodeTypes.find(n => n.type === draggedNodeType);
    if (!nodeType) return;
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: draggedNodeType,
      label: nodeType.label,
      sublabel: nodeType.sublabel,
      x, y,
      status: 'idle',
      config: {},
    };
    setNodes(prev => [...prev, newNode]);
    setDraggedNodeType(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', mx: -3, mt: -3, mb: -3 }}>
      {/* Top toolbar */}
      <Box sx={{
        px: 2.5, py: 1,
        borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 1.5,
        bgcolor: '#fff',
      }}>
        {/* Breadcrumb */}
        <Typography sx={{ fontSize: '0.82rem', color: '#86909C' }}>
          {t('workflow.home')} / {t('workflow.title')} /
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1D2129' }}>
          {t('workflow.sampleName')}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <Tooltip title={t('common.save')}>
          <IconButton size="small" sx={{ color: '#86909C' }}><SaveIcon sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <Tooltip title={t('workflow.undo')}>
          <IconButton size="small" sx={{ color: '#86909C' }}><UndoIcon sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <Tooltip title={t('workflow.redo')}>
          <IconButton size="small" sx={{ color: '#86909C' }}><RedoIcon sx={{ fontSize: 18 }} /></IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Button
          variant="contained"
          startIcon={<PublishIcon sx={{ fontSize: 16 }} />}
          size="small"
          sx={{
            bgcolor: '#165DFF', fontSize: '0.78rem', fontWeight: 600,
            textTransform: 'none', borderRadius: 2, px: 2,
            '&:hover': { bgcolor: '#0E42D2' },
          }}
        >
          {t('workflow.publish')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PreviewIcon sx={{ fontSize: 16 }} />}
          size="small"
          sx={{
            fontSize: '0.78rem', fontWeight: 500,
            textTransform: 'none', borderRadius: 2, px: 2,
            borderColor: '#E5E6EB', color: '#4E5969',
            '&:hover': { borderColor: '#165DFF', color: '#165DFF' },
          }}
        >
          {t('workflow.preview')}
        </Button>
      </Box>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* === LEFT: Node Palette === */}
        <Box sx={{
          width: 200, flexShrink: 0,
          borderRight: '1px solid', borderColor: 'divider',
          bgcolor: '#FAFBFC',
          display: 'flex', flexDirection: 'column',
        }}>
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#1D2129', mb: 1 }}>
              {t('workflow.nodeTypes')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 2 }}>
            {nodeTypes.map((node) => (
              <Paper
                key={node.type}
                draggable
                onDragStart={() => handleDragStart(node.type)}
                sx={{
                  p: 1.5, mb: 1, borderRadius: 2,
                  border: '1px solid #E5E6EB',
                  cursor: 'grab',
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  transition: 'all 0.15s',
                  '&:hover': {
                    borderColor: node.color,
                    boxShadow: `0 2px 8px ${node.color}20`,
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <Box sx={{
                  width: 32, height: 32, borderRadius: 1.5,
                  bgcolor: `${node.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: node.color,
                  '& .MuiSvgIcon-root': { fontSize: 18 },
                }}>
                  {node.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D2129', lineHeight: 1.3 }}>
                    {node.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#86909C', lineHeight: 1.3 }}>
                    {node.sublabel}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
          {/* Template button */}
          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              fullWidth size="small"
              variant="outlined"
              onClick={() => setShowTemplates(true)}
              sx={{
                fontSize: '0.75rem', textTransform: 'none',
                borderColor: '#E5E6EB', color: '#4E5969',
                '&:hover': { borderColor: '#165DFF', color: '#165DFF' },
              }}
            >
              {t('workflow.templates')}
            </Button>
          </Box>
        </Box>

        {/* === MIDDLE: Canvas === */}
        <Box
          ref={canvasRef}
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            flex: 1, position: 'relative',
            bgcolor: '#FAFBFC',
            backgroundImage: `
              radial-gradient(circle, #E5E6EB 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            overflow: 'hidden',
          }}
        >
          {/* Canvas zoom controls */}
          <Box sx={{
            position: 'absolute', bottom: 16, left: 16, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 0.5,
            bgcolor: '#fff', borderRadius: 2, p: 0.5,
            border: '1px solid #E5E6EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <IconButton size="small" onClick={() => setZoom(z => Math.max(50, z - 10))}>
              <ZoomOutIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ fontSize: '0.72rem', color: '#4E5969', minWidth: 36, textAlign: 'center' }}>
              {zoom}%
            </Typography>
            <IconButton size="small" onClick={() => setZoom(z => Math.min(200, z + 10))}>
              <ZoomInIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <IconButton size="small" onClick={() => setZoom(100)}>
              <FitIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* SVG connections layer */}
          <svg
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none', zIndex: 1,
            }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#722ED1" />
              </marker>
            </defs>
            {edges.map(edge => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const startX = fromNode.x + 70;
              const startY = fromNode.y + 45;
              const endX = toNode.x + 70;
              const endY = toNode.y;
              const midY = (startY + endY) / 2;
              return (
                <g key={edge.id}>
                  <path
                    d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                    stroke="#722ED1"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="none"
                    markerEnd="url(#arrowhead)"
                    opacity="0.6"
                  />
                  {edge.label && (
                    <text
                      x={(startX + endX) / 2 + (edge.label === 'Yes' ? -20 : 20)}
                      y={midY - 5}
                      fontSize="11"
                      fill="#86909C"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes layer */}
          {nodes.map(node => (
            <Paper
              key={node.id}
              onClick={() => setSelectedNode(node)}
              sx={{
                position: 'absolute',
                left: node.x, top: node.y,
                width: 140, minHeight: 50,
                borderRadius: 2.5,
                border: selectedNode?.id === node.id
                  ? `2px solid ${getNodeColor(node.type)}`
                  : '1px solid #E5E6EB',
                bgcolor: '#fff',
                cursor: 'pointer',
                zIndex: 5,
                transition: 'all 0.15s',
                boxShadow: selectedNode?.id === node.id
                  ? `0 4px 12px ${getNodeColor(node.type)}25`
                  : '0 1px 4px rgba(0,0,0,0.05)',
                '&:hover': {
                  boxShadow: `0 4px 12px ${getNodeColor(node.type)}20`,
                  transform: 'translateY(-1px)',
                },
                overflow: 'hidden',
              }}
            >
              {/* Status indicator bar */}
              <Box sx={{
                height: 3,
                bgcolor: getStatusColor(node.status),
                opacity: node.status === 'idle' ? 0.3 : 1,
              }} />
              <Box sx={{ p: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: 1.5,
                  bgcolor: `${getNodeColor(node.type)}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: getNodeColor(node.type),
                  '& .MuiSvgIcon-root': { fontSize: 15 },
                }}>
                  {nodeTypes.find(n => n.type === node.type)?.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{
                    fontSize: '0.72rem', fontWeight: 600, color: '#1D2129',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {node.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.62rem', color: '#86909C' }}>
                    {node.sublabel}
                  </Typography>
                </Box>
                {/* Status dot */}
                <Box sx={{
                  width: 7, height: 7, borderRadius: '50%',
                  bgcolor: getStatusColor(node.status),
                  ...(node.status === 'running' && {
                    animation: 'pulse 1.5s infinite',
                  }),
                }} />
              </Box>
              {/* Node actions */}
              <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderTop: '1px solid #F2F3F5', px: 1, py: 0.3,
                gap: 0.5,
              }}>
                <IconButton size="small" sx={{ width: 20, height: 20 }}>
                  <MoreIcon sx={{ fontSize: 12, color: '#C9CDD4' }} />
                </IconButton>
                <IconButton size="small" sx={{ width: 20, height: 20 }}>
                  <PlayIcon sx={{ fontSize: 12, color: '#C9CDD4' }} />
                </IconButton>
                <IconButton size="small" sx={{ width: 20, height: 20 }}>
                  <PauseIcon sx={{ fontSize: 12, color: '#C9CDD4' }} />
                </IconButton>
                <IconButton size="small" sx={{ width: 20, height: 20 }}>
                  <RefreshIcon sx={{ fontSize: 12, color: '#C9CDD4' }} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* === RIGHT: Config Panel === */}
        {selectedNode && (
          <Box sx={{
            width: 300, flexShrink: 0,
            borderLeft: '1px solid', borderColor: 'divider',
            bgcolor: '#fff',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>
            {/* Panel header */}
            <Box sx={{
              p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid', borderColor: 'divider',
            }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1D2129' }}>
                {t('workflow.configPanel')}
              </Typography>
              <IconButton size="small" onClick={() => setSelectedNode(null)}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {/* Selected node info */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  bgcolor: `${getNodeColor(selectedNode.type)}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: getNodeColor(selectedNode.type),
                }}>
                  {nodeTypes.find(n => n.type === selectedNode.type)?.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedNode.sublabel}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#86909C' }}>{selectedNode.label}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Config fields */}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Model selection (for model_call nodes) */}
              {selectedNode.type === 'model_call' && (
                <>
                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#4E5969', mb: 0.8 }}>
                      {t('workflow.modelSelect')}
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select defaultValue="gpt-3.5" sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                        <MenuItem value="gpt-3.5">GPT-3.5</MenuItem>
                        <MenuItem value="gpt-4">GPT-4</MenuItem>
                        <MenuItem value="claude-3">Claude-3</MenuItem>
                        <MenuItem value="deepseek-v3">DeepSeek-V3</MenuItem>
                        <MenuItem value="qwen-72b">Qwen-72B</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#4E5969', mb: 0.8 }}>
                      {t('workflow.inputParams')}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#86909C', mb: 0.5 }}>
                      {t('workflow.inputParamsDesc')}
                    </Typography>
                    <TextField
                      fullWidth size="small" placeholder={t('workflow.inputParams')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
                    />
                  </Box>
                </>
              )}

              {/* Output mapping */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#4E5969', mb: 0.8 }}>
                  {t('workflow.outputMapping')}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#86909C', mb: 0.5 }}>
                  {t('workflow.outputMappingDesc')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small" placeholder={t('workflow.inputMap')}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.78rem' } }}
                  />
                  <TextField
                    size="small" placeholder={t('workflow.outputMap')}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.78rem' } }}
                  />
                  <IconButton size="small" sx={{ color: '#C9CDD4' }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              </Box>

              {/* Retry mechanism */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#4E5969', mb: 0.8 }}>
                  {t('workflow.retryMechanism')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#86909C' }}>
                    {t('workflow.retryMechanism')} ⓘ
                  </Typography>
                  <Switch size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Switch size="small" defaultChecked color="primary" />
                  <Typography sx={{ fontSize: '0.75rem', color: '#4E5969' }}>{t('workflow.medium')}</Typography>
                </Box>
              </Box>

              {/* Retry count */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#4E5969', mb: 0.8 }}>
                  {t('workflow.retryMechanism')}
                </Typography>
                <FormControl fullWidth size="small">
                  <Select defaultValue="exponential" sx={{ fontSize: '0.82rem', borderRadius: 2 }}>
                    <MenuItem value="exponential">{t('workflow.exponentialBackoff')}</MenuItem>
                    <MenuItem value="fixed">{t('workflow.fixedInterval')}</MenuItem>
                    <MenuItem value="linear">{t('workflow.linearBackoff')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Timeout */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#4E5969', mb: 0.8 }}>
                  {t('workflow.timeout')}
                </Typography>
                <TextField
                  fullWidth size="small" defaultValue="30" type="number"
                  InputProps={{ endAdornment: <Typography sx={{ fontSize: '0.72rem', color: '#86909C' }}>s</Typography> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* System status bar */}
      <Box sx={{
        px: 2.5, py: 0.8,
        borderTop: '1px solid', borderColor: 'divider',
        bgcolor: '#fff',
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00B42A' }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#00B42A', fontWeight: 500 }}>
            {t('workflow.systemNormal')}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.68rem', color: '#86909C' }}>
          {t('workflow.nodes')}: {nodes.length} · {t('workflow.edges')}: {edges.length}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography sx={{ fontSize: '0.68rem', color: '#86909C' }}>
          {t('workflow.lastSaved')}: 2 min ago
        </Typography>
      </Box>

      {/* Templates dialog */}
      <Dialog open={showTemplates} onClose={() => setShowTemplates(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('workflow.templateLibrary')}</DialogTitle>
        <DialogContent>
          <List>
            {mockTemplates.map(tpl => (
              <ListItem key={tpl.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton sx={{ borderRadius: 2, border: '1px solid #E5E6EB' }}>
                  <ListItemIcon>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 2,
                      bgcolor: '#165DFF12',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AgentIcon sx={{ color: '#165DFF', fontSize: 18 }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{tpl.name}</Typography>}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.3 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#86909C' }}>{tpl.description}</Typography>
                        <Chip label={`${tpl.nodes} nodes`} size="small" sx={{ height: 18, fontSize: '0.62rem' }} />
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
};

export default Workflow;
