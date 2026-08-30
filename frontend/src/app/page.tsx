"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // For now, always go to dashboard. When auth is implemented, check session here.
    router.replace("/dashboard");
    setChecked(true);
  }, [router]);

  if (!checked) return null;
  return null;
}
