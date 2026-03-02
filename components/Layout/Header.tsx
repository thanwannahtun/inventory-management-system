// 'use client';
// import { BellIcon, LogOutIcon, MenuIcon } from 'lucide-react';
// import { useAuth } from '@/components/Auth/AuthGuard';

// interface HeaderProps {
//   onMenuClick: () => void;
// }

// export function Header({ onMenuClick }: HeaderProps) {
//   const { logout } = useAuth();

//   return (
//     <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 sticky top-0 z-30">
//       <div className="flex items-center justify-between">

//         {/* Left Section: Mobile Menu Button */}
//         <div className="flex items-center">
//           <button
//             onClick={onMenuClick}
//             className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
//           >
//             <MenuIcon className="h-6 w-6" />
//           </button>

//           {/* Optional: You could put a Page Title here if you want it to appear next to the hamburger */}
//         </div>

//         {/* Right Section: Notifications & Profile */}
//         <div className="flex items-center space-x-2 md:space-x-4">
//           {/* Notifications */}
//           <button className="p-2 text-gray-400 hover:text-white relative transition-colors">
//             <BellIcon size={20} />
//             <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full border-2 border-gray-900"></span>
//           </button>

//           {/* User Profile & Logout */}
//           <div className="flex items-center pl-2 border-l border-gray-800 ml-2">
//             <div className="hidden sm:block text-right mr-3">
//               <p className="text-sm font-medium text-white line-clamp-1">Admin User</p>
//               <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin</p>
//             </div>
//             <button
//               onClick={() => logout()}
//               className="p-2 bg-gray-800 text-gray-400 hover:text-red-400 rounded-lg transition-colors ml-1"
//               title="Logout"
//             >
//               <LogOutIcon size={18} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
'use client';

import React from 'react';
import { BellIcon, LogOutIcon, MenuIcon } from 'lucide-react';
import { useAuth } from '@/components/Auth/AuthGuard';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();

  return (
    /* Added backdrop-blur and changed bg to be slightly transparent for a better 'sticky' look */
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 md:px-6 py-3 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between">

        {/* Left Section: Mobile Menu Button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Right Section: Notifications & Profile */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 text-gray-400 hover:text-white relative transition-colors">
            <BellIcon size={20} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full border-2 border-gray-900"></span>
          </button>

          <div className="flex items-center pl-2 border-l border-gray-800 ml-2">
            <div className="hidden sm:block text-right mr-3">
              <p className="text-sm font-medium text-white line-clamp-1">Admin User</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 bg-gray-800 text-gray-400 hover:text-red-400 rounded-lg transition-colors ml-1"
              title="Logout"
            >
              <LogOutIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}