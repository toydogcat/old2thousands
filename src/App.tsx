import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { DECADES } from './data';
import type { DecadeItem } from './data';
import MangaReader from './MangaReader';

const App: React.FC = () => {
  const [activeDecade, setActiveDecade] = useState<string>(DECADES[0].id);
  const [showManga, setShowManga] = useState(false);
  const [mangaId, setMangaId] = useState<string | null>(null);

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

  const handleAction = (actionId: string) => {
    if (actionId.startsWith('manga_')) {
      setMangaId(actionId);
      setShowManga(true);
    }
  };

  return (
    <div className="container">
      {showManga && <MangaReader mangaId={mangaId} onClose={() => setShowManga(false)} />}
      
      <header className="header">
        <div className="retro-border">
          <h1 className="glitch">🕰️ NOSTALGIA ARCHIVE</h1>
          <p>-- Back to the Golden Ages --</p>
          <button 
            className="easter-egg-trigger"
            onClick={() => { setMangaId('easter_egg'); setShowManga(true); }}
          >
            [ READ_MANGA_MODE ]
          </button>
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
                  {cat.items.map((item, i) => {
                    const isObject = typeof item === 'object';
                    const text = isObject ? (item as DecadeItem).text : item as string;
                    const hasAction = isObject && (item as DecadeItem).hasAction;

                    return (
                      <li key={i} className="item-with-action">
                        <span>{text}</span>
                        {hasAction && (
                          <button 
                            className="item-action-btn"
                            onClick={() => handleAction((item as DecadeItem).actionId || '')}
                          >
                            {(item as DecadeItem).actionLabel || '[ ACTION ]'}
                          </button>
                        )}
                      </li>
                    );
                  })}
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

      <style>{`
        .easter-egg-trigger {
          background: none;
          border: 1px dashed var(--border-color);
          color: var(--accent-color);
          font-family: var(--font-family);
          padding: 0.2rem 0.5rem;
          margin-top: 1rem;
          cursor: pointer;
          font-size: 0.7rem;
          transition: all 0.3s;
        }
        .easter-egg-trigger:hover {
          background: var(--accent-color);
          color: var(--bg-color);
          border-style: solid;
        }
        .item-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .item-action-btn {
          background: none;
          border: 1px solid var(--text-color);
          color: var(--text-color);
          font-family: var(--font-family);
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .item-action-btn:hover {
          background: var(--text-color);
          color: var(--bg-color);
        }
      `}</style>
    </div>
  );
};

export default App;
