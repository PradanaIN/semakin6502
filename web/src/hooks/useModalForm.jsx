import { useState } from "react";

export default function useModalForm(initialForm) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
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
    setForm(initialForm);
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
