"use client"; // This marks the file as a Client Component

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page
    router.push("/login");
  }, [router]);

  return null; // Render nothing since we're redirecting
}
