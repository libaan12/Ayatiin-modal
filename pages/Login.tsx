import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if user is already logged in or state updates
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext handles navigation via useEffect
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden">
      {/* Background Decor - Restored Green Header */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-primary-600 to-green-500 transform -skew-y-3 origin-top-left -translate-y-12 shadow-lg"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transform translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center mb-8">
           <div className="h-24 w-24 bg-white rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-6 transform rotate-3 hover:rotate-0 transition-all duration-300 p-2">
              <img src="https://files.catbox.moe/fsno8w.png" alt="Ayatiin Logo" className="w-full h-full object-contain" />
           </div>
           
           <h2 className="text-3xl font-extrabold tracking-tight mb-1">
             <span className="text-slate-900">Ayatiin</span>{' '}
             <span className="text-primary-600">Model</span>
           </h2>
           <h3 className="text-xl font-bold text-slate-600 mb-2 tracking-wide">P & S School</h3>
           
           <p className="mt-1 text-sm text-slate-400 font-medium uppercase tracking-widest">
             School Management System
           </p>
        </div>

        <div className="bg-white py-8 px-8 shadow-2xl rounded-2xl border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="admin@school.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                 </div>
                 <input 
                   type="password" 
                   required 
                   value={password} 
                   onChange={e => setPassword(e.target.value)} 
                   className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                   placeholder="••••••••"
                 />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100 animate-pulse">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Icons.X className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Accessing Portal...
                  </span>
                ) : 'Secure Login'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex flex-col items-center space-y-3">
             <Link to="/download" className="flex items-center text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors">
               <Icons.Download className="h-4 w-4 mr-1.5" />
               Download Android App
             </Link>
             <p className="text-xs text-slate-400">
               Forgot credentials? Contact Administration.
             </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-slate-500 text-xs font-medium opacity-70">&copy; {new Date().getFullYear()} Ayatiin Model P & S School.</p>
        </div>
      </div>
    </div>
  );
};