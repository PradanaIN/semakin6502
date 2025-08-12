import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

export default function EmptyState({
  icon = ClipboardDocumentListIcon,
  iconAlt = "Ilustrasi tidak ada data",
  title = "Tidak ada data",
  message = "",
  actionLabel,
  onAction,
}) {
  const Icon = icon;
  return (
    <div className="py-10 flex flex-col items-center text-center">
      <span role="img" aria-label={iconAlt}>
        <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {message && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
