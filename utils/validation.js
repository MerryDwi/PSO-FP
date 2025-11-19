export const validateEmail = (email) => {
  if (!email) return "Email tidak boleh kosong";

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) return "Format email tidak valid";

  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password tidak boleh kosong";

  if (password.length < 6) return "Password minimal 6 karakter";

  return null;
};

export const validateName = (name) => {
  if (!name) return "Nama tidak boleh kosong";

  return null;
};
