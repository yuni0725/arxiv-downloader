import { useState, useEffect } from "react";
import { browser } from "wxt/browser";

interface PaperInfo {
  id: string | null;
  filename: string | null;
  originalTitle: string | null;
}

// Function to remove characters that cannot be used in file names
function sanitizeFilename(name: string): string {
  if (!name) return "download";
  // 1. Replace spaces with '_'
  const withUnderscores = name.trim().replace(/\s+/g, "_");
  // 2. Remove special characters that cannot be used in file names
  return withUnderscores.replace(/[\/\\?%*:|"<>]/g, "");
}
function App() {
  const [paperInfo, setPaperInfo] = useState<PaperInfo>({
    id: null,
    filename: null,
    originalTitle: null,
  });
  const [status, setStatus] = useState("Analyzing page information...");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [paperTitle, setPaperTitle] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("merged");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isArxiv, setIsArxiv] = useState(true);
  const [arxivId, setArxivId] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy Info & BibTeX");

  // Analyze the title of the current tab when the component loads.
  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) {
        setIsArxiv(false);
        return;
      }

      try {
        const url = new URL(tab.url);
        if (url.hostname !== "arxiv.org") {
          setIsArxiv(false);
          return;
        }
        setIsArxiv(true);

        const path = url.pathname;
        const absMatch = path.match(/\/abs\/(.*)/);
        const pdfMatch = path.match(/\/pdf\/(.*)/);
        let currentArxivId = "";

        if (absMatch) {
          currentArxivId = absMatch[1];
        } else if (pdfMatch) {
          currentArxivId = pdfMatch[1].replace(/\.pdf$/, "");
        }
        setArxivId(currentArxivId);
      } catch (error) {
        setIsArxiv(false);
        return;
      }

      const tabId = tab.id;
      const parseTitle = async () => {
        // Get current tab information
        const [currentTab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!currentTab?.id) {
          setStatus("Error: Could not find the current tab.");
          return;
        }

        // Inject script into the current tab to get document.title
        const injectionResults = await browser.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: () => document.title,
        });

        const pageTitle = injectionResults?.[0]?.result;
        if (!pageTitle) {
          setStatus("Error: Could not retrieve page title.");
          return;
        }

        // Parse title using regex: e.g., [1706.03762] Attention Is All You Need
        const match = pageTitle.match(/^\[(.*?)\]\s*(.*)$/);

        if (match && match[1] && match[2]) {
          const id = match[1]; // "1706.03762"
          const title = match[2]; // "Attention Is All You Need"

          setPaperInfo({
            id: id,
            filename: sanitizeFilename(title),
            originalTitle: title,
          });
          setStatus("Ready to download!");
          setIsButtonDisabled(false); // Activate button after information analysis is complete
        } else {
          setStatus('Error: Could not find title in "[ID] Title" format.');
        }
      };

      parseTitle();
    });
  }, []);

  const handleDownload = async () => {
    if (!paperInfo.id || !paperInfo.filename) {
      alert("Information required for download is missing.");
      return;
    }

    // 1. Create PDF download URL
    const pdfUrl = `https://arxiv.org/pdf/${paperInfo.id}.pdf`;

    // 2. Add .pdf extension to the filename
    const finalFilename = `${paperInfo.filename}.pdf`;

    setStatus(`Downloading "${finalFilename}"...`);
    setIsButtonDisabled(true); // Prevent double-clicking

    // 3. Start download using WXT API
    try {
      await browser.downloads.download({
        url: pdfUrl,
        filename: finalFilename,
        saveAs: true, // Save directly to the downloads folder
      });
      // Uncomment the line below to close the popup after a successful download
      // setTimeout(() => window.close(), 1000);
    } catch (error: any) {
      console.error("Download failed:", error);
      setStatus("Download failed. Please check the console.");
      alert(`Download failed: ${error.message}`);
      setIsButtonDisabled(false); // Re-enable button on failure
    }
  };

  if (!isArxiv) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="max-w-6xl mx-4 px-8 py-10">
          {/* Main CTA Section */}
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-black mb-3">
                arXiv Downloader
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                This extension only works on arxiv.org pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="max-w-6xl mx-4 px-8 py-10">
        {/* Main CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black mb-3">
              arXiv Downloader
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Download arXiv papers with titles, effortlessly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center mx-auto">
            <button className="text-lg bg-black hover:bg-gray-800 text-white font-medium py-4 px-10 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer">
              <a target="_blank" onClick={handleDownload}>
                Download Current Paper
              </a>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
