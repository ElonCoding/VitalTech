import './Forgot_Password.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LoadingSpinner } from '../../../Components/SuccessModal/SuccessModal';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { API_BASE_URL } from '../../../config/api';

function Forgot_Password() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasNumber: false,
        hasLowerCase: false
    });

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            setSuccess('OTP sent to your email.');
            setStep(2);
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                setError('Cannot connect to server. Please ensure backend is running or set VITE_API_URL.');
            } else {
                setError(err.response?.data?.error || 'Failed to send OTP');
            }
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (password) => {
        return {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasLowerCase: /[a-z]/.test(password)
        };
    };

    // Update password validation state
    useEffect(() => {
        setPasswordValidation(validatePassword(newPassword));
    }, [newPassword]);

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            await new Promise(res => setTimeout(res, 1200)); // Add delay
            const res = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
            setSuccess('OTP verified. You can now reset your password.');
            setStep(3);
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                setError('Cannot connect to server. Please ensure backend is running or set VITE_API_URL.');
            } else {
                setError(err.response?.data?.error || 'Invalid OTP');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        // Validate password
        const validationResult = validatePassword(newPassword);
        const isPasswordValid = Object.values(validationResult).every(Boolean);
        if (!isPasswordValid) {
            setError('Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one lowercase letter.');
            setLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/reset-password`, { email, otp, newPassword });
            setSuccess('Password reset successful! You can now log in.');
            setStep(4);
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                setError('Cannot connect to server. Please ensure backend is running or set VITE_API_URL.');
            } else {
                setError(err.response?.data?.error || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            {loading && <LoadingSpinner message="Processing..." />}
            <div className="forgot-password-box">
                <h2>Forgot Password</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="forgot-password-form">
                        <div className="forgot-group">
                            <label className="forgot-label">Email</label>
                            <input type="email" className="forgot-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your registered email" />
                        </div>
                        <button type="submit" className="forgot-submit-btn">Request OTP</button>
                    </form>
                )}
                {step === 2 && (
                    <>
                    <form onSubmit={handleVerifyOtp} className="forgot-password-form">
                        <div className="forgot-group">
                            <label className="forgot-label">Enter OTP</label>
                            <input type="text" className="forgot-input" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="Enter the OTP sent to your email" />
                        </div>
                        <button type="submit" className="forgot-submit-btn">Verify OTP</button>
                    </form>
                    <div className="email-spam-note">
                        <b>Note:</b> If you do not see the OTP email in your inbox, please check your <b>Spam</b> or <b>Junk</b> folder.
                    </div>
                    </>
                )}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="forgot-password-form">
                        <div className="forgot-group">
                            <label className="forgot-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="forgot-input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    className="forgot-password-toggle"
                                    style={{ position: 'absolute', right: 10, top: 10 }}
                                    onClick={() => setShowPassword(v => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            <div className="forgot-password-validation">
                                <div className={`forgot-validation-item ${passwordValidation.minLength ? 'valid' : 'invalid'}`}> <i>{passwordValidation.minLength ? <FaCheck /> : <FaTimes />}</i> At least 8 characters </div>
                                <div className={`forgot-validation-item ${passwordValidation.hasUpperCase ? 'valid' : 'invalid'}`}> <i>{passwordValidation.hasUpperCase ? <FaCheck /> : <FaTimes />}</i> At least one uppercase letter </div>
                                <div className={`forgot-validation-item ${passwordValidation.hasLowerCase ? 'valid' : 'invalid'}`}> <i>{passwordValidation.hasLowerCase ? <FaCheck /> : <FaTimes />}</i> At least one lowercase letter </div>
                                <div className={`forgot-validation-item ${passwordValidation.hasNumber ? 'valid' : 'invalid'}`}> <i>{passwordValidation.hasNumber ? <FaCheck /> : <FaTimes />}</i> At least one number </div>
                            </div>
                        </div>
                        <div className="forgot-group">
                            <label className="forgot-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="forgot-input"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    className="forgot-password-toggle"
                                    style={{ position: 'absolute', right: 10, top: 10 }}
                                    onClick={() => setShowConfirmPassword(v => !v)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="forgot-submit-btn">Reset Password</button>
                    </form>
                )}
                {step === 4 && (
                    <div className="forgot-password-success">
                        <p>Password reset successful! <a href="/login">Go to Login</a></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Forgot_Password;