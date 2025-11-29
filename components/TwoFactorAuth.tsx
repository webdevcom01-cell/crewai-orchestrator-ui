/**
 * Two-Factor Authentication Component
 * 
 * Features:
 * - QR code display for authenticator app setup
 * - Manual entry key for apps without camera
 * - Backup codes display and download
 * - Verification flow
 * - Enable/disable toggle
 */

import React, { useState, useCallback } from 'react';
import { 
  useAuthStore, 
  setup2FA, 
  enable2FA, 
  disable2FA, 
  regenerateBackupCodes,
  TwoFactorSetup
} from '../services/auth.service';

interface TwoFactorAuthProps {
  onClose?: () => void;
}

type Step = 'initial' | 'setup' | 'verify' | 'backup' | 'disable';

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onClose }) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('initial');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showManualKey, setShowManualKey] = useState(false);

  const handleSetup = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await setup2FA();
      
      if (data) {
        setSetupData(data);
        setBackupCodes(data.backupCodes);
        setStep('setup');
      } else {
        setError('Failed to initialize 2FA setup');
      }
    } catch (err) {
      setError('An error occurred during setup');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerify = useCallback(async () => {
    if (code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await enable2FA(code);
      
      if (result.success) {
        setStep('backup');
      } else {
        setError(result.error || 'Invalid code');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleDisable = useCallback(async () => {
    if (code.length < 6) {
      setError('Please enter a valid code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await disable2FA(code);
      
      if (result.success) {
        setStep('initial');
        setCode('');
      } else {
        setError(result.error || 'Invalid code');
      }
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleRegenerateBackupCodes = useCallback(async () => {
    if (code.length < 6) {
      setError('Please enter your 2FA code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await regenerateBackupCodes(code);
      
      if (result) {
        setBackupCodes(result.codes);
        setCode('');
      } else {
        setError('Failed to regenerate backup codes');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }, [code]);

  const downloadBackupCodes = useCallback(() => {
    const content = [
      'CrewAI Orchestrator - 2FA Backup Codes',
      '========================================',
      '',
      'Save these codes in a secure location.',
      'Each code can only be used once.',
      '',
      ...backupCodes.map((code, i) => `${i + 1}. ${code}`),
      '',
      `Generated: ${new Date().toISOString()}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crewai-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [backupCodes]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          Two-Factor Authentication
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Initial State */}
      {step === 'initial' && (
        <div className="space-y-4">
          <p className="text-slate-300">
            {user?.twoFactorEnabled
              ? 'Two-factor authentication is enabled for your account.'
              : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
          </p>

          {user?.twoFactorEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-lg">
                <span>✓</span>
                <span>2FA is enabled</span>
              </div>
              
              <button
                onClick={() => setStep('disable')}
                className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Disable 2FA
              </button>
              
              <button
                onClick={() => setStep('backup')}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                View/Regenerate Backup Codes
              </button>
            </div>
          ) : (
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
            </button>
          )}
        </div>
      )}

      {/* Setup Step - QR Code */}
      {step === 'setup' && setupData && (
        <div className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Step 1: Scan QR Code</h3>
            <p className="text-slate-400 text-sm mb-4">
              Scan this code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
            </p>
            
            <div className="flex justify-center bg-white rounded-lg p-4">
              <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
          </div>

          {/* Manual Entry Option */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <button
              onClick={() => setShowManualKey(!showManualKey)}
              className="text-violet-400 text-sm hover:text-violet-300 transition-colors"
            >
              {showManualKey ? 'Hide' : 'Show'} manual entry key
            </button>
            
            {showManualKey && (
              <div className="mt-2">
                <p className="text-slate-400 text-xs mb-2">
                  Enter this key manually if you can't scan the QR code:
                </p>
                <div className="flex items-center gap-2">
                  <code className="bg-slate-900 px-3 py-2 rounded text-sm text-white font-mono flex-1 break-all">
                    {setupData.manualEntryKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.manualEntryKey)}
                    className="p-2 bg-slate-600 rounded hover:bg-slate-500 transition-colors"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Verify Code */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Step 2: Enter Verification Code</h3>
            <p className="text-slate-400 text-sm mb-4">
              Enter the 6-digit code from your authenticator app
            </p>
            
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest font-mono focus:border-violet-500 focus:outline-none"
              maxLength={6}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep('initial');
                setSetupData(null);
                setCode('');
                setError('');
              }}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Backup Codes Step */}
      {step === 'backup' && (
        <div className="space-y-4">
          <div className="bg-amber-500/20 text-amber-400 px-4 py-3 rounded-lg text-sm">
            <strong>Important:</strong> Save these backup codes in a secure location. 
            Each code can only be used once to access your account if you lose your authenticator device.
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((backupCode, index) => (
                <div
                  key={index}
                  className="bg-slate-900 px-3 py-2 rounded font-mono text-sm text-white text-center"
                >
                  {backupCode}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadBackupCodes}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              Download
            </button>
            <button
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Copy All
            </button>
          </div>

          {/* Regenerate Section */}
          {user?.twoFactorEnabled && (
            <div className="border-t border-slate-600 pt-4 mt-4">
              <h4 className="text-white font-medium mb-2">Regenerate Backup Codes</h4>
              <p className="text-slate-400 text-sm mb-3">
                Enter your 2FA code to generate new backup codes (old codes will be invalidated)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono focus:border-violet-500 focus:outline-none"
                  maxLength={6}
                />
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading || code.length !== 6}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : 'Regenerate'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={() => {
              setStep('initial');
              setCode('');
              setError('');
              if (onClose) onClose();
            }}
            className="w-full px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all"
          >
            Done
          </button>
        </div>
      )}

      {/* Disable Step */}
      {step === 'disable' && (
        <div className="space-y-4">
          <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            <strong>Warning:</strong> Disabling 2FA will make your account less secure. 
            Enter your authentication code to confirm.
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[\s-]/g, '').slice(0, 8))}
              placeholder="Enter code or backup code"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-center font-mono focus:border-violet-500 focus:outline-none"
              autoFocus
            />
            <p className="text-slate-400 text-xs mt-2 text-center">
              Enter 6-digit TOTP code or 8-character backup code
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep('initial');
                setCode('');
                setError('');
              }}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDisable}
              disabled={loading || code.length < 6}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
