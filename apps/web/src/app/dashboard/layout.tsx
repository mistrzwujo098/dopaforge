'use client';

import { Sidebar } from '@/components/navigation/sidebar';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288); // 18rem = 288px

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarWidth(mobile ? 0 : 288);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen relative">
      <Sidebar />
      
      {/* Main content with sidebar offset */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          paddingLeft: isMobile ? 0 : sidebarWidth,
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          paddingLeft: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="min-h-screen transition-all duration-300"
      >
        {children}
      </motion.div>
    </div>
  );
}