import type { Recording } from './audio'

/**
 * The draft's recording, kept in IndexedDB until it is transcribed. A thin wrapper over the raw
 * API (no dependency). Every function swallows errors: without IndexedDB (some private modes, old
 * browsers, jsdom in tests) the app still works, it just can't restore the recording after a reload.
 */

const DB_NAME = 'handover'
const STORE = 'draft'
const KEY = 'recording'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  // One shared connection, so transactions run in the order they were requested.
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).catch((error: unknown) => {
    dbPromise = null
    throw error
  })
  return dbPromise
}

async function run<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode)
    const request = operation(transaction.objectStore(STORE))
    transaction.oncomplete = () => resolve(request.result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function saveDraftAudio(recording: Recording): Promise<boolean> {
  try {
    await run('readwrite', (store) =>
      store.put({ blob: recording.blob, fileName: recording.fileName }, KEY),
    )
    return true
  } catch {
    return false
  }
}

export async function loadDraftAudio(): Promise<Recording | null> {
  try {
    const value: unknown = await run('readonly', (store) => store.get(KEY))
    if (typeof value !== 'object' || value === null) return null
    const { blob, fileName } = value as Record<string, unknown>
    if (!(blob instanceof Blob) || typeof fileName !== 'string') return null
    return { blob, fileName }
  } catch {
    return null
  }
}

export async function deleteDraftAudio(): Promise<void> {
  try {
    await run('readwrite', (store) => store.delete(KEY))
  } catch {
    // Nothing to do: without IndexedDB nothing was stored.
  }
}
