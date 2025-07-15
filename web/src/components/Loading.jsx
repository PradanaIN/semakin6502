import React from "react";
import Spinner from "./Spinner";

export default function Loading({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="text-center space-y-2">
          <Spinner className="h-6 w-6 mx-auto" />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 text-center space-y-2">
      <Spinner className="h-6 w-6 mx-auto" />
      <div>Loading...</div>
    </div>
  );
}
