import { useState, useRef, useEffect, useCallback } from 'react';
import { useNotebook } from '../contexts/NotebookContext';
import type { Page, DrawingData, ImageData, EquationData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './PageContent.css';

interface PageContentProps {
  page: Page;
}

export function PageContent({ page }: PageContentProps) {
  const { updatePage } = useNotebook();
  const [text, setText] = useState(page.content.text || '');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawings, setDrawings] = useState(page.content.drawings || []);
  const [currentDrawing, setCurrentDrawing] = useState<{ points: { x: number; y: number }[]; color: string; width: number } | null>(null);
  const [brushColor, setBrushColor] = useState('#1A1A2E');
  const [brushSize, setBrushSize] = useState(4);
  const [images, setImages] = useState(page.content.images || []);
  const [equations, setEquations] = useState(page.content.equations || []);
  const [newEquation, setNewEquation] = useState('');
  const [showEquationInput, setShowEquationInput] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawings.forEach((drawing: DrawingData) => {
      if (drawing.paths.length > 0) {
        ctx.strokeStyle = drawing.paths[0].color;
        ctx.lineWidth = drawing.paths[0].width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        drawing.paths.forEach((path) => {
          if (path.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);
            path.points.forEach((point) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
        });
      }
    });

    if (currentDrawing && currentDrawing.points.length > 0) {
      ctx.strokeStyle = currentDrawing.color;
      ctx.lineWidth = currentDrawing.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentDrawing.points[0].x, currentDrawing.points[0].y);
      currentDrawing.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [drawings, currentDrawing]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    const timeoutId = setTimeout(() => {
      updatePage(page.id, { text: newText });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [page.id, updatePage]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    setCurrentDrawing({
      points: [coords],
      color: brushColor,
      width: brushSize
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setCurrentDrawing(prev => prev ? {
      ...prev,
      points: [...prev.points, coords]
    } : null);
  };

  const stopDrawing = () => {
    if (isDrawing && currentDrawing && currentDrawing.points.length > 0) {
      const newDrawings = [...drawings, { id: uuidv4(), paths: [currentDrawing] }];
      setDrawings(newDrawings);
      updatePage(page.id, { drawings: newDrawings });
    }
    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        const newImage = {
          id: uuidv4(),
          src,
          x: 50,
          y: 50,
          width: 200,
          height: 150,
        };
        const newImages = [...images, newImage];
        setImages(newImages);
        updatePage(page.id, { images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const addEquation = () => {
    if (!newEquation.trim()) return;
    const newEq = {
      id: uuidv4(),
      latex: newEquation,
      x: 50,
      y: 50
    };
    const newEquations = [...equations, newEq];
    setEquations(newEquations);
    updatePage(page.id, { equations: newEquations });
    setNewEquation('');
    setShowEquationInput(false);
  };

  const renderLatex = (latex: string) => {
    try {
      return katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch {
      return latex;
    }
  };

  return (
    <div className="page-content-wrapper">
      <textarea
        className="text-editor"
        placeholder="Start writing..."
        value={text}
        onChange={handleTextChange}
      />

      <div className="drawing-container">
        <canvas
          ref={canvasRef}
          width={340}
          height={360}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        <div className="drawing-tools">
          <div className="color-picker">
            {['#1A1A2E', '#3D5A80', '#EE6C4D', '#10B981', '#F59E0B', '#8B5CF6'].map(color => (
              <button
                key={color}
                className={`color-btn ${brushColor === color ? 'active' : ''}`}
                style={{ background: color }}
                onClick={() => setBrushColor(color)}
              />
            ))}
          </div>
          <div className="size-picker">
            {[2, 4, 8, 16].map(size => (
              <button
                key={size}
                className={`size-btn ${brushSize === size ? 'active' : ''}`}
                onClick={() => setBrushSize(size)}
              >
                <span style={{ width: size, height: size, background: brushColor, borderRadius: '50%' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="images-container">
        {images.map((img: ImageData) => (
          <img
            key={img.id}
            src={img.src}
            alt=""
            className="page-image"
            style={{ left: img.x, top: img.y, width: img.width, height: img.height }}
            draggable
          />
        ))}
      </div>

      <div className="equations-container">
        {equations.map((eq: EquationData) => (
          <div
            key={eq.id}
            className="equation-block"
            style={{ left: eq.x, top: eq.y }}
            dangerouslySetInnerHTML={{ __html: renderLatex(eq.latex) }}
          />
        ))}
      </div>

      <div className="content-actions">
        <label className="action-btn image-upload">
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          <span>🖼 Add Image</span>
        </label>
        <button 
          className="action-btn equation-btn"
          onClick={() => setShowEquationInput(!showEquationInput)}
        >
          <span>∑ Add Equation</span>
        </button>
      </div>

      {showEquationInput && (
        <div className="equation-input-panel">
          <textarea
            placeholder="Enter LaTeX equation, e.g., E = mc^2"
            value={newEquation}
            onChange={(e) => setNewEquation(e.target.value)}
          />
          <div className="equation-preview" dangerouslySetInnerHTML={{ __html: renderLatex(newEquation) }} />
          <button className="accent-btn" onClick={addEquation}>Add</button>
        </div>
      )}
    </div>
  );
}
