
import React from 'react';
import { Photo } from '../types';
import { Clothespin } from '../constants';

interface PhotoCardProps {
  photo: Photo;
  index: number;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, index }) => {
  return (
    <div 
      className="relative flex flex-col items-center transition-all duration-700 ease-in-out"
      style={{
        transform: `rotate(${photo.rotation}deg) translateY(${photo.offsetY}px)`,
      }}
    >
      <Clothespin />
      
      {/* The Paper Frame */}
      <div 
        className="bg-[#FDF5E6] p-2 shadow-lg ring-1 ring-black/5 flex flex-col items-center noise-overlay"
        style={{
          width: `${photo.width}px`,
          minHeight: `${photo.height}px`,
        }}
      >
        {/* The Actual Photo */}
        <div className="w-full bg-gray-200 overflow-hidden relative">
          <img 
            src={photo.url} 
            alt={photo.title}
            className="w-full h-auto grayscale-[30%] sepia-[20%] contrast-[95%] brightness-[105%]"
            style={{ 
                aspectRatio: photo.width / (photo.height - 40),
                objectFit: 'cover' 
            }}
          />
          {/* Subtle vignette on the photo */}
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
        </div>

        {/* Caption */}
        <div className="mt-3 w-full text-center px-1">
          <p 
            className="text-gray-600/80 leading-tight"
            style={{ 
              fontFamily: index % 2 === 0 ? '"Gochi Hand", cursive' : '"Special Elite", serif',
              fontSize: '0.9rem'
            }}
          >
            {photo.title}
          </p>
        </div>

        {/* Random "age" stains */}
        <div 
          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E6D4B7] opacity-20 pointer-events-none blur-sm"
          style={{ display: index % 3 === 0 ? 'block' : 'none' }}
        ></div>
        <div 
          className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-[#D4C3A1] opacity-10 pointer-events-none blur-md"
          style={{ display: index % 2 === 0 ? 'block' : 'none' }}
        ></div>
      </div>
    </div>
  );
};

export default PhotoCard;
