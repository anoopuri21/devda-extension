import { useState, useCallback, useEffect } from "react";

interface StateSnapshot {
  id: string;
  timestamp: number;
  label: string;
  state: any;
}

const STORAGE_KEY = "devda_state_snapshots";
const MAX_SNAPSHOTS = 50;

export function useStateSnapshots() {
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);

  // Load snapshots on mount
  useEffect(() => {
    const loadSnapshots = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        if (result[STORAGE_KEY]) {
          setSnapshots(JSON.parse(result[STORAGE_KEY]));
        }
      } catch (error) {
        console.error("Failed to load snapshots:", error);
      }
    };
    loadSnapshots();
  }, []);

  // Save snapshots when they change
  useEffect(() => {
    const saveSnapshots = async () => {
      try {
        await chrome.storage.local.set({
          [STORAGE_KEY]: JSON.stringify(snapshots),
        });
      } catch (error) {
        console.error("Failed to save snapshots:", error);
      }
    };
    if (snapshots.length > 0) {
      saveSnapshots();
    }
  }, [snapshots]);

  const captureSnapshot = useCallback((label: string, state: any) => {
    const snapshot: StateSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      label,
      state,
    };

    setSnapshots((prev) => {
      const updated = [snapshot, ...prev].slice(0, MAX_SNAPSHOTS);
      return updated;
    });

    return snapshot.id;
  }, []);

  const getSnapshotByTime = useCallback(
    (hoursAgo: number) => {
      const targetTime = Date.now() - hoursAgo * 60 * 60 * 1000;
      return snapshots.find((s) => s.timestamp <= targetTime);
    },
    [snapshots]
  );

  const getSnapshotById = useCallback(
    (id: string) => {
      return snapshots.find((s) => s.id === id);
    },
    [snapshots]
  );

  const clearSnapshots = useCallback(async () => {
    setSnapshots([]);
    await chrome.storage.local.remove(STORAGE_KEY);
  }, []);

  return {
    snapshots,
    captureSnapshot,
    getSnapshotByTime,
    getSnapshotById,
    clearSnapshots,
  };
}