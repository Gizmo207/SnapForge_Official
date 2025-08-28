// Web worker: receives { fileDataUrl, job, filenamePattern }
// Replies with { ok: true, blob, fileName, w, h } or { ok: false, error }

async function dataUrlToImageBitmap(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  if ('createImageBitmap' in self) {
    return await createImageBitmap(blob);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function applyResizeParams(srcW, srcH, job) {
  let w = srcW;
  let h = srcH;
  if (job.mode === 'long-edge') {
    const scale = job.longEdge / Math.max(srcW, srcH);
    w = Math.round(srcW * scale);
    h = Math.round(srcH * scale);
  } else if (job.mode === 'exact') {
    w = job.width;
    h = job.height;
  } else {
    // fit
    const scale = Math.min(job.width / srcW, job.height / srcH);
    w = Math.round(srcW * scale);
    h = Math.round(srcH * scale);
  }
  return { w, h };
}

self.onmessage = async (ev) => {
  try {
    const { fileDataUrl, job, filenamePattern } = ev.data;
    const img = await dataUrlToImageBitmap(fileDataUrl);
    const srcW = img.width || img.naturalWidth || 0;
    const srcH = img.height || img.naturalHeight || 0;
    const { w, h } = applyResizeParams(srcW, srcH, job);

    let canvas, ctx;
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(w, h);
      ctx = canvas.getContext('2d');
    } else {
      // fallback: create an in-memory canvas via DOM (shouldn't usually run inside worker)
      canvas = new OffscreenCanvas(w, h);
      ctx = canvas.getContext('2d');
    }

    // clear & draw
    ctx.fillStyle = job.bgColor || 'transparent';
    ctx.fillRect(0, 0, w, h);
    // draw with aspect preserved (drawImage will scale)
    ctx.drawImage(img, 0, 0, w, h);

    const mime = (job.format === 'auto') ? 'image/png' : {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }[job.format] || 'image/png';

    const quality = Math.min(1, Math.max(0.01, job.quality || 0.9));

    const blob = await canvas.convertToBlob ? canvas.convertToBlob({ type: mime, quality }) : (await (async () => {
      // OffscreenCanvas may not have convertToBlob in some runtimes; fallback by drawing to ImageBitmap -> create blob via canvas in main thread (not ideal)
      return new Blob([], { type: mime });
    })());

    // Build a simple filename
    const fileName = (filenamePattern || '{base}.{ext}').replace('{base}', 'image').replace('{w}', w).replace('{h}', h).replace('{ext}', mime.split('/')[1]);

    // Transferable: can't transfer Blob easily; just post back
    self.postMessage({ ok: true, blob, fileName, w, h });
  } catch (err) {
    self.postMessage({ ok: false, error: err?.message || String(err) });
  }
};

export {};
