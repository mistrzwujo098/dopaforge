'use client';

import { useEffect, useState } from 'react';

export function SkipLinks() {
  const [showSkipLink, setShowSkipLink] = useState(false);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      if (e.target === document.body || e.target === document.documentElement) {
        setShowSkipLink(true);
      }
    };

    const handleBlur = () => {
      setShowSkipLink(false);
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  return (
    <a
      href="#main-content"
      className={`
        fixed top-4 left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded
        transform transition-transform duration-200 focus:translate-y-0
        ${showSkipLink ? 'translate-y-0' : '-translate-y-20'}
      `}
      onFocus={() => setShowSkipLink(true)}
      onBlur={() => setShowSkipLink(false)}
    >
      Przejdź do treści głównej
    </a>
  );
}