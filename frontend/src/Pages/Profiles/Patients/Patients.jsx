import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Modal,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import './Pateints.css';
import { FaEye, FaEyeSlash, FaRegCopy } from 'react-icons/fa';
import { API_BASE_URL as BACKEND_URL } from '../../../config/api';

function getPatientImage(profileImage) {
  if (!profileImage || profileImage === '/uploads/default-user.png') {
    return '/default-user.png'; 
  }
  if (profileImage.startsWith('/uploads/')) {
    return BACKEND_URL + profileImage;
  }
  return profileImage;
}

function Patients() {
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    contactNumber: '',
    email: '',
    address: '',
    medicalHistory: '',
    bloodGroup: '',
    emergencyContact: '',
    allergies: '',
    occupation: '',
    consent: false,
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [passwordChange, setPasswordChange] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!newPatient.name.trim()) errors.name = 'Name is required';
    if (!newPatient.age) errors.age = 'Age is required';
    if (!newPatient.gender) errors.gender = 'Gender is required';
    if (!newPatient.contactNumber) errors.contactNumber = 'Contact number is required';
    if (!newPatient.consent) errors.consent = 'Consent is required';
    if (newPatient.email && !/\S+@\S+\.\S+/.test(newPatient.email)) {
      errors.email = 'Invalid email format';
    }
    return errors;
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
  };

  useEffect(() => {
    axios.get(`${BACKEND_URL}/patients`)
      .then(res => setPatients(res.data.patients))
      .catch(() => setPatients([]));
  }, []);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setOpenDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewPatient(prev => ({ ...prev, profileImage: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(newPatient).forEach(([key, value]) => {
        if (key === 'profileImage' && value) {
          formData.append('profileImage', value);
        } else if (key !== 'profileImage') {
          formData.append(key, value);
        }
      });
      const res = await axios.post(`${BACKEND_URL}/register-patient`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGeneratedCredentials(res.data.patient);
      setShowCredentialsModal(true);
      setOpenRegisterModal(false);
      setPatients(prev => [...prev, res.data.patient]);
      setNewPatient({
        name: '',
        age: '',
        gender: '',
        contactNumber: '',
        email: '',
        address: '',
        medicalHistory: '',
        bloodGroup: '',
        emergencyContact: '',
        allergies: '',
        occupation: '',
        consent: false,
        profileImage: null
      });
      setPreviewImage(null);
      setFormErrors({});
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setFormErrors({ submit: 'Cannot connect to server. Please ensure backend is running or set VITE_API_URL.' });
      } else {
        setFormErrors({ submit: err.response?.data?.error || 'Failed to register patient. Please try again.' });
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordChange || passwordChange.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters');
      setPasswordChangeSuccess('');
      return;
    }
    try {
      const res = await axios.patch(`${BACKEND_URL}/patients/${selectedPatient._id}/password`, { newPassword: passwordChange });
      setPasswordChangeSuccess('Password updated!');
      setPasswordChangeError('');
      setSelectedPatient(prev => ({ ...prev, _plainPassword: res.data.patient.plainPassword }));
      setPatients(prev => prev.map(p => p._id === selectedPatient._id ? { ...p, _plainPassword: res.data.patient.plainPassword } : p));
      setPasswordChange('');
    } catch (err) {
      setPasswordChangeError('Failed to update password');
      setPasswordChangeSuccess('');
    }
  };

  const handleCopyPassword = () => {
    if (selectedPatient && selectedPatient._plainPassword) {
      navigator.clipboard.writeText(selectedPatient._plainPassword);
    } else if (generatedCredentials && generatedCredentials.password) {
      navigator.clipboard.writeText(generatedCredentials.password);
    } else if (passwordChange) {
      navigator.clipboard.writeText(passwordChange);
    }
  };

  const handleDeletePatient = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this patient? This action cannot be undone.');
    if (!confirm) return;
    try {
      await axios.delete(`${BACKEND_URL}/patients/${id}`);
      setPatients(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete patient.');
    }
  };

  return (
    <div className='patients' style={{ padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => setOpenRegisterModal(true)}
        >
          Register New Patient
        </Button>
      </Box>

      <Grid container spacing={3}>
        {patients.map((patient, idx) => (
          <Grid item xs={12} sm={6} md={4} key={patient._id || idx}>
            <Card sx={{ height: '100%' }}>
              <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={getPatientImage(patient.profileImage)} alt="Profile" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginBottom: 8 }} />
                <Typography variant="h6" gutterBottom>{patient.name}</Typography>
                <Typography color="textSecondary">Age: {patient.age}</Typography>
                <Typography color="textSecondary" gutterBottom>Gender: {patient.gender}</Typography>
                <Button variant="contained" color="primary" fullWidth onClick={() => handleViewDetails(patient)} sx={{ mb: 1 }}>View More Details</Button>
                <Button variant="outlined" color="error" fullWidth onClick={() => handleDeletePatient(patient._id)}>Delete Patient</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
      >
        <Box sx={{
          ...modalStyle,
          bgcolor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          width: '60%',
        }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{
              color: '#1976d2',
              textAlign: 'center',
              fontWeight: 600,
              mb: 4,
              borderBottom: '2px solid #1976d2',
              paddingBottom: '8px'
            }}
          >
            Register New Patient
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 3,
              '& .MuiFormControl-root': {
                mb: 0
              }
            }}>

              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={newPatient.name}
                onChange={handleInputChange}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={{
                  gridColumn: '1 / -1',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField
                label="Age"
                name="age"
                type="number"
                value={newPatient.age}
                onChange={handleInputChange}
                required
                error={!!formErrors.age}
                helperText={formErrors.age}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <FormControl error={!!formErrors.gender}>
                <InputLabel>Gender *</InputLabel>
                <Select
                  name="gender"
                  value={newPatient.gender || ''}
                  onChange={handleInputChange}
                  label="Gender *"
                  required
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formErrors.gender && (
                  <Typography color="error" variant="caption">
                    {formErrors.gender}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={newPatient.contactNumber || ''}
                onChange={handleInputChange}
                required
                error={!!formErrors.contactNumber}
                helperText={formErrors.contactNumber}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField
                label="Address"
                name="address"
                value={newPatient.address || ''}
                onChange={handleInputChange}
                sx={{
                  gridColumn: '1 / -1',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField
                label="Medical History"
                name="medicalHistory"
                multiline
                rows={4}
                value={newPatient.medicalHistory || ''}
                onChange={handleInputChange}
                placeholder="Enter any relevant medical history, conditions, allergies, etc."
                sx={{
                  gridColumn: '1 / -1',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
              <TextField label="Blood Group" name="bloodGroup" value={newPatient.bloodGroup || ''} onChange={handleInputChange} sx={{}} />
              <TextField label="Emergency Contact" name="emergencyContact" value={newPatient.emergencyContact || ''} onChange={handleInputChange} sx={{}} />
              <TextField label="Allergies" name="allergies" value={newPatient.allergies || ''} onChange={handleInputChange} sx={{}} />
              <TextField label="Occupation" name="occupation" value={newPatient.occupation || ''} onChange={handleInputChange} sx={{}} />
              <FormControl error={!!formErrors.consent} sx={{ gridColumn: '1 / -1' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: formErrors.consent ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#1976d2',
                  },
                }}>
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={newPatient.consent || false}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'consent',
                        value: e.target.checked
                      }
                    })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <label htmlFor="consent" className='heading' style={{ color: formErrors.consent ? '#d32f2f' : 'inherit' }}>
                    <p>Patient has consented to data collection and processing</p>
                  </label>
                </Box>
                {formErrors.consent && (
                  <Typography color="error" variant="caption">
                    {formErrors.consent}
                  </Typography>
                )}
              </FormControl>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 16 }} />
              {previewImage ? (
                <img src={previewImage} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginBottom: 16 }} />
              ) : (
                <img src="/default-user.png" alt="Default" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginBottom: 16 }} />
              )}
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                mt: 3,
                gridColumn: '1 / -1'
              }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenRegisterModal(false)}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 4,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 4,
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  Register Patient
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>

      <Modal
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
      >
        <Box sx={{
          ...modalStyle,
          bgcolor: '#fff',
          borderRadius: '16px',
          padding: '32px 24px',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'left',
          boxShadow: 6
        }}>
          {selectedPatient && (
            <>
              <Typography variant="h5" sx={{ color: '#1976d2', mb: 2, textAlign: 'center' }}>
                Patient Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>Basic Information</Typography>
                <Typography variant="body1"><b>Name:</b> {selectedPatient.name}</Typography>
                <Typography variant="body1"><b>Email/ID:</b> {selectedPatient.email}</Typography>
                <Typography variant="body1"><b>Age:</b> {selectedPatient.age}</Typography>
                <Typography variant="body1"><b>Gender:</b> {selectedPatient.gender}</Typography>
                <Typography variant="body1"><b>Contact Number:</b> {selectedPatient.contactNumber}</Typography>
                <Typography variant="body1"><b>Address:</b> {selectedPatient.address}</Typography>
                <Typography variant="body1"><b>Medical History:</b> {selectedPatient.medicalHistory}</Typography>
                <Typography variant="body1"><b>Blood Group:</b> {selectedPatient.bloodGroup}</Typography>
                <Typography variant="body1"><b>Emergency Contact:</b> {selectedPatient.emergencyContact}</Typography>
                <Typography variant="body1"><b>Allergies:</b> {selectedPatient.allergies}</Typography>
                <Typography variant="body1"><b>Occupation:</b> {selectedPatient.occupation}</Typography>
              </Box>
              <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>Patient Login Password</Typography>
                {selectedPatient._plainPassword ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={selectedPatient._plainPassword}
                      readOnly
                      style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '70%' }}
                    />
                    <Button onClick={() => setShowPassword(v => !v)} sx={{ minWidth: 0, px: 1 }}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Button onClick={handleCopyPassword} sx={{ minWidth: 0, px: 1 }}><FaRegCopy /></Button>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#b91c1c' }}>
                    Password is only shown after registration or change.
                  </Typography>
                )}
              </Box>
              <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Change Password</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordChange}
                    onChange={e => setPasswordChange(e.target.value)}
                    placeholder="Enter new password"
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '70%' }}
                  />
                  <Button onClick={() => setShowPassword(v => !v)} sx={{ minWidth: 0, px: 1 }}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                  <Button onClick={handleCopyPassword} sx={{ minWidth: 0, px: 1 }}><FaRegCopy /></Button>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, borderRadius: '8px', textTransform: 'none', px: 2, width: '100%' }}
                  onClick={handlePasswordChange}
                >
                  Update Password
                </Button>
                {passwordChangeError && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{passwordChangeError}</Typography>}
                {passwordChangeSuccess && <Typography color="primary" variant="caption" sx={{ display: 'block', mt: 1 }}>{passwordChangeSuccess}</Typography>}
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
      >
        <Box sx={{
          ...modalStyle,
          bgcolor: '#f9f9f9',
          borderRadius: '16px',
          padding: '32px',
          width: '400px',
          textAlign: 'center',
        }}>
          <Typography variant="h5" sx={{ color: '#1976d2', mb: 2 }}>
            Patient Credentials
          </Typography>
          {generatedCredentials && (
            <>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <b>Email/ID:</b> {generatedCredentials.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <b>Password:</b> {generatedCredentials.password}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', mt: 2 }}>
                Please copy and share these credentials with the patient. They will use them to log in to their dashboard.
              </Typography>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, borderRadius: '8px', textTransform: 'none', px: 4 }}
            onClick={() => setShowCredentialsModal(false)}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default Patients;