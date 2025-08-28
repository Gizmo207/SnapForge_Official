import { useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { createBatchResizer } from './batchResizeService';

// Vite-friendly worker URL
const workerUrl = new URL('./batchResizeWorker.js', import.meta.url);

export function useBatchResizer(defaults) {
	const [files, setFiles] = useState([]);
	const [job, setJob] = useState({
		mode: 'fit',
		width: 2048,
		height: 2048,
		longEdge: 2048,
		format: 'auto',
		quality: 0.9,
		bgColor: '#00000000',
		...(defaults || {}),
	});
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState({ done: 0, total: 0 });
	const [messages, setMessages] = useState([]);

	// build worker pool once
	const resizer = useMemo(() => createBatchResizer({ workerUrl, concurrency: undefined }), []);

	function addFiles(fileList) {
		const list = Array.from(fileList || []).filter((f) => /^image\//.test(f.type));
		if (!list.length) return;
		setFiles((prev) => [...prev, ...list]);
	}

	function removeFileAt(i) {
		setFiles((prev) => prev.filter((_, idx) => idx !== i));
	}

	function reset() {
		setFiles([]);
		setMessages([]);
		setProgress({ done: 0, total: 0 });
		setIsProcessing(false);
	}

	async function start() {
		if (!files.length) {
			setMessages((m) => [...m, 'Please add some images first.']);
			return;
		}
		setIsProcessing(true);
		setProgress({ done: 0, total: files.length });

		try {
			const results = await resizer.processFiles(files, job, {
				onProgress: (p) => setProgress(p),
				filenamePattern: '{base}_{w}x{h}.{ext}',
			});

			const zip = new JSZip();
			let okCount = 0;
			results.forEach((r) => {
				if (r.ok) {
					zip.file(r.fileName, r.blob);
					okCount += 1;
				} else {
					setMessages((m) => [...m, `❌ ${r.fileName || 'image'}: ${r.error}`]);
				}
			});

			if (okCount) {
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				const a = document.createElement('a');
				a.href = URL.createObjectURL(zipBlob);
				a.download = `resized_${okCount}_images.zip`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(a.href);
			}
			setMessages((m) => [...m, `✅ Done. Processed ${okCount}/${files.length} images.`]);
		} catch (err) {
			setMessages((m) => [...m, `❌ Batch error: ${err?.message || String(err)}`]);
		} finally {
			setIsProcessing(false);
		}
	}

	return {
		files,
		job,
		isProcessing,
		progress,
		messages,
		setJob,
		addFiles,
		removeFileAt,
		start,
		reset,
	};
}

export default null;
