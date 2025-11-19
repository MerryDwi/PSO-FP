import { signIn, signUp } from "../auth/firebaseAuth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

jest.mock("firebase/auth");

describe("Firebase Authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("login success", async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: "mockUser" });
    const result = await signIn("test@example.com", "password123");
    expect(result).toEqual({ user: "mockUser" });
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  test("login failed - wrong password", async () => {
    signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/wrong-password",
    });
    await expect(signIn("test@example.com", "salah")).rejects.toEqual(
      "Password salah"
    );
  });

  test("signup failed - email already in use", async () => {
    createUserWithEmailAndPassword.mockRejectedValue({
      code: "auth/email-already-in-use",
    });
    await expect(signUp("test@example.com", "pass123")).rejects.toEqual(
      "Email sudah digunakan"
    );
  });

  test("signup success", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: "newUser" });
    const result = await signUp("new@example.com", "password123");
    expect(result).toEqual({ user: "newUser" });
  });
});
