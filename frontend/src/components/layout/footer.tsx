"use client"

import React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-gray-800 bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center cursor-pointer mb-4">
              <div className="relative h-8 w-8 mr-2">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full blur-sm"></div>
                <div className="absolute inset-0.5 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">Hypernova</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Hypernova is a next-generation decentralized exchange combining
              retro aesthetics with cutting-edge blockchain technology for a
              unique trading experience.
            </p>
            <div className="flex space-x-4">
              {[
                { name: "Twitter", url: "#" },
                { name: "Discord", url: "#" },
                { name: "Telegram", url: "#" },
                { name: "GitHub", url: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 hover:bg-gray-800 transition-colors"
                  id={`x76exw_${index}`}
                >
                  <span className="sr-only" id={`vt5cw0_${index}`}>
                    {social.name}
                  </span>
                  <div
                    className="w-5 h-5 bg-gray-700 rounded-full"
                    id={`ax6kku_${index}`}
                  ></div>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Products
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Exchange", page: "exchange" },
                { label: "Liquidity", page: "liquidity" },
                { label: "Staking", page: "staking" },
                { label: "Farming", page: "farming" },
                { label: "Analytics", page: "analytics" },
              ].map((item, index) => (
                <li key={index} id={`fi4tq3_${index}`}>
                  <Link
                    href={item.page}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Documentation", href: "/docs" },
                { label: "Tutorials", href: "/tutorials" },
                { label: "Blog", href: "/blog" },
                { label: "API", href: "/api" },
                { label: "Status", href: "/status" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { label: "About", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Press", href: "/press" },
                { label: "Contact", href: "/contact" },
                { label: "Legal", href: "/legal" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} Hypernova Protocol. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {[
              { label: "Terms", page: "terms" },
              { label: "Privacy", page: "privacy" },
              { label: "Cookies", page: "cookies" },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.page}
                className="text-gray-500 hover:text-white text-sm transition-colors"
                id={`xzbq5p_${index}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
