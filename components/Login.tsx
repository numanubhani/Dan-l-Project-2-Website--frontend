import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, LoginCredentials } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import InterestSelector from './InterestSelector';

interface LoginProps {
  onLoginSuccess: () => void;
}

type View = 'options' | 'form';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<View>('options');
  const [formData, setFormData] = useState<
    LoginCredentials & { email?: string; password2?: string; name?: string }
  >({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showInterests, setShowInterests] = useState(false);

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setView('options');
    setFormData({ username: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await api.login({ username: formData.username, password: formData.password });
        showSuccess('Welcome back!');
        onLoginSuccess();
        navigate('/');
      } else {
        if (formData.password !== formData.password2) {
          showError('Passwords do not match');
          setLoading(false);
          return;
        }
        await api.register({
          username: formData.username,
          email: formData.email || '',
          password: formData.password,
          password2: formData.password2 || '',
          name: formData.name,
        });
        showSuccess('Welcome to VPulse!');
        // Show interest selector before navigating away
        setShowInterests(true);
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // After signup — show interest selector fullscreen before navigating
  if (showInterests) {
    return (
      <InterestSelector
        onComplete={() => {
          setShowInterests(false);
          onLoginSuccess();
          navigate('/reel');
        }}
      />
    );
  }

  return (
    /* Full-page background matching TikTok dark theme */
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-neon-panel rounded-2xl overflow-hidden shadow-2xl shadow-neon-violet/15 border border-white/[0.08] flex flex-col">

        {/* Back button (form view) */}
        <div className="relative">
          {view === 'form' && (
            <button
              onClick={() => setView('options')}
              className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-8 pt-10 pb-6">
          {/* Title */}
          <h1 className="text-2xl font-black text-white text-center mb-8 tracking-tight">
            {mode === 'login' ? 'Log in to VPulse' : 'Sign up for VPulse'}
          </h1>

          {view === 'options' ? (
            <div className="space-y-3">
              {/* Phone / email / username */}
              <OptionButton
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                label={mode === 'login' ? 'Use phone / email / username' : 'Use phone or email'}
                onClick={() => setView('form')}
              />

              {/* Facebook */}
              <OptionButton
                icon={
                  <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                }
                label="Continue with Facebook"
                onClick={() => showError('Facebook login coming soon')}
              />

              {/* Google */}
              <OptionButton
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
                label="Continue with Google"
                onClick={() => showError('Google login coming soon')}
              />

              {mode === 'login' && (
                <OptionButton
                  icon={
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  }
                  label="Continue with Apple"
                  onClick={() => showError('Apple login coming soon')}
                />
              )}
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <FormInput
                    label="Name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(v) => setFormData({ ...formData, name: v })}
                    placeholder="Your display name"
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                    placeholder="your@email.com"
                    required
                  />
                </>
              )}

              <FormInput
                label="Username"
                type="text"
                value={formData.username}
                onChange={(v) => setFormData({ ...formData, username: v })}
                placeholder="username"
                required
              />

              <FormInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
                placeholder="Password"
                required
              />

              {mode === 'signup' && (
                <FormInput
                  label="Confirm Password"
                  type="password"
                  value={formData.password2 || ''}
                  onChange={(v) => setFormData({ ...formData, password2: v })}
                  placeholder="Confirm password"
                  required
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-full bg-neon-pink hover:bg-neon-pink-hover text-white font-bold text-base tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
              </button>
            </form>
          )}
        </div>

        {/* ── Terms + toggle footer ── */}
        <div className="border-t border-white/10 bg-white/5 px-8 py-5 text-center space-y-3">
          <p className="text-[11px] text-white/40 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-white/70 underline cursor-pointer">Terms of Service</span> and confirm
            that you have read our{' '}
            <span className="text-white/70 underline cursor-pointer">Privacy Policy</span>.
          </p>

          <p className="text-sm text-white/60">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-neon-pink font-semibold hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-neon-pink font-semibold hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Shared sub-components ── */

const OptionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-4 px-5 py-3.5 bg-neon-elevated hover:bg-neon-ink border border-white/10 rounded-xl text-white font-semibold text-sm transition"
  >
    <span className="w-6 h-6 flex items-center justify-center shrink-0 text-white/80">{icon}</span>
    <span className="flex-1 text-center">{label}</span>
  </button>
);

const FormInput: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}> = ({ label, type, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-xs font-semibold text-white/50 mb-1 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 bg-neon-elevated border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-neon-pink/70 focus:ring-1 focus:ring-neon-violet/50 transition duration-200"
    />
  </div>
);

export default Login;
