import { useState } from 'react';

export default function PDFList({ pdfs, onDelete }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (id) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (pdfs.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
        </div>
        <p className="text-gray-500">No PDFs uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              File Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Pages
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Upload Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pdfs.map((pdf) => (
            <tr key={pdf.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-file-pdf-line text-xl text-red-600"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pdf.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatFileSize(pdf.size)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {pdf.pages > 0 ? pdf.pages : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(pdf.uploadDate)}
              </td>
              <td className="px-6 py-4">
                {pdf.status === 'processing' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full whitespace-nowrap">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Processing
                  </span>
                )}
                {pdf.status === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                    <i className="ri-checkbox-circle-line"></i>
                    Vectorized
                  </span>
                )}
                {pdf.status === 'failed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full whitespace-nowrap">
                    <i className="ri-error-warning-line"></i>
                    Failed
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                    title="Download"
                  >
                    <i className="ri-download-line text-lg"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(pdf.id)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition cursor-pointer ${
                      deleteConfirm === pdf.id
                        ? 'text-white bg-red-600 hover:bg-red-700'
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={deleteConfirm === pdf.id ? 'Click again to confirm' : 'Delete'}
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
