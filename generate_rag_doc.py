import os
import sys
from pathlib import Path

# Important configuration: directories and extensions to completely ignore
IGNORE_DIRS = {
    '.git', '.idea', '.vscode', '.mvn', 'target', 'node_modules', 
    'dist', '.docker', 'portainer_data', '__pycache__', '.DS_Store'
}

IGNORE_EXTENSIONS = {
    '.class', '.jar', '.war', '.ear',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.woff', '.woff2', '.ttf', '.eot',
    '.pdf', '.zip', '.tar', '.gz', '.db', '.sqlite',
    '.mp4', '.mp3', '.pem', '.crt'
}

# The name of the output and the script itself (so they don't recursively get included)
OUTPUT_FILE = "codebase_rag_context.md"
SCRIPT_NAME = "generate_rag_doc.py"

def is_ignored(path_str):
    # Check if any parent part of the path is in IGNORE_DIRS
    parts = Path(path_str).parts
    for p in parts:
        if p in IGNORE_DIRS:
            return True
    
    # Check if the filename or extension should be ignored
    file_path = Path(path_str)
    if file_path.name == OUTPUT_FILE or file_path.name == SCRIPT_NAME:
        return True
    
    if file_path.suffix.lower() in IGNORE_EXTENSIONS:
        return True
        
    return False

def generate_rag_doc(start_path):
    output_path = os.path.join(start_path, OUTPUT_FILE)
    
    print(f"Traversing codebase starting from: {start_path}")
    print(f"Generating Output: {output_path}")
    
    with open(output_path, 'w', encoding='utf-8') as outfile:
        outfile.write("# Codebase RAG Context\\n\\n")
        outfile.write("This document contains the consolidated source code files for the project.\\n\\n")
        
        file_count = 0
        
        # Traverse the directory tree
        for root, dirs, files in os.walk(start_path):
            # Modify dirs in-place to prevent os.walk from entering ignored directories
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, start_path)
                
                # Perform the exclusion check
                if is_ignored(rel_path):
                    continue
                
                # Determine markdown language format by file extension for nice syntax highlighting
                ext = Path(file).suffix.lower()
                lang = "text"
                if ext in ['.js', '.jsx']: lang = 'javascript'
                elif ext in ['.ts', '.tsx']: lang = 'typescript'
                elif ext == '.java': lang = 'java'
                elif ext == '.py': lang = 'python'
                elif ext in ['.html', '.htm']: lang = 'html'
                elif ext == '.css': lang = 'css'
                elif ext == '.xml': lang = 'xml'
                elif ext in ['.yaml', '.yml']: lang = 'yaml'
                elif ext == '.json': lang = 'json'
                elif ext == '.md': lang = 'markdown'
                elif ext == '.sh': lang = 'bash'
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        
                    # Write separator, relative path as header, and the fenced code block
                    outfile.write(f"## File: `{rel_path}`\\n\\n")
                    outfile.write(f"```{lang}\\n")
                    outfile.write(content)
                    if not content.endswith('\\n'):
                        outfile.write("\\n")
                    outfile.write("```\\n\\n")
                    
                    file_count += 1
                    print(f"Included: {rel_path}")
                    
                except Exception as e:
                    print(f"Skipping {rel_path} due to read error: {e}")
                    
    print(f"\\nSuccessfully processed {file_count} files.")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    generate_rag_doc(current_dir)
