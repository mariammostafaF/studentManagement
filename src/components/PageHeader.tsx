import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  onBack?: () => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  showNotification?: boolean;
}

export default function PageHeader({
  onBack,
  showSearch = true,
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  showNotification = true,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <i 
        className="fa-solid fa-circle-chevron-left text-black text-xl cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleBack}
        aria-label="Back"
      ></i>
      
      {showSearch && (
        <div className="flex-1 max-w-md mx-4">
          {onSearchSubmit ? (
            <form onSubmit={onSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={onSearchChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </form>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          )}
        </div>
      )}
      
      {showNotification && (
        <div className="relative">
          <i 
            className="fa-regular fa-bell text-black text-xl cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              // Notification functionality to be implemented
            }}
            aria-label="Notifications"
          ></i>
          {/* Notification badge */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      )}
    </div>
  );
}

export type { PageHeaderProps };

