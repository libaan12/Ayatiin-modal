import React from 'react';
import { Icons } from './Icons';

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform active:scale-95";
  const variants = {
    primary: "border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 hover:shadow-md",
    secondary: "border-transparent text-white bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-500 hover:shadow-md",
    outline: "border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-primary-500 hover:border-slate-400",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 hover:shadow-md",
    ghost: "border-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, type = 'text', icon: Icon, className = '', ...props }: any) => (
  <div className={`mb-4 ${className}`}>
    {label && <label className="block text-sm font-semibold text-slate-800 mb-1.5">{label}</label>}
    <div className="relative rounded-md shadow-sm">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
      )}
      <input
        type={type}
        className={`appearance-none block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all shadow-sm`}
        {...props}
      />
    </div>
  </div>
);

export const Select = ({ label, options, icon: Icon, className = '', ...props }: any) => (
  <div className={`mb-4 ${className}`}>
    {label && <label className="block text-sm font-semibold text-slate-800 mb-1.5">{label}</label>}
    <div className="relative rounded-md shadow-sm">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
      )}
      <select
        className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all shadow-sm`}
        {...props}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full ring-1 ring-black ring-opacity-5">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl leading-6 font-bold text-slate-900" id="modal-title">{title}</h3>
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-500 bg-slate-100 rounded-full p-1 hover:bg-slate-200 transition-colors">
                    <Icons.X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 w-full max-h-[80vh] overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Badge = ({ children, color = 'green', className='' }: any) => {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${colors[color as keyof typeof colors]} ${className}`}>
      {children}
    </span>
  );
};