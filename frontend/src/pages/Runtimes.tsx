import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Grid, Card, CardContent, Typography, Chip, LinearProgress, Button, IconButton,
} from '@mui/material';
import {
  CheckCircle, Warning, Settings, Refresh as RefreshIcon,
} from '@mui/icons-material';

const runtimesData = [
  {
    id: 1, name: 'vLLM Production', engine: 'vllm', version: '0.6.4', status: 'active',
    models: 2, instances: 4, features: ['continuous_batching', 'paged_attention', 'speculative_decoding', 'tensor_parallelism'],
    formats: ['safetensors', 'awq', 'gptq'], gpuReq: '16GB+ VRAM, NVIDIA Ampere/Hopper',
    description: 'High-throughput serving engine with PagedAttention',
    color: '#165DFF',
  },
  {
    id: 2, name: 'GPUStack Native', engine: 'gpustack', version: '0.4.1', status: 'active',
    models: 3, instances: 5, features: ['auto_scheduling', 'multi_node', 'resource_pooling', 'auto_scaling', 'heterogeneous_gpu'],
    formats: ['safetensors', 'gguf', 'awq'], gpuReq: '8GB+ VRAM',
    description: 'Multi-node GPU orchestration with auto-scheduling',
    color: '#722ED1',
  },
  {
    id: 3, name: 'llama.cpp (llama-box)', engine: 'llama.cpp', version: 'b4547', status: 'active',
    models: 1, instances: 2, features: ['cpu_inference', 'metal_acceleration', 'low_memory', 'quantization', 'grammar_sampling'],
    formats: ['gguf'], gpuReq: '4GB+ VRAM (or CPU only)',
    description: 'Lightweight inference with extreme quantization support',
    color: '#14C9C9',
  },
  {
    id: 4, name: 'TensorRT-LLM', engine: 'tensorrt-llm', version: '0.12.0', status: 'degraded',
    models: 1, instances: 1, features: ['tensor_parallelism', 'inflight_batching', 'kv_cache_optimization', 'custom_plugins'],
    formats: ['safetensors', 'engine'], gpuReq: '24GB+ VRAM, NVIDIA only',
    description: 'NVIDIA optimized inference with maximum throughput',
    color: '#FF7D00',
  },
];

const Runtimes: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h2">{t('runtimes.title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('runtimes.subtitle')}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} size="small">
          {t('runtimes.refresh')}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {runtimesData.map((rt) => (
          <Grid item xs={12} md={6} key={rt.id}>
            <Card sx={{ height: '100%', borderLeft: 4, borderColor: rt.color }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>{rt.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{rt.description}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      icon={rt.status === 'active' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Warning sx={{ fontSize: 14 }} />}
                      label={rt.status}
                      size="small"
                      color={rt.status === 'active' ? 'success' : 'warning'}
                    />
                    <IconButton size="small"><Settings fontSize="small" /></IconButton>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>Engine</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>{rt.engine}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>Version</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{rt.version}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>GPU Requirement</Typography>
                    <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>{rt.gpuReq}</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{rt.models} Models / {rt.instances} Instances</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(rt.instances / 6) * 100} sx={{ height: 4, borderRadius: 2, bgcolor: '#F2F3F5', '& .MuiLinearProgress-bar': { bgcolor: rt.color, borderRadius: 2 } }} />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6875rem', mb: 0.5 }}>Supported Formats</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {rt.formats.map((f) => (
                      <Chip key={f} label={f} size="small" variant="outlined" sx={{ fontSize: '0.6875rem', fontFamily: 'monospace' }} />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6875rem', mb: 0.5 }}>Features</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {rt.features.map((f) => (
                      <Chip key={f} label={f.replace(/_/g, ' ')} size="small" sx={{ fontSize: '0.625rem', bgcolor: `${rt.color}10`, color: rt.color, border: `1px solid ${rt.color}30` }} />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Runtimes;
