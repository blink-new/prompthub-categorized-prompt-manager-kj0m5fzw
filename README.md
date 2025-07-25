# PromptHub - Categorized Prompt Manager

A simple, standalone HTML/CSS/JavaScript application for managing AI prompts with categories, local storage, and export functionality.

## Features

✅ **Local Storage** - All prompts stored on your PC  
✅ **Category Management** - Organize prompts by custom categories  
✅ **Large Prompt Dialog** - Easy-to-read editing interface  
✅ **Search & Filter** - Find prompts quickly  
✅ **ZIP Export** - Export all prompts as individual TXT files  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **No Dependencies** - Runs directly in any modern browser  

## How to Use

### Option 1: Direct Download
1. Download all files (`index.html`, `styles.css`, `script.js`)
2. Open `index.html` in any modern web browser
3. Start adding your prompts!

### Option 2: Local Server (Recommended)
For better performance and to avoid CORS issues:

1. **Using Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Using Node.js:**
   ```bash
   npx serve .
   ```

3. **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

Then open `http://localhost:8000` in your browser.

## File Structure

```
prompthub/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # Complete JavaScript functionality
└── README.md       # This file
```

## Key Features Explained

### 🗂️ Category Management
- Create custom categories for organizing prompts
- Filter prompts by category or view all
- Automatic prompt counting per category

### 📝 Prompt Management
- Add, edit, and delete prompts
- Large, readable editing dialog
- Tag system for better organization
- Search across titles, content, and tags

### 💾 Local Storage
- All data stored in browser's localStorage
- No internet connection required
- Data persists between sessions

### 📦 Export Functionality
- Export all prompts to a ZIP file
- Each prompt saved as individual TXT file
- Organized by category folders
- Includes metadata (title, category, tags, dates)

### 🎨 Modern Design
- Clean, professional interface
- Responsive design for all devices
- Smooth animations and transitions
- Accessible color scheme

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Sample Data

The app includes 3 sample prompts on first run:
- Creative Writing Assistant
- Code Review Expert  
- Marketing Copy Generator

## Export Format

Exported TXT files include:
```
Title: [Prompt Title]
Category: [Category Name]
Tags: [tag1, tag2, tag3]
Created: [Creation Date]
Updated: [Last Modified Date]

Content:
[Full prompt content]
```

## Customization

### Colors
Edit the CSS custom properties in `styles.css`:
```css
:root {
  --primary: hsl(262.1 83.3% 57.8%);    /* Purple */
  --accent: hsl(45.4 93.4% 47.5%);      /* Amber */
  --background: hsl(210 20% 98%);       /* Light gray */
}
```

### Categories
Default categories: General, Writing, Coding, Creative
Add more through the UI or modify the `categories` array in `script.js`.

## Troubleshooting

**Export not working?**
- Ensure you're using a modern browser
- Try using a local server instead of opening the file directly

**Data not saving?**
- Check if localStorage is enabled in your browser
- Some browsers block localStorage for local files

**Styling issues?**
- Make sure all three files are in the same directory
- Check browser console for any errors

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check the browser console for error messages and ensure you're using a supported browser version.