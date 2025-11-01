'use client';

import { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

interface InlineColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export default function InlineColorPicker({ color, onChange }: InlineColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (colorResult: ColorResult) => {
    onChange(colorResult.hex);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="inline-color-picker-btn"
        title="Pick color"
      >
        <div className="color-picker-gradient">
          <div 
            className="color-picker-inner"
            style={{ backgroundColor: color }}
          />
        </div>
      </button>
      {showPicker && (
        <div className="color-picker-popup">
          <div 
            className="color-picker-overlay" 
            onClick={() => setShowPicker(false)}
          />
          <div className="color-picker-container">
            <SketchPicker
              color={color}
              onChange={handleColorChange}
              disableAlpha={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
