import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-app-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-text-primary">Librarian</h1>
          <p className="text-text-secondary">MIDI pedal preset manager</p>
        </div>

        <div className="bg-card-bg border border-border-light rounded-lg p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-md">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <button
            onClick={login}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#3b82f6' }}
          >
            {isLoading ? 'Redirecting...' : 'Sign in with WorkOS'}
          </button>
        </div>
      </div>
    </div>
  );
}
