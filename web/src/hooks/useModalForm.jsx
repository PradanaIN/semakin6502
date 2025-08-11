import { useState } from "react";

export default function useModalForm(initialForm) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const openCreate = () => {
    setEditing(null);
    // create a fresh copy so components receive a new reference
    setForm({ ...initialForm });
    setShowForm(true);
  };

  const openEdit = (item, mapper = (v) => v) => {
    setEditing(item);
    setForm(mapper(item));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const resetForm = () => {
    // reset using a new object to avoid stale references
    setForm({ ...initialForm });
  };

  return {
    showForm,
    form,
    setForm,
    editing,
    openCreate,
    openEdit,
    closeForm,
    resetForm,
  };
}
