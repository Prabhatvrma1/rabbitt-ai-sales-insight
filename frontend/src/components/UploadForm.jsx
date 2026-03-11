import { useState, useRef } from 'react';

function UploadForm({ onSubmit, isLoading }) {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validExtensions = ['.csv', '.xlsx'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      alert('Please upload a .csv or .xlsx file only.');
      return;
    }

    // 10MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !email) return;
    onSubmit(file, email);
  };

  const isFormValid = file && email && !isLoading;

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        {/* Drop Zone */}
        <div
          className={`dropzone ${dragActive ? 'dropzone--active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="file-dropzone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="hidden-input"
            id="file-input"
          />
          
          {!file ? (
            <>
              <span className="dropzone__icon">📁</span>
              <p className="dropzone__text">
                Drag & drop your file here or <strong>browse</strong>
              </p>
              <p className="dropzone__hint">Supports .csv and .xlsx files (max 10MB)</p>
            </>
          ) : (
            <>
              <span className="dropzone__icon">📊</span>
              <p className="dropzone__text">File selected</p>
              <div className="dropzone__file" onClick={(e) => e.stopPropagation()}>
                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                <button
                  type="button"
                  className="dropzone__file-remove"
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  id="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </div>

        {/* Email Input */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="email-input">
            📧 Recipient Email Address
          </label>
          <input
            id="email-input"
            type="email"
            className="form-group__input"
            placeholder="manager@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`submit-btn ${isLoading ? 'submit-btn--loading' : ''}`}
          disabled={!isFormValid}
          id="submit-btn"
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Generating Insight...
            </>
          ) : (
            '🚀 Generate & Send Summary'
          )}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
