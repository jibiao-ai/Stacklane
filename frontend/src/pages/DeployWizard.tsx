import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Stepper, Step, StepLabel, Button, Grid, Radio, RadioGroup, FormControlLabel, TextField, Alert, Snackbar, LinearProgress, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const models = ['Llama-3-70B-Instruct', 'Qwen-2-72B-Chat', 'Codestral-22B', 'Mixtral-8x7B', 'Phi-3-Medium-14B'];
const runtimes = ['vLLM', 'llama.cpp', 'TensorRT-LLM', 'GPUStack'];
const strategies = ['rolling', 'canary', 'blueGreen'];

const DeployWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [model, setModel] = useState('');
  const [runtime, setRuntime] = useState('');
  const [strategy, setStrategy] = useState('rolling');
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [config, setConfig] = useState({ cluster: 'us-east-1', gpuCount: '4', replicas: '2', memory: '80' });

  const steps = [t('deploy.selectModel'), t('deploy.selectRuntime'), t('deploy.configResources'), t('deploy.setStrategy'), t('deploy.review')];

  const handleDeploy = () => {
    setDeploying(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDeploying(false);
          setCompleted(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  if (completed) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" sx={{ color: '#00B42A', mb: 2 }}>Deployment Successful!</Typography>
        <Alert severity="success" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          <strong>{model}</strong> deployed to <strong>{config.cluster}</strong> using <strong>{runtime}</strong> with {config.replicas} replicas ({strategy} strategy).
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/services')}>View Services</Button>
          <Button variant="outlined" onClick={() => { setCompleted(false); setStep(0); setModel(''); setRuntime(''); }}>Deploy Another</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3 }}>{t('deploy.title')}</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={step} sx={{ mb: 4 }}>
            {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
          </Stepper>

          {step === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('deploy.selectModel')}</Typography>
              <RadioGroup value={model} onChange={(e) => setModel(e.target.value)}>
                <Grid container spacing={1}>
                  {models.map((m) => (
                    <Grid item xs={12} sm={6} key={m}>
                      <Card variant="outlined" sx={{ p: 1, border: model === m ? '2px solid #165DFF' : undefined, cursor: 'pointer' }} onClick={() => setModel(m)}>
                        <FormControlLabel value={m} control={<Radio />} label={m} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </Box>
          )}

          {step === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('deploy.selectRuntime')}</Typography>
              <RadioGroup value={runtime} onChange={(e) => setRuntime(e.target.value)}>
                <Grid container spacing={1}>
                  {runtimes.map((r) => (
                    <Grid item xs={12} sm={6} md={3} key={r}>
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center', border: runtime === r ? '2px solid #165DFF' : undefined, cursor: 'pointer' }} onClick={() => setRuntime(r)}>
                        <FormControlLabel value={r} control={<Radio />} label={r} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('deploy.configResources')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label={t('deploy.cluster')} value={config.cluster} onChange={(e) => setConfig({ ...config, cluster: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label={t('deploy.gpuCount')} type="number" value={config.gpuCount} onChange={(e) => setConfig({ ...config, gpuCount: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label={t('deploy.replicas')} type="number" value={config.replicas} onChange={(e) => setConfig({ ...config, replicas: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label={t('deploy.memoryLimit')} type="number" value={config.memory} onChange={(e) => setConfig({ ...config, memory: e.target.value })} /></Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                Estimated cost: ${(parseInt(config.gpuCount) * 0.6).toFixed(1)}/hr | Latency: ~{45 - parseInt(config.replicas) * 5}ms | Throughput: ~{parseInt(config.replicas) * 60} req/s
              </Alert>
            </Box>
          )}

          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('deploy.setStrategy')}</Typography>
              <RadioGroup value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                {strategies.map((s) => (
                  <Card variant="outlined" sx={{ p: 2, mb: 1, border: strategy === s ? '2px solid #165DFF' : undefined, cursor: 'pointer' }} key={s} onClick={() => setStrategy(s)}>
                    <FormControlLabel value={s} control={<Radio />} label={t(`deploy.${s}`)} />
                  </Card>
                ))}
              </RadioGroup>
            </Box>
          )}

          {step === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('deploy.review')}</Typography>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Model</Typography><Typography fontWeight={600}>{model}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Runtime</Typography><Typography fontWeight={600}>{runtime}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Cluster</Typography><Typography fontWeight={600}>{config.cluster}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">GPUs</Typography><Typography fontWeight={600}>{config.gpuCount}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Replicas</Typography><Typography fontWeight={600}>{config.replicas}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Strategy</Typography><Chip label={strategy} size="small" color="primary" /></Grid>
                </Grid>
              </Card>
              {deploying && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Deploying... {Math.min(Math.round(progress), 100)}%</Typography>
                  <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={step === 0 || deploying} onClick={() => setStep(step - 1)}>Back</Button>
            {step < 4 ? (
              <Button variant="contained" onClick={() => setStep(step + 1)} disabled={(step === 0 && !model) || (step === 1 && !runtime)}>Next</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleDeploy} disabled={deploying}>
                {deploying ? 'Deploying...' : 'Deploy Now'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeployWizard;
