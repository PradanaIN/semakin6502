function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border px-3 py-2 text-sm
        bg-white text-gray-900 placeholder-gray-400
        dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:cursor-not-allowed disabled:opacity-50
        ${props.className || ""}`}
    />
  );
}

export default Textarea;
