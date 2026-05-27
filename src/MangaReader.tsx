import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, BookOpen, RefreshCw, Settings } from 'lucide-react';
import JSZip from 'jszip';

interface MangaPage {
  url: string;
  name: string;
}

interface GoFileItem {
  id: string;
  name: string;
  type: string;
  directLink?: string;
  link?: string;
}

interface MangaReaderProps {
  mangaId: string | null;
  onClose: () => void;
}

const MangaReader: React.FC<MangaReaderProps> = ({ mangaId, onClose }) => {
  const [folderId, setFolderId] = useState('ZWkuvT');
  const [items, setItems] = useState<GoFileItem[]>([]);
  const [pages, setPages] = useState<MangaPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'reader' | 'settings'>(mangaId === 'easter_egg' ? 'reader' : 'list');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchFolderContents();
    }
  }, [folderId]);

  const fetchFolderContents = async () => {
    setLoading(true);
    setStatus('FETCHING_FOLDER_METADATA...');
    setError(null);
    try {
      // GoFile Public API
      const response = await fetch(`https://api.gofile.io/contents/getFolder?id=${folderId}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        const contents = data.data.children;
        const zipFiles = Object.values(contents)
          .filter((item: any) => item.type === 'file' && item.name.toLowerCase().endsWith('.zip'))
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            directLink: item.directLink,
            link: item.link
          }))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        
        setItems(zipFiles);
      } else {
        throw new Error(data.status || 'FAILED_TO_LOAD_FOLDER');
      }
    } catch (err: any) {
      console.error(err);
      setError(`ERROR: ${err.message || 'NETWORK_ERROR'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMangaZip = async (item: GoFileItem) => {
    setLoading(true);
    setStatus(`DOWNLOADING: ${item.name}...`);
    setCurrentPage(0);
    
    try {
      // 1. Fetch the zip file
      const downloadUrl = item.directLink || item.link;
      if (!downloadUrl) throw new Error('NO_DIRECT_LINK_AVAILABLE');

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`FETCH_FAILED: ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      setStatus('UNZIPPING_IN_MEMORY...');

      // 2. Unzip using JSZip
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(arrayBuffer);
      
      const imagePages: MangaPage[] = [];
      const filePromises: Promise<void>[] = [];

      zipContent.forEach((relativePath, file) => {
        if (!file.dir && relativePath.match(/\.(webp|jpg|jpeg|png)$/i)) {
          const promise = file.async('blob').then(blob => {
            imagePages.push({
              url: URL.createObjectURL(blob),
              name: relativePath
            });
          });
          filePromises.push(promise);
        }
      });

      await Promise.all(filePromises);
      
      if (imagePages.length === 0) throw new Error('NO_IMAGES_FOUND_IN_ZIP');

      // 3. Sort pages by filename
      imagePages.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      
      setPages(imagePages);
      setViewMode('reader');
    } catch (err: any) {
      console.error(err);
      setError(`LOAD_ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderList = () => (
    <div className="volume-list">
      <div className="list-header">
        <h3 style={{ color: 'var(--accent-color)' }}>
          <BookOpen size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          漫畫清單 [Folder: {folderId}]
        </h3>
        <div className="list-actions">
          <button onClick={() => setViewMode('settings')} title="Settings"><Settings size={16} /></button>
          <button onClick={fetchFolderContents} title="Refresh"><RefreshCw size={16} /></button>
        </div>
      </div>

      {error && <div className="error-box retro-border">{error}</div>}

      <div className="volumes-grid">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="volume-card retro-border" onClick={() => loadMangaZip(item)}>
              <div className="vol-info">
                <span className="vol-title">{item.name}</span>
                <span className="download-indicator">
                  <Download size={14} /> READY
                </span>
              </div>
            </div>
          ))
        ) : (
          !loading && <p style={{ textAlign: 'center', opacity: 0.5 }}>[ NO_FILES_FOUND ]</p>
        )}
      </div>
    </div>
  );

  const renderReader = () => {
    if (mangaId === 'easter_egg') {
      return (
        <div className="manga-content">
          <pre className="ascii-art">
            {`
      ___________________________________________
     |                                           |
     |   [ 咚 ！！ ]                             |
     |                                           |
     |        /\\____/\\                           |
     |       (  o  o  )   < 沒 有 圖 片 ...      |
     |       (  =^=  )      只 有 文 字 ！ >     |
     |        (      )                           |
     |         |_||_|                            |
     |                                           |
     |___________________________________________|
            `}
          </pre>
          <p className="manga-desc">這是彩蛋模式，只有 ASCII 漫畫。</p>
          <button className="back-to-list" onClick={() => setViewMode('list')}>[ 進入真實閱讀器 ]</button>
        </div>
      );
    }

    return (
      <div className="reader-container">
        <div className="manga-frame">
          {pages[currentPage] && (
            <img 
              src={pages[currentPage].url} 
              alt={`Page ${currentPage + 1}`} 
              className="manga-image"
            />
          )}
        </div>

        <div className="manga-footer">
          <button 
            disabled={currentPage === 0} 
            onClick={() => setCurrentPage(p => p - 1)}
            className="nav-btn"
          >
            <ChevronLeft size={20} /> PREV
          </button>
          <span>{currentPage + 1} / {pages.length}</span>
          <button 
            disabled={currentPage === pages.length - 1} 
            onClick={() => setCurrentPage(p => p + 1)}
            className="nav-btn"
          >
            NEXT <ChevronRight size={20} />
          </button>
        </div>
        <button className="back-to-list" onClick={() => setViewMode('list')}>
          [ 返回清單 ]
        </button>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="settings-panel retro-border">
      <h3>[ SYSTEM_SETTINGS ]</h3>
      <div className="setting-item">
        <label>GOFILE_FOLDER_ID:</label>
        <input 
          type="text" 
          value={folderId} 
          onChange={(e) => setFolderId(e.target.value)}
          className="retro-input"
        />
      </div>
      <button className="nav-btn" onClick={() => setViewMode('list')} style={{ marginTop: '1rem' }}>
        SAVE & CLOSE
      </button>
    </div>
  );

  return (
    <div className="manga-overlay">
      <div className="retro-border manga-window">
        <div className="manga-header">
          <span>[ RETRO_MANGA_SYSTEM v1.0 ]</span>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{status}</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && renderList()}
            {viewMode === 'reader' && renderReader()}
            {viewMode === 'settings' && renderSettings()}
          </>
        )}
      </div>

      <style>{`
        .manga-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 10px;
        }
        .manga-window {
          background: var(--bg-color);
          max-width: 900px;
          width: 100%;
          max-height: 95vh;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          padding: 1rem;
          overflow: hidden;
        }
        .manga-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          color: var(--accent-color);
          font-weight: bold;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-color);
          cursor: pointer;
        }
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .list-actions {
          display: flex;
          gap: 0.5rem;
        }
        .list-actions button {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-color);
          cursor: pointer;
          padding: 0.2rem;
        }
        .volumes-grid {
          display: grid;
          gap: 0.8rem;
          overflow-y: auto;
          max-height: 60vh;
          padding-right: 5px;
        }
        .volume-card {
          cursor: pointer;
          padding: 0.8rem;
          transition: all 0.2s;
        }
        .volume-card:hover {
          background: var(--hover-bg);
          border-color: var(--accent-color);
          transform: translateX(5px);
        }
        .vol-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vol-title {
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .download-indicator {
          font-size: 0.6rem;
          color: var(--accent-color);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          border: 1px solid var(--accent-color);
          padding: 0.1rem 0.3rem;
        }
        .loading-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          color: var(--accent-color);
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid var(--bg-color);
          border-top: 5px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .reader-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .manga-frame {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          overflow: auto;
          border: 1px solid #333;
        }
        .manga-image {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .manga-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding: 0.5rem 0;
          border-top: 1px solid var(--border-color);
        }
        .nav-btn {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-color);
          padding: 0.4rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-family);
        }
        .nav-btn:hover:not(:disabled) {
          background: var(--text-color);
          color: var(--bg-color);
        }
        .nav-btn:disabled {
          opacity: 0.3;
        }
        .back-to-list {
          align-self: center;
          margin-top: 0.5rem;
          background: none;
          border: none;
          color: var(--accent-color);
          font-size: 0.8rem;
          cursor: pointer;
          text-decoration: underline;
        }
        .error-box {
          color: #ff3333;
          border-color: #ff3333;
          padding: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.8rem;
        }
        .settings-panel {
          padding: 1.5rem;
        }
        .setting-item {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .retro-input {
          background: #000;
          border: 1px solid var(--border-color);
          color: var(--text-color);
          padding: 0.5rem;
          font-family: var(--font-family);
        }
        .ascii-art {
          font-family: monospace;
          white-space: pre;
          color: var(--text-color);
          font-size: 12px;
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
};

export default MangaReader;
