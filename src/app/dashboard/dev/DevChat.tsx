
'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ChatMessage = {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  authorPhotoURL?: string | null;
  timestamp: Timestamp | null; // Allow null for messages being sent
};

export function DevChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const q = query(collection(db, 'dev_chat'), orderBy('timestamp', 'asc'));

    // Listen for real-time updates, including metadata changes to get local writes immediately.
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
            id: doc.id,
            text: data.text,
            authorName: data.authorName,
            authorId: data.authorId,
            authorPhotoURL: data.authorPhotoURL,
            // The timestamp will be null for local pending writes
            timestamp: data.timestamp,
        });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !user) return;

    const textToSend = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    try {
      await addDoc(collection(db, 'dev_chat'), {
        text: textToSend,
        authorName: user.displayName || 'Dev User',
        authorId: user.uid,
        authorPhotoURL: user.photoURL,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(textToSend); // Restore message on error
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Chat</CardTitle>
        <CardDescription>A real-time chat for the dev team.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.authorId === user?.uid ? 'justify-end' : ''}`}
              >
                {msg.authorId !== user?.uid && (
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={msg.authorPhotoURL || undefined} />
                     <AvatarFallback>{msg.authorName.charAt(0)}</AvatarFallback>
                   </Avatar>
                )}
                <div
                  className={`flex flex-col ${msg.authorId === user?.uid ? 'items-end' : 'items-start'}`}
                >
                  {msg.authorId !== user?.uid && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {msg.authorName}
                    </p>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-xs sm:max-w-sm break-words ${
                      msg.authorId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <p className="text-xs text-muted-foreground">
                        {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}
                     </p>
                  </div>
                </div>
                 {msg.authorId === user?.uid && (
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={msg.authorPhotoURL || undefined} />
                     <AvatarFallback><UserIcon /></AvatarFallback>
                   </Avatar>
                )}
              </div>
            ))}
             <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleFormSubmit} className="w-full flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
