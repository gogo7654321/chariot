
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, ArrowRight, Delete, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';


const symbolButtons = [
    { label: <span className="inline-block">x</span>, cmd: 'x', offset: 0 },
    { label: <span className="inline-block">y</span>, cmd: 'y', offset: 0 },
    { label: <span className="inline-block">a<span className="align-text-top text-xs -translate-y-1.5">2</span></span>, cmd: '^{2}', offset: 0 },
    { label: <span className="inline-block">a<span className="align-text-top text-xs -translate-y-1.5">b</span></span>, cmd: '^{}', offset: -1 },
    { label: <span className="align-middle">a<sub className="text-xs translate-y-1">b</sub></span>, cmd: '_{}', offset: -1 },
    { label: <span className="inline-block">(</span>, cmd: '(', offset: 0 },
    { label: <span className="inline-block">)</span>, cmd: ')', offset: 0 },
    { label: <span className="inline-block">&#60;</span>, cmd: '<', offset: 0 },
    { label: <span className="inline-block">&#62;</span>, cmd: '>', offset: 0 },
    { label: <span className="inline-block">|a|</span>, cmd: '||', offset: -1 },
    { label: <span className="inline-block">,</span>, cmd: ',', offset: 0 },
    { label: <span className="inline-block">&#8804;</span>, cmd: '\\le', offset: 0 },
    { label: <span className="inline-block">&#8805;</span>, cmd: '\\ge', offset: 0 },
    { label: <span className="inline-block">&#8730;x</span>, cmd: '\\sqrt{}', offset: -1 },
    { label: <span className="inline-block">&#960;</span>, cmd: '\\pi', offset: 0 },
    { label: <span className="inline-block">x/y</span>, cmd: '\\frac{}{}', offset: -4 },
    { label: <span className="inline-block">&#8800;</span>, cmd: '\\neq', offset: 0 },
];

const numpadButtons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '.', '=',
];

const operatorButtons = [
    { label: <>&divide;</>, cmd: '\\div' },
    { label: <>&times;</>, cmd: '\\times' },
    { label: <>&minus;</>, cmd: '-' },
    { label: <>+</>, cmd: '+' },
];


function MathKeypad({ onInsert, onDelete, onMove, onSave }: { onInsert: (cmd: string, offset?: number) => void; onDelete: () => void; onMove: (dir: 'left' | 'right' | 'up' | 'down') => void; onSave: () => void; }) {
    return (
        <div className="flex flex-wrap items-start justify-center gap-4">
            {/* Symbols */}
            <div className="grid grid-cols-4 gap-2">
                {symbolButtons.map(btn => (
                    <Button key={typeof btn.label === 'string' ? btn.label : btn.cmd} type="button" variant="outline" className="h-12 text-lg font-sans" onClick={() => onInsert(btn.cmd, btn.offset)}>
                        {btn.label}
                    </Button>
                ))}
            </div>

            {/* Numpad and Operators */}
            <div className="flex gap-2">
                <div className="grid grid-cols-3 gap-2">
                    {numpadButtons.map(label => (
                        <Button key={label} type="button" variant="secondary" className="h-12 text-lg font-sans" onClick={() => onInsert(label)}>
                            {label}
                        </Button>
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {operatorButtons.map(btn => (
                        <Button key={btn.cmd} type="button" variant="outline" className="h-12 text-lg font-sans" onClick={() => onInsert(btn.cmd)}>
                            {btn.label}
                        </Button>
                    ))}
                </div>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col gap-2">
                 <div className="grid grid-cols-3 gap-1 justify-items-center">
                    <div></div> {/*_*/}
                    <Button type="button" variant="secondary" className="h-10 w-10 p-0" onClick={() => onMove('up')}><ArrowUp /></Button>
                    <div></div> {/*_*/}
                    <Button type="button" variant="secondary" className="h-10 w-10 p-0" onClick={() => onMove('left')}><ArrowLeft /></Button>
                    <Button type="button" variant="secondary" className="h-10 w-10 p-0" onClick={() => onMove('down')}><ArrowDown /></Button>
                    <Button type="button" variant="secondary" className="h-10 w-10 p-0" onClick={() => onMove('right')}><ArrowRight /></Button>
                </div>
                <Button type="button" variant="destructive" className="h-12" onClick={onDelete}><Delete /></Button>
                <Button type="button" className="h-12" onClick={onSave}><CornerDownLeft /></Button>
            </div>
        </div>
    );
}

interface MathInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (latex: string) => void;
  initialLatex?: string;
}

export default function MathInputDialog({
  isOpen,
  onClose,
  onSave,
  initialLatex = '',
}: MathInputDialogProps) {
  const [latex, setLatex] = useState(initialLatex);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialValue = initialLatex || '';
      setLatex(initialValue);
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = initialValue.length;
        }
      }, 100);
    }
  }, [isOpen, initialLatex]);

  useEffect(() => {
    if (previewRef.current) {
      try {
        katex.render(latex || "\\text{\\color{gray}...}", previewRef.current, {
          throwOnError: false,
          displayMode: true,
        });
        setError(null);
      } catch (e: any) {
        if (previewRef.current) {
           previewRef.current.textContent = e.message;
        }
        setError(e.message);
      }
    }
  }, [latex]);


  const handleInsert = (cmd: string, offset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + cmd + text.substring(end);
    setLatex(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + cmd.length + offset;
      textarea.selectionStart = textarea.selectionEnd = newPos;
    }, 0);
  };
  
  const handleDelete = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end && start > 0) {
        setLatex(latex.substring(0, start - 1) + latex.substring(start));
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start - 1;
        }, 0);
    } else {
        setLatex(latex.substring(0, start) + latex.substring(end));
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start;
        }, 0);
    }
  };
  
  const handleMove = (dir: 'left' | 'right' | 'up' | 'down') => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      setTimeout(() => {
        textarea.focus();
        let currentPos = textarea.selectionStart;

        if (dir === 'left') {
            textarea.selectionStart = textarea.selectionEnd = Math.max(0, currentPos - 1);
        } else if (dir === 'right') {
            textarea.selectionStart = textarea.selectionEnd = Math.min(latex.length, currentPos + 1);
        } else if (dir === 'up') {
            const textBefore = latex.substring(0, currentPos);
            const lastOpeningBrace = textBefore.lastIndexOf('{');
            if (lastOpeningBrace !== -1) {
                textarea.selectionStart = textarea.selectionEnd = lastOpeningBrace;
            }
        } else if (dir === 'down') {
            const textAfter = latex.substring(currentPos);
            const nextClosingBrace = textAfter.indexOf('}');
            if (nextClosingBrace !== -1) {
                textarea.selectionStart = textarea.selectionEnd = currentPos + nextClosingBrace + 1;
            }
        }
      }, 0);
  }

  const handleSave = () => {
    onSave(latex);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMove('up');
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMove('down');
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Math Equation Editor</DialogTitle>
          <DialogDescription>
            Use the keypad or your keyboard to build your equation. Click save to insert it.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div
                className={cn(
                    "math-input-container", // Parent class for specific CSS rule
                    "relative w-full min-h-[80px] rounded-md border border-input bg-secondary/50",
                    "flex items-center justify-center text-2xl", // Ensures vertical centering of KaTeX
                    "cursor-text",
                    error && "border-destructive"
                )}
                onClick={() => textareaRef.current?.focus()}
            >
                <div
                    ref={previewRef}
                    aria-hidden="true"
                    className={cn(
                        "p-4",
                        error && "text-destructive"
                    )}
                />
                <Textarea
                    ref={textareaRef}
                    value={latex}
                    onChange={(e) => setLatex(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        fontSize: '1.5rem', /* 24px, matches text-2xl */
                        lineHeight: '2rem', /* 32px, matches text-2xl */
                    }}
                    className={cn(
                        "absolute inset-0 z-10 p-4 w-full h-full",
                        "flex items-center justify-center", // This centers the text vertically and horizontally
                        "text-center font-mono text-transparent",
                        "resize-none border-none bg-transparent",
                        "selection:bg-blue-500/30",
                        "theme-aware-cursor", // Custom class for caret color
                        "ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    )}
                    placeholder=""
                    spellCheck="false"
                />
            </div>
            
            {error && <p className="text-xs text-destructive text-center font-mono p-2 bg-destructive/10 rounded-md">{error}</p>}
            
            <MathKeypad onInsert={handleInsert} onDelete={handleDelete} onMove={handleMove} onSave={handleSave} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Equation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
