import Spinner from "./Spinner";

export default function Loading({
  fullScreen = false,
  message = "Sabar, ambil nafas dulu...",
  size = "h-10 w-10",
}) {
  const content = (
    <div className="flex flex-col items-center space-y-4 animate-fade-in">
      <Spinner
        className={`${size} text-primary-500 animate-pulse drop-shadow`}
      />
      <div className="text-lg font-medium text-gray-700 dark:text-gray-300 tracking-wide transition-colors">
        {message}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="py-10">{content}</div>;
}
