
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type Quill from 'quill';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle, ArrowRightLeft, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const QuillEditor = dynamic(() => import('@/components/QuillEditor'), {
    ssr: false,
    loading: () => <Skeleton className="h-[150px] w-full rounded-md" />,
});

const MathInputDialog = dynamic(() => import('@/components/MathInputDialog'), {
    ssr: false,
});

const FlashcardPreview = dynamic(() => import('./FlashcardPreview'), {
    ssr: false,
    loading: () => null,
});


type FlashcardState = {
    id: number;
    term: string;
    definition: string;
    hint: string;
    options: string[];
    cardType: 'term-definition' | 'multiple-choice' | 'fill-in-the-blank';
};

type CardEditorProps = {
    index: number;
    card: FlashcardState;
    onUpdate: (id: number, field: 'term' | 'definition' | 'hint' | 'cardType', value: string) => void;
    onDelete: (id: number) => void;
    onSwap: (id: number) => void;
    onOptionChange: (cardId: number, optionIndex: number, value: string) => void;
    onAddOption: (cardId: number) => void;
    onRemoveOption: (cardId: number, optionIndex: number) => void;
};

const cardTypeLabels = {
    'term-definition': { term: 'TERM', definition: 'DEFINITION' },
    'multiple-choice': { term: 'QUESTION', definition: 'CORRECT ANSWER' },
    'fill-in-the-blank': { term: 'SENTENCE WITH BLANK', definition: 'ANSWER (FILL-IN)' },
};

export function CardEditor({ index, card, onUpdate, onDelete, onSwap, onOptionChange, onAddOption, onRemoveOption }: CardEditorProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isHintVisible, setIsHintVisible] = useState(!!card.hint);
    const [activeEditor, setActiveEditor] = useState<Quill | null>(null);
    const [isMathDialogOpen, setIsMathDialogOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    const [activeFormats, setActiveFormats] = useState({});
    
    const toolbarId = `toolbar-${card.id}`;
    
    const handleMathSave = (latex: string) => {
        if (activeEditor) {
            const range = activeEditor.getSelection(true);
            activeEditor.insertEmbed(range.index, 'formula', latex);
            activeEditor.setSelection(range.index + 1, 0);
        }
    };

    const updateColorIcons = (formats: any) => {
        const toolbarEl = document.getElementById(toolbarId);
        if (!toolbarEl) return;

        const colorPicker = toolbarEl.querySelector('.ql-color:not(.ql-picker-options)');
        if (colorPicker) {
            const colorStroke = colorPicker.querySelector('.ql-stroke');
            if (colorStroke) {
                (colorStroke as HTMLElement).style.stroke = formats.color || "";
            }
        }

        const backgroundPicker = toolbarEl.querySelector('.ql-background:not(.ql-picker-options)');
        if (backgroundPicker) {
            const backgroundFill = backgroundPicker.querySelector('.ql-fill');
            if (backgroundFill) {
                (backgroundFill as HTMLElement).style.fill = formats.background || "";
            }
        }
    };

    const setupQuillHandlers = (quill: Quill | null) => {
        if (quill) {
            const toolbar = quill.getModule('toolbar');
            
            toolbar.addHandler('formula', () => {
                if (quill.hasFocus()) {
                    setActiveEditor(quill);
                    setIsMathDialogOpen(true);
                }
            });
            
            const updateActiveFormats = () => {
                const range = quill.getSelection();
                if (range) {
                    const formats = quill.getFormat(range.index, range.length);
                    setActiveFormats(formats);
                }
            };
            
            quill.on('selection-change', updateActiveFormats);
            quill.on('text-change', updateActiveFormats);
            updateActiveFormats();
        }
    };

    useEffect(() => {
        updateColorIcons(activeFormats);
    }, [activeFormats, toolbarId]);

    useEffect(() => {
        setIsHintVisible(!!card.hint);
    }, [card.hint]);

    const stripHtml = (html: string) => {
        if (typeof window === 'undefined') return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <>
            <FlashcardPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                term={card.term}
                definition={card.definition}
            />
            <Card className="overflow-visible relative">
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsPreviewOpen(true)}>
                        <Eye className="h-5 w-5" />
                        <span className="sr-only">Preview Card</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSwap(card.id)}>
                        <ArrowRightLeft className="h-5 w-5" />
                        <span className="sr-only">Swap Term and Definition</span>
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                        <span className="sr-only">{isMinimized ? "Expand" : "Collapse"} Card</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(card.id)}>
                        <Trash2 className="h-5 w-5 text-destructive" />
                        <span className="sr-only">Delete Card</span>
                    </Button>
                </div>

                <div className={isMinimized ? 'block' : 'hidden'}>
                     <div className="flex items-center p-3 pr-44">
                        <span className="font-bold text-lg mr-4">{index}</span>
                        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 flex-grow min-w-0">
                            <div className="flex items-baseline gap-2 min-w-0">
                                <span className="font-medium text-sm text-muted-foreground whitespace-nowrap">Term:</span>
                                <p className="text-sm min-w-0 break-words" title={stripHtml(card.term)}>{stripHtml(card.term) || "..."}</p>
                            </div>
                             <div className="flex items-baseline gap-2 min-w-0">
                                <span className="font-medium text-sm text-muted-foreground whitespace-nowrap">Definition:</span>
                                <p className="text-sm text-muted-foreground min-w-0 break-words" title={stripHtml(card.definition)}>{stripHtml(card.definition) || "..."}</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-medium text-sm text-muted-foreground whitespace-nowrap">Type:</span>
                                <Badge variant="outline" className="capitalize text-xs">{card.cardType.replace('-', ' ')}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cn(isMinimized && 'hidden')}>
                    <MathInputDialog isOpen={isMathDialogOpen} onClose={() => setIsMathDialogOpen(false)} onSave={handleMathSave} />
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between p-4 border-b gap-2">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">{index}</span>
                            <Select value={card.cardType} onValueChange={(value) => onUpdate(card.id, 'cardType', value)}>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Card Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="term-definition">Term / Definition</SelectItem>
                                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                    <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div id={toolbarId} className="floating-toolbar">
                            <span className="ql-formats">
                                <select className="ql-header" defaultValue="">
                                    <option value="1">H1</option>
                                    <option value="2">H2</option>
                                    <option value="3">H3</option>
                                    <option value="">Normal</option>
                                </select>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-bold"></button>
                                <button className="ql-italic"></button>
                                <button className="ql-underline"></button>
                            </span>
                            <span className="ql-formats">
                                <select className="ql-color"></select>
                                <select className="ql-background"></select>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-list" value="ordered"></button>
                                <button className="ql-list" value="bullet"></button>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-link"></button>
                                <button className="ql-formula"></button>
                            </span>
                        </div>
                        <div className="w-[220px] hidden lg:block" />
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        
                        {card.cardType === 'term-definition' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="w-full space-y-2">
                                    <Label className="font-semibold text-muted-foreground">{cardTypeLabels[card.cardType].term}</Label>
                                    <QuillEditor
                                        isEnabled={!isMinimized}
                                        value={card.term}
                                        onChange={(val) => onUpdate(card.id, 'term', val || '')}
                                        toolbarId={toolbarId}
                                        onFocus={setActiveEditor}
                                        onMount={setupQuillHandlers}
                                    />
                                </div>
                                <div className="w-full space-y-2">
                                    <Label className="font-semibold text-muted-foreground">{cardTypeLabels[card.cardType].definition}</Label>
                                    <QuillEditor
                                        isEnabled={!isMinimized}
                                        value={card.definition}
                                        onChange={(val) => onUpdate(card.id, 'definition', val || '')}
                                        toolbarId={toolbarId}
                                        onFocus={setActiveEditor}
                                        onMount={setupQuillHandlers}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-muted-foreground">{cardTypeLabels[card.cardType].term}</Label>
                                    {card.cardType === 'fill-in-the-blank' ? (
                                        <Textarea 
                                            placeholder="e.g. The powerhouse of the cell is the ___."
                                            value={card.term}
                                            onChange={(e) => onUpdate(card.id, 'term', e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <QuillEditor
                                            isEnabled={!isMinimized}
                                            value={card.term}
                                            onChange={(val) => onUpdate(card.id, 'term', val || '')}
                                            toolbarId={toolbarId}
                                            onFocus={setActiveEditor}
                                            onMount={setupQuillHandlers}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-semibold text-muted-foreground">{cardTypeLabels[card.cardType].definition}</Label>
                                     <QuillEditor
                                        className="quill-answer-box"
                                        isEnabled={!isMinimized}
                                        value={card.definition}
                                        onChange={(val) => onUpdate(card.id, 'definition', val || '')}
                                        toolbarId={toolbarId}
                                        onFocus={setActiveEditor}
                                        onMount={setupQuillHandlers}
                                    />
                                </div>
                            </div>
                        )}

                        {card.cardType === 'multiple-choice' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="font-semibold text-muted-foreground">OTHER OPTIONS (DISTRACTORS)</Label>
                                    {card.options.length === 0 && (
                                        <Button variant="secondary" size="sm" onClick={() => onAddOption(card.id)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add another option
                                        </Button>
                                    )}
                                </div>
                                
                                {card.options.map((option, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <Textarea 
                                            placeholder={`Distractor option ${i + 1}`}
                                            value={option}
                                            onChange={(e) => onOptionChange(card.id, i, e.target.value)}
                                            rows={1}
                                            className="min-h-10 resize-none"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => onRemoveOption(card.id, i)}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                                
                                {card.options.length > 0 && (
                                    <Button variant="secondary" size="sm" onClick={() => onAddOption(card.id)} className="mt-2">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add another option
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t">
                            {isHintVisible ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-semibold text-muted-foreground">HINT (OPTIONAL)</Label>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onUpdate(card.id, 'hint', '')}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete Hint</span>
                                        </Button>
                                    </div>
                                    <QuillEditor
                                        isEnabled={!isMinimized}
                                        value={card.hint}
                                        onChange={(val) => onUpdate(card.id, 'hint', val || '')}
                                        toolbarId={toolbarId}
                                        onFocus={setActiveEditor}
                                        onMount={setupQuillHandlers}
                                    />
                                </div>
                            ) : (
                                <Button variant="outline" onClick={() => setIsHintVisible(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Hint
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>
        </>
    );
}
