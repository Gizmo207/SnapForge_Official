import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainCanvas from './components/MainCanvas';
import { ImageProvider } from './context/ImageContext';

function App() {
  return (
    <ImageProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainCanvas />
        </div>
      </div>
    </ImageProvider>
  );
}

export default App;