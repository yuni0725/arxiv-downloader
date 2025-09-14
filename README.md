# arXiv Paper Downloader

A browser extension to solve a simple, yet annoying, problem with arXiv: downloading papers with their actual titles as filenames.

## The Problem

When you download a paper directly from arXiv, the PDF is saved with its ID number (e.g., `1706.03762.pdf`). This is not very descriptive and forces you to manually rename the file every time to keep your library organized. It's a small hassle, but it adds up.

## The Solution

This extension automates the process. When you're on an arXiv abstract or PDF page, simply click the extension icon, and it will:

1.  **Parse the paper's title.**
2.  **Sanitize it** into a clean, valid filename (e.g., `Attention_Is_All_You_Need.pdf`).
3.  **Download the PDF** with the proper name.

It also includes a handy button to copy the paper's title and its BibTeX citation to your clipboard.

## Features

- **Smart Naming:** Automatically downloads arXiv papers with their titles as filenames.
- **Clipboard Helper:** Copy the title and BibTeX citation with a single click.
- **Site-Locked:** The extension only activates on `arxiv.org` pages to stay out of your way.

## Tech Stack

This extension is built with a modern web stack:

- **[WXT](https://wxt.dev/)**: A next-generation web extension framework.
- **[React](https://react.dev/)**: For building the user interface.
- **[TypeScript](https://www.typescriptlang.org/)**: For robust, type-safe code.
- **[Tailwind CSS](https://tailwindcss.com/)**: For styling the popup.
