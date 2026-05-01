import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Tabs, Tab,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon, CloudDownload as ImportIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, RocketLaunch as DeployIcon, CheckCircle,
  Schedule, Error as ErrorIcon, Hub as HubIcon,
} from '@mui/icons-material';

// Mock data - represents real model catalog synced from GPUStack + local registry
const mockModels = [
  { id: 1, name: 'Llama-3.1-70B-Instruct', version: 'v1.0', format: 'safetensors', size: 140000000000, runtime: 'vllm', status: 'running', source: 'huggingface', huggingfaceId: 'meta-llama/Llama-3.1-70B-Instruct', gpuCount: 2, description: 'Meta Llama 3.1 70B instruction-tuned' },
  { id: 2, name: 'Qwen-2.5-72B-Chat', version: 'v2.5', format: 'safetensors', size: 145000000000, runtime: 'vllm', status: 'running', source: 'huggingface', huggingfaceId: 'Qwen/Qwen2.5-72B-Chat', gpuCount: 2, description: 'Alibaba Qwen 2.5 72B' },
  { id: 3, name: 'DeepSeek-V3-671B', version: 'v3.0', format: 'safetensors', size: 671000000000, runtime: 'gpustack', status: 'running', source: 'huggingface', huggingfaceId: 'deepseek-ai/DeepSeek-V3', gpuCount: 16, description: 'DeepSeek V3 671B MoE, multi-node via GPUStack' },
  { id: 4, name: 'Codestral-22B', version: 'v1.0', format: 'gguf', size: 22000000000, runtime: 'llama.cpp', status: 'running', source: 'huggingface', huggingfaceId: 'mistralai/Codestral-22B-v0.1', gpuCount: 1, description: 'Code generation model' },
  { id: 5, name: 'Mixtral-8x7B-v0.1', version: 'v0.1', format: 'safetensors', size: 93000000000, runtime: 'tensorrt-llm', status: 'error', source: 'huggingface', huggingfaceId: 'mistralai/Mixtral-8x7B-v0.1', gpuCount: 2, description: 'Mixtral MoE 8x7B' },
  { id: 6, name: 'Phi-3-Medium-14B', version: 'v1.0', format: 'gguf', size: 14000000000, runtime: 'gpustack', status: 'running', source: 'gpustack', huggingfaceId: 'microsoft/Phi-3-medium-128k-instruct', gpuCount: 1, description: 'Microsoft Phi-3 deployed via GPUStack' },
];

const mockVersions = [
  { id: 1, version: 'v1.0', format: 'safetensors', quantization: 'fp16', size: 140000000000, status: 'ready', hash: 'sha256:abc123...' },
  { id: 2, version: 'v1.0-awq', format: 'awq', quantization: 'awq-4bit', size: 40000000000, status: 'ready', hash: 'sha256:def456...' },
  { id: 3, version: 'v1.0-gguf', format: 'gguf', quantization: 'q4_0', size: 35000000000, status: 'downloading', hash: '' },
];

const compatibilityMatrix = [
  { format: 'safetensors', vllm: true, gpustack: true, 'llama.cpp': false, 'tensorrt-llm': true },
  { format: 'gguf', vllm: false, gpustack: true, 'llama.cpp': true, 'tensorrt-llm': false },
  { format: 'awq', vllm: true, gpustack: true, 'llama.cpp': false, 'tensorrt-llm': false },
  { format: 'gptq', vllm: true, gpustack: false, 'llama.cpp': false, 'tensorrt-llm': false },
];

const ModelManagement: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [importOpen, setImportOpen] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)}TB`;
    return `${(bytes / 1e9).toFixed(0)}GB`;
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'running': return <Chip icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Running" size="small" color="success" />;
      case 'deploying': case 'downloading': return <Chip icon={<Schedule sx={{ fontSize: 14 }} />} label={status} size="small" color="warning" />;
      case 'error': return <Chip icon={<ErrorIcon sx={{ fontSize: 14 }} />} label="Error" size="small" color="error" />;
      case 'ready': return <Chip label="Ready" size="small" color="info" />;
      case 'registered': return <Chip label="Registered" size="small" variant="outlined" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  const getRuntimeChip = (runtime: string) => {
    const colors: Record<string, string> = {
      'vllm': '#165DFF', 'gpustack': '#722ED1', 'llama.cpp': '#14C9C9', 'tensorrt-llm': '#FF7D00',
    };
    return <Chip label={runtime} size="small" sx={{ bgcolor: colors[runtime] || '#86909C', color: '#fff', fontWeight: 500, fontSize: '0.7rem' }} />;
  };

  const totalModels = mockModels.length;
  const runningModels = mockModels.filter(m => m.status === 'running').length;
  const totalGPUsUsed = mockModels.reduce((s, m) => s + m.gpuCount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h2">{t('models.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('models.subtitle')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ImportIcon />} onClick={() => setImportOpen(true)}>
            {t('models.importHF')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            {t('models.register')}
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">{t('models.totalModels')}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>{totalModels}</Typography>
              <Typography variant="body2" color="success.main">{runningModels} {t('models.serving')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">{t('models.gpusAllocated')}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>{totalGPUsUsed}</Typography>
              <Typography variant="body2" color="text.secondary">{t('models.acrossModels')}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">{t('models.runtimeDistribution')}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                {getRuntimeChip('vllm')}
                {getRuntimeChip('gpustack')}
                {getRuntimeChip('llama.cpp')}
                {getRuntimeChip('tensorrt-llm')}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label={t('models.catalogTab')} />
          <Tab label={t('models.versionsTab')} />
          <Tab label={t('models.compatibilityTab')} />
        </Tabs>

        {/* Model Catalog */}
        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>{t('models.version')}</TableCell>
                  <TableCell>{t('models.format')}</TableCell>
                  <TableCell>{t('models.size')}</TableCell>
                  <TableCell>Runtime</TableCell>
                  <TableCell>GPU</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockModels.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{m.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{m.description}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={m.version} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={m.format} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /></TableCell>
                    <TableCell>{formatSize(m.size)}</TableCell>
                    <TableCell>{getRuntimeChip(m.runtime)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{m.gpuCount}x</TableCell>
                    <TableCell>
                      <Chip
                        label={m.source}
                        size="small"
                        variant="outlined"
                        icon={m.source === 'gpustack' ? <HubIcon sx={{ fontSize: 14 }} /> : undefined}
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(m.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small"><ViewIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="primary"><DeployIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Model Versions */}
        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Llama-3.1-70B-Instruct - {t('models.versions')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('models.version')}</TableCell>
                    <TableCell>{t('models.format')}</TableCell>
                    <TableCell>Quantization</TableCell>
                    <TableCell>{t('models.size')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>Hash</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockVersions.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{v.version}</TableCell>
                      <TableCell><Chip label={v.format} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{v.quantization}</TableCell>
                      <TableCell>{formatSize(v.size)}</TableCell>
                      <TableCell>{getStatusChip(v.status)}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>{v.hash || '-'}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" startIcon={<DeployIcon />}>Deploy</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Compatibility Matrix */}
        {tab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {t('models.runtimeCompatibility')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Format</TableCell>
                    <TableCell align="center">vLLM</TableCell>
                    <TableCell align="center">GPUStack</TableCell>
                    <TableCell align="center">llama.cpp</TableCell>
                    <TableCell align="center">TensorRT-LLM</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {compatibilityMatrix.map((row) => (
                    <TableRow key={row.format} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{row.format}</TableCell>
                      <TableCell align="center">{row.vllm ? <CheckCircle sx={{ color: '#00B42A', fontSize: 20 }} /> : <ErrorIcon sx={{ color: '#C9CDD4', fontSize: 20 }} />}</TableCell>
                      <TableCell align="center">{row.gpustack ? <CheckCircle sx={{ color: '#00B42A', fontSize: 20 }} /> : <ErrorIcon sx={{ color: '#C9CDD4', fontSize: 20 }} />}</TableCell>
                      <TableCell align="center">{row['llama.cpp'] ? <CheckCircle sx={{ color: '#00B42A', fontSize: 20 }} /> : <ErrorIcon sx={{ color: '#C9CDD4', fontSize: 20 }} />}</TableCell>
                      <TableCell align="center">{row['tensorrt-llm'] ? <CheckCircle sx={{ color: '#00B42A', fontSize: 20 }} /> : <ErrorIcon sx={{ color: '#C9CDD4', fontSize: 20 }} />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>

      {/* Import Dialog */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('models.importFromHuggingFace')}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="HuggingFace Model ID" placeholder="meta-llama/Llama-3.1-70B-Instruct" sx={{ mt: 2, mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select label="Format" defaultValue="safetensors">
              <MenuItem value="safetensors">safetensors</MenuItem>
              <MenuItem value="gguf">GGUF</MenuItem>
              <MenuItem value="awq">AWQ</MenuItem>
              <MenuItem value="gptq">GPTQ</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Target Runtime</InputLabel>
            <Select label="Target Runtime" defaultValue="vllm">
              <MenuItem value="vllm">vLLM</MenuItem>
              <MenuItem value="gpustack">GPUStack</MenuItem>
              <MenuItem value="llama.cpp">llama.cpp</MenuItem>
              <MenuItem value="tensorrt-llm">TensorRT-LLM</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Quantization</InputLabel>
            <Select label="Quantization" defaultValue="fp16">
              <MenuItem value="fp16">FP16</MenuItem>
              <MenuItem value="bf16">BF16</MenuItem>
              <MenuItem value="int8">INT8</MenuItem>
              <MenuItem value="int4">INT4</MenuItem>
              <MenuItem value="awq-4bit">AWQ 4-bit</MenuItem>
              <MenuItem value="q4_0">Q4_0 (GGUF)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={() => setImportOpen(false)}>{t('models.startImport')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelManagement;
