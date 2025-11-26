import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IDP Analytics BI
              </span>
              <span className="ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">2025</span>
            </div>
            <div className="flex items-center space-x-4">
               <div className="text-sm text-slate-500 hidden md:block">
                 Talento TI: Dashboard Ejecutivo
               </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {children}
      </main>
    </div>
  );
};