import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImageContextType {
  originalImage: string | null;
  processedImage: string | null;
  currentTool: string;
  imageSize: { width: number; height: number };
  setOriginalImage: (image: string | null) => void;
  setProcessedImage: (image: string | null) => void;
  setCurrentTool: (tool: string) => void;
  setImageSize: (size: { width: number; height: number }) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImage = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<string>('social-media-resize');
  const [imageSize, setImageSize] = useState({ width: 1080, height: 1080 });

  return (
    <ImageContext.Provider
      value={{
        originalImage,
        processedImage,
        currentTool,
        imageSize,
        setOriginalImage,
        setProcessedImage,
        setCurrentTool,
        setImageSize,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};