import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { DECADES } from './data';

const App: React.FC = () => {
  const [activeDecade, setActiveDecade] = useState<string>(DECADES[0].id);

  // postMessage for Luna AI Hub
  useEffect(() => {
    let lastScrollY = 0;
    const scrollThreshold = 8;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold && currentScrollY > 10) return;
      
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      window.parent.postMessage({
        type: 'iframe_scroll',
        scrollY: currentScrollY,
        direction: direction
      }, '*');
      
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Vercount fetch on page change
  useEffect(() => {
    if ((window as any).vercount && typeof (window as any).vercount.fetch === 'function') {
      (window as any).vercount.fetch();
    }
  }, [activeDecade]);

  const currentDecade = DECADES.find(d => d.id === activeDecade) || DECADES[0];

  return (
    <div className="container">
      <header className="header">
        <div className="retro-border">
          <h1 className="glitch">🕰️ NOSTALGIA ARCHIVE</h1>
          <p>-- Back to the Golden Ages --</p>
        </div>
      </header>

      <nav className="nav">
        {DECADES.map(decade => (
          <div
            key={decade.id}
            className={`nav-item ${activeDecade === decade.id ? 'active' : ''}`}
            onClick={() => setActiveDecade(decade.id)}
          >
            [{decade.id}s]
          </div>
        ))}
      </nav>

      <main className="content-section">
        <div className="retro-border">
          <h2 style={{ color: 'var(--accent-color)' }}>{currentDecade.title}</h2>
          <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>{currentDecade.description}</p>

          {currentDecade.categories.map((cat, idx) => {
            const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.HelpCircle;
            return (
              <div key={idx} className="category">
                <h3 className="category-title">
                  <Icon size={20} /> {cat.name}
                </h3>
                <ul className="item-list">
                  {cat.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="footer">
        <div className="retro-border">
          <p>© 2026 NOSTALGIA ARCHIVE SYSTEM v1.0.4</p>
          <div className="stats">
            <span id="vercount_value_site_pv">--</span> PV | 
            <span id="vercount_value_site_uv">--</span> UV
          </div>
          <p style={{ fontSize: '0.6rem', marginTop: '1rem', opacity: 0.7 }}>
            [SYSTEM READY] - [WAITING FOR USER INPUT]
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
