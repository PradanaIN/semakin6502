import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MonitoringTabs from "../pages/dashboard/components/MonitoringTabs";
import months from "../utils/months";
import userEvent from "@testing-library/user-event";
import { getWeekStarts } from "../pages/monitoring/MonitoringPage";

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

test("week 1 for June starts with a June date", () => {
  const starts = getWeekStarts(5, 2024);
  expect(starts[0].getUTCMonth()).toBe(5);
});

test("changing month resets week index", async () => {
  const user = userEvent.setup();

  const Wrapper = () => {
    const [month, setMonth] = useState(5); // June
    const [week, setWeek] = useState(2); // third week
    const weeks = Array.from({ length: 5 }, (_, i) => ({ minggu: i + 1 }));
    const handleMonth = (m) => {
      setMonth(m);
      setWeek(0);
    };
    return (
      <MonitoringTabs
        dailyData={[]}
        weeklyList={weeks}
        weekIndex={week}
        onWeekChange={setWeek}
        monthIndex={month}
        onMonthChange={handleMonth}
        monthlyData={[]}
        year={2024}
        onYearChange={() => {}}
      />
    );
  };

  render(<Wrapper />);

  await user.click(screen.getByRole("tab", { name: /mingguan/i }));
  expect(screen.getByText(/Minggu 3/i)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: months[5] }));
  await user.click(await screen.findByText(months[6]));

  expect(screen.getByText(/Minggu 1/i)).toBeInTheDocument();
});
