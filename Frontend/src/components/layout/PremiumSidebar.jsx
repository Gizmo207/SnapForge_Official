import React, { useState } from 'react';
import '../../styles/theme.tokens.css';
import '../../styles/PremiumSidebar.css';
import '../../styles/PremiumSidebar.hotfix.css';

// Import all tool panels directly
import ResizePanel from '../../tools/resize/ResizePanel';
import FiltersPanel from '../../tools/filters/FiltersPanel';
import FormatConverterPanel from '../../tools/format-converter/FormatConverterPanel';
import BackgroundRemovalPanel from '../../tools/background-removal/BackgroundRemovalPanel';
import BatchResizerPanel from '../../tools/batch-resizer/BatchResizerPanel';
import WatermarkRemoverPanel from '../../tools/watermark-remover/WatermarkRemoverPanel';
import GifCreatorPanel from '../../tools/gif-creator/GifCreatorPanel';
import FaceFixerPanel from '../../tools/face-fixer/FaceFixerPanel';
import MemeCreatorPanel from '../../tools/meme-creator/MemeCreatorPanel';
import PrivacyCleanerPanel from '../../tools/privacy-cleaner/PrivacyCleanerPanel';

const PremiumSidebar = ({ onImageUpload, onOpenMemeCreator, onResult }) => {
  // Check URL for forced modes
  const u = new URL(window.location.href);
  const path = (u.pathname || '').replace(/\/+$/,'');
  const forcedTrial = /(^|\/)(app\/trial|trial)(\/|$)/.test(path) || u.searchParams.get('mode') === 'trial';
  const forcedPro = /(^|\/)(app\/pro|pro)(\/|$)/.test(path) || u.searchParams.get('mode') === 'pro';
  const hasProLicense = forcedPro || (!forcedTrial && localStorage.getItem('proLicenseActive') === 'true');
  const isTrial = !hasProLicense;

  // Use controlled props from App for image state
  // hasImage and imageFile are passed from parent App
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      setFileName(file.name);
      if (onImageUpload) {
        onImageUpload(file);
      }
    }
  };

  return (
    <aside className="premium-sidebar">
      <div className="sidebar-content">
        <header className="sidebar-header" style={{ marginTop: '60px', paddingTop: '1rem' }}>
          <h1 className="app-title">Image Editor</h1>
        </header>

  <section className="upload-section" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-title">
            <span className="status-dot upload"></span>
            Upload Image
          </div>
          <div className="upload-zone" onClick={() => document.getElementById('file-input').click()}>
            <div className="upload-icon">📁</div>
            <div className="upload-text">Drop your image here or click to browse</div>
            <div className="upload-hint">Supports JPG, PNG, GIF, WebP</div>
            <div className="upload-info">
              <p>• Max file size: 50MB</p>
              <p>• Best quality: Use PNG for graphics, JPG for photos</p>
              <p>• All processing happens locally in your browser</p>
            </div>
          </div>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {hasImage && (
            <div style={{ marginTop: '10px', color: '#10b981' }}>
              ✅ {fileName || (imageFile && imageFile.name) || 'Loaded'}
            </div>
          )}
        </section>

        {/* Only show pro tools if not trial and hasImage */}
        {hasImage && !isTrial && (
          <div style={{ padding: '1rem', flex: 1, position: 'relative', zIndex: 5 }}>
            <ResizePanel hasImage={hasImage} imageFile={imageFile} onResult={onResult} />
            <FiltersPanel hasImage={hasImage} imageFile={imageFile} />
            <FormatConverterPanel hasImage={hasImage} imageFile={imageFile} />
            <BackgroundRemovalPanel hasImage={hasImage} imageFile={imageFile} />
            <BatchResizerPanel hasImage={hasImage} imageFile={imageFile} />
            <WatermarkRemoverPanel hasImage={hasImage} imageFile={imageFile} />
            <GifCreatorPanel hasImage={hasImage} imageFile={imageFile} />
            <FaceFixerPanel hasImage={hasImage} imageFile={imageFile} />
            <MemeCreatorPanel hasImage={hasImage} imageFile={imageFile} onOpenFullWorkspace={onOpenMemeCreator} />
            <PrivacyCleanerPanel hasImage={hasImage} imageFile={imageFile} />
          </div>
        )}

        {/* Show only upgrade card for trial users */}
        {isTrial && (
          <section className="upgrade-section">
            <div className="upgrade-card">
              <h3>Unlock Premium Features</h3>
              <p>Unlimited background removal, batch resize, watermark removal, GIFs, and more.</p>
              <button className="upgrade-button" onClick={() => (window.location.href = '/checkout')}>
                Upgrade to Pro
              </button>
            </div>
            {/* Trial limits info */}
            <div style={{ marginTop: '20px', color: '#f59e42', fontSize: '14px', textAlign: 'center' }}>
              <b>Trial Mode:</b> Limited to 3 images per day, watermark on output, and restricted access to premium tools.
            </div>
          </section>
        )}

        {/* Show upgrade card for free users (not pro, not trial) */}
        {!hasProLicense && !isTrial && (
          <section className="upgrade-section">
            <div className="upgrade-card">
              <h3>Unlock Premium Features</h3>
              <p>Unlimited background removal, batch resize, watermark removal, GIFs, and more.</p>
              <button className="upgrade-button" onClick={() => (window.location.href = '/checkout')}>
                Upgrade to Pro
              </button>
            </div>
          </section>
        )}

        {hasProLicense && (
          <div className="pro-user-spacer" aria-hidden="true" />
        )}
      </div>
    </aside>
  );
};

export default PremiumSidebar;