import { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useNotebook } from '../contexts/NotebookContext';
import { Toolbar } from './Toolbar';
import { PageContent } from './PageContent';
import './FlipNotebook.css';

export function FlipNotebook() {
  const { pages, currentPage, createPage, deletePage } = useNotebook();
  const [currentIndex, setCurrentIndex] = useState(0);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    if (currentPage && pages.length > 0) {
      const index = pages.findIndex(p => p.id === currentPage.id);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [currentPage, pages]);

  const handleFlip = useCallback((e: any) => {
    const pageIndex = e.data;
    setCurrentIndex(pageIndex);
  }, []);

  const handleAddPage = async () => {
    await createPage();
    setTimeout(() => {
      if (bookRef.current) {
        const pageCount = bookRef.current.getPageCount();
        bookRef.current.flip(pageCount - 1);
      }
    }, 100);
  };

  const handleDeletePage = () => {
    if (currentPage) {
      deletePage(currentPage.id);
    }
  };

  const handleFlipPrev = () => {
    if (bookRef.current) {
      bookRef.current.flipPrev();
    }
  };

  const handleFlipNext = () => {
    if (bookRef.current) {
      bookRef.current.flipNext();
    }
  };

  if (pages.length === 0) {
    return (
      <div className="flip-notebook-empty">
        <div className="empty-notebook">
          <div className="notebook-cover">
            <h2>Engineering Notebook</h2>
            <p>Start documenting your team's progress</p>
            <button className="accent-btn" onClick={handleAddPage}>
              Create First Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flip-notebook-container">
      <Toolbar
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
        onFlipPrev={handleFlipPrev}
        onFlipNext={handleFlipNext}
        currentPage={currentIndex + 1}
        totalPages={pages.length}
      />
      
      <div className="flip-notebook-wrapper">
        <div className="flip-notebook">
          <HTMLFlipBook
            ref={bookRef}
            onFlip={handleFlip}
            className=""
            style={{}}
            width={400}
            height={560}
            startPage={0}
            size="fixed"
            minWidth={400}
            maxWidth={400}
            minHeight={560}
            maxHeight={560}
            drawShadow={true}
            startZIndex={100}
            maxShadowOpacity={0.5}
            showCover={true}
            flippingTime={400}
            usePortrait={true}
            autoSize={false}
            mobileScrollSupport={true}
            useMouseEvents={true}
            clickEventForward={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pages.map((page) => (
              <div key={page.id} className="notebook-page">
                <div className="page-content">
                  <div className="page-header">
                    <span className="page-date">
                      {page.date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="page-author">
                      by {page.authorName}
                    </span>
                  </div>
                  <PageContent page={page} />
                </div>
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <div className="page-navigation">
        <button 
          className="nav-btn" 
          onClick={handleFlipPrev}
          disabled={currentIndex === 0}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="page-indicator">
          {currentIndex + 1} / {pages.length}
        </span>
        <button 
          className="nav-btn" 
          onClick={handleFlipNext}
          disabled={currentIndex === pages.length - 1}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
