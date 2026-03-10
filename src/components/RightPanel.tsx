import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotebook } from '../contexts/NotebookContext';
import './RightPanel.css';

interface RightPanelProps {
  isOpen: boolean;
}

export function RightPanel({ isOpen }: RightPanelProps) {
  const { user } = useAuth();
  const { currentPage } = useNotebook();
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [versions] = useState<any[]>([]);

  const handleAddComment = () => {
    if (!newComment.trim() || !user || !currentPage) return;
    
    const comment = {
      id: Date.now().toString(),
      pageId: currentPage.id,
      authorId: user.id,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      content: newComment,
      createdAt: new Date()
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <aside className={`right-panel ${isOpen ? 'open' : 'closed'}`}>
      <div className="panel-tabs">
        <button 
          className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'comments' && (
          <div className="comments-section">
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="empty-comments">
                  <p>No comments yet</p>
                  <span>Be the first to add a comment!</span>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    {comment.authorPhoto ? (
                      <img src={comment.authorPhoto} alt={comment.authorName} className="comment-avatar" />
                    ) : (
                      <div className="comment-avatar placeholder">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{comment.authorName}</span>
                        <span className="comment-time">
                          {comment.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="comment-input">
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button className="accent-btn" onClick={handleAddComment}>
                Post
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            {versions.length === 0 ? (
              <div className="empty-history">
                <p>No version history</p>
                <span>Changes will appear here</span>
              </div>
            ) : (
              <div className="version-list">
                {versions.map(version => (
                  <div key={version.id} className="version-item">
                    <div className="version-header">
                      <span className="version-author">{version.authorName}</span>
                      <span className="version-time">
                        {version.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="version-changes">{version.changes}</p>
                    <button className="restore-btn">Restore</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
