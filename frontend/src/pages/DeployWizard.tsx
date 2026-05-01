import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Stepper, Step, StepLabel, Button, Grid, Radio, RadioGroup, FormControlLabel, TextField, Alert } from '@mui/material';

const models = ['Llama-3-70B-Instruct', 'Qwen-2-72B-Chat', 'Codestral-22B', 'Mixtral-8x7B', 'Phi-3-Medium-14B'];
const runtimes = ['vLLM', 'llama.cpp', 'TensorRT-LLM', 'GPUStack'];
const strategies = ['rolling', 'canary', 'blueGreen'];

const DeployWizard: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [model, setModel] = useState('');
  const [runtime, setRuntime] = useState('');
  const [strategy, setStrategy] = useState('rolling');

  const steps = [t('deploy.step1'), t('deploy.step2'), t('deploy.step3'), t('deploy.step4')];

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
                      <Card variant="outlined" sx={{ p: 1, border: model === m ? '2px solid #165DFF' : undefined }}>
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
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center', border: runtime === r ? '2px solid #165DFF' : undefined }}>
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
                <Grid item xs={12} sm={6}><TextField fullWidth label="Cluster" defaultValue="us-east-1" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="GPU Count" type="number" defaultValue="4" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Replicas" type="number" defaultValue="2" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Max Memory (GB)" type="number" defaultValue="80" /></Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('deploy.estimatedCost')}: $2.4/hr | {t('deploy.estimatedLatency')}: ~45ms | {t('deploy.estimatedThroughput')}: ~120 req/s
              </Alert>
            </Box>
          )}

          {step === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>{t('deploy.selectStrategy')}</Typography>
              <RadioGroup value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                {strategies.map((s) => (
                  <Card variant="outlined" sx={{ p: 2, mb: 1, border: strategy === s ? '2px solid #165DFF' : undefined }} key={s}>
                    <FormControlLabel value={s} control={<Radio />} label={t(`deploy.${s}`)} />
                  </Card>
                ))}
              </RadioGroup>
              <Alert severity="warning" sx={{ mt: 2 }}>{t('deploy.riskWarning')}: Ensure sufficient GPU capacity before deployment.</Alert>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={step === 0} onClick={() => setStep(step - 1)}>{t('common.back')}</Button>
            {step < 3 ? (
              <Button variant="contained" onClick={() => setStep(step + 1)}>{t('common.next')}</Button>
            ) : (
              <Button variant="contained" color="primary">{t('deploy.submit')}</Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeployWizard;
