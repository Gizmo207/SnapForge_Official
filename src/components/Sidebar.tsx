import React, { useState } from 'react';
import { 
  Crop, 
  Palette, 
  Sliders, 
  Sparkles, 
  Type, 
  Layers,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import { useImage } from '../context/ImageContext';
import SocialMediaResizeTool from './tools/SocialMediaResizeTool';

const tools = [
  { id: 'social-media-resize', name: 'Social Media Resize', icon: Crop },
  { id: 'color-adjustment', name: 'Color Adjustment', icon: Palette },
  { id: 'filters', name: 'Filters', icon: Sliders },
  { id: 'effects', name: 'Effects', icon: Sparkles },
  { id: 'text-overlay', name: 'Text Overlay', icon: Type },
  { id: 'layers', name: 'Layers', icon: Layers },
];

const Sidebar: React.FC = () => {
  const { currentTool, setCurrentTool } = useImage();

  const renderToolContent = () => {
    switch (currentTool) {
      case 'social-media-resize':
        return <SocialMediaResizeTool />;
      case 'color-adjustment':
        return (
          <div className="p-4 text-gray-500">
            <p>Color adjustment tools coming soon...</p>
          </div>
        );
      case 'filters':
        return (
          <div className="p-4 text-gray-500">
            <p>Filter tools coming soon...</p>
          </div>
        );
      case 'effects':
        return (
          <div className="p-4 text-gray-500">
            <p>Effect tools coming soon...</p>
          </div>
        );
      case 'text-overlay':
        return (
          <div className="p-4 text-gray-500">
            <p>Text overlay tools coming soon...</p>
          </div>
        );
      case 'layers':
        return (
          <div className="p-4 text-gray-500">
            <p>Layer tools coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Tool Navigation */}
      <div className="border-b border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Tools</h2>
          <div className="space-y-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentTool === tool.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {renderToolContent()}
      </div>
    </div>
  );
};

export default Sidebar;