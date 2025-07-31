import { render, screen, fireEvent } from "@testing-library/react";
import MonitoringTabs from "../pages/dashboard/components/MonitoringTabs";

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
    />
  );

  // default tab
  expect(screen.getByText(/Daily content/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: /mingguan/i }));
  expect(screen.getByText(/Weekly content/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: /bulanan/i }));
  expect(screen.getByText(/Monthly content/i)).toBeInTheDocument();
});
