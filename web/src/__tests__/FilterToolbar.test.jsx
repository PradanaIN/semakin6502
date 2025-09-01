import { render, screen } from "@testing-library/react";
import FilterToolbar from "../pages/monitoring/components/FilterToolbar";
import { useAuth } from "../pages/auth/useAuth";

jest.mock("../pages/auth/useAuth");
const mockedUseAuth = useAuth;

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("hides team selector for team leader", () => {
  mockedUseAuth.mockReturnValue({ user: { role: "ketua", teamId: "1" } });
  render(
    <FilterToolbar
      tab="harian"
      monthlyMode="current"
      monthIndex={0}
      setMonthIndex={() => {}}
      weekIndex={0}
      setWeekIndex={() => {}}
      weekStarts={[]}
      year={2024}
      setYear={() => {}}
      teamId="1"
      setTeamId={() => {}}
      teams={[{ id: "1", namaTim: "Tim A" }]}
    />
  );
  expect(screen.queryByLabelText(/Pilih Tim/i)).not.toBeInTheDocument();
});

test("shows team selector for admin", () => {
  mockedUseAuth.mockReturnValue({ user: { role: "admin" } });
  render(
    <FilterToolbar
      tab="harian"
      monthlyMode="current"
      monthIndex={0}
      setMonthIndex={() => {}}
      weekIndex={0}
      setWeekIndex={() => {}}
      weekStarts={[]}
      year={2024}
      setYear={() => {}}
      teamId=""
      setTeamId={() => {}}
      teams={[]}
    />
  );
  expect(screen.getByLabelText(/Pilih Tim/i)).toBeInTheDocument();
});
