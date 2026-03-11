import { useState } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import StatusFeedback from './components/StatusFeedback';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (file, email) => {
    setStatus('loading');
    setError('');
    setResponseData(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          // Include API key if configured
          ...(import.meta.env.VITE_API_KEY && {
            'X-API-Key': import.meta.env.VITE_API_KEY,
          }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong. Please try again.');
      }

      setResponseData(data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResponseData(null);
    setError('');
  };

  return (
    <div className="app">
      <Header />

      {status === 'idle' && (
        <UploadForm onSubmit={handleSubmit} isLoading={false} />
      )}

      {status === 'loading' && (
        <>
          <UploadForm onSubmit={handleSubmit} isLoading={true} />
          <StatusFeedback status="loading" />
        </>
      )}

      {(status === 'success' || status === 'error') && (
        <StatusFeedback
          status={status}
          data={responseData}
          error={error}
          onReset={handleReset}
        />
      )}

      <footer className="footer">
        <p>
          Built with ❤️ by <a href="https://github.com/rabbitt-ai" target="_blank" rel="noopener noreferrer">Rabbitt AI</a> · 
          Powered by Google Gemini AI · 
          <a href={`${API_URL}/docs`} target="_blank" rel="noopener noreferrer">API Docs</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
