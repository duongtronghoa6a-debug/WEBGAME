import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation states
    const [validations, setValidations] = useState({
        email: { valid: false, message: '' },
        username: { valid: false, message: '' },
        password: { valid: false, message: '', strength: 0 },
        confirmPassword: { valid: false, message: '' }
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    // Email validation
    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            return { valid: false, message: '' };
        }
        if (!emailRegex.test(value)) {
            return { valid: false, message: 'Email không hợp lệ' };
        }
        return { valid: true, message: 'Email hợp lệ' };
    };

    // Username validation
    const validateUsername = (value) => {
        if (!value) {
            return { valid: false, message: '' };
        }
        if (value.length < 3) {
            return { valid: false, message: 'Tối thiểu 3 ký tự' };
        }
        if (value.length > 20) {
            return { valid: false, message: 'Tối đa 20 ký tự' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return { valid: false, message: 'Chỉ chứa chữ, số và _' };
        }
        return { valid: true, message: 'Username hợp lệ' };
    };

    // Password validation with strength
    const validatePassword = (value) => {
        if (!value) {
            return { valid: false, message: '', strength: 0 };
        }

        let strength = 0;
        const checks = {
            minLength: value.length >= 6,
            hasLower: /[a-z]/.test(value),
            hasUpper: /[A-Z]/.test(value),
            hasNumber: /[0-9]/.test(value),
            hasSpecial: /[!@#$%^&*]/.test(value)
        };

        if (checks.minLength) strength += 1;
        if (checks.hasLower) strength += 1;
        if (checks.hasUpper) strength += 1;
        if (checks.hasNumber) strength += 1;
        if (checks.hasSpecial) strength += 1;

        if (value.length < 6) {
            return { valid: false, message: 'Tối thiểu 6 ký tự', strength };
        }
        if (!checks.hasLower || !checks.hasUpper) {
            return { valid: false, message: 'Cần có chữ hoa và thường', strength };
        }
        if (!checks.hasNumber) {
            return { valid: false, message: 'Cần có ít nhất 1 số', strength };
        }

        return { valid: true, message: 'Mật khẩu mạnh', strength };
    };

    // Confirm password validation
    const validateConfirmPassword = (value, originalPassword) => {
        if (!value) {
            return { valid: false, message: '' };
        }
        if (value !== originalPassword) {
            return { valid: false, message: 'Mật khẩu không khớp' };
        }
        return { valid: true, message: 'Mật khẩu khớp' };
    };

    // Handle input changes with validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setValidations(prev => ({ ...prev, email: validateEmail(value) }));
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setValidations(prev => ({ ...prev, username: validateUsername(value) }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setValidations(prev => ({
            ...prev,
            password: validatePassword(value),
            confirmPassword: confirmPassword ? validateConfirmPassword(confirmPassword, value) : prev.confirmPassword
        }));
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setValidations(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, password) }));
    };

    // Get password strength label and color
    const getPasswordStrength = () => {
        const { strength } = validations.password;
        if (strength <= 1) return { label: 'Yếu', color: '#ef4444' };
        if (strength <= 2) return { label: 'Trung bình', color: '#f59e0b' };
        if (strength <= 3) return { label: 'Khá', color: '#22c55e' };
        return { label: 'Mạnh', color: '#10b981' };
    };

    const validateForm = () => {
        const emailCheck = validateEmail(email);
        const usernameCheck = validateUsername(username);
        const passwordCheck = validatePassword(password);
        const confirmCheck = validateConfirmPassword(confirmPassword, password);

        setValidations({
            email: emailCheck,
            username: usernameCheck,
            password: passwordCheck,
            confirmPassword: confirmCheck
        });

        if (!emailCheck.valid) {
            setError(emailCheck.message || 'Vui lòng nhập email hợp lệ');
            return false;
        }
        if (!usernameCheck.valid) {
            setError(usernameCheck.message || 'Vui lòng nhập username hợp lệ');
            return false;
        }
        if (!passwordCheck.valid) {
            setError(passwordCheck.message || 'Vui lòng nhập mật khẩu hợp lệ');
            return false;
        }
        if (!confirmCheck.valid) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            await register(email, username, password);
            navigate('/games');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Đăng ký</h1>
                    <p>Tạo tài khoản mới để bắt đầu chơi game!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="form-group">
                        <label>Email</label>
                        <div className={`input-wrapper ${validations.email.message ? (validations.email.valid ? 'valid' : 'invalid') : ''}`}>
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={handleEmailChange}
                                required
                            />
                            {validations.email.valid && <CheckCircle size={18} className="validation-icon valid" />}
                            {validations.email.message && !validations.email.valid && <AlertCircle size={18} className="validation-icon invalid" />}
                        </div>
                        {validations.email.message && (
                            <span className={`validation-message ${validations.email.valid ? 'valid' : 'invalid'}`}>
                                {validations.email.message}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <div className={`input-wrapper ${validations.username.message ? (validations.username.valid ? 'valid' : 'invalid') : ''}`}>
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                className="input"
                                placeholder="username"
                                value={username}
                                onChange={handleUsernameChange}
                                minLength={3}
                                maxLength={20}
                                required
                            />
                            {validations.username.valid && <CheckCircle size={18} className="validation-icon valid" />}
                            {validations.username.message && !validations.username.valid && <AlertCircle size={18} className="validation-icon invalid" />}
                        </div>
                        {validations.username.message && (
                            <span className={`validation-message ${validations.username.valid ? 'valid' : 'invalid'}`}>
                                {validations.username.message}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <div className={`input-wrapper ${validations.password.message ? (validations.password.valid ? 'valid' : 'invalid') : ''}`}>
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Chứa chữ hoa, thường và số"
                                value={password}
                                onChange={handlePasswordChange}
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                className="input-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${(validations.password.strength / 5) * 100}%`,
                                            backgroundColor: getPasswordStrength().color
                                        }}
                                    />
                                </div>
                                <span style={{ color: getPasswordStrength().color }}>
                                    Độ mạnh: {getPasswordStrength().label}
                                </span>
                            </div>
                        )}
                        {validations.password.message && (
                            <span className={`validation-message ${validations.password.valid ? 'valid' : 'invalid'}`}>
                                {validations.password.message}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu</label>
                        <div className={`input-wrapper ${validations.confirmPassword.message ? (validations.confirmPassword.valid ? 'valid' : 'invalid') : ''}`}>
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                required
                            />
                            {validations.confirmPassword.valid && <CheckCircle size={18} className="validation-icon valid" />}
                            {validations.confirmPassword.message && !validations.confirmPassword.valid && <AlertCircle size={18} className="validation-icon invalid" />}
                        </div>
                        {validations.confirmPassword.message && (
                            <span className={`validation-message ${validations.confirmPassword.valid ? 'valid' : 'invalid'}`}>
                                {validations.confirmPassword.message}
                            </span>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                        {loading ? (
                            <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Đăng ký
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
