'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type Deck = {
  id: string;
  hashtags?: string;
};

type EditHashtagsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck | null;
};

export function EditHashtagsDialog({ isOpen, onClose, deck }: EditHashtagsDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [hashtags, setHashtags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (deck) {
      setHashtags(deck.hashtags || '');
    }
  }, [deck]);

  const handleSuggestHashtags = async () => {
    toast({
        title: 'Feature Temporarily Unavailable',
        description: 'AI hashtag suggestions are offline while we resolve a package issue. Please check back later.',
    });
  };

  const handleSave = async () => {
    if (!user || !deck) return;

    setIsSaving(true);
    const deckDocRef = doc(db, 'users', user.uid, 'flashcardDecks', deck.id);

    try {
      await updateDoc(deckDocRef, {
        hashtags: hashtags
      });
      toast({
        title: "Hashtags Updated!",
        description: `Your tags have been saved.`,
      });
      onClose();
    } catch (error) {
      console.error("Error updating hashtags:", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your hashtags. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            onClose();
        }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Hashtags</DialogTitle>
          <DialogDescription>
            Organize your deck with hashtags. Separate them with spaces, like #history #ww2.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="deck-hashtags">Hashtags</Label>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={handleSuggestHashtags}>
                    <Lightbulb className="h-5 w-5" />
                    <span className="sr-only">Suggest Hashtags</span>
                </Button>
                <Input
                    id="deck-hashtags"
                    placeholder="#history #ww2 #midterm"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
