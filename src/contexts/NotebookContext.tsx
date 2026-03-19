import { createContext, useContext, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Notebook, Page, PageContent } from '../types';

interface NotebookContextType {
  notebooks: Notebook[];
  pages: Page[];
  currentNotebook: Notebook | null;
  currentPage: Page | null;
  loading: boolean;
  createNotebook: (title: string, coverColor: string) => Promise<Notebook>;
  selectNotebook: (notebook: Notebook | null) => void;
  createPage: (date?: Date) => Promise<Page>;
  updatePage: (pageId: string, content: Partial<PageContent>) => Promise<void>;
  deletePage: (pageId: string) => void;
  selectPage: (page: Page | null) => void;
  nextPage: () => void;
  prevPage: () => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === "YOUR_API_KEY" ||
  import.meta.env.VITE_FIREBASE_API_KEY.includes("your_");

const demoNotebook: Notebook = {
  id: 'demo-notebook',
  teamId: 'demo-team',
  title: 'My Engineering Notebook',
  coverColor: '#1E3A5F',
  createdAt: new Date(),
  updatedAt: new Date()
};

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(isDemoMode ? [demoNotebook] : []);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(isDemoMode ? demoNotebook : null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading] = useState(false);

  const createNotebook = async (title: string, coverColor: string): Promise<Notebook> => {
    const newNotebook: Notebook = {
      id: isDemoMode ? 'demo-notebook' : uuidv4(),
      teamId: 'demo-team',
      title,
      coverColor,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDemoMode) {
      setNotebooks([newNotebook]);
    }
    return newNotebook;
  };

  const selectNotebook = (notebook: Notebook | null) => {
    setCurrentNotebook(notebook);
    setCurrentPage(null);
    setPages([]);
  };

  const createPage = async (date?: Date): Promise<Page> => {
    const notebook = currentNotebook || demoNotebook;
    const pageDate = date || new Date();
    
    const newPage: Page = {
      id: uuidv4(),
      notebookId: notebook.id,
      date: pageDate,
      authorId: 'demo-user',
      authorName: 'Demo User',
      content: { text: '', drawings: [], images: [], equations: [] },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPages(prev => [...prev, newPage]);
    setCurrentPage(newPage);
    return newPage;
  };

  const updatePage = async (pageId: string, content: Partial<PageContent>) => {
    setPages(prev => prev.map(page => {
      if (page.id === pageId) {
        return {
          ...page,
          content: { ...page.content, ...content },
          updatedAt: new Date()
        };
      }
      return page;
    }));
  };

  const deletePage = (pageId: string) => {
    setPages(prev => prev.filter(page => page.id !== pageId));
    if (currentPage?.id === pageId) {
      setCurrentPage(null);
    }
  };

  const selectPage = (page: Page | null) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (!currentPage || pages.length === 0) return;
    const currentIndex = pages.findIndex(p => p.id === currentPage.id);
    if (currentIndex < pages.length - 1) {
      setCurrentPage(pages[currentIndex + 1]);
    }
  };

  const prevPage = () => {
    if (!currentPage || pages.length === 0) return;
    const currentIndex = pages.findIndex(p => p.id === currentPage.id);
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1]);
    }
  };

  return (
    <NotebookContext.Provider value={{
      notebooks,
      pages,
      currentNotebook,
      currentPage,
      loading,
      createNotebook,
      selectNotebook,
      createPage,
      updatePage,
      deletePage,
      selectPage,
      nextPage,
      prevPage
    }}>
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebook() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
}
