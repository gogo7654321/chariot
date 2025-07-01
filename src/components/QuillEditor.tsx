
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  toolbarId: string;
  onFocus?: (quill: Quill | null) => void;
  onMount?: (quill: Quill | null) => void;
  isEnabled?: boolean;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  toolbarId,
  onFocus,
  onMount,
  isEnabled = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isMountedRef = useRef(false);

  // This useCallback will be stable as long as onChange doesn't change.
  const textChangeHandler = useCallback((delta, oldDelta, source) => {
    if (source === 'user' && quillRef.current) {
      onChange(quillRef.current.root.innerHTML);
    }
  }, [onChange]);
  
  const selectionChangeHandler = useCallback((range) => {
    if (onFocus) {
      onFocus(range ? quillRef.current : null);
    }
  }, [onFocus]);

  // Effect for initialization, runs only once on mount.
  useEffect(() => {
    if (!isMountedRef.current && editorRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: { toolbar: { container: `#${toolbarId}` } },
        placeholder: 'Enter content here...',
      });
      quillRef.current = quill;
      if (onMount) onMount(quill);
    }
    isMountedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is crucial.

  // Effect for setting up and cleaning up listeners.
  useEffect(() => {
    const quill = quillRef.current;
    if (quill) {
      quill.on('text-change', textChangeHandler);
      quill.on('selection-change', selectionChangeHandler);
    }
    // Cleanup
    return () => {
      if (quill) {
        quill.off('text-change', textChangeHandler);
        quill.off('selection-change', selectionChangeHandler);
      }
    };
  }, [textChangeHandler, selectionChangeHandler]);

  // Effect to sync the `value` prop with the editor's content.
  useEffect(() => {
    const quill = quillRef.current;
    if (quill) {
      if (quill.root.innerHTML !== value) {
        const delta = quill.clipboard.convert(value as any);
        quill.setContents(delta, 'silent');
      }
    }
  }, [value]);

  // Effect to enable or disable the editor.
  useEffect(() => {
    const quill = quillRef.current;
    if (quill) {
      quill.enable(isEnabled);
    }
  }, [isEnabled]);

  return (
    <div className="quill-container rounded-md overflow-hidden border border-input bg-background">
      <div ref={editorRef} style={{ minHeight: '150px' }} />
    </div>
  );
};

export default QuillEditor;
