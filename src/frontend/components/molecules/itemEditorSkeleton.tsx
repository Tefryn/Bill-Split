export const ItemEditorSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="flex justify-between items-center p-4">
        {/* Left Side: Name and Details */}
        <div className="flex flex-col space-y-2">
          {/* Item Name Placeholder */}
          <div className="h-6 w-32 bg-gray-200 rounded-md animate-shimmer" />
          
          {/* Subtext Placeholder */}
          <div className="h-4 w-48 bg-gray-100 rounded-md animate-shimmer" />
        </div>

        {/* Right Side: Button Placeholder */}
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
};