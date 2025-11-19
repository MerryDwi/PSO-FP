import {
  validateEmail,
  validatePassword,
  validateName,
} from "../utils/validation";

describe("Validation - Name", () => {
  test("should return error when name is empty", () => {
    expect(validateName("")).toBe("Nama tidak boleh kosong");
  });

  test("should return null when name is valid", () => {
    expect(validateName("Hasna QA")).toBeNull();
  });
});

describe("Validation - Email", () => {
  test("should return error when email empty", () => {
    expect(validateEmail("")).toBe("Email tidak boleh kosong");
  });

  test("should return error when email invalid format", () => {
    expect(validateEmail("abc@xyz")).toBe("Format email tidak valid");
  });

  test("should return null for valid email", () => {
    expect(validateEmail("test@example.com")).toBeNull();
  });
});

describe("Validation - Password", () => {
  test("empty password returns error", () => {
    expect(validatePassword("")).toBe("Password tidak boleh kosong");
  });

  test("short password returns error", () => {
    expect(validatePassword("123")).toBe("Password minimal 6 karakter");
  });

  test("valid password returns null", () => {
    expect(validatePassword("secret123")).toBeNull();
  });
});
