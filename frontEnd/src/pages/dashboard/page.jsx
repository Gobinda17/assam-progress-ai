import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UploadSection from './components/UploadSection';
import PDFList from './components/PDFList';
import { mockPDFs } from '../../mocks/pdfs';

export default function Dashboard() {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState(mockPDFs);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpload = (files) => {
    const newPDFs = Array.from(files).map((file, index) => ({
      id: `pdf-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      uploadDate: new Date().toISOString(),
      status: 'processing',
      vectorized: false,
      pages: 0
    }));

    setPdfs([...newPDFs, ...pdfs]);

    // Simulate processing
    newPDFs.forEach((pdf, index) => {
      setTimeout(() => {
        setPdfs(prev => prev.map(p => 
          p.id === pdf.id 
            ? { ...p, status: 'completed', vectorized: true, pages: Math.floor(Math.random() * 50) + 10 }
            : p
        ));
      }, 2000 + index * 1000);
    });
  };

  const handleDelete = (id) => {
    setPdfs(pdfs.filter(pdf => pdf.id !== id));
  };

  const filteredPDFs = pdfs.filter(pdf =>
    pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PDF Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Upload and manage PDFs for RAG vectorization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total PDFs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pdfs.length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <i className="ri-file-text-line text-2xl text-teal-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vectorized</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {pdfs.filter(p => p.vectorized).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {pdfs.filter(p => p.status === 'processing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-loader-4-line text-2xl text-orange-600"></i>
              </div>
            </div>
          </div>
        </div>

        <UploadSection onUpload={handleUpload} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Uploaded PDFs</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400 text-lg"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PDFs..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-sm w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          <PDFList pdfs={filteredPDFs} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
