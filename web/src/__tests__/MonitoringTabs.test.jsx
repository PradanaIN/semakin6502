import { render, screen, fireEvent } from "@testing-library/react";
import MonitoringTabs from "../pages/dashboard/components/MonitoringTabs";
import months from "../utils/months";
import userEvent from "@testing-library/user-event";

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

jest.mock("../pages/dashboard/components/DailyOverview", () => () => (
  <div>Daily content</div>
));
jest.mock("../pages/dashboard/components/WeeklyOverview", () => () => (
  <div>Weekly content</div>
));
jest.mock("../pages/dashboard/components/MonthlyOverview", () => () => (
  <div>Monthly content</div>
));

test("switches between monitoring tabs", () => {
  render(
    <MonitoringTabs
      dailyData={[]}
      weeklyList={[{ minggu: 1 }]}
      weekIndex={0}
      onWeekChange={() => {}}
      monthIndex={0}
      onMonthChange={() => {}}
      monthlyData={[]}
      year={new Date().getFullYear()}
      onYearChange={() => {}}
    />
  );

  // default tab
  expect(screen.getByText(/Daily content/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: /mingguan/i }));
  expect(screen.getByText(/Weekly content/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: /bulanan/i }));
  expect(screen.getByText(/Monthly content/i)).toBeInTheDocument();
});

test("changing month and week selections does not throw", async () => {
  const onMonthChange = jest.fn();
  const onWeekChange = jest.fn();
  const onYearChange = jest.fn();
  const currentYear = new Date().getFullYear();
  const user = userEvent.setup();

  render(
    <MonitoringTabs
      dailyData={[]}
      weeklyList={[{ minggu: 1 }, { minggu: 2 }]}
      weekIndex={0}
      onWeekChange={onWeekChange}
      monthIndex={0}
      onMonthChange={onMonthChange}
      monthlyData={[]}
      year={currentYear}
      onYearChange={onYearChange}
    />
  );

  await user.click(screen.getByRole("button", { name: String(currentYear) }));
  await user.click(await screen.findByText(String(currentYear - 1)));
  expect(onYearChange).toHaveBeenCalledWith(currentYear - 1);

  await user.click(screen.getByRole("button", { name: months[0] }));
  await user.click(await screen.findByText(months[1]));
  expect(onMonthChange).toHaveBeenCalledWith(1);

  await user.click(screen.getByRole("tab", { name: /mingguan/i }));

  await user.click(screen.getByRole("button", { name: /Minggu 1/i }));
  await user.click(await screen.findByText(/Minggu 2/i));
  expect(onWeekChange).toHaveBeenCalledWith(1);
});
