import Spinner from "./Spinner";

export default function Loading({ fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center space-y-3 animate-fade-in">
      <Spinner className="h-8 w-8 text-primary-500 animate-pulse" />
      <div className="text-gray-700 dark:text-gray-300 font-medium">
        Sabar, ambil nafas dulu...
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
