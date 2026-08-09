"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminIndex() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";

  useEffect(() => {
    router.replace(`/${lang}/admin/articles`);
  }, [lang, router]);

  return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );
}