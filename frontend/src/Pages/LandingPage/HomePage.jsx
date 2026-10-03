import './Style.css';
import { useNavigate } from 'react-router-dom';
import MedicalHero3D from './MedicalHero3D';

function HomePage() {
    const navigate = useNavigate();
    return (
        <>
        <section className="hero-section">
                <div className="hero-content-wrapper">
                    <div className="hero-content-left">
                        <h1>VitalCheck</h1>
                        <p className="hero-subtitle">Your Trusted Partner in AI-Powered Healthcare</p>
                        <p className="hero-description">Experience the future of healthcare with our advanced AI disease detection and comprehensive patient management system.</p>
                        <div className='hero-btn'>
                        <button className="cta-button" onClick={() => navigate('/signup')}>Register Now</button>
                        <button className="live-button" onClick={() => navigate('/login')}>Try Live Demo</button>
                        </div>
                    </div>
                    <div className="hero-content-right">
                        <MedicalHero3D />
                    </div>
                </div>
            </section>
        <div className="landing-page">
            

            <section className="features-section">
                <h2>Comprehensive Healthcare Solutions</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Early Disease Detection</h3>
                        <p>Advanced AI algorithms that identify potential health issues at their earliest stages</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👨‍⚕️</div>
                        <h3>Patient Management</h3>
                        <p>Streamlined system for doctors to manage and monitor patient care effectively</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Data Analytics</h3>
                        <p>Comprehensive health data analysis for better decision making</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure Platform</h3>
                        <p>HIPAA-compliant security ensuring your medical data stays protected</p>
                    </div>
                </div>
            </section>

            <section className="benefits-section">
                <h2>Why Choose VitalCheck?</h2>
                <div className="benefits-grid">
                    <div className="benefit-item">
                        <h3>99% Accuracy</h3>
                        <p>High-precision disease detection powered by advanced AI</p>
                    </div>
                    <div className="benefit-item">
                        <h3>24/7 Access</h3>
                        <p>Round-the-clock availability for healthcare professionals</p>
                    </div>
                    <div className="benefit-item">
                        <h3>Easy Integration</h3>
                        <p>Seamlessly integrates with existing healthcare systems</p>
                    </div>
                </div>
            </section>

            <section className="testimonials-section">
                <h2>What Healthcare Professionals Say</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"VitalCheck has revolutionized how we detect and monitor diseases in our practice."</p>
                        <div className="testimonial-author">Dr. Sarah Johnson</div>
                        <div className="testimonial-role">Chief Medical Officer</div>
                    </div>
                    <div className="testimonial-card">
                        <p>"The patient management system has significantly improved our workflow efficiency."</p>
                        <div className="testimonial-author">Dr. Michael Chen</div>
                        <div className="testimonial-role">Primary Care Physician</div>
                    </div>
                </div>
            </section>

            
        </div>
        <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>VitalCheck</h3>
                        <p>Empowering healthcare with AI innovation</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li>About Us</li>
                            <li>Services</li>
                            <li>Contact</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <p>Email: <a href="mailto:sharmaparikshit405@gmail.com">sharmaparikshit405@gmail.com</a></p>
                        <p>Phone: +91 8817763021</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} VitalCheck. All rights reserved.</p>
                </div>
            </footer>
        </>
        
    )
}

export default HomePage;