import { useState, useMemo } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { Search, Plus, Download, Sparkles } from 'lucide-react';
import { PromptCard } from './components/prompts/PromptCard';
import { PromptDialog } from './components/prompts/PromptDialog';
import { CategorySidebar } from './components/prompts/CategorySidebar';
import { ExportProgress } from './components/prompts/ExportProgress';
import { useLocalStorage } from './hooks/useLocalStorage';
import { exportPromptsToZip } from './utils/export';
import { Prompt, Category, ExportProgress as ExportProgressType } from './types/prompt';

function App() {
  const { toast } = useToast();
  
  // Local storage state
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', [
    { id: '1', name: 'General', color: '#6366F1', promptCount: 0 },
    { id: '2', name: 'Writing', color: '#F59E0B', promptCount: 0 },
    { id: '3', name: 'Coding', color: '#10B981', promptCount: 0 },
    { id: '4', name: 'Marketing', color: '#EF4444', promptCount: 0 }
  ]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [promptDialog, setPromptDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit' | 'view';
    prompt?: Prompt;
  }>({ open: false, mode: 'create' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; promptId?: string }>({ open: false });
  const [exportProgress, setExportProgress] = useState<ExportProgressType>({
    current: 0,
    total: 0,
    status: 'preparing',
    message: ''
  });
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Update category counts
  const updatedCategories = useMemo(() => {
    return categories.map(category => ({
      ...category,
      promptCount: prompts.filter(prompt => prompt.category === category.name).length
    }));
  }, [categories, prompts]);

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === null || prompt.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [prompts, searchQuery, selectedCategory]);

  const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (promptDialog.mode === 'create') {
      const newPrompt: Prompt = {
        ...promptData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };
      setPrompts(prev => [...prev, newPrompt]);
      toast({
        title: 'Prompt added',
        description: 'Your prompt has been saved successfully.'
      });
    } else if (promptDialog.mode === 'edit' && promptDialog.prompt) {
      const updatedPrompt: Prompt = {
        ...promptDialog.prompt,
        ...promptData,
        updatedAt: now
      };
      setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
      toast({
        title: 'Prompt updated',
        description: 'Your changes have been saved successfully.'
      });
    }
    
    setPromptDialog({ open: false, mode: 'create' });
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    setDeleteDialog({ open: false });
    toast({
      title: 'Prompt deleted',
      description: 'The prompt has been removed successfully.'
    });
  };

  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color: '#6366F1',
      promptCount: 0
    };
    setCategories(prev => [...prev, newCategory]);
    toast({
      title: 'Category added',
      description: `Category "${name}" has been created.`
    });
  };

  const handleExport = async () => {
    if (prompts.length === 0) {
      toast({
        title: 'No prompts to export',
        description: 'Add some prompts first before exporting.',
        variant: 'destructive'
      });
      return;
    }

    setShowExportDialog(true);
    setExportProgress({
      current: 0,
      total: prompts.length,
      status: 'preparing',
      message: 'Preparing export...'
    });

    try {
      await exportPromptsToZip(prompts, (current, total, message) => {
        setExportProgress({
          current,
          total,
          status: current === total ? 'complete' : 'processing',
          message
        });
      });

      toast({
        title: 'Export successful',
        description: `${prompts.length} prompts exported successfully.`
      });

      // Auto-close dialog after 2 seconds
      setTimeout(() => {
        setShowExportDialog(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress(prev => ({
        ...prev,
        status: 'error',
        message: 'Export failed. Please try again.'
      }));
      
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting prompts.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">PromptHub</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {prompts.length} prompts
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <CategorySidebar
          categories={updatedCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onAddCategory={handleAddCategory}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-border">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Prompts Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery || selectedCategory ? 'No prompts found' : 'No prompts yet'}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  {searchQuery || selectedCategory 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start building your prompt library by adding your first prompt.'
                  }
                </p>
                {!searchQuery && !selectedCategory && (
                  <Button 
                    onClick={() => setPromptDialog({ open: true, mode: 'create' })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Prompt
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={(prompt) => setPromptDialog({ open: true, mode: 'edit', prompt })}
                    onDelete={(id) => setDeleteDialog({ open: true, promptId: id })}
                    onClick={(prompt) => setPromptDialog({ open: true, mode: 'view', prompt })}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => setPromptDialog({ open: true, mode: 'create' })}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <PromptDialog
        open={promptDialog.open}
        onOpenChange={(open) => setPromptDialog(prev => ({ ...prev, open }))}
        prompt={promptDialog.prompt}
        categories={updatedCategories}
        onSave={handleSavePrompt}
        mode={promptDialog.mode}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prompt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.promptId && handleDeletePrompt(deleteDialog.promptId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportProgress
        open={showExportDialog}
        progress={exportProgress}
        onClose={() => setShowExportDialog(false)}
      />

      <Toaster />
    </div>
  );
}

export default App;