import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError('Invalid credentials');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: 'primary.main', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>SL</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{t('auth.loginTitle')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('auth.loginSubtitle')}</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleLogin}>
            <TextField fullWidth label={t('auth.username')} value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" type="submit">{t('auth.login')}</Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
