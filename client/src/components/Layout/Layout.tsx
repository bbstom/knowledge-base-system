import React, { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Container } from '../Container';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noPadding?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showSidebar = false,
  containerSize = 'lg',
  noPadding = false
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-7xl flex">
          {showSidebar && (
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
            />
          )}
          
          <main className="flex-1 overflow-hidden">
            {noPadding ? (
              children
            ) : (
              <Container size={containerSize}>
                {children}
              </Container>
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};