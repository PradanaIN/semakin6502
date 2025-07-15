export const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#374151"
      : "#ffffff",
    borderColor: "#d1d5db",
    color: document.documentElement.classList.contains("dark")
      ? "#f9fafb"
      : "#1f2937",
    "&:hover": {
      borderColor: "#60a5fa",
    },
    boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : base.boxShadow,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? document.documentElement.classList.contains("dark")
        ? "#4b5563"
        : "#f3f4f6"
      : document.documentElement.classList.contains("dark")
      ? "#374151"
      : "#ffffff",
    color: document.documentElement.classList.contains("dark")
      ? "#f9fafb"
      : "#1f2937",
    "&:active": {
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#4b5563"
        : "#e5e7eb",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#f9fafb"
      : "#1f2937",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#4b5563" // dark: bg-gray-600
      : "#e2e8f0", // light: gray-200
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#f9fafb" // gray-100
      : "#1f2937", // gray-900
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark")
      ? "#f9fafb"
      : "#1f2937",
    ":hover": {
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#6b7280" // gray-500
        : "#cbd5e1", // gray-300
      color: "#000",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    maxHeight: "100px",
    overflowY: "auto",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

export default selectStyles;
