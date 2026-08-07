import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../app/providers/AuthProvider';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const { login } = useAuth();

  useEffect(() => {
    // Simulate initial loading animation
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] overflow-hidden relative z-0">
      <div className="w-full max-w-[420px]">
        
        {/* Logo Container */}
        <div 
          className={`flex justify-center transition-all duration-1000 ease-in-out ${
            isAppLoading ? 'translate-y-[150px] scale-110' : 'translate-y-0 scale-100'
          } mb-8`}
        >
          {/* Please place the provided logo image as "logo.png" in the "public" folder */}
          <img 
            src="/logo.png" 
            alt="RNE Logo" 
            className="w-[280px] h-auto object-contain"
            onError={(e) => {
              // Fallback text just in case the image is missing
              e.currentTarget.style.display = 'none';
              const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextEl) nextEl.style.display = 'block';
            }}
          />
          <h1 style={{ display: 'none' }} className="text-[32px] font-bold text-primary">RNE</h1>
        </div>
        
        {/* Form Container */}
        <div 
          className={`transition-all duration-1000 ease-in-out ${
            isAppLoading ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <Card>
            <div className="text-center mb-8">
              <h2 className="text-[22px] font-bold text-text-primary tracking-tight mb-1">Welcome Back</h2>
              <p className="text-[14px] text-text-secondary">Please sign in to continue</p>
            </div>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <Input
                label="Name / Email"
                type="text"
                placeholder="Enter your name or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {error && (
                <div className="bg-error/10 text-error p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <Button type="submit" disabled={isLoading} className="mt-4 w-full h-12">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-0.5">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-spring-dot-1" />
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-spring-dot-2" />
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-spring-dot-3" />
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}

