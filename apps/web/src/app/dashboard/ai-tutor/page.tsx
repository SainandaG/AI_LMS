'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AiTutorPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'flashcards' | 'notes'>('chat');

  // ─── Tab 1: AI Chatbot ────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; sources?: any[] }>>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Study Tutor. Ask me any doubt about your courses, lessons, or concepts!',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (userMsgs: any[]) => {
      const res = await apiClient.post('/ai/tutor', { messages: userMsgs });
      return res.data.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, sources: data.sources },
      ]);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'AI Chat response failed');
    },
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsgs = [...messages, { role: 'user' as const, content: inputMessage }];
    setMessages(newMsgs);
    setInputMessage('');

    chatMutation.mutate(newMsgs.map((m) => ({ role: m.role, content: m.content })));
  };

  // ─── Tab 2: AI Flashcards ────────────────────────────────────────────────
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [flashcards, setFlashcards] = useState<Array<{ question: string; answer: string }>>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const flashcardMutation = useMutation({
    mutationFn: async (topic: string) => {
      const res = await apiClient.post('/ai/flashcards', { topic, count: 5 });
      return res.data.data;
    },
    onSuccess: (cards) => {
      setFlashcards(cards);
      setCardIndex(0);
      setIsFlipped(false);
      toast.success('Generated 5 AI Flashcards!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate flashcards');
    },
  });

  // ─── Tab 3: AI Revision Notes ─────────────────────────────────────────────
  const [notesTopic, setNotesTopic] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);

  const notesMutation = useMutation({
    mutationFn: async (topic: string) => {
      const res = await apiClient.post('/ai/notes', { topic });
      return res.data.data;
    },
    onSuccess: (data) => {
      setGeneratedNotes(data.notes);
      toast.success('Revision notes generated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate notes');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-ai" /> AI Learning Tutor & Assistant
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          RAG-powered intelligent tutoring, automated flashcards, and instant revision notes
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/60 gap-4">
        {[
          { id: 'chat', label: 'RAG Doubts Chatbot', icon: Bot },
          { id: 'flashcards', label: 'AI Flashcards Deck', icon: HelpCircle },
          { id: 'notes', label: 'AI Revision Notes', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-all ${
                isActive
                  ? 'border-ai text-ai'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Chatbot */}
      {activeTab === 'chat' && (
        <Card className="border-border/60 h-[600px] flex flex-col justify-between">
          {/* Chat Messages */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-ai/20 text-ai border border-ai/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    m.role === 'user'
                      ? 'bg-gradient-brand text-white font-medium rounded-br-none'
                      : 'bg-accent/60 border border-border/60 text-foreground rounded-bl-none'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>

                  {m.sources && m.sources.length > 0 && (
                    <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                      <span className="font-bold text-ai">RAG Sources:</span>{' '}
                      {m.sources.map((s: any) => s.title).join(', ')}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 text-foreground">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3 items-center text-xs text-muted-foreground animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-ai/20 text-ai flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                AI Tutor is thinking...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border/60 bg-background/40">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <Input
                placeholder="Ask your AI tutor anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="h-11"
              />
              <Button type="submit" disabled={chatMutation.isPending} className="bg-ai hover:bg-ai/90 h-11 px-6">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Tab 2: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-ai" /> Flashcard Generator
              </CardTitle>
              <CardDescription>Enter a topic to generate active recall study cards</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (flashcardTopic) flashcardMutation.mutate(flashcardTopic);
                }}
                className="flex gap-3"
              >
                <Input
                  placeholder="e.g. Photosynthesis, Newton Laws, Operating System Threads"
                  value={flashcardTopic}
                  onChange={(e) => setFlashcardTopic(e.target.value)}
                />
                <Button type="submit" disabled={flashcardMutation.isPending} className="bg-ai hover:bg-ai/90 shrink-0">
                  {flashcardMutation.isPending ? 'Generating...' : 'Generate Deck'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {flashcards.length > 0 && (
            <div className="space-y-4 text-center">
              {/* Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="h-64 rounded-3xl border border-ai/40 bg-card/80 backdrop-blur-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-ai transition-all duration-300 shadow-2xl shadow-ai/10 relative select-none"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-ai mb-4">
                  {isFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                </span>

                <p className="text-lg font-bold text-foreground max-w-md">
                  {isFlipped ? flashcards[cardIndex]?.answer : flashcards[cardIndex]?.question}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((i) => Math.max(0, i - 1));
                  }}
                  disabled={cardIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <span className="text-xs font-medium text-muted-foreground">
                  Card {cardIndex + 1} of {flashcards.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((i) => Math.min(flashcards.length - 1, i + 1));
                  }}
                  disabled={cardIndex === flashcards.length - 1}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Revision Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-ai" /> AI Revision Notes Generator
              </CardTitle>
              <CardDescription>Generate instant academic revision sheets</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (notesTopic) notesMutation.mutate(notesTopic);
                }}
                className="flex gap-3"
              >
                <Input
                  placeholder="e.g. Quantum Mechanics Principles, Organic Chemistry Reactions"
                  value={notesTopic}
                  onChange={(e) => setNotesTopic(e.target.value)}
                />
                <Button type="submit" disabled={notesMutation.isPending} className="bg-ai hover:bg-ai/90 shrink-0">
                  {notesMutation.isPending ? 'Generating...' : 'Generate Notes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {generatedNotes && (
            <Card className="border-ai/30 bg-ai/5 p-6 animate-fade-in">
              <CardHeader className="p-0 pb-4 border-b border-border/60 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-ai flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Generated Revision Sheet
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedNotes);
                    toast.success('Notes copied to clipboard!');
                  }}
                  className="text-xs gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Copy Text
                </Button>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <pre className="whitespace-pre-wrap font-sans text-xs text-foreground/90 leading-relaxed max-h-[500px] overflow-y-auto">
                  {generatedNotes}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
