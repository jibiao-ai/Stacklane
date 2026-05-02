import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Avatar,
  TextField, InputAdornment, Tabs, Tab, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating, LinearProgress, alpha, useTheme,
  Tooltip, Badge, Stack, Divider, Paper, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
  Search, SmartToy, Add, Download, Star, Category, Refresh,
  PlayArrow, Stop, GitHub, CloudDownload, ViewModule, ViewList,
  Psychology, Code, Edit as EditIcon, Create, Analytics, Palette,
  SupportAgent, Science, Engineering
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const categoryIcons: Record<string, React.ReactElement> = {
  assistant: <Psychology />,
  coding: <Code />,
  writing: <EditIcon />,
  analysis: <Analytics />,
  creative: <Palette />,
  customer_service: <SupportAgent />,
  research: <Science />,
  devops: <Engineering />,
};

const mockAgents = [
  { id: 1, name: 'Claude Assistant', avatar: '', description: 'A helpful AI assistant powered by Claude\'s reasoning capabilities.', category: 'assistant', provider: 'anthropic', status: 'active', usage_count: 15234, rating: 4.8, is_builtin: true, tags: 'general,reasoning' },
  { id: 2, name: 'DeepSeek Coder', avatar: '', description: 'Expert code generation and debugging agent for 50+ languages.', category: 'coding', provider: 'deepseek', status: 'active', usage_count: 12890, rating: 4.7, is_builtin: true, tags: 'code,debug,review' },
  { id: 3, name: 'Qwen Writer', avatar: '', description: 'Professional content creation for articles and creative writing.', category: 'writing', provider: 'qwen', status: 'active', usage_count: 8920, rating: 4.5, is_builtin: true, tags: 'writing,bilingual' },
  { id: 4, name: 'Data Analyst Pro', avatar: '', description: 'Advanced data analysis with visualization and insights.', category: 'analysis', provider: 'openai', status: 'active', usage_count: 6780, rating: 4.6, is_builtin: false, tags: 'data,stats' },
  { id: 5, name: 'Customer Service Bot', avatar: '', description: 'Multi-language customer support with FAQ and ticket escalation.', category: 'customer_service', provider: 'qwen', status: 'inactive', usage_count: 4560, rating: 4.3, is_builtin: false, tags: 'support,multilingual' },
];

const mockTemplates = [
  { id: 1, name: 'Claude Assistant', description: 'Reasoning, analysis, and complex problem-solving.', category: 'assistant', provider: 'anthropic', author: 'Anthropic', stars: 15200, downloads: 89000, is_official: true, source: 'https://github.com/anthropics/claude-prompts' },
  { id: 2, name: 'DeepSeek Coder', description: 'Code generation with 50+ language support.', category: 'coding', provider: 'deepseek', author: 'DeepSeek AI', stars: 12800, downloads: 67000, is_official: true, source: 'https://github.com/deepseek-ai/DeepSeek-Coder' },
  { id: 3, name: 'Qwen Writer', description: 'Professional bilingual content creation.', category: 'writing', provider: 'qwen', author: 'Alibaba Cloud', stars: 9800, downloads: 45000, is_official: true, source: 'https://github.com/QwenLM/Qwen' },
  { id: 4, name: 'Research Scholar', description: 'Literature review and citation management.', category: 'analysis', provider: 'anthropic', author: 'Community', stars: 6100, downloads: 28000, is_official: false, source: 'https://github.com/research-tools/scholar-agent' },
  { id: 5, name: 'Creative Director', description: 'Marketing campaigns and brand strategy.', category: 'creative', provider: 'openai', author: 'Community', stars: 5400, downloads: 23000, is_official: false, source: '' },
  { id: 6, name: 'DevOps Engineer', description: 'CI/CD pipelines and Kubernetes deployments.', category: 'coding', provider: 'deepseek', author: 'Community', stars: 3800, downloads: 15000, is_official: false, source: '' },
];

const Agents: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [installDialog, setInstallDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const providerColors: Record<string, string> = {
    anthropic: '#D4A574', openai: '#10A37F', deepseek: '#4A90D9', qwen: '#FF6B35', ollama: '#888',
  };

  const filteredAgents = mockAgents.filter(a =>
    (selectedCategory === 'all' || a.category === selectedCategory) &&
    (!search || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredTemplates = mockTemplates.filter(t =>
    (selectedCategory === 'all' || t.category === selectedCategory) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('agents.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">{t('agents.subtitle')}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} size="small">{t('agents.syncTemplates')}</Button>
          <Button variant="contained" startIcon={<Add />} sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}` }}>
            {t('agents.create')}
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: t('agents.totalAgents'), value: '5', icon: <SmartToy />, color: theme.palette.primary.main },
          { label: t('agents.activeAgents'), value: '4', icon: <PlayArrow />, color: '#10B981' },
          { label: t('agents.builtinAgents'), value: '3', icon: <CloudDownload />, color: '#8B5CF6' },
          { label: t('agents.templates'), value: '8', icon: <Category />, color: '#F59E0B' },
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(stat.color, 0.2)}`, background: `linear-gradient(135deg, ${alpha(stat.color, 0.05)}, ${alpha(stat.color, 0.02)})` }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.12), color: stat.color, width: 44, height: 44 }}>{stat.icon}</Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField size="small" placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 260 }}
          />
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
            <Tab label={t('agents.myAgents')} />
            <Tab label={t('agents.marketplace')} />
          </Tabs>
          <Box sx={{ flexGrow: 1 }} />
          <ToggleButtonGroup size="small" value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)}>
            <ToggleButton value="grid"><ViewModule /></ToggleButton>
            <ToggleButton value="list"><ViewList /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {['all', 'assistant', 'coding', 'writing', 'analysis', 'creative', 'customer_service'].map(cat => (
            <Chip key={cat} label={cat === 'all' ? t('agents.allCategories') : t(`agents.cat_${cat}`)}
              size="small" variant={selectedCategory === cat ? 'filled' : 'outlined'}
              color={selectedCategory === cat ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat)}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Content */}
      {tab === 0 ? (
        <Grid container spacing={2.5}>
          {filteredAgents.map(agent => (
            <Grid item xs={12} sm={6} md={4} key={agent.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}`, borderColor: theme.palette.primary.main } }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ width: 52, height: 52, bgcolor: alpha(providerColors[agent.provider] || '#888', 0.12), color: providerColors[agent.provider] || '#888', fontSize: 24 }}>
                      {categoryIcons[agent.category] || <SmartToy />}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>{agent.name}</Typography>
                        {agent.is_builtin && <Chip label="Built-in" size="small" sx={{ height: 20, fontSize: 11, bgcolor: alpha('#8B5CF6', 0.1), color: '#8B5CF6' }} />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {agent.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rating value={agent.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">{agent.rating}</Typography>
                    </Stack>
                    <Chip label={agent.status} size="small" color={agent.status === 'active' ? 'success' : 'default'}
                      sx={{ height: 22, '& .MuiChip-label': { px: 1 } }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Chip label={agent.provider} size="small" variant="outlined" sx={{ borderRadius: 1.5, height: 22, borderColor: alpha(providerColors[agent.provider] || '#888', 0.4), color: providerColors[agent.provider] || '#888' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                      {agent.usage_count.toLocaleString()} uses
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
                  <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>Configure</Button>
                  <Button size="small" variant="text" color={agent.status === 'active' ? 'error' : 'success'}>
                    {agent.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2.5}>
          {filteredTemplates.map(tmpl => (
            <Grid item xs={12} sm={6} md={4} key={tmpl.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}` } }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ width: 52, height: 52, bgcolor: alpha(providerColors[tmpl.provider] || '#888', 0.12), color: providerColors[tmpl.provider] || '#888' }}>
                      {categoryIcons[tmpl.category] || <SmartToy />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={600}>{tmpl.name}</Typography>
                        {tmpl.is_official && <Chip label="Official" size="small" sx={{ height: 20, fontSize: 11, bgcolor: alpha('#10A37F', 0.1), color: '#10A37F' }} />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{tmpl.description}</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Star sx={{ fontSize: 16, color: '#F59E0B' }} />
                        <Typography variant="caption">{(tmpl.stars / 1000).toFixed(1)}k</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Download sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{(tmpl.downloads / 1000).toFixed(0)}k</Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">by {tmpl.author}</Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 2, pt: 0 }}>
                  <Button size="small" variant="contained" startIcon={<CloudDownload />}
                    onClick={() => { setSelectedTemplate(tmpl); setInstallDialog(true); }}
                    sx={{ borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}>
                    Install
                  </Button>
                  {tmpl.source && <IconButton size="small" href={tmpl.source} target="_blank"><GitHub sx={{ fontSize: 18 }} /></IconButton>}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Install Dialog */}
      <Dialog open={installDialog} onClose={() => setInstallDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Install Agent: {selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedTemplate?.description}</Typography>
          <Stack spacing={1}>
            <Typography variant="body2"><strong>Provider:</strong> {selectedTemplate?.provider}</Typography>
            <Typography variant="body2"><strong>Author:</strong> {selectedTemplate?.author}</Typography>
            <Typography variant="body2"><strong>Stars:</strong> {selectedTemplate?.stars?.toLocaleString()}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setInstallDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setInstallDialog(false)} sx={{ borderRadius: 2 }}>Confirm Install</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Agents;
