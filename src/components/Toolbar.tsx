import { useState } from 'react';
import './Toolbar.css';

interface ToolbarProps {
  onAddPage: () => void;
  onDeletePage: () => void;
  onFlipPrev: () => void;
  onFlipNext: () => void;
  currentPage: number;
  totalPages: number;
}

export function Toolbar({ 
  onAddPage, 
  onDeletePage, 
  onFlipPrev, 
  onFlipNext,
  currentPage,
  totalPages 
}: ToolbarProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button 
          className={`toolbar-btn ${activeTool === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
          title="Text mode"
        >
          <span className="tool-icon">T</span>
        </button>
        <button 
          className={`toolbar-btn ${activeTool === 'draw' ? 'active' : ''}`}
          onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')}
          title="Drawing mode"
        >
          <span className="tool-icon">✎</span>
        </button>
        <button 
          className={`toolbar-btn ${activeTool === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTool(activeTool === 'image' ? null : 'image')}
          title="Add image"
        >
          <span className="tool-icon">🖼</span>
        </button>
        <button 
          className={`toolbar-btn ${activeTool === 'equation' ? 'active' : ''}`}
          onClick={() => setActiveTool(activeTool === 'equation' ? null : 'equation')}
          title="Add equation"
        >
          <span className="tool-icon">∑</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={onFlipPrev} title="Previous page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="page-info">{currentPage} / {totalPages}</span>
        <button className="toolbar-btn" onClick={onFlipNext} title="Next page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button className="toolbar-btn add-page-btn" onClick={onAddPage} title="Add new page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button className="toolbar-btn delete-btn" onClick={onDeletePage} title="Delete page">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
