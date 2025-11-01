'use client';

import { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (colorResult: ColorResult) => {
    onChange(colorResult.hex);
  };

  return (
    <div className="space-y-3">
      <label className="form-label">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div
          className="color-swatch"
          style={{ backgroundColor: color }}
          onClick={() => setShowPicker(!showPicker)}
          title="Click to open color picker"
        />
        <div className="flex-1">
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="input-field font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="btn-secondary text-sm py-2.5 px-4"
        >
          {showPicker ? 'Close' : 'Pick'}
        </button>
      </div>
      {showPicker && (
        <div className="mt-3 relative z-50">
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setShowPicker(false)}
          />
          <div className="relative mt-2">
            <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <SketchPicker
                color={color}
                onChange={handleColorChange}
                disableAlpha={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
