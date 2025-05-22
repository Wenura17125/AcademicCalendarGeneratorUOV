import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 mt-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            © {currentYear} Academic Calendar Generator. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://github.com', '_blank');
              }}
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://nextjs.org', '_blank');
              }}
            >
              Built with Next.js
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                window.open('https://ui.shadcn.com', '_blank');
              }}
            >
              UI by shadcn/ui
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
