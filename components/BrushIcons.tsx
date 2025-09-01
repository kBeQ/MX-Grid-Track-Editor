import React, { useMemo } from 'react';
import type { Deformation } from '../types';

interface BrushPreviewProps {
  className?: string;
  shape: Deformation;
}

export const BrushPreview: React.FC<BrushPreviewProps> = ({ className, shape }) => {
  const { cells, gridTemplateColumns } = useMemo(() => {
    if (!shape || shape.length === 0 || shape[0].length === 0) {
      return { cells: [], gridTemplateColumns: '' };
    }
    
    const height = shape.length;
    const width = shape[0].length;
    
    const allValues = shape.flat();
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;

    const newCells = shape.map((row, rowIndex) =>
      row.map((value, colIndex) => {
        // Normalize the value to a 0-1 range for grayscale
        const normalized = range === 0 ? 0.5 : (value - min) / range;
        const colorValue = Math.floor(normalized * 255);
        const color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
        return <div key={`${rowIndex}-${colIndex}`} style={{ backgroundColor: color }} />;
      })
    );

    return {
      cells: newCells.flat(),
      gridTemplateColumns: `repeat(${width}, 1fr)`
    };

  }, [shape]);

  return (
    <div
      className={`grid ${className}`}
      style={{ gridTemplateColumns, aspectRatio: '1 / 1' }}
    >
      {cells}
    </div>
  );
};