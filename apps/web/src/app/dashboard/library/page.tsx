'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Library,
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Bot,
  User,
  X,
} from 'lucide-react';

import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LibraryCatalogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAiRecOpen, setIsAiRecOpen] = useState(false);

  const [interests, setInterests] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);

  // Fetch Books Catalog
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books', search],
    queryFn: async () => {
      const res = await apiClient.get('/library', {
        params: { search: search || undefined },
      });
      return res.data.data;
    },
  });

  // Add Book Mutation
  const { register, handleSubmit, reset } = useForm();
  const addBookMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await apiClient.post('/library', formData);
      return res.data.data;
    },
    onSuccess: (newBook) => {
      toast.success(`Book '${newBook.title}' added to library catalog!`);
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsBookModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add book');
    },
  });

  // AI Recommender Mutation
  const recMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/library/ai/recommendations', { interests });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAiRecommendations(data.recommendations);
      toast.success('AI Book recommendations ready!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to get recommendations');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Library className="w-6 h-6 text-brand-400" /> Digital Library Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search institution library books, barcode copies, borrowing logs, and AI reading suggestions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setAiRecommendations(null);
              setIsAiRecOpen(true);
            }}
            variant="outline"
            className="gap-2 border-ai/50 text-ai hover:bg-ai/10"
          >
            <Bot className="w-4 h-4 text-ai" /> AI Recommender
          </Button>

          <Button onClick={() => setIsBookModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Book
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by book title, author, or category..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 skeleton rounded-2xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <Card className="border-dashed border-2 p-12 text-center">
          <CardContent className="space-y-3">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-base font-semibold text-foreground">No Books Found in Catalog</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add your first textbook or academic reference book to start issuing copies.
            </p>
            <Button onClick={() => setIsBookModalOpen(true)} variant="outline" className="mt-2">
              Add First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book: any) => (
            <Card
              key={book.id}
              className="border-border/60 hover:border-brand-500/50 transition-all group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {book.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Copies: <span className="font-bold text-foreground">{book.totalCopies}</span>
                  </span>
                </div>

                <CardTitle className="text-base font-bold mt-2 group-hover:text-brand-400 transition-colors">
                  {book.title}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <User className="w-3 h-3 text-brand-400" /> {book.author}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 text-xs text-muted-foreground">
                {book.isbn && <p className="font-mono text-[11px]">ISBN: {book.isbn}</p>}
                <Button variant="secondary" size="sm" className="w-full text-xs font-semibold mt-3">
                  View Book Copies →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border relative animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold">Add Book to Catalog</CardTitle>
                <CardDescription>Register a new book for the library system</CardDescription>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit((d) => addBookMutation.mutate(d))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title</Label>
                  <Input id="title" placeholder="Introduction to Algorithms" required {...register('title')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" placeholder="Thomas H. Cormen" required {...register('author')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" placeholder="Computer Science" required {...register('category')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN (Optional)</Label>
                    <Input id="isbn" placeholder="978-0262033848" {...register('isbn')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalCopies">Total Copies</Label>
                    <Input id="totalCopies" type="number" defaultValue={5} {...register('totalCopies', { valueAsNumber: true })} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addBookMutation.isPending}>
                    {addBookMutation.isPending ? 'Adding...' : 'Add Book'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Book Recommender Modal */}
      {isAiRecOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl border-ai/50 relative animate-fade-in my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ai/20 flex items-center justify-center text-ai border border-ai/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">AI Book Recommender</CardTitle>
                  <CardDescription>Curated academic book suggestions based on interests</CardDescription>
                </div>
              </div>
              <button
                onClick={() => setIsAiRecOpen(false)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interests">Study Interests / Subjects</Label>
                <Input
                  id="interests"
                  placeholder="e.g. Artificial Intelligence, Neural Networks, Quantum Computing"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              <Button
                onClick={() => recMutation.mutate()}
                disabled={recMutation.isPending || !interests}
                className="w-full bg-ai hover:bg-ai/90 text-white font-semibold gap-2 mt-2 shadow-lg shadow-ai/20"
              >
                <Bot className="w-4 h-4" />
                {recMutation.isPending ? 'Recommending Books...' : 'Get AI Reading List'}
              </Button>

              {aiRecommendations && (
                <div className="p-4 rounded-xl border border-ai/30 bg-ai/5 space-y-2 text-xs mt-4">
                  <div className="font-bold text-ai flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4" /> Recommended Books Rationale:
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-foreground/90 bg-background/50 p-4 rounded-lg border border-border/60 text-xs leading-relaxed max-h-64 overflow-y-auto">
                    {aiRecommendations}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
