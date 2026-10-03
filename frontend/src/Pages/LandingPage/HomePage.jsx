import './Style.css';
import { useNavigate } from 'react-router-dom';
import MedicalHero3D from './MedicalHero3D';

function HomePage() {
    const navigate = useNavigate();
    return (
        <>
        <section className="hero-section">
                {/* Background Cyber Glowing Orbs */}
                <div className="cyber-orb orb-1"></div>
                <div className="cyber-orb orb-2"></div>
                <div className="cyber-orb orb-3"></div>

                <div className="hero-content-wrapper">
                    <div className="hero-content-left">
                        <div className="hero-status-pill">
                            <span className="pulse-dot"></span>
                            <span>Next-Gen Neural Diagnostics 4.0</span>
                        </div>
                        <h1>VitalTech</h1>
                        <p className="hero-subtitle">Your Trusted Partner in AI-Powered Healthcare</p>
                        <p className="hero-description">Experience the future of healthcare with our advanced AI disease detection, multi-modal scan analytics, and comprehensive patient management.</p>
                        
                        <div className="hero-metrics-strip">
                            <div className="metric-box">
                                <span className="metric-val">99.4%</span>
                                <span className="metric-lbl">Accuracy</span>
                            </div>
                            <div className="metric-box">
                                <span className="metric-val">4</span>
                                <span className="metric-lbl">Neural Nets</span>
                            </div>
                            <div className="metric-box">
                                <span className="metric-val">&lt; 2s</span>
                                <span className="metric-lbl">Inference</span>
                            </div>
                        </div>

                        <div className='hero-btn'>
                            <button className="cta-button" onClick={() => navigate('/signup')}>Register Now</button>
                            <button className="live-button" onClick={() => navigate('/login')}>Try Live Demo</button>
                        </div>
                    </div>
                    <div className="hero-content-right">
                        <MedicalHero3D />
                    </div>
                </div>

                {/* Animated Bottom ECG Heartbeat Scanner Line */}
                <div className="hero-ecg-strip">
                    <svg className="hero-ecg-svg" preserveAspectRatio="none" viewBox="0 0 1200 40">
                        <path d="M0,20 L280,20 L290,6 L300,34 L310,10 L320,26 L330,20 L620,20 L630,6 L640,34 L650,10 L660,26 L670,20 L960,20 L970,6 L980,34 L990,10 L1000,26 L1010,20 L1200,20" />
                    </svg>
                    <div className="hero-ecg-scanner"></div>
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
                <h2>Why Choose VitalTech?</h2>
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
                <h2>Engineering & Innovation</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"VitalTech was architected to bridge cutting-edge deep learning neural networks with clinical-grade diagnostic intelligence."</p>
                        <div className="testimonial-author">Parikshit Sharma</div>
                        <div className="testimonial-role">Founder & Chief AI Architect, VitalTech</div>
                    </div>
                    <div className="testimonial-card">
                        <p>"Unified multi-modal intelligence for MRI, CT, X-Ray, and blood reports — engineered for instantaneous diagnostic inference."</p>
                        <div className="testimonial-author">Parikshit Sharma</div>
                        <div className="testimonial-role">Lead Fullstack & Systems Engineer</div>
                    </div>
                </div>
            </section>

            
        </div>
        <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>VitalTech</h3>
                        <p>Empowering healthcare with AI innovation</p>
                        <p style={{ marginTop: '0.5rem', color: '#00f0ff', fontSize: '0.88rem' }}>Creator: Parikshit Sharma</p>
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
                        <p>Parikshit Sharma</p>
                        <p>Email: <a href="mailto:sharmaparikshit405@gmail.com">sharmaparikshit405@gmail.com</a></p>
                        <p>Phone: +91 8817763021</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} VitalTech • Created by Parikshit Sharma. All rights reserved.</p>
                </div>
            </footer>
        </>
        
    )
}

export default HomePage;