
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Flashcard = {
    term: string;
    definition: string;
};

type ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
};

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return '';
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    } catch(e) {
        return html;
    }
};

export function ExportDialog({ isOpen, onClose, cards }: ExportDialogProps) {
  const { toast } = useToast();
  const [termSeparator, setTermSeparator] = useState('\t');
  const [customTermSeparator, setCustomTermSeparator] = useState('-');
  const [isCustomTerm, setIsCustomTerm] = useState(false);

  const [rowSeparator, setRowSeparator] = useState('\n');
  const [customRowSeparator, setCustomRowSeparator] = useState('\\n\\n');
  const [isCustomRow, setIsCustomRow] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Reset copy state when dialog re-opens or cards change
    setIsCopied(false);
  }, [isOpen, cards]);

  const finalTermSeparator = useMemo(() => {
    return isCustomTerm ? customTermSeparator : termSeparator;
  }, [isCustomTerm, termSeparator, customTermSeparator]);
  
  const finalRowSeparator = useMemo(() => {
    const separator = isCustomRow ? customRowSeparator : rowSeparator;
    return separator.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  }, [isCustomRow, rowSeparator, customRowSeparator]);

  const exportedText = useMemo(() => {
    if (!cards) return "";
    return cards
      .map(card => `${stripHtml(card.term)}${finalTermSeparator}${stripHtml(card.definition)}`)
      .join(finalRowSeparator);
  }, [cards, finalTermSeparator, finalRowSeparator]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedText).then(() => {
      setIsCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setIsCopied(false), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast({ variant: 'destructive', title: "Failed to copy", description: "Could not copy text to clipboard."});
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export flashcards</DialogTitle>
          <DialogDescription>
            Select how you want to export your flashcard content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Term Separator Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Between term and definition</h4>
            <RadioGroup 
                defaultValue="\t" 
                onValueChange={(value) => {
                    if(value !== 'custom') {
                        setIsCustomTerm(false);
                        setTermSeparator(value);
                    }
                }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="\t" id="term-tab" checked={!isCustomTerm} />
                <Label htmlFor="term-tab">Tab</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="," id="term-comma" checked={!isCustomTerm && termSeparator === ','} onClick={() => setTermSeparator(',')} />
                <Label htmlFor="term-comma">Comma</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="term-custom" checked={isCustomTerm} onClick={() => setIsCustomTerm(true)} />
                <Input 
                    id="term-custom-input"
                    value={customTermSeparator}
                    onChange={(e) => setCustomTermSeparator(e.target.value)}
                    onFocus={() => setIsCustomTerm(true)}
                    className="h-9"
                    placeholder="Custom"
                />
              </div>
            </RadioGroup>
          </div>
          
          {/* Row Separator Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Between rows</h4>
             <RadioGroup 
                defaultValue="\n" 
                onValueChange={(value) => {
                     if(value !== 'custom') {
                        setIsCustomRow(false);
                        setRowSeparator(value);
                    }
                }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="\n" id="row-newline" checked={!isCustomRow} />
                <Label htmlFor="row-newline">New line</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value=";" id="row-semicolon" checked={!isCustomRow && rowSeparator === ';'} onClick={() => setRowSeparator(';')}/>
                <Label htmlFor="row-semicolon">Semicolon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="row-custom" checked={isCustomRow} onClick={() => setIsCustomRow(true)} />
                <Input 
                    id="row-custom-input"
                    value={customRowSeparator}
                    onChange={(e) => setCustomRowSeparator(e.target.value)}
                    onFocus={() => setIsCustomRow(true)}
                    className="h-9"
                    placeholder="Custom"
                />
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="space-y-2">
            <Label>Copy and paste the text below. It is read-only.</Label>
            <Textarea readOnly value={exportedText} className="h-48 font-mono text-xs" />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCopyToClipboard}>
            {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {isCopied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
