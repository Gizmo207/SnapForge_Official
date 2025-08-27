import React from 'react';
import { useImage } from '../context/ImageContext';
import { Upload } from 'lucide-react';

const MainCanvas: React.FC = () => {
  const { originalImage, processedImage, setOriginalImage } = useImage();

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

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="h-full grid grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Original</h3>
          </div>
          <div className="h-full flex items-center justify-center p-6">
            {originalImage ? (
              <div className="max-w-full max-h-full overflow-auto scrollbar-thin">
                <img
                  src={originalImage}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Upload an image to get started</p>
                <label className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Processed Image */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Processed</h3>
          </div>
          <div className="h-full flex items-center justify-center p-6">
            {processedImage ? (
              <div className="max-w-full max-h-full overflow-auto scrollbar-thin">
                <img
                  src={processedImage}
                  alt="Processed"
                  className="max-w-full max-h-full object-contain border border-gray-200"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p>Processed image will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCanvas;