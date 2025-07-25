// PromptHub - Vanilla JavaScript Implementation
class PromptHub {
    constructor() {
        this.prompts = this.loadFromStorage('prompts') || [];
        this.categories = this.loadFromStorage('categories') || ['General', 'Writing', 'Coding', 'Creative'];
        this.currentCategory = 'all';
        this.currentPrompt = null;
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.renderCategories();
        this.renderPrompts();
        this.bindEvents();
        this.updateCounts();
    }

    // Local Storage Methods
    saveToStorage(key, data) {
        localStorage.setItem(`prompthub_${key}`, JSON.stringify(data));
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(`prompthub_${key}`);
        return data ? JSON.parse(data) : null;
    }

    // Event Binding
    bindEvents() {
        // Modal controls
        document.getElementById('addPromptBtn').addEventListener('click', () => this.openPromptModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closePromptModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closePromptModal());
        document.getElementById('saveBtn').addEventListener('click', () => this.savePrompt());
        document.getElementById('deleteBtn').addEventListener('click', () => this.showDeleteConfirmation());

        // Category modal
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('saveCategoryBtn').addEventListener('click', () => this.saveCategory());

        // Delete confirmation modal
        document.getElementById('closeDeleteModal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.deletePrompt());

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderPrompts();
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportPrompts());

        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Enter key in category input
        document.getElementById('categoryName').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveCategory();
            }
        });
    }

    // Category Management
    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        const allPromptsItem = categoriesList.querySelector('[data-category="all"]');
        
        // Clear existing categories except "All Prompts"
        const existingCategories = categoriesList.querySelectorAll('.category-item:not([data-category="all"])');
        existingCategories.forEach(item => item.remove());

        // Render categories
        this.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = `category-item ${this.currentCategory === category ? 'active' : ''}`;
            categoryItem.setAttribute('data-category', category);
            
            const count = this.prompts.filter(p => p.category === category).length;
            
            categoryItem.innerHTML = `
                <span class="category-name">${category}</span>
                <span class="category-count">${count}</span>
            `;
            
            categoryItem.addEventListener('click', () => this.selectCategory(category));
            categoriesList.appendChild(categoryItem);
        });

        // Update "All Prompts" active state
        allPromptsItem.classList.toggle('active', this.currentCategory === 'all');
        allPromptsItem.addEventListener('click', () => this.selectCategory('all'));

        // Update category dropdown in prompt modal
        this.updateCategoryDropdown();
    }

    updateCategoryDropdown() {
        const select = document.getElementById('promptCategory');
        select.innerHTML = '<option value="">Select category...</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    selectCategory(category) {
        this.currentCategory = category;
        this.renderCategories();
        this.renderPrompts();
    }

    openCategoryModal() {
        document.getElementById('categoryModal').classList.add('show');
        document.getElementById('categoryName').focus();
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('show');
        document.getElementById('categoryName').value = '';
    }

    saveCategory() {
        const categoryName = document.getElementById('categoryName').value.trim();
        
        if (!categoryName) {
            this.showToast('Please enter a category name', 'error');
            return;
        }

        if (this.categories.includes(categoryName)) {
            this.showToast('Category already exists', 'error');
            return;
        }

        this.categories.push(categoryName);
        this.saveToStorage('categories', this.categories);
        this.renderCategories();
        this.closeCategoryModal();
        this.showToast('Category added successfully', 'success');
    }

    // Prompt Management
    renderPrompts() {
        const promptsGrid = document.getElementById('promptsGrid');
        const emptyState = document.getElementById('emptyState');
        
        let filteredPrompts = this.prompts;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filteredPrompts = filteredPrompts.filter(p => p.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            filteredPrompts = filteredPrompts.filter(p => 
                p.title.toLowerCase().includes(this.searchQuery) ||
                p.content.toLowerCase().includes(this.searchQuery) ||
                p.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        // Clear existing prompts
        const existingCards = promptsGrid.querySelectorAll('.prompt-card');
        existingCards.forEach(card => card.remove());

        if (filteredPrompts.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            
            filteredPrompts.forEach(prompt => {
                const promptCard = this.createPromptCard(prompt);
                promptsGrid.appendChild(promptCard);
            });
        }

        this.updateCounts();
    }

    createPromptCard(prompt) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.addEventListener('click', () => this.openPromptModal(prompt));

        const tagsHtml = prompt.tags.map(tag => 
            `<span class="prompt-tag">${tag}</span>`
        ).join('');

        card.innerHTML = `
            <div class="prompt-card-header">
                <h3 class="prompt-title">${prompt.title}</h3>
                <span class="prompt-category">${prompt.category}</span>
            </div>
            <p class="prompt-content">${prompt.content}</p>
            <div class="prompt-tags">${tagsHtml}</div>
        `;

        return card;
    }

    openPromptModal(prompt = null) {
        this.currentPrompt = prompt;
        const modal = document.getElementById('promptModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteBtn');

        if (prompt) {
            modalTitle.textContent = 'Edit Prompt';
            document.getElementById('promptTitle').value = prompt.title;
            document.getElementById('promptCategory').value = prompt.category;
            document.getElementById('promptTags').value = prompt.tags.join(', ');
            document.getElementById('promptContent').value = prompt.content;
            deleteBtn.style.display = 'inline-block';
        } else {
            modalTitle.textContent = 'Add New Prompt';
            document.getElementById('promptTitle').value = '';
            document.getElementById('promptCategory').value = '';
            document.getElementById('promptTags').value = '';
            document.getElementById('promptContent').value = '';
            deleteBtn.style.display = 'none';
        }

        modal.classList.add('show');
        document.getElementById('promptTitle').focus();
    }

    closePromptModal() {
        document.getElementById('promptModal').classList.remove('show');
        this.currentPrompt = null;
    }

    savePrompt() {
        const title = document.getElementById('promptTitle').value.trim();
        const category = document.getElementById('promptCategory').value;
        const tagsInput = document.getElementById('promptTags').value.trim();
        const content = document.getElementById('promptContent').value.trim();

        if (!title || !category || !content) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const promptData = {
            id: this.currentPrompt ? this.currentPrompt.id : Date.now().toString(),
            title,
            category,
            tags,
            content,
            createdAt: this.currentPrompt ? this.currentPrompt.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.currentPrompt) {
            // Update existing prompt
            const index = this.prompts.findIndex(p => p.id === this.currentPrompt.id);
            this.prompts[index] = promptData;
            this.showToast('Prompt updated successfully', 'success');
        } else {
            // Add new prompt
            this.prompts.push(promptData);
            this.showToast('Prompt added successfully', 'success');
        }

        this.saveToStorage('prompts', this.prompts);
        this.renderPrompts();
        this.renderCategories();
        this.closePromptModal();
    }

    showDeleteConfirmation() {
        document.getElementById('deleteModal').classList.add('show');
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('show');
    }

    deletePrompt() {
        if (!this.currentPrompt) return;

        this.prompts = this.prompts.filter(p => p.id !== this.currentPrompt.id);
        this.saveToStorage('prompts', this.prompts);
        this.renderPrompts();
        this.renderCategories();
        this.closeDeleteModal();
        this.closePromptModal();
        this.showToast('Prompt deleted successfully', 'success');
    }

    // Export Functionality
    async exportPrompts() {
        if (this.prompts.length === 0) {
            this.showToast('No prompts to export', 'error');
            return;
        }

        const exportModal = document.getElementById('exportModal');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        exportModal.classList.add('show');
        progressFill.style.width = '0%';
        progressText.textContent = 'Preparing export...';

        try {
            const zip = new JSZip();
            const totalPrompts = this.prompts.length;

            // Create folders for each category
            const categoryFolders = {};
            this.categories.forEach(category => {
                categoryFolders[category] = zip.folder(category);
            });

            // Add prompts to ZIP
            for (let i = 0; i < this.prompts.length; i++) {
                const prompt = this.prompts[i];
                const progress = ((i + 1) / totalPrompts) * 80; // 80% for processing
                
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Processing prompt ${i + 1} of ${totalPrompts}...`;

                // Create filename (sanitize for file system)
                const sanitizedTitle = prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `${sanitizedTitle}_${prompt.id}.txt`;

                // Create file content
                const fileContent = `Title: ${prompt.title}
Category: ${prompt.category}
Tags: ${prompt.tags.join(', ')}
Created: ${new Date(prompt.createdAt).toLocaleString()}
Updated: ${new Date(prompt.updatedAt).toLocaleString()}

Content:
${prompt.content}`;

                // Add to appropriate category folder
                const folder = categoryFolders[prompt.category];
                folder.file(filename, fileContent);

                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            progressFill.style.width = '90%';
            progressText.textContent = 'Generating ZIP file...';

            // Generate ZIP
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            progressFill.style.width = '100%';
            progressText.textContent = 'Download starting...';

            // Download ZIP
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prompthub_export_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Close modal and show success
            setTimeout(() => {
                exportModal.classList.remove('show');
                this.showToast(`Successfully exported ${totalPrompts} prompts!`, 'success');
            }, 1000);

        } catch (error) {
            console.error('Export failed:', error);
            exportModal.classList.remove('show');
            this.showToast('Export failed. Please try again.', 'error');
        }
    }

    // Utility Methods
    updateCounts() {
        // Update "All Prompts" count
        document.getElementById('allCount').textContent = this.prompts.length;

        // Update individual category counts
        this.categories.forEach(category => {
            const categoryItem = document.querySelector(`[data-category="${category}"]`);
            if (categoryItem) {
                const count = this.prompts.filter(p => p.category === category).length;
                const countElement = categoryItem.querySelector('.category-count');
                if (countElement) {
                    countElement.textContent = count;
                }
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.currentPrompt = null;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PromptHub();
});

// Add some sample data if no prompts exist
document.addEventListener('DOMContentLoaded', () => {
    const existingPrompts = localStorage.getItem('prompthub_prompts');
    if (!existingPrompts) {
        const samplePrompts = [
            {
                id: '1',
                title: 'Creative Writing Assistant',
                category: 'Writing',
                tags: ['creative', 'storytelling', 'fiction'],
                content: 'You are a creative writing assistant. Help me develop compelling characters, engaging plots, and vivid descriptions for my stories. Focus on creating emotional depth and narrative tension.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Code Review Expert',
                category: 'Coding',
                tags: ['code-review', 'best-practices', 'optimization'],
                content: 'Review the following code for best practices, potential bugs, performance issues, and suggest improvements. Provide specific recommendations with explanations.',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Marketing Copy Generator',
                category: 'Creative',
                tags: ['marketing', 'copywriting', 'persuasive'],
                content: 'Create compelling marketing copy that converts. Focus on benefits over features, use emotional triggers, and include clear calls-to-action. Target audience: [specify audience].',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('prompthub_prompts', JSON.stringify(samplePrompts));
    }
});