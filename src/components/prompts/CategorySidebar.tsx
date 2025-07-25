import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Hash, Folder } from 'lucide-react';
import { Category } from '../../types/prompt';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onAddCategory: (name: string) => void;
}

export function CategorySidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  onAddCategory 
}: CategorySidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    } else if (e.key === 'Escape') {
      setIsAddingCategory(false);
      setNewCategoryName('');
    }
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground mb-3">Categories</h2>
        <Button
          onClick={() => setIsAddingCategory(true)}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* All Prompts */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`sidebar-item w-full ${selectedCategory === null ? 'active' : ''}`}
          >
            <Hash className="h-4 w-4" />
            <span>All Prompts</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {categories.reduce((sum, cat) => sum + cat.promptCount, 0)}
            </Badge>
          </button>

          {/* Category List */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.name)}
              className={`sidebar-item w-full ${selectedCategory === category.name ? 'active' : ''}`}
            >
              <Folder className="h-4 w-4" />
              <span className="truncate">{category.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {category.promptCount}
              </Badge>
            </button>
          ))}

          {/* Add Category Input */}
          {isAddingCategory && (
            <div className="p-2 space-y-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Category name..."
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleAddCategory} size="sm" className="flex-1">
                  Add
                </Button>
                <Button 
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}