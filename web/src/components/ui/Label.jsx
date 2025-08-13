export default function Label({ className = "", children, ...props }) {
  const baseClasses = "block text-sm mb-1";
  return (
    <label className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </label>
  );
}
