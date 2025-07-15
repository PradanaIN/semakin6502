export default function Table({ children, className = "", ...props }) {
  return (
    <table
      className={`min-w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg overflow-hidden shadow ${className}`.trim()}
      {...props}
    >
      {children}
    </table>
  );
}
