import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import UploadSection from './components/UploadSection';
import PDFList from './components/PDFList';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, API_URL } = useAuth();

  const pdfsRef = useRef(pdfs);
  useEffect(() => {
    pdfsRef.current = pdfs;
  }, [pdfs]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const mapBackendStatusToUiStatus = useCallback((backendStatus) => {
    switch (backendStatus) {
      case 'ready':
        return 'completed';
      case 'failed':
        return 'failed';
      case 'queued':
      case 'processing':
      default:
        return 'processing';
    }
  }, []);

  const mapDocToPdf = useCallback(
    (doc) => ({
      id: doc._id,
      name: doc.filename,
      size: doc.sizeBytes,
      uploadDate: doc.createdAt || doc.updatedAt || new Date().toISOString(),
      status: mapBackendStatusToUiStatus(doc.status),
      vectorized: doc.status === 'ready',
      pages: 0,
      _backendStatus: doc.status,
    }),
    [mapBackendStatusToUiStatus]
  );

  const fetchAdminDocs = useCallback(async () => {
    if (!user || user.role !== 'SUPERADMIN') {
      setPdfs([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/admin/documents`);
      const docs = Array.isArray(res.data) ? res.data : [];
      setPdfs(docs.map(mapDocToPdf));
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, [API_URL, mapDocToPdf, user]);

  useEffect(() => {
    fetchAdminDocs();
  }, [fetchAdminDocs]);

  const handleUpload = async (files, category) => {
    const fileList = Array.from(files || []);
    if (fileList.length === 0) return;

    const placeholders = fileList.map((file, index) => ({
      id: `local-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      uploadDate: new Date().toISOString(),
      status: 'processing',
      vectorized: false,
      pages: 0,
      _local: true,
    }));

    setPdfs((prev) => [...placeholders, ...prev]);

    await Promise.all(
      placeholders.map(async (placeholder, idx) => {
        const file = fileList[idx];
        const formData = new FormData();
        formData.append('file', file);
        if (category) formData.append('category', category);

        try {
          const res = await axios.post(`${API_URL}/admin/documents/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const documentId = res?.data?.documentId;
          setPdfs((prev) =>
            prev.map((p) =>
              p.id === placeholder.id
                ? {
                    ...p,
                    id: documentId || p.id,
                    status: 'processing',
                    vectorized: false,
                    _local: false,
                    _backendStatus: res?.data?.status || 'queued',
                  }
                : p
            )
          );
        } catch (err) {
          console.error('Upload failed:', err);
          setPdfs((prev) => prev.map((p) => (p.id === placeholder.id ? { ...p, status: 'failed' } : p)));
        }
      })
    );

    // Refresh from server so IDs/statuses match backend
    await fetchAdminDocs();
  };

  // Poll backend status so queued/processing -> ready updates the UI automatically
  useEffect(() => {
    if (!user || user.role !== 'SUPERADMIN') return;

    const intervalId = setInterval(async () => {
      const current = pdfsRef.current;
      if (!Array.isArray(current) || current.length === 0) return;
      const idsToPoll = current
        .filter((p) => !p._local && p.status === 'processing' && typeof p.id === 'string')
        .map((p) => p.id);

      if (idsToPoll.length === 0) return;

      try {
        const statuses = await Promise.all(
          idsToPoll.map(async (id) => {
            const res = await axios.get(`${API_URL}/admin/documents/${id}/status`);
            return { id, backendStatus: res?.data?.status };
          })
        );

        const statusMap = new Map(statuses.map((s) => [s.id, s.backendStatus]));
        setPdfs((prev) =>
          prev.map((p) => {
            const backendStatus = statusMap.get(p.id);
            if (!backendStatus) return p;
            return {
              ...p,
              _backendStatus: backendStatus,
              status: mapBackendStatusToUiStatus(backendStatus),
              vectorized: backendStatus === 'ready',
            };
          })
        );
      } catch (err) {
        // Ignore transient polling errors
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [API_URL, mapBackendStatusToUiStatus, user]);

  const handleDelete = (id) => {
    setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
  };

  const filteredPDFs = (pdfs || []).filter((pdf) =>
    (pdf?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />

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

        {user.role === 'SUPERADMIN' ? (
          <UploadSection onUpload={handleUpload} />
        ) : ''}

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
