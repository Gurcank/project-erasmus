"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="mt-auto py-3 bg-red-500/80 text-white rounded-xl hover:bg-red-600 transition"
    >
      Çıkış Yap
    </button>
  )
}