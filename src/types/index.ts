export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Date;
}

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface Notebook {
  id: string;
  teamId: string;
  title: string;
  coverColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageContent {
  text: string;
  drawings: DrawingData[];
  images: ImageData[];
  equations: EquationData[];
}

export interface DrawingData {
  id: string;
  paths: PathData[];
}

export interface PathData {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface ImageData {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  caption?: string;
}

export interface EquationData {
  id: string;
  latex: string;
  x: number;
  y: number;
}

export interface Page {
  id: string;
  notebookId: string;
  date: Date;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: PageContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  pageId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  parentId?: string;
  createdAt: Date;
}

export interface Version {
  id: string;
  pageId: string;
  authorId: string;
  authorName: string;
  content: PageContent;
  createdAt: Date;
}
