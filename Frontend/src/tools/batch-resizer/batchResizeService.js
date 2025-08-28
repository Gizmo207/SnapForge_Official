// Lightweight worker-pool orchestration for batch image resizing.
// Exposes createBatchResizer({ workerUrl, concurrency }) -> { processFiles(files, job, opts) }

export function createBatchResizer({ workerUrl, concurrency = navigator.hardwareConcurrency || 2 } = {}) {
  const pool = [];
  const free = [];

  function makeWorker() {
    const w = new Worker(workerUrl, { type: 'module' });
    let busy = false;
    const obj = { w, busy };
    pool.push(obj);
    free.push(obj);
    return obj;
  }

  // ensure pool size
  for (let i = 0; i < Math.max(1, concurrency); i++) makeWorker();

  function acquire() {
    return free.length ? free.shift() : makeWorker();
  }

  function release(obj) {
    obj.busy = false;
    free.push(obj);
  }

  async function processSingle(file, job, filenamePattern) {
    return new Promise((resolve) => {
      const obj = acquire();
      obj.busy = true;
      const reader = new FileReader();
      reader.onload = () => {
        obj.w.onmessage = (ev) => {
          release(obj);
          resolve(ev.data);
        };
        obj.w.postMessage({ fileDataUrl: reader.result, job, filenamePattern });
      };
      reader.onerror = (e) => {
        release(obj);
        resolve({ ok: false, error: 'read-error', fileName: file.name });
      };
      reader.readAsDataURL(file);
    });
  }

  async function processFiles(files, job, opts = {}) {
    const total = files.length;
    const results = new Array(total);
    let done = 0;
    const promises = files.map((file, idx) =>
      processSingle(file, job, opts.filenamePattern).then((r) => {
        results[idx] = r;
        done += 1;
        opts.onProgress && opts.onProgress({ done, total });
      })
    );
    await Promise.all(promises);
    return results;
  }

  return { processFiles };
}

export default { createBatchResizer };
