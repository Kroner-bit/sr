import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Target } from 'lucide-react';

export default function Login() {
  const { user, signIn } = useAuth();

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 rounded-full" />
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 relative">
              <Target className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-display font-bold text-white tracking-tight">
          Shooting<span className="text-cyan-400">Range</span>
        </h2>
        <p className="mt-3 text-center text-zinc-400">
          Digitális lőlap és eredménykövető
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-zinc-800/50">
          <button
            onClick={signIn}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-zinc-900 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Folytatás Google fiókkal
          </button>
        </div>
      </div>
    </div>
  );
}
