"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChooseUsername() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const submit = async () => {
    const res = await fetch("/api/username", {
      method: "POST",
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      router.push(`/u/${username}`);
    }
  };

  return (
    <div>
      <h1>Kullanıcı Adı Seç</h1>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button onClick={submit}>
        Kaydet
      </button>
    </div>
  );
}