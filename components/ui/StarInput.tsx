"use client";

import { useState } from "react";

type Props = {
  label: string;
  name: string;
};

export default function StarInput({ label, name }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between bg-zinc-900/70 border border-zinc-800 rounded-xl px-5 py-4 transition hover:border-zinc-700 hover:bg-zinc-900">
      
      {/* Label */}
      <label className="text-sm font-medium text-white">
        {label}
      </label>

      {/* Stars */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hovered || rating);

          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className={`text-2xl transition-all duration-200 ${
                active
                  ? "text-yellow-400 scale-110"
                  : "text-zinc-600 hover:text-yellow-300"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>

      <input type="hidden" name={name} value={rating} />
    </div>
  );
}