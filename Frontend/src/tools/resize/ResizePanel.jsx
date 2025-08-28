import React, { useState } from 'react';
import { resizeImage, downloadBlob, createImagePreview } from '../../services/browserResizeService';

const ResizePanel = ({ hasImage, imageFile, onProcessedImage, onResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState(3000);
  const [customHeight, setCustomHeight] = useState(4000);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(3000 / 4000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const socialPresets = [
    {
      platform: 'Instagram Presets',
      icon: '📸',
      sizes: [
        { name: 'Square Post', width: 1080, height: 1080 },
        { name: 'Story', width: 1080, height: 1920 },
        { name: 'Reel', width: 1080, height: 1920 },
        { name: 'IGTV Cover', width: 420, height: 654 }
      ]
    },
    {
      platform: 'Facebook Presets',
      icon: '📘',
      sizes: [
        { name: 'Post', width: 1200, height: 630 },
        { name: 'Cover Photo', width: 820, height: 312 },
        { name: 'Story', width: 1080, height: 1920 },
        { name: 'Event Cover', width: 1920, height: 1080 }
      ]
    },
    {
      platform: 'X (Twitter) Presets',
      icon: '🐦',
      sizes: [
        { name: 'Post Image', width: 1200, height: 675 },
        { name: 'Header', width: 1500, height: 500 },
        { name: 'Card Image', width: 800, height: 418 },
        { name: 'Profile Photo', width: 400, height: 400 }
      ]
    },
    {
      platform: 'Discord Presets',
      icon: '🎮',
      sizes: [
        { name: 'Server Icon', width: 512, height: 512 },
        { name: 'Banner', width: 960, height: 540 },
        { name: 'Emoji', width: 128, height: 128 },
        { name: 'Splash', width: 1920, height: 1080 }
      ]
    }
  ];

  const [platformOpen, setPlatformOpen] = useState({
    instagram: false,
    facebook: false,
    twitter: false,
    discord: false
  });

  const togglePlatform = (key) => setPlatformOpen(s => ({ ...s, [key]: !s[key] }));

  const applyPreset = (width, height) => {
    setCustomWidth(width);
    setCustomHeight(height);
    setOriginalAspectRatio(width / height);
    console.log(`Applied preset: ${width}x${height}`);
  };

  const handleWidthChange = (newWidth) => {
    setCustomWidth(newWidth);
    if (aspectRatioLocked) {
      setCustomHeight(Math.round(newWidth / originalAspectRatio));
    }
  };

  const handleHeightChange = (newHeight) => {
    setCustomHeight(newHeight);
    if (aspectRatioLocked) {
      setCustomWidth(Math.round(newHeight * originalAspectRatio));
    }
  };

  const handleReset = () => {
    setCustomWidth(3000);
    setCustomHeight(4000);
    setOriginalAspectRatio(3000 / 4000);
  };

  const toggleAspectRatio = () => {
    if (!aspectRatioLocked) {
      setOriginalAspectRatio(customWidth / customHeight);
    }
    setAspectRatioLocked(!aspectRatioLocked);
  };

  const handleResize = async (width, height, presetName = null) => {
    console.log('handleResize called:', { width, height, presetName, imageFile, hasImage });
    // if parent didn't pass imageFile, try the global bridge set by the uploader
    const activeFile = imageFile || (window && window.__SF_LAST_FILE__) || null;
    if (!activeFile) {
      console.log('No imageFile - showing alert');
      alert('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus(presetName ? `Resizing to ${presetName}...` : `Resizing to ${width}×${height}...`);

    try {
  const resizedBlob = await resizeImage(activeFile, width, height, aspectRatioLocked, 'jpeg');
      
      // Create preview URL for the processed image
      const previewUrl = createImagePreview(resizedBlob);
      
      // Call onProcessedImage if provided
      if (onProcessedImage) {
        onProcessedImage(previewUrl, resizedBlob);
      }
      
      // Call onResult if provided (for main processed panel)
      if (onResult) {
        onResult(previewUrl, resizedBlob, null);
      }
      
      setProcessingStatus('✅ Resize complete! Check the processed panel.');
      
      // Auto-download the resized image
      const filename = presetName ? 
        `${presetName.toLowerCase().replace(/\s+/g, '_')}_${width}x${height}.jpg` :
        `resized_${width}x${height}.jpg`;
      downloadBlob(resizedBlob, filename);
      
    } catch (error) {
      console.error('Resize error:', error);
      setProcessingStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingStatus(''), 3000);
    }
  };

  const handlePresetClick = async (size) => {
    console.log('Preset button clicked:', size);
    console.log('imageFile:', imageFile);
    console.log('hasImage:', hasImage);
    await handleResize(size.width, size.height, size.name);
  };

  const handleCustomResize = async () => {
    await handleResize(customWidth, customHeight);
  };
  return (
  <div className="tool-card" onClickCapture={(e) => console.log('[ResizePanel] click capture', e.target && (e.target.className || e.target.tagName))}>
      <div 
        className="tool-header clickable" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="tool-icon">📏</div>
        <div className="tool-info">
          <h3>Resize Image</h3>
          <p>Adjust dimensions for social media or custom sizes</p>
        </div>
        <span className={`expand-arrow ${isOpen ? 'expanded' : ''}`}>▾</span>
      </div>
      
      {isOpen && (
        <div className="tool-content">
          {!hasImage ? (
            <div className="processing-status">
              <div className="status-message">Upload an image to enable resizing.</div>
              <div className="status-hint">Use the uploader above.</div>
            </div>
          ) : (
            <>
              {/* Social Media Presets */}
              {socialPresets.map((social, index) => {
                const platformKey = social.platform.toLowerCase().split(' ')[0];
                return (
                  <div key={index}>
                    <div className="tool-header clickable" onClick={() => togglePlatform(platformKey)}>
                      <div className="tool-icon">{social.icon}</div>
                      <div className="tool-info">
                        <h3>{social.platform}</h3>
                      </div>
                      <span className={`expand-arrow ${platformOpen[platformKey] ? 'expanded' : ''}`}>▾</span>
                    </div>
                    {platformOpen[platformKey] && (
                      <div className="tool-content">
                        <div className="preset-grid">
                          {social.sizes.map((size, sizeIndex) => (
                            <button 
                              key={sizeIndex} 
                              className="preset-btn" 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePresetClick(size);
                              }}
                              disabled={isProcessing}
                            >
                              <div className="preset-name">{size.name}</div>
                              <div className="preset-size">{size.width} × {size.height}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Custom Size Section */}
              <div className="custom-resize-section" style={{ marginTop: '1rem' }}>
                <div className="tool-header">
                  <div className="tool-icon">✏️</div>
                  <div className="tool-info">
                    <h3>Custom Size</h3>
                  </div>
                </div>
                <div className="tool-content">
                  <div className="slider-controls">
                    <div className="slider-group">
                      <label>
                        <span>Width</span>
                        <span className="slider-value">{customWidth}px</span>
                      </label>
                      <input
                        className="adjustment-slider"
                        type="range"
                        min={100}
                        max={8000}
                        value={customWidth}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="slider-group">
                      <label>
                        <span>Height</span>
                        <span className="slider-value">{customHeight}px</span>
                      </label>
                      <input
                        className="adjustment-slider"
                        type="range"
                        min={100}
                        max={8000}
                        value={customHeight}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div style={{ margin: '1rem 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={aspectRatioLocked}
                        onChange={toggleAspectRatio}
                      />
                      <span>🔒 Lock aspect ratio</span>
                    </label>
                  </div>
                  
                  {/* Processing Status */}
                  {(isProcessing || processingStatus) && (
                    <div className="processing-status" style={{ 
                      margin: '1rem 0', 
                      padding: '0.75rem',
                      background: isProcessing ? '#fef3c7' : processingStatus.includes('✅') ? '#d1fae5' : '#fee2e2',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isProcessing ? '#f59e0b' : processingStatus.includes('✅') ? '#10b981' : '#ef4444'}`,
                      textAlign: 'center'
                    }}>
                      <div className="status-message" style={{
                        color: isProcessing ? '#92400e' : processingStatus.includes('✅') ? '#065f46' : '#991b1b',
                        fontWeight: '500',
                        fontSize: '0.875rem'
                      }}>{processingStatus}</div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      className="tool-button" 
                      type="button" 
                      style={{ 
                        flex: 1,
                        opacity: isProcessing ? 0.7 : 1,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        background: isProcessing ? '#9ca3af' : '#3b82f6',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={handleCustomResize}
                      disabled={isProcessing}
                    >
                      {isProcessing ? '⏳ Processing...' : '✅ Apply'}
                    </button>
                    <button 
                      className="tool-button" 
                      type="button" 
                      style={{ 
                        flex: 1, 
                        background: isProcessing ? '#9ca3af' : '#6b7280', 
                        color: 'white',
                        opacity: isProcessing ? 0.7 : 1,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={handleReset}
                      disabled={isProcessing}
                    >
                      🔄 Reset
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResizePanel;