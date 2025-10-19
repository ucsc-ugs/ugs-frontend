import React, { useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * Verify page
 *
 * Usage patterns supported:
 * 1. Frontend receives a full backend verification URL in the `url` query param:
 *    /verify?url=https%3A%2F%2Fbackend.example.com%2Femail%2Fverify%2F123%2Fabc%3Fsignature%3D...
 *    -> this page will redirect directly to that URL.
 *
 * 2. Frontend receives verification query params produced by the backend (id, hash, signature, expires, ...):
 *    /verify?id=123&hash=abc&signature=...&expires=...
 *    -> this page will forward the query string to the backend's email verification route at
 *       http://localhost:8000/email/verify (assumes backend is running at localhost:8000).
 *
 * If neither pattern is present, a small message is shown with instructions.
 */
const Verify: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const runVerification = async () => {
      try {
        setStatus('verifying');

        // Extract everything after 'url=' to preserve the full verification URL with all its parameters
        const searchString = window.location.search;
        const urlParamIndex = searchString.indexOf('url=');
        const fullUrl = urlParamIndex !== -1 ? searchString.substring(urlParamIndex + 4) : null;

        if (!fullUrl) {
          throw new Error('No verification URL provided');
        }

        const decoded = decodeURIComponent(fullUrl);
        const res = await verifyEmail(decoded);
        console.log('Verification response:', res);

        // Prefer a top-level message, then data.message, then stringify the response
        let messageToShow: string;
        if (typeof res === 'string') {
          messageToShow = res;
        } else if (res && typeof res === 'object') {
          if (typeof res.message === 'string') messageToShow = res.message;
          else if (res.data && typeof res.data.message === 'string') messageToShow = res.data.message;
          else messageToShow = JSON.stringify(res);
        } else {
          messageToShow = 'Email verification completed.';
        }

        setMessage(messageToShow);
        setStatus('success');
      } catch (err: any) {
        console.error('Email verification failed:', err);
        setStatus('error');
        // If backend sent a helpful message, prefer that
        const errMsg = err?.message || (err && typeof err === 'object' ? JSON.stringify(err) : String(err));
        setMessage(errMsg || 'Verification failed.');
      }
    };

    runVerification();
  }, []);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8000/api/email/verification-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email has been resent. Please check your inbox.');
        setStatus('success');
      } else {
        throw new Error(data.message || 'Failed to resend verification email');
      }
    } catch (err: any) {
      console.error('Resend verification failed:', err);
      setMessage(err?.message || 'Failed to resend verification email.');
      setStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToPortal = () => {
    navigate('/portal');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <h2 className="text-2xl font-semibold mb-4">Verifying your email</h2>
        {status === 'verifying' && (
          <p className="text-gray-600 mb-6">Please wait while we verify your email...</p>
        )}

        {status === 'success' && (
          <div className="p-6 bg-green-50 rounded-md">
            {/* <p className="text-green-800 font-medium">Verification successful</p> */}
            {message && <p className="text-sm text-green-700 mt-2">{message}</p>}
            <div className="mt-4">
              <Button 
                onClick={handleGoToPortal}
                className="w-full"
              >
                Go to Student Portal
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-6 bg-red-50 rounded-md">
            <p className="text-red-800 font-medium">Verification failed</p>
            {message && <p className="text-sm text-red-700 mt-2">{message}</p>}
            <div className="mt-4 space-y-2">
              <Button 
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? 'Resending...' : 'Resend Verification Email'}
              </Button>
              <Button 
                onClick={handleGoToPortal}
                className="w-full"
              >
                Go to Student Portal
              </Button>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <p className="text-gray-600 mb-6">Preparing to verify your email...</p>
        )}
      </div>
    </div>
  );
};

export default Verify;
