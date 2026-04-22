import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    if (token) {
      handleCallback(token).then(() => navigate('/', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg">
      <p className="text-text-secondary">Signing in...</p>
    </div>
  );
}
