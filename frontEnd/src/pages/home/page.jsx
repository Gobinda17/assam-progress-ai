import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (user && user.role === 'SUPERADMIN') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return null;
}
