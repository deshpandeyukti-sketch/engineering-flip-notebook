import { useState } from 'react';
import Calendar from 'react-calendar';
import { isSameDay } from 'date-fns';
import { useNotebook } from '../contexts/NotebookContext';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { notebooks, currentNotebook, pages, selectNotebook, selectPage, createNotebook, createPage } = useNotebook();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showNewNotebook, setShowNewNotebook] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');

  const pageDates = pages.map(p => p.date);

  const handleDateChange = (value: any) => {
    if (!value || Array.isArray(value)) return;
    const dateValue = value as Date;
    setSelectedDate(dateValue);
    const pageForDate = pages.find(p => isSameDay(p.date, dateValue));
    if (pageForDate) {
      selectPage(pageForDate);
    } else {
      createPage(dateValue);
    }
  };

  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) return;
    const colors = ['#1E3A5F', '#3D5A80', '#EE6C4D', '#10B981', '#F59E0B', '#8B5CF6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const notebook = await createNotebook(newNotebookTitle, randomColor);
    selectNotebook(notebook);
    setNewNotebookTitle('');
    setShowNewNotebook(false);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-section">
        <div className="section-header">
          <h3>Notebooks</h3>
          <button className="icon-btn add-btn" onClick={() => setShowNewNotebook(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        
        {showNewNotebook && (
          <div className="new-notebook-form">
            <input
              type="text"
              placeholder="Notebook title..."
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
              autoFocus
            />
            <div className="form-actions">
              <button className="primary-btn" onClick={handleCreateNotebook}>Create</button>
              <button onClick={() => setShowNewNotebook(false)}>Cancel</button>
            </div>
          </div>
        )}
        
        <div className="notebook-list">
          {notebooks.map(notebook => (
            <button
              key={notebook.id}
              className={`notebook-item ${currentNotebook?.id === notebook.id ? 'active' : ''}`}
              onClick={() => selectNotebook(notebook)}
            >
              <span className="notebook-color" style={{ background: notebook.coverColor }} />
              <span className="notebook-title">{notebook.title}</span>
            </button>
          ))}
          
          {notebooks.length === 0 && (
            <div className="empty-state">
              <p>No notebooks yet</p>
              <button className="accent-btn" onClick={() => setShowNewNotebook(true)}>
                Create your first notebook
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Calendar</h3>
        </div>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="calendar"
          tileClassName={({ date }) => {
            const hasPage = pageDates.some(d => isSameDay(d, date));
            return hasPage ? 'has-page' : '';
          }}
        />
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Team</h3>
        </div>
        <div className="team-list">
          <div className="team-member">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="member-avatar" />
            ) : (
              <div className="member-avatar placeholder">
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="member-name">{user?.displayName}</span>
            <span className="online-indicator" />
          </div>
        </div>
      </div>
    </aside>
  );
}
