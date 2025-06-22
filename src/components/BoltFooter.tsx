import React from 'react';
import { Zap } from 'lucide-react';

export default function BoltFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* Built with Bolt Badge */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold text-sm">Built with Bolt</span>
          </div>
          
          {/* Additional Info */}
          <div className="text-center text-gray-600 text-sm">
            <p>Created for the Bolt Hackathon • Teaching kids about nutrition through fun gameplay</p>
            <p className="mt-1">Made with ❤️ for families who want to learn about healthy eating</p>
          </div>
          
          {/* Bolt Link */}
          <div className="text-center">
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              Learn more about Bolt →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}