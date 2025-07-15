import React from "react";
import Spinner from "./Spinner";
export default function Loading({ fullScreen = false }) {
  const content = (
    <div className="text-center space-y-2">
      <Spinner className="h-6 w-6 mx-auto" />
      <div>Loading...</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white/80 dark:bg-zinc-950/80">
        {content}
      </div>
    );
  }

  return <div className="py-10">{content}</div>;
}
