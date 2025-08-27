import React from 'react';
import { Camera, Download, Upload } from 'lucide-react';
import { useImage } from '../context/ImageContext';

const Header: React.FC = () => {
  const { setOriginalImage, processedImage } = useImage();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'snapforge-processed-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Camera className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">SnapForge</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Official</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleDownload}
            disabled={!processedImage}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;