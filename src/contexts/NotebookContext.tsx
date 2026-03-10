import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';
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

export function NotebookProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotebooks([]);
      setPages([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notebooks'),
      where('teamId', '==', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notebookList: Notebook[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notebookList.push({
          id: doc.id,
          teamId: data.teamId,
          title: data.title,
          coverColor: data.coverColor,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      setNotebooks(notebookList);
      if (notebookList.length > 0 && !currentNotebook) {
        setCurrentNotebook(notebookList[0]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!currentNotebook) {
      setPages([]);
      return;
    }

    const q = query(
      collection(db, 'pages'),
      where('notebookId', '==', currentNotebook.id),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pageList: Page[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        pageList.push({
          id: doc.id,
          notebookId: data.notebookId,
          date: data.date?.toDate() || new Date(),
          authorId: data.authorId,
          authorName: data.authorName,
          authorPhoto: data.authorPhoto,
          content: data.content || { text: '', drawings: [], images: [], equations: [] },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      setPages(pageList);
      if (pageList.length > 0 && !currentPage) {
        setCurrentPage(pageList[0]);
      }
    });

    return unsubscribe;
  }, [currentNotebook]);

  const createNotebook = async (title: string, coverColor: string): Promise<Notebook> => {
    if (!user) throw new Error('Must be logged in');
    
    const docRef = await addDoc(collection(db, 'notebooks'), {
      teamId: user.id,
      title,
      coverColor,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const newNotebook: Notebook = {
      id: docRef.id,
      teamId: user.id,
      title,
      coverColor,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return newNotebook;
  };

  const selectNotebook = (notebook: Notebook | null) => {
    setCurrentNotebook(notebook);
    setCurrentPage(null);
  };

  const createPage = async (date?: Date): Promise<Page> => {
    if (!user || !currentNotebook) throw new Error('Must be logged in with a notebook selected');
    
    const pageDate = date || new Date();
    
    const docRef = await addDoc(collection(db, 'pages'), {
      notebookId: currentNotebook.id,
      date: pageDate,
      authorId: user.id,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      content: { text: '', drawings: [], images: [], equations: [] },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const newPage: Page = {
      id: docRef.id,
      notebookId: currentNotebook.id,
      date: pageDate,
      authorId: user.id,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      content: { text: '', drawings: [], images: [], equations: [] },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentPage(newPage);
    return newPage;
  };

  const updatePage = async (pageId: string, content: Partial<PageContent>) => {
    const pageRef = doc(db, 'pages', pageId);
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    await updateDoc(pageRef, {
      content: { ...page.content, ...content },
      updatedAt: serverTimestamp()
    });
  };

  const deletePage = async (pageId: string) => {
    await deleteDoc(doc(db, 'pages', pageId));
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
