'use client';

export function SkipLinks() {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Przejdź do głównej treści
      </a>
      <a href="#navigation" className="skip-link">
        Przejdź do nawigacji
      </a>
      <a href="#tasks" className="skip-link">
        Przejdź do zadań
      </a>
    </div>
  );
}