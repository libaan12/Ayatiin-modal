import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../firebase';

export const useData = <T>(path: string) => {
  // Initialize state from local storage if available for instant load
  const [data, setData] = useState<T[]>(() => {
    try {
      const cached = localStorage.getItem(`ayatiin_cache_${path}`);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(db, path);
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      let list: T[] = [];
      
      if (val) {
        // Map object to array, preserving the ID
        list = Object.keys(val).map(key => ({
          ...val[key],
          id: key
        }));
      }
      
      setData(list);
      setLoading(false);
      
      // Update cache
      try {
        localStorage.setItem(`ayatiin_cache_${path}`, JSON.stringify(list));
      } catch (e) {
        console.warn("Failed to save to local storage", e);
      }
      
    }, (err) => {
      console.error("Firebase read error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const dataRef = ref(db, path);
      const newRef = push(dataRef);
      await set(newRef, item);
      return newRef.key;
    } catch (err: any) {
      console.error("Firebase add error:", err);
      throw err;
    }
  };

  const updateItem = async (id: string, item: Partial<T>) => {
    try {
      if(!id) throw new Error("No ID provided for update");
      const itemRef = ref(db, `${path}/${id}`);
      await update(itemRef, item);
    } catch (err: any) {
      console.error("Firebase update error:", err);
      throw err;
    }
  };

  const removeDt = async (id: string) => {
    try {
      if(!id) throw new Error("No ID provided for deletion");
      const itemRef = ref(db, `${path}/${id}`);
      await remove(itemRef);
    } catch (err: any) {
      console.error("Firebase remove error:", err);
      throw err;
    }
  };

  return { data, loading, error, add, update: updateItem, remove: removeDt };
};