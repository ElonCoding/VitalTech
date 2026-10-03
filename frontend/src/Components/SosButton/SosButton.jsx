import { useState, useEffect, useCallback } from 'react';
import './SosButton.css';
import { useUser } from '../../context/UserContext';

const EMERGENCY_CONTACTS = [
  { name: 'Ambulance', number: '102', icon: '🚑' },
  { name: 'Police', number: '100', icon: '🚔' },
  { name: 'Fire', number: '101', icon: '🚒' },
  { name: 'Emergency (All)', number: '112', icon: '☎️' },
  { name: 'Women Helpline', number: '1091', icon: '👩' },
];

function SosButton() {
  const { name } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [countdownTimer, setCountdownTimer] = useState(null);

  const getLocation = useCallback(() => {
    setLoadingLocation(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoadingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable it in browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
        }
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleSosClick = () => {
    setIsOpen(true);
    setAlertSent(false);
    getLocation();
  };

  const handleClose = () => {
    setIsOpen(false);
    setAlertSent(false);
    if (countdownTimer) {
      clearInterval(countdownTimer);
      setCountdownTimer(null);
    }
    setCountdown(null);
  };

  const handleSendAlert = () => {
    // Start 5-second countdown before sending
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCountdownTimer(null);
          // Actually "send" the alert
          triggerEmergencyAlert();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    setCountdownTimer(timer);
  };

  const handleCancelCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      setCountdownTimer(null);
    }
    setCountdown(null);
  };

  const triggerEmergencyAlert = () => {
    setAlertSent(true);
    // In a real app, this would send an SMS/notification to emergency contacts
    // For now, we show the success state with the location info
    if (location) {
      const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      console.log(`🆘 EMERGENCY ALERT - User: ${name || 'Unknown'}, Location: ${mapsUrl}`);
    }
  };

  const handleCallEmergency = (number) => {
    window.open(`tel:${number}`, '_self');
  };

  const getGoogleMapsUrl = () => {
    if (!location) return '#';
    return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  };

  const shareLocation = async () => {
    if (!location) return;
    const text = `🆘 EMERGENCY! I need help!\nMy location: https://www.google.com/maps?q=${location.lat},${location.lng}\n- ${name || 'VitalTech User'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Emergency - Need Help!', text });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert('Emergency message copied to clipboard! Paste it in your messaging app.');
      } catch {
        // Clipboard API not available
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Emergency message copied to clipboard!');
      }
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [countdownTimer]);

  return (
    <>
      {/* Floating SOS Button */}
      <button 
        className="sos-floating-btn" 
        onClick={handleSosClick}
        aria-label="Emergency SOS"
        title="Emergency SOS"
      >
        <span className="sos-pulse"></span>
        <span className="sos-text">SOS</span>
      </button>

      {/* SOS Modal */}
      {isOpen && (
        <div className="sos-overlay" onClick={handleClose}>
          <div className="sos-modal" onClick={e => e.stopPropagation()}>
            <button className="sos-close-btn" onClick={handleClose}>✕</button>
            
            <div className="sos-modal-header">
              <div className="sos-emergency-icon">🆘</div>
              <h2>Emergency SOS</h2>
              <p>Get immediate help</p>
            </div>

            {/* Location Status */}
            <div className="sos-location-status">
              {loadingLocation && (
                <div className="sos-location-loading">
                  <div className="sos-spinner"></div>
                  <span>Getting your location...</span>
                </div>
              )}
              {locationError && (
                <div className="sos-location-error">
                  <span>⚠️ {locationError}</span>
                  <button onClick={getLocation} className="sos-retry-btn">Retry</button>
                </div>
              )}
              {location && !loadingLocation && (
                <div className="sos-location-found">
                  <span>📍 Location found</span>
                  <span className="sos-coords">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                </div>
              )}
            </div>

            {/* Alert Sent State */}
            {alertSent ? (
              <div className="sos-alert-sent">
                <div className="sos-sent-icon">✅</div>
                <h3>Emergency Alert Sent!</h3>
                <p>Your location has been logged. Contact emergency services immediately.</p>
                {location && (
                  <a 
                    href={getGoogleMapsUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="sos-map-link"
                  >
                    📍 View on Google Maps
                  </a>
                )}
                <div className="sos-post-actions">
                  <button onClick={shareLocation} className="sos-share-btn">
                    📤 Share Location
                  </button>
                  <button onClick={() => handleCallEmergency('112')} className="sos-call-112-btn">
                    📞 Call 112
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Send Alert Button with Countdown */}
                <div className="sos-send-section">
                  {countdown !== null ? (
                    <div className="sos-countdown">
                      <div className="sos-countdown-circle">
                        <span>{countdown}</span>
                      </div>
                      <p>Sending alert in {countdown} seconds...</p>
                      <button onClick={handleCancelCountdown} className="sos-cancel-btn">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleSendAlert} 
                      className="sos-send-alert-btn"
                      disabled={loadingLocation}
                    >
                      🚨 Send Emergency Alert
                    </button>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="sos-quick-actions">
                  <button onClick={shareLocation} className="sos-action-btn share" disabled={!location}>
                    📤 Share Location
                  </button>
                  <a 
                    href={location ? getGoogleMapsUrl() : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`sos-action-btn map ${!location ? 'disabled' : ''}`}
                  >
                    🗺️ Open Maps
                  </a>
                </div>

                {/* Emergency Contacts */}
                <div className="sos-contacts">
                  <h3>Emergency Contacts</h3>
                  <div className="sos-contacts-grid">
                    {EMERGENCY_CONTACTS.map((contact) => (
                      <button
                        key={contact.number}
                        className="sos-contact-card"
                        onClick={() => handleCallEmergency(contact.number)}
                      >
                        <span className="contact-icon">{contact.icon}</span>
                        <span className="contact-name">{contact.name}</span>
                        <span className="contact-number">{contact.number}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SosButton;
