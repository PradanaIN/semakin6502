import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import { AuthProvider, useAuth } from "../pages/auth/useAuth";

jest.mock("axios");

function TestComponent() {
  const { user } = useAuth();
  return <div data-testid="user">{user ? "has-user" : "no-user"}</div>;
}

beforeEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

test("verifyToken clears storage when user is null", async () => {
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
  const lsSetSpy = jest.spyOn(window.localStorage.__proto__, "setItem");
  const ssSetSpy = jest.spyOn(window.sessionStorage.__proto__, "setItem");
  const lsRemoveSpy = jest.spyOn(window.localStorage.__proto__, "removeItem");
  const ssRemoveSpy = jest.spyOn(window.sessionStorage.__proto__, "removeItem");

  axios.get.mockResolvedValue({ data: { user: null } });

  const { getByTestId } = render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  expect(lsSetSpy).not.toHaveBeenCalled();
  expect(ssSetSpy).not.toHaveBeenCalled();
  expect(lsRemoveSpy).toHaveBeenCalledWith("user");
  expect(ssRemoveSpy).toHaveBeenCalledWith("user");
  expect(localStorage.getItem("user")).toBeNull();
  expect(sessionStorage.getItem("user")).toBeNull();
  await waitFor(() =>
    expect(getByTestId("user").textContent).toBe("no-user")
  );
});

test("verifyToken clears storage when user is undefined", async () => {
  sessionStorage.setItem("user", JSON.stringify({ id: 1 }));
  const lsSetSpy = jest.spyOn(window.localStorage.__proto__, "setItem");
  const ssSetSpy = jest.spyOn(window.sessionStorage.__proto__, "setItem");
  const lsRemoveSpy = jest.spyOn(window.localStorage.__proto__, "removeItem");
  const ssRemoveSpy = jest.spyOn(window.sessionStorage.__proto__, "removeItem");

  axios.get.mockResolvedValue({ data: {} });

  const { getByTestId } = render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  expect(lsSetSpy).not.toHaveBeenCalled();
  expect(ssSetSpy).not.toHaveBeenCalled();
  expect(lsRemoveSpy).toHaveBeenCalledWith("user");
  expect(ssRemoveSpy).toHaveBeenCalledWith("user");
  expect(localStorage.getItem("user")).toBeNull();
  expect(sessionStorage.getItem("user")).toBeNull();
  await waitFor(() =>
    expect(getByTestId("user").textContent).toBe("no-user")
  );
});

