import { useState, useMemo } from 'react';

/**
 * Reusable client-side table sorting hook.
 * Supports numeric, boolean, date/string values and custom accessor functions.
 */
export function useTableSort(items = [], accessors = {}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    const getVal = accessors[sortConfig.key] || ((row) => row?.[sortConfig.key]);

    return [...items].sort((a, b) => {
      const valA = getVal(a);
      const valB = getVal(b);

      if (valA === valB) return 0;
      if (valA == null) return 1 * dir;
      if (valB == null) return -1 * dir;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return (Number(valA) - Number(valB)) * dir;
      }
      return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * dir;
    });
  }, [items, sortConfig, accessors]);

  return { sortConfig, handleSort, sortedItems };
}
