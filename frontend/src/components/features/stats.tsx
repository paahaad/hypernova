"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUpIcon, UsersIcon, BarChartIcon } from "lucide-react";

export function Stats() {
  const stats = [
    {
      title: "Total Value Locked",
      value: "$3.2B",
      change: "+12.5%",
      icon: BarChartIcon,
      positive: true,
    },
    {
      title: "Cumulative Trading Volume",
      value: "$840M",
      change: "+8.3%",
      icon: TrendingUpIcon,
      positive: true,
    },
    {
      title: "Active Users",
      value: "245K",
      change: "+24.7%",
      icon: UsersIcon,
      positive: true,
    }
  ];

  return (
    <section className="py-16 relative z-10">
      <div className="container mx-auto px-4">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="retro-card border-gray-800 overflow-hidden hover:scale-105 transition-transform duration-200"
              id={`ksvnjl_${index}`}
            >
              <CardContent className="p-8" id={`k6qhfh_${index}`}>
                <div
                  className="flex items-start justify-between"
                  id={`v2tjk9_${index}`}
                >
                  <div id={`yctq17_${index}`}>
                    <p
                      className="text-base text-gray-400 mb-2"
                      id={`3j2dz2_${index}`}
                    >
                      {stat.title}
                    </p>
                    <h3
                      className="text-4xl font-bold mb-3 retro-glow"
                      id={`zef6oc_${index}`}
                    >
                      {stat.value}
                    </h3>
                    <p
                      className={`text-xs flex items-center ${stat.positive ? "text-green-400" : "text-red-400"}`}
                      id={`y9wgn4_${index}`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className="bg-gray-800 p-3 rounded-lg"
                    id={`gl4gqc_${index}`}
                  >
                    <stat.icon
                      className="h-5 w-5 text-gray-300"
                      id={`e9mer5_${index}`}
                    />
                  </div>
                </div>

                {/* Animated bar */}
                <div
                  className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden"
                  id={`s7w5q8_${index}`}
                >
                  <div
                    className="h-full bg-gradient-to-rrounded-full"
                    style={{
                      width: `${75 + index * 5}%`,
                      animation: `pulse 2s infinite, width-animation 2s ease-in-out`,
                    }}
                    id={`jghud5_${index}`}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes width-animation {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
