import React from 'react';

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Sidebar / Navigation (1/3 width on desktop) */}
      <nav 
        className="w-full md:w-1/3 bg-gray-100 p-4" 
        aria-label="Main Navigation"
      >
        <ul className="space-y-2">
          <li><a href="#feature1" className="text-blue-700 hover:underline">Feature 1</a></li>
          <li><a href="#feature2" className="text-blue-700 hover:underline">Feature 2</a></li>
          <li><a href="#feature3" className="text-blue-700 hover:underline">Feature 3</a></li>
        </ul>
      </nav>

      {/* Right Main Content Area (2/3 width on desktop) */}
      <main 
        className="w-full md:w-2/3 p-6 bg-white overflow-y-auto" 
        role="main"
      >
        <h1 className="text-2xl font-bold mb-4">Generated Educational Content</h1>
        <p>
          This area will display the AI-generated educational materials. It is styled to take up 
          two-thirds of the screen on larger screens, and full width on smaller devices.
        </p>
      </main>
    </div>
  );
};

export default Layout;