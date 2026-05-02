import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Avatar,
  TextField, InputAdornment, Tabs, Tab, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, alpha, useTheme, Stack, Divider, Paper,
  LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Search, Add, PlayArrow, Schedule, PictureAsPdf, Language, Email,
  Transform, Image, Http, Summarize, Code, Webhook, Folder, Storage,
  CheckCircle, Refresh, TrendingUp, Speed, Category, Extension
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const skillIconMap: Record<string, React.ReactElement> = {
  schedule: <Schedule />, picture_as_pdf: <PictureAsPdf />, language: <Language />,
  email: <Email />, transform: <Transform />, image: <Image />,
  http: <Http />, summarize: <Summarize />, code: <Code />,
  webhook: <Webhook />, folder: <Folder />, storage: <Storage />,
};

const categoryColors: Record<string, string> = {
  automation: '#8B5CF6', document: '#EF4444', data: '#3B82F6',
  communication: '#10B981', utility: '#F59E0B', development: '#06B6D4',
};

const mockSkills = [
  { id: 1, name: 'Cron Timer', icon: 'schedule', description: 'Scheduled task executor with cron expressions.', category: 'automation', status: 'active', is_builtin: true, usage_count: 12450, success_rate: 99.8, avg_duration: 15, version: '1.0.0', source: 'https://github.com/robfig/cron' },
  { id: 2, name: 'PDF Converter', icon: 'picture_as_pdf', description: 'Convert documents between PDF and other formats.', category: 'document', status: 'active', is_builtin: true, usage_count: 8930, success_rate: 97.5, avg_duration: 3200, version: '1.2.0', source: 'https://github.com/nickvdyck/weasyprint' },
  { id: 3, name: 'Web Scraper', icon: 'language', description: 'Extract structured data from web pages.', category: 'data', status: 'active', is_builtin: true, usage_count: 7650, success_rate: 95.2, avg_duration: 2100, version: '1.1.0', source: 'https://github.com/gocolly/colly' },
  { id: 4, name: 'Email Sender', icon: 'email', description: 'Send emails with template and attachment support.', category: 'communication', status: 'active', is_builtin: true, usage_count: 5890, success_rate: 99.1, avg_duration: 800, version: '1.0.0', source: 'https://github.com/jordan-wright/email' },
  { id: 5, name: 'JSON/CSV Transform', icon: 'transform', description: 'Transform data between JSON, CSV, XML formats.', category: 'data', status: 'active', is_builtin: true, usage_count: 4560, success_rate: 99.9, avg_duration: 45, version: '1.0.0', source: 'https://github.com/tidwall/gjson' },
  { id: 6, name: 'Image Processor', icon: 'image', description: 'Resize, crop, compress, and convert images.', category: 'document', status: 'active', is_builtin: true, usage_count: 3890, success_rate: 98.7, avg_duration: 1500, version: '1.0.0', source: 'https://github.com/disintegration/imaging' },
  { id: 7, name: 'HTTP Request', icon: 'http', description: 'Make HTTP requests with custom headers and auth.', category: 'utility', status: 'active', is_builtin: true, usage_count: 6780, success_rate: 96.8, avg_duration: 350, version: '1.0.0', source: 'https://github.com/go-resty/resty' },
  { id: 8, name: 'Text Summarizer', icon: 'summarize', description: 'AI-powered text summarization.', category: 'utility', status: 'active', is_builtin: true, usage_count: 2340, success_rate: 94.5, avg_duration: 2800, version: '1.0.0', source: '' },
  { id: 9, name: 'Code Executor', icon: 'code', description: 'Execute code in sandboxed environments.', category: 'development', status: 'active', is_builtin: true, usage_count: 4120, success_rate: 92.3, avg_duration: 4500, version: '1.0.0', source: '' },
  { id: 10, name: 'Webhook Listener', icon: 'webhook', description: 'Create webhook endpoints for external events.', category: 'automation', status: 'active', is_builtin: true, usage_count: 3560, success_rate: 99.5, avg_duration: 20, version: '1.0.0', source: 'https://github.com/adnanh/webhook' },
  { id: 11, name: 'File Manager', icon: 'folder', description: 'Upload, download, and organize files.', category: 'utility', status: 'active', is_builtin: true, usage_count: 5230, success_rate: 99.2, avg_duration: 500, version: '1.0.0', source: '' },
  { id: 12, name: 'Database Query', icon: 'storage', description: 'Execute SQL queries with result formatting.', category: 'data', status: 'active', is_builtin: true, usage_count: 2890, success_rate: 98.1, avg_duration: 120, version: '1.0.0', source: '' },
];

const mockExecutions = [
  { id: 1, skill_name: 'Cron Timer', status: 'success', duration: 12, trigger_by: 'cron', created_at: '2026-05-02T11:00:00Z' },
  { id: 2, skill_name: 'PDF Converter', status: 'success', duration: 3150, trigger_by: 'agent', created_at: '2026-05-02T10:45:00Z' },
  { id: 3, skill_name: 'Web Scraper', status: 'failed', duration: 5000, trigger_by: 'manual', created_at: '2026-05-02T10:30:00Z' },
  { id: 4, skill_name: 'Email Sender', status: 'success', duration: 780, trigger_by: 'agent', created_at: '2026-05-02T10:15:00Z' },
  { id: 5, skill_name: 'HTTP Request', status: 'success', duration: 320, trigger_by: 'webhook', created_at: '2026-05-02T10:00:00Z' },
];

const Skills: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSkills = mockSkills.filter(s =>
    (selectedCategory === 'all' || s.category === selectedCategory) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalUsage = mockSkills.reduce((sum, s) => sum + s.usage_count, 0);
  const avgSuccess = mockSkills.reduce((sum, s) => sum + s.success_rate, 0) / mockSkills.length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ background: `linear-gradient(135deg, #8B5CF6, #06B6D4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('skills.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">{t('skills.subtitle')}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} size="small">{t('skills.syncBuiltin')}</Button>
          <Button variant="contained" startIcon={<Add />}
            sx={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: `0 4px 14px ${alpha('#8B5CF6', 0.4)}`, borderRadius: 2 }}>
            {t('skills.create')}
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: t('skills.totalSkills'), value: mockSkills.length.toString(), icon: <Extension />, color: '#8B5CF6' },
          { label: t('skills.totalExecutions'), value: (totalUsage / 1000).toFixed(1) + 'k', icon: <PlayArrow />, color: '#10B981' },
          { label: t('skills.avgSuccess'), value: avgSuccess.toFixed(1) + '%', icon: <CheckCircle />, color: '#3B82F6' },
          { label: t('skills.categories'), value: '6', icon: <Category />, color: '#F59E0B' },
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

      {/* Search & Tabs */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField size="small" placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 260 }}
          />
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
            <Tab label={t('skills.skillLibrary')} />
            <Tab label={t('skills.execHistory')} />
          </Tabs>
        </Stack>
        {tab === 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {['all', 'automation', 'document', 'data', 'communication', 'utility', 'development'].map(cat => (
              <Chip key={cat} label={cat === 'all' ? t('skills.allCategories') : t(`skills.cat_${cat}`)}
                size="small" variant={selectedCategory === cat ? 'filled' : 'outlined'}
                onClick={() => setSelectedCategory(cat)}
                sx={{ borderRadius: 2, ...(selectedCategory === cat && cat !== 'all' ? { bgcolor: alpha(categoryColors[cat] || '#888', 0.15), color: categoryColors[cat], borderColor: categoryColors[cat] } : {}) }}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* Content */}
      {tab === 0 ? (
        <Grid container spacing={2}>
          {filteredSkills.map(skill => {
            const catColor = categoryColors[skill.category] || '#888';
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={skill.id}>
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 30px ${alpha(catColor, 0.15)}`, borderColor: catColor } }}>
                  <CardContent sx={{ p: 2.5, flex: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(catColor, 0.12), color: catColor }}>
                        {skillIconMap[skill.icon] || <Extension />}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>{skill.name}</Typography>
                        <Typography variant="caption" color="text.secondary">v{skill.version}</Typography>
                      </Box>
                      {skill.is_builtin && (
                        <Chip label="Built-in" size="small" sx={{ height: 18, fontSize: 10, bgcolor: alpha(catColor, 0.1), color: catColor }} />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 12 }}>
                      {skill.description}
                    </Typography>
                    {/* Performance indicators */}
                    <Stack spacing={0.8}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">{t('skills.successRate')}</Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: skill.success_rate > 98 ? '#10B981' : skill.success_rate > 95 ? '#F59E0B' : '#EF4444' }}>
                          {skill.success_rate}%
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={skill.success_rate}
                        sx={{ height: 4, borderRadius: 2, bgcolor: alpha(catColor, 0.1), '& .MuiLinearProgress-bar': { bgcolor: catColor, borderRadius: 2 } }}
                      />
                      <Stack direction="row" justifyContent="space-between">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Speed sx={{ fontSize: 12, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{skill.avg_duration}ms</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TrendingUp sx={{ fontSize: 12, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{skill.usage_count.toLocaleString()}</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ px: 2.5, pb: 2, pt: 0, gap: 0.5 }}>
                    <Button size="small" variant="contained" startIcon={<PlayArrow />}
                      sx={{ borderRadius: 2, fontSize: 12, bgcolor: catColor, '&:hover': { bgcolor: catColor, opacity: 0.9 } }}>
                      {t('skills.execute')}
                    </Button>
                    <Button size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: 12 }}>
                      {t('skills.configure')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 600 }}>{t('skills.skillName')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('skills.duration')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('skills.trigger')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('skills.time')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockExecutions.map(exec => (
                  <TableRow key={exec.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{exec.skill_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={exec.status} size="small"
                        color={exec.status === 'success' ? 'success' : exec.status === 'failed' ? 'error' : 'warning'}
                        sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: 11 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{exec.duration}ms</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={exec.trigger_by} size="small" variant="outlined" sx={{ height: 22, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{new Date(exec.created_at).toLocaleTimeString()}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default Skills;
