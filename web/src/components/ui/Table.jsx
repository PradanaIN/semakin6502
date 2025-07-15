export default function Table({ children, className = "", ...props }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow">
      <table
        className={`min-w-full border-collapse bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 
          ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}
