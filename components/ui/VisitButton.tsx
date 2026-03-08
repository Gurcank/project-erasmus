"use client";

import { useState } from "react";

export default function VisitButton({
  cityId,
  initialVisited,
}: {
  cityId: string;
  initialVisited: boolean;
}) {
  const [visited, setVisited] = useState(initialVisited);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cityId }),
    });

    const data = await res.json();

    if (data.added) setVisited(true);
    if (data.removed) setVisited(false);

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      className={`ml-4 px-4 py-2 rounded-lg transition ${visited
          ? "bg-red-600 hover:bg-red-700"
          : "bg-green-600 hover:bg-green-700"
        }`}
    >
      {loading ? "⏳" : visited ? "✓ Ziyaret Edildi" : "+ Ziyaret Listeme Ekle"}
    </button>
  );
}