import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const AuthDebugger: React.FC = () => {
  const { user, isLoading, profile } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Auth state - Loading: ${isLoading}, User: ${user ? 'exists' : 'null'}`);
  }, [isLoading, user]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        setSessionInfo({ session: session ? 'exists' : 'null', error: error?.message });
        addLog(`Session check - Session: ${session ? 'exists' : 'null'}, Error: ${error?.message || 'none'}`);
      } catch (err) {
        addLog(`Session check failed: ${err}`);
      }
    };

    checkSession();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: <span className={isLoading ? 'text-red-400' : 'text-green-400'}>{isLoading.toString()}</span></div>
        <div>User: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? user.email : 'null'}</span></div>
        <div>Profile: <span className={profile ? 'text-green-400' : 'text-red-400'}>{profile ? 'exists' : 'null'}</span></div>
        <div>Session: <span className={sessionInfo?.session === 'exists' ? 'text-green-400' : 'text-red-400'}>{sessionInfo?.session || 'checking...'}</span></div>
      </div>
      <div className="mt-2 border-t border-gray-600 pt-2">
        <div className="font-semibold mb-1">Recent Logs:</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {debugLogs.map((log, index) => (
            <div key={index} className="text-xs text-gray-300">{log}</div>
          ))}
        </div>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Reload App
      </button>
    </div>
  );
};

export default AuthDebugger;
