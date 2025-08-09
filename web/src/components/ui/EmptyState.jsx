import React from "react";

export default function EmptyState({ message, action }) {
  return (
    <div className="py-6 text-center">
      <p className="text-gray-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
