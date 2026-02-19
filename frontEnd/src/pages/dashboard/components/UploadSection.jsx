import { useRef, useState } from "react";
import { pdfCategories } from '../../../mocks/pdfs';

export default function UploadSection({ onUpload }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pendingFiles, setPendingFiles] = useState(null);
  const [showCategoryError, setShowCategoryError] = useState(false);
  const [dropDownOpen, setDropdownOpen] = useState(false);

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
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setShowCategoryError(false);
    setDropdownOpen(false);
  };

  const handleClearFiles = (e) => {
    e.stopPropagation();
    setPendingFiles([]);
    setShowCategoryError(false);
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (!selectedCategory) {
      setShowCategoryError(true);
      return;
    }
    if (pendingFiles) {
      onUpload(pendingFiles, selectedCategory);
      setPendingFiles([]);
      setSelectedCategory("");
      setShowCategoryError(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Category Selector Bar */}
      <div
        className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-folder-3-line text-lg text-teal-600"></i>
          </div>
          Category
        </div>
        <div className="relative flex-1 max-w-xs">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropDownOpen)}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-lg text-sm transition cursor-pointer ${
              showCategoryError && !selectedCategory
                ? "border-red-400 bg-red-50 text-red-600"
                : selectedCategory
                  ? "border-teal-300 bg-teal-50 text-teal-800"
                  : "border-gray-300 bg-white text-gray-500 hover:border-teal-400"
            }`}
          >
            <span className="truncate">
              {selectedCategory || "Select a category..."}
            </span>
            <i
              className={`ri-arrow-down-s-line text-lg transition ${dropDownOpen ? "rotate-180" : ""}`}
            ></i>
          </button>

          {dropDownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-56 overflow-y-auto">
                {pdfCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer hover:bg-teal-50 ${
                      selectedCategory === cat
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedCategory === cat && (
                        <i className="ri-check-line text-teal-600"></i>
                      )}
                      <span className={selectedCategory === cat ? "" : "ml-5"}>
                        {cat}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {showCategoryError && !selectedCategory && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <i className="ri-error-warning-line"></i>
            Please select a category before uploading
          </p>
        )}
      </div>

      {/* Upload Area */}
      {!pendingFiles ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`bg-white rounded-xl shadow-sm border-2 border-dashed transition cursor-pointer ${
            isDragging
              ? "border-teal-500 bg-teal-50"
              : "border-gray-300 hover:border-teal-400 hover:bg-slate-50"
          }`}
        >
          <div className="p-12 text-center">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition ${
                isDragging ? "bg-teal-500" : "bg-slate-100"
              }`}
            >
              <i
                className={`ri-upload-cloud-2-line text-4xl transition ${
                  isDragging ? "text-white" : "text-gray-400"
                }`}
              ></i>
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
      ) : (
        /* Pending Files Preview */
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">
              {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}{" "}
              selected
            </h4>
            <button
              type="button"
              onClick={handleClearFiles}
              className="text-sm text-gray-500 hover:text-red-500 transition cursor-pointer flex items-center gap-1"
            >
              <i className="ri-close-line"></i>
              Clear
            </button>
          </div>

          <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
            {Array.from(pendingFiles).map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-pdf-line text-red-600"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                {selectedCategory && (
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full whitespace-nowrap">
                    {selectedCategory}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUploadClick}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedCategory
                ? "bg-teal-500 hover:bg-teal-600 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <i className="ri-upload-2-line text-lg"></i>
            Upload &amp; Vectorize
          </button>
        </div>
      )}
    </div>
  );
}
