import React from "react";
import Spinner from "./Spinner";

export default function Loading() {
  return (
    <div className="py-10 text-center space-y-2">
      <Spinner className="h-6 w-6 mx-auto" />
      <div>Loading...</div>
    </div>
  );
}
