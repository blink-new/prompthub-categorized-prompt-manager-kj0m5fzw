import JSZip from 'jszip';
import { Prompt } from '../types/prompt';

export async function exportPromptsToZip(
  prompts: Prompt[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  const zip = new JSZip();
  const total = prompts.length;

  onProgress?.(0, total, 'Preparing export...');

  // Create a folder for prompts
  const promptsFolder = zip.folder('prompts');
  
  if (!promptsFolder) {
    throw new Error('Failed to create prompts folder');
  }

  // Process each prompt
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    onProgress?.(i + 1, total, `Processing "${prompt.title}"...`);

    // Create filename from title (sanitized)
    const sanitizedTitle = prompt.title
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const filename = `${sanitizedTitle}_${prompt.id.substring(0, 8)}.txt`;

    // Create file content with metadata
    const fileContent = [
      `Title: ${prompt.title}`,
      `Category: ${prompt.category}`,
      `Tags: ${prompt.tags.join(', ')}`,
      `Created: ${new Date(prompt.createdAt).toLocaleString()}`,
      `Updated: ${new Date(prompt.updatedAt).toLocaleString()}`,
      '',
      '--- PROMPT CONTENT ---',
      '',
      prompt.content
    ].join('\n');

    promptsFolder.file(filename, fileContent);

    // Small delay to prevent blocking UI
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  onProgress?.(total, total, 'Generating ZIP file...');

  // Generate and download the ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `prompts_export_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  
  onProgress?.(total, total, 'Export complete!');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}