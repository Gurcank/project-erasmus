"use client";

import { useState } from "react";

type City = {
  name: string;
  description: string;
  image: string;
};

export default function CityClient({ city }: { city: City }) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    { text: string; rating: number }[]
  >([]);

  const addComment = () => {
    if (!comment || rating === 0) return;

    setComments([...comments, { text: comment, rating }]);
    setComment("");
    setRating(0);
  };

  const average =
    comments.length > 0
      ? (
          comments.reduce((acc, c) => acc + c.rating, 0) /
          comments.length
        ).toFixed(1)
      : "0";

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl max-w-2xl w-full p-6 space-y-6 transition-colors">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        {city.name}
      </h1>

      <img
        src={city.image}
        alt={city.name}
        className="rounded-xl w-full object-cover"
      />

      <p className="text-gray-600 dark:text-gray-300">
        {city.description}
      </p>

      <div className="flex items-center gap-2 text-xl">
        <span>Ortalama:</span>
        <span className="font-bold text-yellow-500">⭐ {average} / 5</span>
      </div>

      <div className="space-y-3">
        <div className="flex gap-1 text-2xl cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={
                (hover || rating) >= star
                  ? "text-yellow-500"
                  : "text-gray-400"
              }
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Yorumunuzu yazın..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
        />

        <button
          onClick={addComment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Gönder
        </button>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold dark:text-white">
            Yorumlar
          </h3>

          {comments.map((c, i) => (
            <div
              key={i}
              className="border p-3 rounded-lg dark:border-gray-600"
            >
              <div className="text-yellow-500">
                {"★".repeat(c.rating)}
              </div>
              <p className="dark:text-gray-200">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}