import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useImage } from '../../context/ImageContext';

interface SocialMediaPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<any>;
  platform: string;
}

const socialMediaPresets: SocialMediaPreset[] = [
  { id: 'instagram-square', name: 'Square Post', width: 1080, height: 1080, icon: Instagram, platform: 'Instagram' },
  { id: 'instagram-story', name: 'Story', width: 1080, height: 1920, icon: Instagram, platform: 'Instagram' },
  { id: 'facebook-post', name: 'Post', width: 1200, height: 630, icon: Facebook, platform: 'Facebook' },
  { id: 'facebook-cover', name: 'Cover Photo', width: 1640, height: 859, icon: Facebook, platform: 'Facebook' },
  { id: 'twitter-post', name: 'Post', width: 1200, height: 675, icon: Twitter, platform: 'Twitter' },
  { id: 'twitter-header', name: 'Header', width: 1500, height: 500, icon: Twitter, platform: 'Twitter' },
  { id: 'youtube-thumbnail', name: 'Thumbnail', width: 1280, height: 720, icon: Youtube, platform: 'YouTube' },
  { id: 'linkedin-post', name: 'Post', width: 1200, height: 627, icon: Linkedin, platform: 'LinkedIn' },
];

const SocialMediaResizeTool: React.FC = () => {
  const { originalImage, setProcessedImage, imageSize, setImageSize } = useImage();
  const [customWidth, setCustomWidth] = useState(imageSize.width.toString());
  const [customHeight, setCustomHeight] = useState(imageSize.height.toString());

  const resizeImage = (targetWidth: number, targetHeight: number) => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      if (ctx) {
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate scaling to fit image while maintaining aspect ratio
        const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        const resizedImageData = canvas.toDataURL('image/png');
        setProcessedImage(resizedImageData);
        setImageSize({ width: targetWidth, height: targetHeight });
      }
    };

    img.src = originalImage;
  };

  const handlePresetClick = (preset: SocialMediaPreset) => {
    resizeImage(preset.width, preset.height);
  };

  const handleCustomResize = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0) {
      resizeImage(width, height);
    }
  };

  const groupedPresets = socialMediaPresets.reduce((acc, preset) => {
    if (!acc[preset.platform]) {
      acc[preset.platform] = [];
    }
    acc[preset.platform].push(preset);
    return acc;
  }, {} as Record<string, SocialMediaPreset[]>);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Presets</h3>
        
        {Object.entries(groupedPresets).map(([platform, presets]) => (
          <div key={platform} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{platform}</h4>
            <div className="space-y-2">
              {presets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    disabled={!originalImage}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                        <p className="text-xs text-gray-500">{preset.width} × {preset.height}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Size</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Width"
                min="1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Height"
                min="1"
              />
            </div>
          </div>
          <button
            onClick={handleCustomResize}
            disabled={!originalImage || !customWidth || !customHeight}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Apply Custom Size
          </button>
        </div>
      </div>

      {!originalImage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Upload an image first to use the resize tools.
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaResizeTool;