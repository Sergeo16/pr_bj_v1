'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const showDashboard = pathname?.includes('/dashboard');

  return (
    <>
      <section className="fixed top-0 left-0 w-full z-50 bg-stone-950 shadow-md px-4 py-2">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center font-bold text-xl md:text-3xl"
            onClick={() => setIsOpen(false)}
          >
            PR<span className="text-accent">2026</span> BJ
          </Link>

          {/* Menu Desktop */}
          <ul className="hidden md:flex items-center space-x-6 md:pb-3">
            <li>
              <Link
                href="/"
                className="relative inline-block mx-2 py-1 text-white md:text-2xl hover:text-accent transition duration-300
                          before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 
                          before:bg-accent before:transition-all before:duration-300 hover:before:w-full"
              >
                Vote
              </Link>
            </li>
            {showDashboard && (
              <li>
                <Link
                  href="/dashboard"
                  className="relative inline-block mx-2 py-1 text-white md:text-2xl hover:text-accent transition duration-300
                            before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 
                            before:bg-accent before:transition-all before:duration-300 hover:before:w-full"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Menu Mobile Toggle */}
          <button
            className="md:hidden text-accent"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </section>

      {/* Menu Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-stone-950 z-40 shadow-md px-4 py-2">
          <ul className="flex flex-col space-y-4 items-start">
            <li>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="relative inline-block py-1 text-white text-xl hover:text-accent transition duration-300
                          before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 
                          before:bg-accent before:transition-all before:duration-300 hover:before:w-full"
              >
                Vote
              </Link>
            </li>
            {showDashboard && (
              <li>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="relative inline-block py-1 text-white text-xl hover:text-accent transition duration-300
                            before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 
                            before:bg-accent before:transition-all before:duration-300 hover:before:w-full"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

