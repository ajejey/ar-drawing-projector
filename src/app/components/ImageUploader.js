'use client';

import { useState } from 'react';

export default function ImageUploader({ onImageUpload }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-uploader fixed bottom-4 left-4 z-50">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageChange}
        className="hidden" 
        id="image-upload"
      />
      <label 
        htmlFor="image-upload" 
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg cursor-pointer"
      >
        Upload Image
      </label>
      {selectedImage && (
        <img 
          src={selectedImage} 
          alt="Uploaded" 
          className="mt-2 w-24 h-24 object-cover rounded"
        />
      )}
    </div>
  );
}
