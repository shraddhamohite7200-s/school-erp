import React from 'react';

export default function LoadingState({ message = 'Loading school records...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-6">
      <div className="w-10 h-10 border-3 border-[#1e3a8a]/20 border-t-[#1e3a8a] rounded-full animate-spin mb-3"></div>
      <span className="text-sm font-medium text-[#444651]">{message}</span>
    </div>
  );
}
