import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined,
  RocketLaunchOutlined,
  AutoAwesomeOutlined,
  SecurityOutlined,
  SpeedOutlined,
} from '@mui/icons-material';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <RocketLaunchOutlined sx={{ fontSize: 28 }} />, titleKey: 'auth.feature1Title', descKey: 'auth.feature1Desc' },
    { icon: <AutoAwesomeOutlined sx={{ fontSize: 28 }} />, titleKey: 'auth.feature2Title', descKey: 'auth.feature2Desc' },
    { icon: <SecurityOutlined sx={{ fontSize: 28 }} />, titleKey: 'auth.feature3Title', descKey: 'auth.feature3Desc' },
    { icon: <SpeedOutlined sx={{ fontSize: 28 }} />, titleKey: 'auth.feature4Title', descKey: 'auth.feature4Desc' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: '#F0F5FF',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* ===================== LEFT PANEL — Brand Showcase ===================== */}
      <Box sx={{
        flex: '0 0 520px',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        background: 'linear-gradient(160deg, #165DFF 0%, #0E42D2 40%, #0A2F9E 100%)',
        overflow: 'hidden',
        px: 6,
        py: 8,
      }}>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -120, left: -60,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <Box sx={{
          position: 'absolute', top: '40%', right: '10%',
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />

        {/* Animated lines / grid pattern */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        {/* Logo + Branding */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Inline SVG Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 3,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="36" height="36">
                <g fill="white">
                  <path d="M 88 180 L 190 180 L 190 212 L 88 212 Z"/>
                  <path d="M 322 180 L 424 180 L 424 212 L 322 212 Z"/>
                  <path d="M 88 300 L 190 300 L 190 332 L 88 332 Z"/>
                  <path d="M 322 300 L 424 300 L 424 332 L 322 332 Z"/>
                  <path d="M 178 180 L 202 180 L 258 236 L 310 180 L 334 180 L 270 248 L 256 248 L 242 248 Z"/>
                  <path d="M 178 332 L 202 332 L 258 276 L 310 332 L 334 332 L 270 264 L 256 264 L 242 264 Z"/>
                </g>
                <path d="M 215 268 L 233 250 L 221 238 L 203 256 Z" fill="#165DFF"/>
                <path d="M 279 244 L 297 262 L 309 250 L 291 232 Z" fill="#165DFF"/>
              </svg>
            </Box>
            <Typography sx={{
              color: '#fff', fontWeight: 700, fontSize: '1.75rem',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              Stacklane
            </Typography>
          </Box>

          {/* Tagline */}
          <Typography sx={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 1.5,
            maxWidth: 380,
          }}>
            {t('auth.brandTitle')}
          </Typography>
          <Typography sx={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1rem',
            lineHeight: 1.7,
            mb: 6,
            maxWidth: 380,
          }}>
            {t('auth.brandDesc')}
          </Typography>

          {/* Feature highlights */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {features.map((f, idx) => (
              <Box key={idx} sx={{
                display: 'flex', alignItems: 'flex-start', gap: 2,
                p: 2, borderRadius: 2.5,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.12)',
                  transform: 'translateX(6px)',
                },
              }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: 2,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                }}>
                  {f.icon}
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', mb: 0.3 }}>
                    {t(f.titleKey)}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {t(f.descKey)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom copyright */}
        <Typography sx={{
          position: 'absolute', bottom: 32, left: 48,
          color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem',
        }}>
          &copy; 2025 Stacklane. All rights reserved.
        </Typography>
      </Box>

      {/* ===================== RIGHT PANEL — Login Form ===================== */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, sm: 6, md: 8 },
        py: 6,
        position: 'relative',
        background: '#fff',
      }}>
        {/* Top-right decorative gradient blob */}
        <Box sx={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,93,255,0.08) 0%, transparent 70%)',
        }} />

        {/* Login container */}
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo (hidden on desktop) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: 2.5,
              background: 'linear-gradient(135deg, #165DFF, #0E42D2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="28" height="28">
                <g fill="white">
                  <path d="M 88 180 L 190 180 L 190 212 L 88 212 Z"/>
                  <path d="M 322 180 L 424 180 L 424 212 L 322 212 Z"/>
                  <path d="M 88 300 L 190 300 L 190 332 L 88 332 Z"/>
                  <path d="M 322 300 L 424 300 L 424 332 L 322 332 Z"/>
                  <path d="M 178 180 L 202 180 L 258 236 L 310 180 L 334 180 L 270 248 L 256 248 L 242 248 Z"/>
                  <path d="M 178 332 L 202 332 L 258 276 L 310 332 L 334 332 L 270 264 L 256 264 L 242 264 Z"/>
                </g>
                <path d="M 215 268 L 233 250 L 221 238 L 203 256 Z" fill="#165DFF"/>
                <path d="M 279 244 L 297 262 L 309 250 L 291 232 Z" fill="#165DFF"/>
              </svg>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#1D2129' }}>
              Stacklane
            </Typography>
          </Box>

          {/* Welcome text */}
          <Typography sx={{
            fontWeight: 700, fontSize: '1.75rem', color: '#1D2129',
            mb: 0.5, letterSpacing: '-0.01em',
          }}>
            {t('auth.welcomeBack')}
          </Typography>
          <Typography sx={{
            color: '#86909C', fontSize: '0.95rem', mb: 4, lineHeight: 1.6,
          }}>
            {t('auth.loginSubtitle')}
          </Typography>

          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{
              mb: 3, borderRadius: 2,
              '& .MuiAlert-icon': { alignItems: 'center' },
            }}>
              {error}
            </Alert>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin}>
            {/* Username field */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E5969', mb: 1 }}>
              {t('auth.username')}
            </Typography>
            <TextField
              fullWidth
              placeholder={t('auth.usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline sx={{ color: '#C9CDD4', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: '#F7F8FA',
                  transition: 'all 0.2s ease',
                  '& fieldset': { borderColor: '#E5E6EB' },
                  '&:hover fieldset': { borderColor: '#165DFF' },
                  '&.Mui-focused fieldset': { borderColor: '#165DFF', borderWidth: 2 },
                  '&.Mui-focused': { bgcolor: '#fff' },
                },
                '& .MuiInputBase-input': {
                  py: 1.5, fontSize: '0.9rem',
                },
              }}
            />

            {/* Password field */}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#4E5969', mb: 1 }}>
              {t('auth.password')}
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#C9CDD4', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#C9CDD4' }}
                    >
                      {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: '#F7F8FA',
                  transition: 'all 0.2s ease',
                  '& fieldset': { borderColor: '#E5E6EB' },
                  '&:hover fieldset': { borderColor: '#165DFF' },
                  '&.Mui-focused fieldset': { borderColor: '#165DFF', borderWidth: 2 },
                  '&.Mui-focused': { bgcolor: '#fff' },
                },
                '& .MuiInputBase-input': {
                  py: 1.5, fontSize: '0.9rem',
                },
              }}
            />

            {/* Remember me + Forgot password */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    size="small"
                    sx={{
                      color: '#C9CDD4',
                      '&.Mui-checked': { color: '#165DFF' },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.82rem', color: '#86909C' }}>{t('auth.rememberMe')}</Typography>}
              />
              <Typography sx={{
                fontSize: '0.82rem', color: '#165DFF', cursor: 'pointer',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}>
                {t('auth.forgotPassword')}
              </Typography>
            </Box>

            {/* Login button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                py: 1.6,
                borderRadius: 2.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #165DFF 0%, #4080FF 100%)',
                boxShadow: '0 4px 14px rgba(22, 93, 255, 0.35)',
                textTransform: 'none',
                letterSpacing: '0.02em',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0E42D2 0%, #165DFF 100%)',
                  boxShadow: '0 6px 20px rgba(22, 93, 255, 0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(135deg, #94BFFF 0%, #ADC6FF 100%)',
                  color: '#fff',
                },
              }}
            >
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3.5 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#E5E6EB' }} />
            <Typography sx={{ mx: 2, fontSize: '0.78rem', color: '#C9CDD4', whiteSpace: 'nowrap' }}>
              {t('auth.securedPlatform')}
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: '#E5E6EB' }} />
          </Box>

          {/* Trust badges */}
          <Box sx={{
            display: 'flex', justifyContent: 'center', gap: 4,
            flexWrap: 'wrap',
          }}>
            {[
              { icon: <SecurityOutlined sx={{ fontSize: 16 }} />, label: t('auth.badgeSecure') },
              { icon: <SpeedOutlined sx={{ fontSize: 16 }} />, label: t('auth.badgePerformance') },
              { icon: <AutoAwesomeOutlined sx={{ fontSize: 16 }} />, label: t('auth.badgeAI') },
            ].map((badge, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ color: '#C9CDD4' }}>{badge.icon}</Box>
                <Typography sx={{ fontSize: '0.75rem', color: '#C9CDD4' }}>{badge.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Default credentials hint */}
          <Box sx={{
            mt: 3, p: 2, borderRadius: 2,
            background: '#F7F8FA',
            border: '1px solid #E5E6EB',
          }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#86909C', textAlign: 'center', mb: 0.5 }}>
              {t('auth.defaultCredentials', '默认管理员账号')}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#4E5969', textAlign: 'center', fontFamily: 'monospace' }}>
              admin / Admin@2026!
            </Typography>
          </Box>
        </Box>

        {/* Bottom version */}
        <Typography sx={{
          position: 'absolute', bottom: 24,
          color: '#C9CDD4', fontSize: '0.72rem',
        }}>
          Stacklane v2.0.0
        </Typography>
      </Box>

      {/* Global CSS keyframes for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
};

export default Login;
