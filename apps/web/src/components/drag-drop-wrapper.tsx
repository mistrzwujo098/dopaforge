'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export { DragDropContext, Droppable, Draggable };

// Fix for react-beautiful-dnd in Next.js 14 App Router
export function DragDropWrapper({ children }: { children: React.ReactNode }) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser) {
    return null;
  }

  return <>{children}</>;
}