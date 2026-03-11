function StatusFeedback({ status, data, error, onReset }) {
  if (status === 'loading') {
    return (
      <div className="status status--loading">
        <div className="loading-dots">
          <div className="loading-dots__dot"></div>
          <div className="loading-dots__dot"></div>
          <div className="loading-dots__dot"></div>
        </div>
        <p className="loading-text">Generating your sales insight...</p>
        <p className="loading-step">Parsing data → AI Analysis → Sending email</p>
      </div>
    );
  }

  if (status === 'success' && data) {
    return (
      <div className="status status--success">
        <div className="status__header">
          <span className="status__icon">✅</span>
          <h3 className="status__title status__title--success">Summary Sent!</h3>
        </div>
        <p className="status__message">
          The AI-generated sales summary has been delivered to <strong>{data.recipient}</strong>.
        </p>
        <div className="summary-box">
          <p className="summary-box__title">📊 AI Summary Preview</p>
          <div className="summary-box__content">{data.summary}</div>
        </div>
        <button className="new-upload-btn" onClick={onReset} id="new-upload-btn">
          ↻ Analyze Another File
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="status status--error">
        <div className="status__header">
          <span className="status__icon">❌</span>
          <h3 className="status__title status__title--error">Something went wrong</h3>
        </div>
        <p className="status__message">
          {error || 'An unexpected error occurred. Please try again.'}
        </p>
        <button className="new-upload-btn" onClick={onReset} id="retry-btn">
          ↻ Try Again
        </button>
      </div>
    );
  }

  return null;
}

export default StatusFeedback;
