import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleRightPanel: () => void;
}

export function Header({ onToggleSidebar, onToggleRightPanel }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn menu-btn" onClick={onToggleSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="logo">
          <span className="logo-icon">📓</span>
          <span className="logo-text">Engineering Notebook</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn" onClick={onToggleRightPanel}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M15 3v18" />
          </svg>
        </button>
        
        <div className="user-menu">
          <button 
            className="user-avatar-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </button>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="user-name">{user?.displayName}</span>
                <span className="user-email">{user?.email}</span>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={logout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
