export const selectStyles = {
  option: (base) => ({ ...base, color: "#000" }),
  valueContainer: (base) => ({
    ...base,
    maxHeight: "100px",
    overflowY: "auto",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default selectStyles;
