import { useState } from 'react';
import './Reportsr.css';
import { jsPDF } from 'jspdf';
import { AI_BASE_URL } from '../../../config/api';

const REPORT_TYPES = [
  {
    key: 'blood_test',
    label: 'Blood Test Report',
    icon: '🩸',
    enabled: true,
    description: 'Complete blood count, lipid profile, liver function tests',
  },
  {
    key: 'pathology',
    label: 'Pathology Report',
    icon: '🔬',
    enabled: false,
    description: 'Biopsy results, cytology reports, histopathology',
  },
  {
    key: 'diagnostic',
    label: 'Diagnostic Report',
    icon: '📊',
    enabled: false,
    description: 'Tumor marker tests, genetic analysis, specialized tests',
  },
  {
    key: 'other',
    label: 'Other Medical Document',
    icon: '📋',
    enabled: false,
    description: 'Discharge summaries, clinical notes, medical certificates',
  },
];

const DISEASES = [
  { key: 'heart', label: 'Heart Disease', icon: '❤️' },
  { key: 'diabetes', label: 'Diabetes', icon: '🍬' },
  { key: 'cancer', label: 'Cancer', icon: '🦠' },
  { key: 'anemia', label: 'Anemia', icon: '🩸' },
  { key: 'thyroid', label: 'Thyroid Disorder', icon: '🦋' },
  { key: 'kidney', label: 'Kidney Disease', icon: '🧫' },
  { key: 'liver', label: 'Liver Disease', icon: '🫀' },
  { key: 'other', label: 'Other', icon: '❓' },
];

const featureLabels = {
  age: v => `Age: ${v}`,
  sex: v => `Sex: ${v === 1 ? 'Male' : 'Female'}`,
  cp: v => `Chest Pain Type: ${['Typical Angina', 'Atypical Angina', 'Non-anginal Pain', 'Asymptomatic'][v] || v}`,
  trestbps: v => `Resting Blood Pressure: ${v} mmHg`,
  chol: v => `Cholesterol: ${v} mg/dl`,
  fbs: v => `Fasting Blood Sugar > 120 mg/dl: ${v === 1 ? 'Yes' : 'No'}`,
  restecg: v => `Resting ECG: ${['Normal', 'ST-T Wave Abnormality', 'Left Ventricular Hypertrophy'][v] || v}`,
  thalach: v => `Max Heart Rate Achieved: ${v}`,
  exang: v => `Exercise Induced Angina: ${v === 1 ? 'Yes' : 'No'}`,
  oldpeak: v => `ST Depression: ${v}`,
  slope: v => `Slope of Peak Exercise ST: ${['Upsloping', 'Flat', 'Downsloping'][v] || v}`,
  ca: v => `Number of Major Vessels Colored by Fluoroscopy: ${v}`,
  thal: v => `Thalassemia: ${['Normal', 'Fixed Defect', 'Reversible Defect'][v-1] || v}`,
};

const featureRanges = {
  age: { good: [0, 50], warning: [51, 65], bad: [66, 150] },
  chol: { good: [0, 200], warning: [201, 239], bad: [240, 1000] },
  trestbps: { good: [90, 120], warning: [121, 139], bad: [140, 300] },
  thalach: { good: [100, 200], warning: [70, 99], bad: [0, 69] },
  fbs: { good: [0], bad: [1] }, 
  exang: { good: [0], bad: [1] }, 
  oldpeak: { good: [0, 1], warning: [1.1, 2], bad: [2.1, 10] },
  ca: { good: [0], warning: [1, 2], bad: [3, 4] },
 
};

function getFeatureColor(key, value) {
  const range = featureRanges[key];
  if (!range) return '';
  const v = Number(value);
  if (Array.isArray(range.bad) && v >= range.bad[0] && v <= range.bad[1]) return 'red';
  if (Array.isArray(range.warning) && v >= range.warning[0] && v <= range.warning[1]) return 'orange';
  if (Array.isArray(range.good) && v >= range.good[0] && v <= range.good[1]) return 'green';
  if (range.bad && range.bad.includes(v)) return 'red';
  if (range.warning && range.warning.includes(v)) return 'orange';
  if (range.good && range.good.includes(v)) return 'green';
  return '';
}

function DiseaseFinderReports() {
  const [step, setStep] = useState(1); 
  const [reportType, setReportType] = useState(null);
  const [targetDisease, setTargetDisease] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fakeEvent = { target: { files } }; 
      handleFileSelect(fakeEvent); 
    }
  };
  
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    setError(null);
    setResult(null);
    if (!file) return;
    if (reportType.key === 'blood_test' && targetDisease === 'heart') {
      const formData = new FormData();
      formData.append('report', file);
      setLoading(true);
      try {
        const res = await fetch(`${AI_BASE_URL}/predict-blood`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setResult(data);
        }
      } catch (err) {
        if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
          setError('Cannot connect to AI server. Please ensure AI server is running or set VITE_AI_URL.');
        } else {
          setError('Something went wrong while processing the report.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError('This disease is not supported for the selected report type.');
    }
  };
  
  const handleBackToReportType = () => {
    setReportType(null);
    setTargetDisease('');
    setError(null);
    setStep(1);
  };
  const handleBackToDisease = () => {
    setTargetDisease('');
    setError(null);
    setStep(2);
  };

  function handleDownloadPDF() {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    doc.setFontSize(20);
    doc.text('AI Analysis Report for Blood Test', pageWidth/2, margin, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, margin + 10);
    doc.setFontSize(14);
    doc.text('Prediction:', margin, margin + 25);
    doc.setFontSize(12);
    doc.text(
      result.prediction === 'Heart Disease Detected'
        ? 'High risk of heart disease detected. Please consult your doctor.'
        : 'No significant risk of heart disease detected. For a full assessment, consult your healthcare provider.',
      margin, margin + 35
    );
    doc.setFontSize(14);
    doc.text('AI Confidence Score:', margin, margin + 50);
    doc.setFontSize(12);
    doc.text(`${result.confidence}%`, margin, margin + 60);
    doc.setFontSize(14);
    doc.text('Features Used:', margin, margin + 75);
    doc.setFontSize(11);
    let y = margin + 85;
    if (result.features_used) {
      Object.entries(result.features_used).forEach(([k, v]) => {
        const label = featureLabels[k] ? featureLabels[k](v) : `${k}:`;
        let labelText = label, valueText = '';
        if (featureLabels[k]) {
          const idx = label.lastIndexOf(':');
          if (idx !== -1) {
            labelText = label.slice(0, idx + 1);
            valueText = label.slice(idx + 1).trim();
          }
        } else {
          valueText = v;
        }
        doc.text(`• ${labelText} ${valueText}`, margin, y);
        y += 7;
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
      });
    }
    doc.setFontSize(14);
    doc.text('Important Notice:', margin, y + 10);
    doc.setFontSize(10);
    const warning = 'This is an AI-assisted analysis and should not be considered as a final diagnosis. Please consult with a qualified healthcare professional for proper medical evaluation and treatment decisions.';
    const splitWarning = doc.splitTextToSize(warning, pageWidth - 2 * margin);
    doc.text(splitWarning, margin, y + 20);
    doc.save('blood-report-analysis.pdf');
  }

  const steps = [
    'Select Report Type',
    'Enter Disease/Condition',
    'Upload & Analyze',
  ];

  return (
    <div className='reports-container'>
      <div className='reports-header'>
        <h1>Report Analysis</h1>
        <p>Upload medical reports for AI analysis</p>
      </div>
      <div className='stepper'>
        {steps.map((label, idx) => (
          <div key={label} className={`stepper-step${step === idx + 1 ? ' active' : ''}${step > idx + 1 ? ' completed' : ''}`}> 
            <div className='stepper-circle'>{idx + 1}</div>
            <div className='stepper-label'>{label}</div>
            {idx < steps.length - 1 && <div className='stepper-line'></div>}
          </div>
        ))}
      </div>
      <div className='reports-content'>
        {step === 1 && (
          <div className='card-selection-section'>
            <h2>Choose Report Type</h2>
            <div className='type-cards interactive'>
              {REPORT_TYPES.map((type) => (
                <div
                  key={type.key}
                  className={`type-card big-card${reportType && reportType.key === type.key ? ' selected' : ''}`}
                  onClick={() => {
                    setReportType(type);
                    setStep(2);
                  }}
                >
                  <div className='card-icon'>{type.icon}</div>
                  <h3>{type.label}</h3>
                  <div className='bodypart-benefit'>{type.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && reportType && (
          <div className='card-selection-section'>
            <button className='back-btn' onClick={handleBackToReportType}>← Back</button>
            <h2>Choose Target Disease/Condition</h2>
            <div className='type-cards interactive'>
              {DISEASES.map((disease) => (
                <div
                  key={disease.key}
                  className={`type-card big-card${targetDisease === disease.key ? ' selected' : ''}`}
                  onClick={() => setTargetDisease(disease.key)}
                >
                  <div className='card-icon'>{disease.icon}</div>
                  <h3>{disease.label}</h3>
                </div>
              ))}
            </div>
            <button
              className='submit-button'
              onClick={() => setStep(3)}
              disabled={!targetDisease}
              style={{marginTop: '1.2rem'}}
            >
              Next
            </button>
          </div>
        )}
        {step === 3 && reportType && (
          <div className='upload-section'>
            <button className='back-btn' onClick={handleBackToDisease}>← Back</button>
            <h2>Upload {reportType.label}</h2>
            <p>Upload your {reportType.label.toLowerCase()} for analysis</p>
            {reportType.enabled && targetDisease === 'heart' ? (
              <>
                <div 
                  className={`upload-area ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className='upload-icon'>📄</div>
                  <p>Drag and drop your document, or <label className='browse-label'>browse<input type='file' onChange={handleFileSelect} accept='.pdf,.jpg,.png,.jpeg' /></label></p>
                  <p className='file-types'>.pdf, .jpg, .png, .jpeg up to 10MB</p>
                </div>
                {loading && (
                  <div className='analysis-status'>
                    <div className='loading-spinner'></div>
                    <p>Analyzing your report...</p>
                  </div>
                )}
                {error && (
                  <div className='error-message'>
                    <p>❌ {error}</p>
                  </div>
                )}
                {result && (
                  <div className='prediction-results'>
                    <h3>Analysis Results 🎯</h3>
                    <div className='result-card'>
                      <div className='result-header'>
                        <div className='header-icon'>📄</div>
                        <h4>AI Analysis Report</h4>
                        <div className='timestamp'>{new Date().toLocaleDateString()}</div>
                      </div>
                      <div className='result-content'>
                        <div className='prediction-section'>
                          <div className='prediction-icon'>🩺</div>
                          <div className='prediction-details'>
                            <h5>Prediction</h5>
                            <p className='condition-name'>
                              {result.prediction === 'Heart Disease Detected'
                                ? 'High risk of heart disease detected. Please consult your doctor.'
                                : 'No significant risk of heart disease detected. For a full assessment, consult your healthcare provider.'}
                            </p>
                          </div>
                        </div>
                        <div className='confidence-section'>
                          <div className='confidence-label'>
                            <h5>AI Confidence Score</h5>
                            <span className='confidence-value'>{result.confidence}%</span>
                          </div>
                          <div className='confidence-bar-container'>
                            <div 
                              className='confidence-bar' 
                              style={{
                                width: `${result.confidence}%`,
                                backgroundColor: `hsl(${result.confidence}, 70%, 45%)`
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className='features-section'>
                          <h5>Features Used</h5>
                          <ul style={{fontSize: '0.95rem', color: '#444', paddingLeft: 18}}>
                            {result.features_used && Object.entries(result.features_used).map(([k, v]) => {
                              const label = featureLabels[k] ? featureLabels[k](v) : `${k}:`;
                              const color = getFeatureColor(k, v);
                              let labelText = label, valueText = '';
                              if (featureLabels[k]) {
                                const idx = label.lastIndexOf(':');
                                if (idx !== -1) {
                                  labelText = label.slice(0, idx + 1);
                                  valueText = label.slice(idx + 1).trim();
                                }
                              } else {
                                valueText = v;
                              }
                              return (
                                <li key={k}>
                                  <b>{labelText} </b>
                                  <span style={{ color, fontWeight: 600 }}>{valueText}</span>
                                </li>
                              );
                            })}
                          </ul>
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
                  </div>
                )}
              </>
            ) : (
              <div className='not-available-msg'>
                <div style={{fontSize:'2.5rem'}}>🚧</div>
                <p>Sorry, this report+disease combination is not available yet. Please check back later!</p>
              </div>
            )}
          </div>
        )}
        <div className='supported-types'>
          <h2>What You Can Analyze with VitalCheck Reports</h2>
          <div className='type-cards'>
            <div className='type-card'>
              <div className='card-icon'>🩸</div>
              <h3 style={{marginBottom: '0.7rem'}}>Blood Test Report</h3>
              <div className='bodypart-benefit' style={{fontSize: '1.08rem'}}>Detect anemia, diabetes, and monitor organ health from your blood tests.</div>
            </div>
            <div className='type-card'>
              <div className='card-icon'>🔬</div>
              <h3 style={{marginBottom: '0.7rem'}}>Pathology Report</h3>
              <div className='bodypart-benefit' style={{fontSize: '1.08rem'}}>Get insights from biopsy and cytology reports for early disease detection.</div>
            </div>
            <div className='type-card'>
              <div className='card-icon'>📊</div>
              <h3 style={{marginBottom: '0.7rem'}}>Diagnostic Report</h3>
              <div className='bodypart-benefit' style={{fontSize: '1.08rem'}}>Analyze tumor markers, genetic tests, and specialized diagnostics.</div>
            </div>
            <div className='type-card'>
              <div className='card-icon'>📋</div>
              <h3 style={{marginBottom: '0.7rem'}}>Other Medical Document</h3>
              <div className='bodypart-benefit' style={{fontSize: '1.08rem'}}>Summarize discharge notes, clinical findings, and medical certificates.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiseaseFinderReports;