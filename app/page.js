'use client';
import { useState } from 'react';
import { Button, Box, TextField, CircularProgress, Typography } from '@mui/material';

export default function UnitTestGenerator() {
  const [codeSnippet, setCodeSnippet] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ role: 'user', content: codeSnippet }]),
      });

      if (!res.ok) {
        throw new Error('Failed to generate test cases');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamOutput = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        streamOutput += decoder.decode(value);
        setResponse((prev) => prev + decoder.decode(value));
      }

      setResponse(streamOutput);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #4F46E5, #9333EA, #EC4899)',
        padding: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 800,
          backgroundColor: 'white',
          boxShadow: 24,
          borderRadius: 2,
          padding: 4,
        }}
      >
        <Typography variant="h4" color="primary" gutterBottom align="center">
          Unit Test Case Generator
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
          Paste your code snippet below to generate comprehensive and readable unit test cases.
        </Typography>

        <TextField
          value={codeSnippet}
          onChange={(e) => setCodeSnippet(e.target.value)}
          placeholder="Paste your code snippet here..."
          multiline
          rows={8}
          variant="outlined"
          fullWidth
          sx={{
            marginBottom: 2,
            backgroundColor: '#f7fafc',
            borderRadius: 1,
          }}
        />

        <Box display="flex" justifyContent="center">
          <Button
            onClick={handleGenerate}
            variant="contained"
            color="primary"
            sx={{
              paddingX: 4,
              paddingY: 2,
              fontWeight: 'bold',
              borderRadius: 5,
              boxShadow: 2,
              transition: '0.3s',
              '&:hover': {
                boxShadow: 6,
                backgroundColor: '#6d28d9',
              },
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Test Cases'}
          </Button>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" mt={3}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {error && (
          <Typography variant="body2" color="error" align="center" mt={3}>
            <strong>Error:</strong> {error}
          </Typography>
        )}

        {response && (
          <Box mt={4}>
            <Typography variant="h6" color="textPrimary" gutterBottom align="center">
              Generated Test Cases
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f1f5f9',
                padding: 2,
                borderRadius: 1,
                border: '1px solid #e5e7eb',
                whiteSpace: 'pre-wrap',
                fontSize: '0.875rem',
                wordBreak: 'break-word',
              }}
            >
              {response}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
