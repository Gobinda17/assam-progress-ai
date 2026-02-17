import { useRef, useState } from 'react';

export default function UploadSection({ onUpload }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`bg-white rounded-xl shadow-sm border-2 border-dashed transition cursor-pointer ${
        isDragging
          ? 'border-teal-500 bg-teal-50'
          : 'border-gray-300 hover:border-teal-400 hover:bg-slate-50'
      }`}
    >
      <div className="p-12 text-center">
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition ${
          isDragging ? 'bg-teal-500' : 'bg-slate-100'
        }`}>
          <i className={`ri-upload-cloud-2-line text-4xl transition ${
            isDragging ? 'text-white' : 'text-gray-400'
          }`}></i>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Upload PDF Files
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your PDF files here, or click to browse
        </p>
        
        <button
          type="button"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition whitespace-nowrap"
        >
          <i className="ri-folder-open-line text-lg"></i>
          Choose Files
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Supports PDF files up to 50MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
