import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center max-w-2xl">
        <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="ri-file-text-line text-4xl text-white"></i>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          PDF RAG Management System
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Upload, vectorize, and manage PDF documents for advanced RAG retrieval. 
          Streamline your document processing workflow with our powerful admin dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
          >
            <i className="ri-login-box-line text-xl"></i>
            Admin Login
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-gray-900 font-semibold rounded-lg transition border-2 border-gray-200 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-dashboard-line text-xl"></i>
            View Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <i className="ri-upload-cloud-2-line text-2xl text-teal-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Upload</h3>
            <p className="text-gray-600 text-sm">
              Drag and drop PDF files or browse to upload multiple documents at once
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <i className="ri-cpu-line text-2xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Auto Vectorization</h3>
            <p className="text-gray-600 text-sm">
              Automatically parse and vectorize PDFs for efficient RAG retrieval
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <i className="ri-dashboard-3-line text-2xl text-orange-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage & Track</h3>
            <p className="text-gray-600 text-sm">
              Monitor processing status and manage all your documents in one place
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
