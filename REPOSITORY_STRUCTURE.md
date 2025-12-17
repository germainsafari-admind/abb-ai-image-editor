# Repository Structure Explanation

## Current Setup

You have **TWO separate git repositories** with **duplicate code**:

```
abb-ai-image-editor/                          ← ROOT DIRECTORY (GitHub Repo)
├── .git/                                     ← GitHub repository
├── origin: github.com/germainsafari/abb-ai-image-editor.git
│
├── app/                                      ← DUPLICATE CODE
├── components/
├── lib/
├── package.json
│
└── abbaiphotoeditor/                         ← SUBDIRECTORY (Hugging Face Repo)
    ├── .git/                                 ← Hugging Face repository
    ├── origin: huggingface.co/spaces/sfrgermain/abbaiphotoeditor
    │
    ├── app/                                  ← DUPLICATE CODE (same files!)
    ├── components/
    ├── lib/
    ├── package.json
    └── Dockerfile                            ← Only in HF repo
```

## The Problem

- **Root directory** (`/`) → Pushes to **GitHub**
- **Subdirectory** (`/abbaiphotoeditor`) → Pushes to **Hugging Face Spaces**
- You have **duplicate code** in both places
- When you edit files, you need to decide: edit in root? Or edit in abbaiphotoeditor?
- This is confusing and error-prone!

## How to Work With This Setup

### Option 1: Edit in Root, Sync to Hugging Face (Recommended)

1. **Always edit files in the ROOT directory** (`/app`, `/components`, etc.)
2. **Copy changes** to `abbaiphotoeditor/` when ready to deploy
3. **Push root** → GitHub
4. **Push abbaiphotoeditor** → Hugging Face

### Option 2: Edit in Hugging Face Directory Only

1. **Edit files in** `abbaiphotoeditor/` only
2. **Push abbaiphotoeditor** → Hugging Face
3. Copy back to root if needed for GitHub

### Option 3: Use Root as Single Source of Truth (Best Long-term)

1. Keep root as your main repository
2. Use a script to sync changes to `abbaiphotoeditor/`
3. Only push `abbaiphotoeditor/` to Hugging Face when deploying

## Quick Reference

| Location | Repository | Remote URL | When to Push |
|----------|-----------|------------|--------------|
| **Root (`/`)** | GitHub | `github.com/germainsafari/abb-ai-image-editor.git` | Push here for GitHub |
| **abbaiphotoeditor/** | Hugging Face | `huggingface.co/spaces/sfrgermain/abbaiphotoeditor` | Push here for Hugging Face Spaces |

## Commands

### Push to GitHub
```bash
cd C:\Users\germain.safari\Desktop\Admind\abb-ai-image-editor
git add .
git commit -m "Your message"
git push origin main
```

### Push to Hugging Face
```bash
cd C:\Users\germain.safari\Desktop\Admind\abb-ai-image-editor\abbaiphotoeditor
git add .
git commit -m "Your message"
git push origin main
```

