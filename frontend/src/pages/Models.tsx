import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const mockModels = [
  { id: 1, name: 'Llama-3-70B-Instruct', version: 'v1.0', format: 'safetensors', size: '140GB', runtime: 'vLLM', status: 'available' },
  { id: 2, name: 'Qwen-2-72B-Chat', version: 'v2.0', format: 'safetensors', size: '145GB', runtime: 'vLLM', status: 'available' },
  { id: 3, name: 'Codestral-22B', version: 'v1.0', format: 'gguf', size: '22GB', runtime: 'llama.cpp', status: 'available' },
  { id: 4, name: 'Mixtral-8x7B', version: 'v0.1', format: 'safetensors', size: '93GB', runtime: 'TensorRT', status: 'deploying' },
  { id: 5, name: 'Phi-3-Medium-14B', version: 'v1.0', format: 'gguf', size: '14GB', runtime: 'GPUStack', status: 'available' },
];

const Models: React.FC = () => {
  const { t } = useTranslation();
  const getStatusColor = (s: string) => { switch(s) { case 'available': return 'success'; case 'deploying': return 'warning'; default: return 'default'; } };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2">{t('models.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>{t('models.register')}</Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.name')}</TableCell>
                  <TableCell>{t('models.version')}</TableCell>
                  <TableCell>{t('models.format')}</TableCell>
                  <TableCell>{t('models.size')}</TableCell>
                  <TableCell>{t('services.runtime')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockModels.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{m.name}</TableCell>
                    <TableCell>{m.version}</TableCell>
                    <TableCell><Chip label={m.format} size="small" variant="outlined" /></TableCell>
                    <TableCell>{m.size}</TableCell>
                    <TableCell>{m.runtime}</TableCell>
                    <TableCell><Chip label={m.status} size="small" color={getStatusColor(m.status) as any} /></TableCell>
                    <TableCell><IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Models;
