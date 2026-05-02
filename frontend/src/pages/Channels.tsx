import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Avatar,
  TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, alpha, useTheme, Stack, Divider, Paper, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Badge
} from '@mui/material';
import {
  Search, Add, Link as LinkIcon, LinkOff, Send, Settings, Delete,
  CheckCircle, Error, Warning, Refresh, Message, SmartToy, Cable
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const channelIcons: Record<string, { color: string; label: string }> = {
  qq: { color: '#12B7F5', label: 'QQ' },
  wecom: { color: '#2B73FF', label: 'WeCom' },
  feishu: { color: '#3370FF', label: 'Feishu' },
  wechat: { color: '#07C160', label: 'WeChat' },
  telegram: { color: '#229ED9', label: 'Telegram' },
  discord: { color: '#5865F2', label: 'Discord' },
  slack: { color: '#4A154B', label: 'Slack' },
  dingtalk: { color: '#0089FF', label: 'DingTalk' },
};

const mockChannels = [
  { id: 1, name: 'QQ AI Assistant', type: 'qq', status: 'active', agent_name: 'Claude Assistant', message_count: 45230, last_active_at: '2026-05-02T10:30:00Z', error_msg: '' },
  { id: 2, name: 'WeCom Support Bot', type: 'wecom', status: 'active', agent_name: 'Customer Service Bot', message_count: 23890, last_active_at: '2026-05-02T11:15:00Z', error_msg: '' },
  { id: 3, name: 'Feishu Dev Helper', type: 'feishu', status: 'active', agent_name: 'DeepSeek Coder', message_count: 12456, last_active_at: '2026-05-02T09:45:00Z', error_msg: '' },
  { id: 4, name: 'WeChat Official Account', type: 'wechat', status: 'inactive', agent_name: '', message_count: 8900, last_active_at: '2026-04-28T16:20:00Z', error_msg: '' },
  { id: 5, name: 'Telegram Team Bot', type: 'telegram', status: 'error', agent_name: 'Data Analyst Pro', message_count: 5670, last_active_at: '2026-05-01T08:00:00Z', error_msg: 'Token expired' },
  { id: 6, name: 'DingTalk Notification', type: 'dingtalk', status: 'active', agent_name: 'Qwen Writer', message_count: 3450, last_active_at: '2026-05-02T10:00:00Z', error_msg: '' },
];

const Channels: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const statusConfig: Record<string, { color: string; icon: React.ReactElement; label: string }> = {
    active: { color: '#10B981', icon: <CheckCircle sx={{ fontSize: 16 }} />, label: t('channels.statusActive') },
    inactive: { color: '#6B7280', icon: <LinkOff sx={{ fontSize: 16 }} />, label: t('channels.statusInactive') },
    error: { color: '#EF4444', icon: <Error sx={{ fontSize: 16 }} />, label: t('channels.statusError') },
    connecting: { color: '#F59E0B', icon: <Warning sx={{ fontSize: 16 }} />, label: t('channels.statusConnecting') },
  };

  const filteredChannels = mockChannels.filter(ch =>
    !search || ch.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = mockChannels.filter(c => c.status === 'active').length;
  const totalMessages = mockChannels.reduce((sum, c) => sum + c.message_count, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, #8B5CF6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('channels.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">{t('channels.subtitle')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialog(true)}
          sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`, borderRadius: 2 }}>
          {t('channels.create')}
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: t('channels.totalChannels'), value: mockChannels.length.toString(), icon: <Cable />, color: theme.palette.primary.main },
          { label: t('channels.activeChannels'), value: activeCount.toString(), icon: <CheckCircle />, color: '#10B981' },
          { label: t('channels.totalMessages'), value: (totalMessages / 1000).toFixed(1) + 'k', icon: <Message />, color: '#8B5CF6' },
          { label: t('channels.boundAgents'), value: mockChannels.filter(c => c.agent_name).length.toString(), icon: <SmartToy />, color: '#F59E0B' },
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

      {/* Supported Channel Types */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>{t('channels.supportedPlatforms')}</Typography>
        <Grid container spacing={1.5}>
          {Object.entries(channelIcons).map(([key, { color, label }]) => {
            const count = mockChannels.filter(c => c.type === key).length;
            return (
              <Grid item key={key}>
                <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 2.5, border: `1px solid ${alpha(color, 0.3)}`, background: alpha(color, 0.04), display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { background: alpha(color, 0.1), transform: 'scale(1.02)' } }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                  <Typography variant="body2" fontWeight={500}>{label}</Typography>
                  {count > 0 && <Chip label={count} size="small" sx={{ height: 18, fontSize: 11, bgcolor: alpha(color, 0.15), color }} />}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField size="small" placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 300 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button startIcon={<Refresh />} size="small" variant="outlined">{t('common.refresh')}</Button>
        </Stack>
      </Paper>

      {/* Channel List */}
      <Grid container spacing={2.5}>
        {filteredChannels.map(channel => {
          const chInfo = channelIcons[channel.type] || { color: '#888', label: channel.type };
          const statusInfo = statusConfig[channel.status] || statusConfig.inactive;
          return (
            <Grid item xs={12} sm={6} md={4} key={channel.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, transition: 'all 0.3s', position: 'relative', overflow: 'visible', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 40px ${alpha(chInfo.color, 0.15)}`, borderColor: chInfo.color } }}>
                {/* Status indicator */}
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <Tooltip title={statusInfo.label}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: 2, bgcolor: alpha(statusInfo.color, 0.1) }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusInfo.color, animation: channel.status === 'active' ? 'pulse 2s infinite' : 'none', '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } } }} />
                      <Typography variant="caption" sx={{ color: statusInfo.color, fontWeight: 500 }}>{statusInfo.label}</Typography>
                    </Box>
                  </Tooltip>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(chInfo.color, 0.12), color: chInfo.color, fontWeight: 700, fontSize: 14 }}>
                      {chInfo.label.substring(0, 2)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{channel.name}</Typography>
                      <Chip label={chInfo.label} size="small" sx={{ height: 20, fontSize: 11, bgcolor: alpha(chInfo.color, 0.1), color: chInfo.color }} />
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">{t('channels.boundAgent')}</Typography>
                      <Typography variant="body2" fontWeight={500}>{channel.agent_name || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">{t('channels.messages')}</Typography>
                      <Typography variant="body2" fontWeight={500}>{channel.message_count.toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">{t('channels.lastActive')}</Typography>
                      <Typography variant="body2" fontWeight={500}>{new Date(channel.last_active_at).toLocaleDateString()}</Typography>
                    </Stack>
                  </Stack>
                  {channel.error_msg && (
                    <Paper sx={{ mt: 1.5, p: 1, bgcolor: alpha('#EF4444', 0.05), border: `1px solid ${alpha('#EF4444', 0.2)}`, borderRadius: 1.5 }}>
                      <Typography variant="caption" color="error">{channel.error_msg}</Typography>
                    </Paper>
                  )}
                </CardContent>
                <CardActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={0.5}>
                    {channel.status === 'active' ? (
                      <Button size="small" color="error" startIcon={<LinkOff />} sx={{ borderRadius: 2 }}>Disconnect</Button>
                    ) : (
                      <Button size="small" color="success" startIcon={<LinkIcon />} sx={{ borderRadius: 2 }}>Connect</Button>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small"><Send sx={{ fontSize: 18 }} /></IconButton>
                    <IconButton size="small"><Settings sx={{ fontSize: 18 }} /></IconButton>
                    <IconButton size="small" color="error"><Delete sx={{ fontSize: 18 }} /></IconButton>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Channel Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('channels.createTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t('channels.selectPlatform')}</Typography>
          <Grid container spacing={1.5}>
            {Object.entries(channelIcons).map(([key, { color, label }]) => (
              <Grid item xs={6} sm={3} key={key}>
                <Paper elevation={0} onClick={() => setSelectedType(key)}
                  sx={{ p: 2, textAlign: 'center', borderRadius: 2, cursor: 'pointer', border: `2px solid ${selectedType === key ? color : 'transparent'}`, bgcolor: selectedType === key ? alpha(color, 0.08) : alpha(color, 0.02), transition: 'all 0.2s', '&:hover': { bgcolor: alpha(color, 0.08) } }}>
                  <Avatar sx={{ width: 40, height: 40, mx: 'auto', mb: 1, bgcolor: alpha(color, 0.12), color, fontWeight: 700, fontSize: 12 }}>
                    {label.substring(0, 2)}
                  </Avatar>
                  <Typography variant="caption" fontWeight={500}>{label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {selectedType && (
            <Box sx={{ mt: 3 }}>
              <TextField fullWidth label={t('channels.channelName')} size="small" sx={{ mb: 2 }} />
              <TextField fullWidth label="App ID" size="small" sx={{ mb: 2 }} />
              <TextField fullWidth label="App Secret" size="small" type="password" sx={{ mb: 2 }} />
              <TextField fullWidth label="Token" size="small" sx={{ mb: 2 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" disabled={!selectedType} sx={{ borderRadius: 2 }}>{t('common.create')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Channels;
