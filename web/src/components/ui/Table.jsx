export default function Table({ children, className = "", ...props }) {
  return (
    <div className="overflow-x-auto md:overflow-x-visible rounded-xl shadow-md">
      <table
        className={`w-full border-collapse text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${className}`.trim()}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}
