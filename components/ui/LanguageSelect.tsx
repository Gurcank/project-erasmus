"use client";

export default function LanguageSelect() {

  const changeLang = (lang: string) => {
    localStorage.setItem("lang", lang);
    location.reload();
  };

  return (
    <select
      onChange={(e) => changeLang(e.target.value)}
      className="bg-zinc-800 text-white px-3 py-2 rounded"
    >
      <option value="tr">🇹🇷 Türkçe</option>
      <option value="en">🇬🇧 English</option>
    </select>
  );
}