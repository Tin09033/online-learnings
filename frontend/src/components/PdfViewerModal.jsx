import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

/**
 * PdfViewerModal — mobile-first PDF viewer.
 *
 * On desktop: centered modal with an iframe.
 * On mobile:  full-screen overlay with a top action bar.
 *             Falls back to "Open in browser" if iframe is blocked.
 */
const PdfViewerModal = ({ url, title, onClose }) => {
  const overlayRef = useRef(null);

  // Trap scroll behind modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        {/* Modal panel — bottom-sheet on mobile, centered card on sm+ */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="
            w-full sm:w-auto sm:max-w-4xl
            h-[92dvh] sm:h-[85vh]
            bg-white dark:bg-gray-900
            rounded-t-[2rem] sm:rounded-[2rem]
            flex flex-col overflow-hidden
            shadow-2xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Top Bar ─────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            {/* Drag handle pill (mobile visual cue) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full sm:hidden" />

            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary-500" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{title || 'Document'}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Open externally — useful when iframe is sandboxed */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-black hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open</span>
              </a>
              {/* Download */}
              <a
                href={url}
                download
                className="flex items-center gap-1.5 px-3 py-2 bg-primary-gradient text-white rounded-xl text-xs font-black shadow-dual-sm hover:shadow-dual-md transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
              {/* Close */}
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── PDF Frame ────────────────────────────────────── */}
          <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
            <iframe
              src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
              title={title || 'Document viewer'}
              className="w-full h-full border-0"
              loading="lazy"
            />
            {/* Fallback overlay — shown if iframe is blocked (rare) */}
            {/* We can't detect iframe block from JS, so the Open/Download buttons above serve as fallback */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PdfViewerModal;
