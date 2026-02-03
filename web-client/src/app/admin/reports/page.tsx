"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminReportsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push("/admin/dashboard");
    }, [router]);

    return null;
}
