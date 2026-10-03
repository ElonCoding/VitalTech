import { useState } from 'react';
import { jsPDF } from 'jspdf';
import './SkinDiseaseFinder.css';
import { AI_BASE_URL } from '../../../config/api';

function SkinDiseaseFinder() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDownloadPDF = () => {
    if (!prediction) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFontSize(20);
    doc.text('AI Skin Analysis Report', pageWidth/2, margin, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, margin + 10);

    doc.setFontSize(14);
    doc.text('Detected Condition:', margin, margin + 25);
    doc.setFontSize(12);
    doc.text(prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1), margin, margin + 35);

    doc.setFontSize(14);
    doc.text('AI Confidence Score:', margin, margin + 50);
    doc.setFontSize(12);
    doc.text(`${(prediction.confidence * 100).toFixed(2)}%`, margin, margin + 60);

    doc.setFontSize(14);
    doc.text('Important Notice:', margin, margin + 75);
    doc.setFontSize(10);
    const warning = 'This is an AI-assisted analysis and should not be considered as a final diagnosis. Please consult with a qualified dermatologist for proper medical evaluation and treatment decisions.';
    const splitWarning = doc.splitTextToSize(warning, pageWidth - 2 * margin);
    doc.text(splitWarning, margin, margin + 85);

    doc.setFontSize(14);
    doc.text('Recommended Next Steps:', margin, margin + 105);
    doc.setFontSize(10);
    const steps = [
      '• Save this report for your records',
      '• Share the results with your dermatologist',
      '• Schedule a follow-up consultation if needed'
    ];
    steps.forEach((step, index) => {
      doc.text(step, margin, margin + 115 + (index * 7));
    });

    doc.save('skin-analysis-report.pdf');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setError(null);
    setPrediction(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('scanType', 'skin');

    try {
      const response = await fetch(`${AI_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setPrediction(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to AI server. Please ensure the Python server is running on port 5000 (run: python Server.py).');
      } else {
        setError(err.message || 'Failed to analyze the image');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  return (
    <div className='skin-disease-finder'>
      <div className='skin-header'>
        <h1>Skin Analysis</h1>
        <p>Upload skin images for AI-powered assessment</p>
      </div>

      <div className='skin-content'>
        <div className='how-it-works'>
          <h2>How Skin Analysis Works</h2>
          <ol>
            <li>Take a clear, well-lit photo of the skin lesion or condition</li>
            <li>Upload the image through our secure system</li>
            <li>Our AI analyzes the image using machine learning models</li>
            <li>The system classifies the condition and provides a probability score</li>
            <li>You'll receive a detailed analysis with recommendations</li>
          </ol>
          <div className='note'>
            <strong>Tips for good skin photos:</strong> Ensure good lighting, take from multiple angles if possible, include a ruler or coin for size reference if available.
          </div>
        </div>

        <div className='upload-section'>
          <h2>Upload Skin Image</h2>
          <p>Upload a clear image of the skin area you want to analyze</p>

          

          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className='preview-container'>
                <img src={previewUrl} alt='Skin condition preview' className='scan-preview' />
                <button className='remove-preview' onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setPrediction(null);
                }}>✖</button>
              </div>
            ) : (
              <>
                <div className='upload-icon'>📷</div>
                <p>Drag and drop your image, or <label className='browse-label'>browse<input type='file' onChange={handleFileSelect} accept='.jpg,.png,.jpeg' /></label></p>
                <p className='file-types'>.jpg, .png, .jpeg up to 15MB</p>
              </>
            )}
          </div>

          {previewUrl && !prediction && !loading && (
            <button 
              className='submit-button' 
              onClick={handleSubmit}
              disabled={!selectedFile}
            >
              Analyze Skin Image
            </button>
          )}

          {loading && (
            <div className='analysis-status'>
              <div className='loading-spinner'></div>
              <p>Analyzing your skin image...</p>
            </div>
          )}

          {error && (
            <div className='error-message'>
              <p>❌ {error}</p>
            </div>
          )}

          {prediction && (
            <div className='prediction-results'>
              <h3>Analysis Results 🎯</h3>
              <div className='result-card'>
                <div className='result-header'>
                  <div className='header-icon'>🔍</div>
                  <h4>AI Skin Analysis Report</h4>
                  <div className='timestamp'>{new Date().toLocaleDateString()}</div>
                </div>
                <div className='result-content'>
                  <div className='prediction-section'>
                    <div className='prediction-icon'>🏥</div>
                    <div className='prediction-details'>
                      <h5>Detected Condition</h5>
                      <p className='condition-name'>{prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1)}</p>
                    </div>
                  </div>
                  
                  <div className='confidence-section'>
                    <div className='confidence-label'>
                      <h5>AI Confidence Score</h5>
                      <span className='confidence-value'>{(prediction.confidence * 100).toFixed(2)}%</span>
                    </div>
                    <div className='confidence-bar-container'>
                      <div 
                        className='confidence-bar' 
                        style={{
                          width: `${(prediction.confidence * 100).toFixed(2)}%`,
                          backgroundColor: `hsl(${prediction.confidence * 120}, 70%, 45%)`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className='result-footer'>
                  <div className='warning-box'>
                    <div className='warning-icon'>⚠️</div>
                    <div className='warning-content'>
                      <h5>Important Notice</h5>
                      <p>This is an AI-assisted analysis and should not be considered as a final diagnosis. Please consult with a qualified dermatologist for proper medical evaluation and treatment decisions.</p>
                    </div>
                  </div>
                  <div className='next-steps'>
                    <h5>Recommended Next Steps</h5>
                    <ul>
                      <li>Save this report for your records</li>
                      <li>Share the results with your dermatologist</li>
                      <li>Schedule a follow-up consultation if needed</li>
                    </ul>
                  </div>
                </div>
                <button 
                  className='download-pdf-button' 
                  onClick={handleDownloadPDF}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: 'fit-content'
                  }}
                >
                  Download PDF Report
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='skin-benefits'>
          <h2>Skin Analysis Benefits</h2>
          <div className='benefit-cards'>
            <div className='benefit-card'>
              <div className='card-icon'>⏰</div>
              <h3>Early Detection</h3>
              <p>Detect potential skin issues early when they're more treatable</p>
            </div>
            <div className='benefit-card'>
              <div className='card-icon'>📱</div>
              <h3>No Special Equipment</h3>
              <p>Use any smartphone camera to take and upload images</p>
            </div>
            <div className='benefit-card'>
              <div className='card-icon'>🔍</div>
              <h3>Multiple Conditions</h3>
              <p>Analyze for various conditions including melanoma, carcinoma, and benign growths</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkinDiseaseFinder;