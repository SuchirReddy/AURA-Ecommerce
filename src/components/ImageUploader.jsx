import React, { useState, useRef } from 'react';
import { UploadCloud, Loader as LoaderIcon } from 'lucide-react';
import { uploadImage } from '../services/storageService';
import './ImageUploader.css';

const ImageUploader = ({ 
  folder = 'general', 
  multiple = false, 
  maxFiles = 1, 
  onUploadComplete, 
  onError,
  buttonText = 'Click or drag image to upload',
  compact = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (files) => {
    setUploading(true);
    setProgress(10);
    const filesArray = Array.from(files).slice(0, maxFiles);
    
    try {
      const uploadPromises = filesArray.map(file => {
        setProgress(prev => Math.min(prev + 20, 90));
        return uploadImage(folder, file);
      });
      
      const urls = await Promise.all(uploadPromises);
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        if (onUploadComplete) {
          if (multiple) {
            onUploadComplete(urls);
          } else {
            onUploadComplete(urls[0]);
          }
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setUploading(false);
      setProgress(0);
      if (onError) onError(err);
    }
  };

  const onButtonClick = () => {
    if (!uploading) inputRef.current.click();
  };

  return (
    <div 
      className={`image-uploader ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''} ${compact ? 'compact' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
    >
      <input 
        ref={inputRef}
        type="file" 
        multiple={multiple} 
        accept="image/*"
        onChange={handleChange} 
        style={{ display: "none" }} 
      />
      
      {uploading ? (
        <div className="uploader-content uploading-state">
          <LoaderIcon className="spin-icon" size={compact ? 20 : 40} />
          {compact ? <span>Uploading...</span> : <p>Uploading...</p>}
          {!compact && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      ) : (
        <div className="uploader-content idle-state">
          <UploadCloud size={compact ? 20 : 48} className="upload-icon" />
          {compact ? <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{buttonText}</span> : <h3>{buttonText}</h3>}
          {!compact && <p>Powered by Cloudinary. JPG, PNG or GIF.</p>}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
