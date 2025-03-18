"use client"

import React from "react";
import { Hero } from "@/components/features/hero";
import { Features } from "@/components/features/features";
import { Stats } from "@/components/features/stats";

export default function Home() {
  return (
    <div className="relative z-10">
      <Hero />
      <Stats />
      <Features />
    </div>
  );
}
