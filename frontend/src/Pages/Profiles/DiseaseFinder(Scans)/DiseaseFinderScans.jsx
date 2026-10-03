import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './Reportss.css';
import { AI_BASE_URL } from '../../../config/api';

const SCAN_TYPES = [
  {
    key: 'mri',
    label: 'MRI Scan',
    icon: '🧠',
    bodyParts: [
      { key: 'brain', label: 'Brain', icon: '🧠', enabled: true, benefit: 'Early detection of brain tumors' },
      { key: 'spine', label: 'Spine', icon: '🦴', enabled: false, benefit: 'Detailed imaging for spinal issues' },
      { key: 'abdomen', label: 'Abdomen', icon: '🫃', enabled: false, benefit: 'Soft tissue and organ analysis' },
      { key: 'joints', label: 'Joints', icon: '🦵', enabled: false, benefit: 'Joint and cartilage assessment' },
    ],
  },
  {
    key: 'ct',
    label: 'CT Scan',
    icon: '🫁',
    bodyParts: [
      { key: 'lung', label: 'Lungs', icon: '🫁', enabled: true, benefit: 'Lung cancer and disease detection' },
      { key: 'head', label: 'Head', icon: '🧑‍🦲', enabled: false, benefit: 'Head trauma and stroke evaluation' },
      { key: 'chest', label: 'Chest', icon: '🫀', enabled: false, benefit: 'Heart and chest disease analysis' },
      { key: 'abdomen', label: 'Abdomen', icon: '🫃', enabled: false, benefit: 'Abdominal organ assessment' },
      { key: 'pelvis', label: 'Pelvis', icon: '🦴', enabled: false, benefit: 'Pelvic bone and organ imaging' },
    ],
  },
  {
    key: 'xray',
    label: 'X-Ray',
    icon: '🩻',
    bodyParts: [
      { key: 'chest', label: 'Chest', icon: '🫀', enabled: true, benefit: 'Tuberculosis and chest disease detection' },
      { key: 'bone', label: 'Bone', icon: '🦴', enabled: false, benefit: 'Bone fracture and injury detection' },
      { key: 'dental', label: 'Dental', icon: '🦷', enabled: false, benefit: 'Dental and jaw assessment' },
    ],
  },
  {
    key: 'other',
    label: 'Other Medical Imaging',
    icon: '📷',
    bodyParts: [], 
  },
];

function DiseaseFinderScans() {
  const [step, setStep] = useState(1);
  const [scanType, setScanType] = useState(null);
  const [bodyPart, setBodyPart] = useState(null);
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
    doc.text('AI Analysis Report for Medical Scans', pageWidth/2, margin, { align: 'center' });
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
    const warning = 'This is an AI-assisted analysis and should not be considered as a final diagnosis. Please consult with a qualified healthcare professional for proper medical evaluation and treatment decisions.';
    const splitWarning = doc.splitTextToSize(warning, pageWidth - 2 * margin);
    doc.text(splitWarning, margin, margin + 85);
    doc.setFontSize(14);
    doc.text('Recommended Next Steps:', margin, margin + 105);
    doc.setFontSize(10);
    const steps = [
      '• Save this report for your records',
      '• Share the results with your healthcare provider',
      '• Schedule a follow-up consultation if needed'
    ];
    steps.forEach((step, index) => {
      doc.text(step, margin, margin + 115 + (index * 7));
    });
    doc.save('scan-analysis-report.pdf');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
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
    reader.onloadend = () => setPreviewUrl(reader.result);
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
    formData.append('scanType', scanType.key);
    formData.append('bodyPart', bodyPart.key);
    try {
      const response = await fetch(`${AI_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPrediction(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to AI server. Please ensure AI server is running or set VITE_AI_URL.');
      } else {
        setError(err.message || 'Failed to analyze the image');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Select Scan Type',
    'Select Body Part',
    'Upload & Analyze',
  ];

  const handleBackToScanType = () => {
    setScanType(null);
    setBodyPart(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setStep(1);
  };

  const handleBackToBodyPart = () => {
    setBodyPart(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setStep(2);
  };

  const selectedScanTypeObj = SCAN_TYPES.find((s) => s.key === (scanType && scanType.key));

  return (
    <div className='reportss-container'>
      <div className='reportss-header'>
        <h1 className='heading_scan'>Scan Analysis</h1>
        <p className='para_scan'>Upload and analyze medical imaging scans</p>
      </div>
      {/* Stepper */}
      <div className='stepper'>
        {steps.map((label, idx) => (
          <div key={label} className={`stepper-step${step === idx + 1 ? ' active' : ''}${step > idx + 1 ? ' completed' : ''}`}> 
            <div className='stepper-circle'>{idx + 1}</div>
            <div className='stepper-label'>{label}</div>
            {idx < steps.length - 1 && <div className='stepper-line'></div>}
          </div>
        ))}
      </div>
      <div className='reportss-content'>
        {step === 1 && (
          <div className='card-selection-section'>
            <h2 className='heading_scan'>Choose Scan Type</h2>
            <div className='type-cards interactive'>
              {SCAN_TYPES.map((type) => (
                <div
                  key={type.key}
                  className={`type-card big-card${scanType && scanType.key === type.key ? ' selected' : ''}`}
                  onClick={() => {
                    setScanType(type);
                    setBodyPart(null);
                    setStep(2);
                  }}
                >
                  <div className='card-icon'>{type.icon}</div>
                  <h3>{type.label}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && scanType && (
          <div className='card-selection-section'>
            <button className='back-btn' onClick={handleBackToScanType}>← Back</button>
            <h2>Choose Body Part/Region</h2>
            {scanType.bodyParts.length === 0 ? (
              <div className='not-available-msg'>
                <div style={{fontSize:'2.5rem'}}>🚧</div>
                <p>Sorry, this scan type is not available yet. Please check back later!</p>
                <button className='back-btn' onClick={handleBackToScanType}>Choose Another Scan Type</button>
              </div>
            ) : (
              <div className='type-cards interactive'>
                {scanType.bodyParts.map((part) => (
                  <div
                    key={part.key}
                    className={`type-card big-card${bodyPart && bodyPart.key === part.key ? ' selected' : ''}`}
                    onClick={() => {
                      setBodyPart(part);
                      setStep(3);
                    }}
                  >
                    <div className='card-icon'>{part.icon}</div>
                    <h3>{part.label}</h3>
                    <div className='bodypart-benefit'>{part.benefit}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {step === 3 && scanType && bodyPart && (
          <div className='upload-section'>
            <button className='back-btn' onClick={handleBackToBodyPart}>← Back</button>
            <h2>Upload {scanType.label} - {bodyPart.label}</h2>
            <p>Upload your {scanType.label.toLowerCase()}, {bodyPart.label.toLowerCase()} scan image</p>
            {bodyPart.enabled ? (
              <div 
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className='preview-container'>
                    <img src={previewUrl} alt='Scan preview' className='scan-preview' />
                    <button className='remove-preview' onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      setPrediction(null);
                    }}>✖</button>
                  </div>
                ) : (
                  <>
                    <div className='upload-icon'>🔍</div>
                    <p>Drag and drop your Scan, or <label className='browse-label'>browse<input type='file' onChange={handleFileSelect} accept='.jpg,.png,.jpeg,.dicom' /></label></p>
                    <p className='file-types'>.jpg, .png, .jpeg, .dicom up to 20MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className='not-available-msg'>
                <div style={{fontSize:'2.5rem'}}>🚧</div>
                <p>Sorry, this scan type is not available yet. Please check back later!</p>
              </div>
            )}
            {previewUrl && !prediction && !loading && (
              <button 
                className='submit-button' 
                onClick={handleSubmit}
                disabled={!selectedFile}
              >
                Analyze Scan
              </button>
            )}
            {loading && (
              <div className='analysis-status'>
                <div className='loading-spinner'></div>
                <p>Analyzing your scan...</p>
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
                    <h4>AI Analysis Report</h4>
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
                        <p>This is an AI-assisted analysis and should not be considered as a final diagnosis. Please consult with a qualified healthcare professional for proper medical evaluation and treatment decisions.</p>
                      </div>
                    </div>
                    <div className='next-steps'>
                      <h5>Recommended Next Steps</h5>
                      <ul>
                        <li>Save this report for your records</li>
                        <li>Share the results with your healthcare provider</li>
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
        )}
        <div className='supported-types'>
          <h2>What You Can Analyze with VitalCheck</h2>
          <div className='type-cards'>
            {/* Supported combos only */}
            {SCAN_TYPES.filter(type => type.key !== 'other').map(type => (
              type.bodyParts.filter(part => part.enabled).map(part => (
                <div className='type-card' key={type.key + '-' + part.key}>
                  <div className='card-icon'>{part.icon}</div>
                  <h3 style={{marginBottom: '0.7rem'}}>{part.label} {type.label}</h3>
                  <div className='bodypart-benefit' style={{fontSize: '1.08rem'}}>
                    {part.key === 'brain' && type.key === 'mri' && 'Detect brain tumors and abnormalities early for better outcomes.'}
                    {part.key === 'lung' && type.key === 'ct' && 'Screen for lung cancer and other pulmonary diseases with high accuracy.'}
                    {part.key === 'chest' && type.key === 'xray' && 'Identify tuberculosis and chest infections quickly and reliably.'}
                  </div>
                </div>
              ))
            ))}
          </div>
          <div className='ai-benefits-box'>
            <h3>Why Use Our AI Analysis?</h3>
            <ul className='ai-benefits-list'>
              <li>⚡ <b>Fast & Accurate:</b> Get instant, reliable results powered by advanced AI models.</li>
              <li>🔒 <b>Secure & Private:</b> Your scans are processed securely and never shared.</li>
              <li>📄 <b>Instant PDF Reports:</b> Download detailed analysis to share with your doctor.</li>
              <li>🩺 <b>Medical-Grade:</b> Models trained on thousands of real medical scans.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiseaseFinderScans;