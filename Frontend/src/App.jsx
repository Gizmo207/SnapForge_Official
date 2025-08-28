import React, { useState } from 'react';
import PremiumSidebar from './components/layout/PremiumSidebar';
import MemeCreatorView from './tools/meme-creator/components/MemeCreatorView';
import './styles/App.css';

const App = () => {
  // Check URL for forced modes
  const u = new URL(window.location.href);
  const path = (u.pathname || '').replace(/\/+$/,'');
  const forcedTrial = /(^|\/)(app\/trial|trial)(\/|$)/.test(path) || u.searchParams.get('mode') === 'trial';
  const forcedPro = /(^|\/)(app\/pro|pro)(\/|$)/.test(path) || u.searchParams.get('mode') === 'pro';

  // Handle forced modes
  try {
    if (forcedTrial) {
      localStorage.removeItem('proLicenseActive');
      localStorage.setItem('userMode','trial');
    } else if (forcedPro) {
      localStorage.setItem('proLicenseActive', 'true');
      localStorage.setItem('userMode','pro');
    }
  } catch {}

  const hasProLicense = forcedPro || (!forcedTrial && localStorage.getItem('proLicenseActive') === 'true');
  const isTrial = !hasProLicense;

  const [hasImage, setHasImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [activeToolId, setActiveToolId] = useState(null);
  
  const handleImageUpload = (file) => {
    console.log('App received image upload:', file?.name);
    setHasImage(Boolean(file));
    setImageFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
  // Let tools (like Resize) access the last uploaded file without re-upload
  try { window.__SF_LAST_FILE__ = file; } catch {}
    } else {
      setImageUrl(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🎨</span>
            <span className="logo-text">Image Editor {hasProLicense ? <span className="pro-text">Pro</span> : isTrial ? <span className="trial-text">Trial</span> : null}</span>
          </div>
        </div>
        <div className="header-center">
          {/* Hide store button for trial users */}
          {!isTrial && (
            <button className="add-tools-btn">
              ✨ Add More Tools
            </button>
          )}
        </div>
        <div className="header-right">
          {hasProLicense ? (
            <span className="pro-badge-header">✅ PRO USER</span>
          ) : isTrial ? (
            <span className="trial-badge-header">🧪 TRIAL USER</span>
          ) : null}
        </div>
      </header>
      
      <PremiumSidebar 
        hasProLicense={hasProLicense}
        isTrial={isTrial}
        hasImage={hasImage}
        imageFile={imageFile}
        onImageUpload={handleImageUpload}
        onOpenMemeCreator={() => setActiveToolId('meme-creator')}
        onResult={(url /*, blob, meta */) => {
          setProcessedUrl(prev => { if (prev && prev !== url) { try { URL.revokeObjectURL(prev); } catch {} } return url; });
        }}
      />
      
      {activeToolId === 'meme-creator' ? (
        <MemeCreatorView onExit={() => setActiveToolId(null)} />
      ) : (
        <main className="main-content">
        <div className="image-panels">
          <div className="image-panel original">
            <div className="panel-header">
              <span className="panel-icon">🖼️</span>
              <span className="panel-title">Original</span>
            </div>
            <div className="panel-content">
              {!hasImage ? (
                <div className="placeholder-text">Upload an image to get started</div>
              ) : (
                <img 
                  src={imageUrl} 
                  alt="Original" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              )}
            </div>
          </div>
          
          <div className="image-panel processed">
            <div className="panel-header">
              <span className="panel-icon">✨</span>
              <span className="panel-title">Processed</span>
            </div>
            <div className="panel-content">
              {!processedUrl ? (
                <div className="placeholder-text">Processed image will appear here after using a tool</div>
              ) : (
                <img
                  src={processedUrl}
                  alt="Processed"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      )}
    </div>
  );
};

export default App;