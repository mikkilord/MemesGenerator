import { useState, useEffect } from 'react';

export const useMemeStorage = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const request = indexedDB.open('MemeGeneratorDB', 1);

    request.onerror = () => {
      console.error("Error opening IndexedDB");
    };

    request.onsuccess = () => {
      setDb(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('memes')) {
        db.createObjectStore('memes', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('fonts')) {
        db.createObjectStore('fonts', { keyPath: 'name' });
      }
    };
  }, []);

  const saveMeme = async (memeData: any) => {
    if (!db) return;

    const transaction = db.transaction(['memes'], 'readwrite');
    const store = transaction.objectStore('memes');
    return store.add(memeData);
  };

  const loadMeme = async (id: number) => {
    if (!db) return null;

    const transaction = db.transaction(['memes'], 'readonly');
    const store = transaction.objectStore('memes');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  return { saveMeme, loadMeme };
};