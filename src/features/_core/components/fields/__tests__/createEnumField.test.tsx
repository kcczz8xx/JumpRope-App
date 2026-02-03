import { render, screen, fireEvent } from "@testing-library/react";

import { createEnumField } from "../_enum/factory";
import type { EnumOption } from "../types";

const TEST_OPTIONS: EnumOption<string>[] = [
  { value: "ACTIVE", label: "進行中", color: "green" },
  { value: "PENDING", label: "待處理", color: "yellow" },
  { value: "COMPLETED", label: "已完成", color: "blue" },
];

const TestStatusField = createEnumField("TestStatusField", TEST_OPTIONS, "gray");

describe("createEnumField", () => {
  const defaultProps = {
    value: "" as string,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("edit mode", () => {
    test("given empty value: renders select with placeholder", () => {
      render(<TestStatusField {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue("");
    });

    test("given value: renders select with selected option", () => {
      render(<TestStatusField {...defaultProps} value="ACTIVE" />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("ACTIVE");
    });

    test("given options: renders all options", () => {
      render(<TestStatusField {...defaultProps} />);

      expect(screen.getByText("請選擇")).toBeInTheDocument();
      expect(screen.getByText("進行中")).toBeInTheDocument();
      expect(screen.getByText("待處理")).toBeInTheDocument();
      expect(screen.getByText("已完成")).toBeInTheDocument();
    });

    test("given label: renders label", () => {
      render(<TestStatusField {...defaultProps} label="狀態" />);

      expect(screen.getByText("狀態")).toBeInTheDocument();
    });

    test("given required: renders label with asterisk", () => {
      render(<TestStatusField {...defaultProps} label="狀態" required />);

      const label = screen.getByText("狀態");
      expect(label).toHaveClass("after:content-['*']");
    });

    test("given error: renders error message", () => {
      render(<TestStatusField {...defaultProps} error="請選擇狀態" />);

      expect(screen.getByRole("alert")).toHaveTextContent("請選擇狀態");
    });

    test("given disabled: renders disabled select", () => {
      render(<TestStatusField {...defaultProps} disabled />);

      expect(screen.getByRole("combobox")).toBeDisabled();
    });

    test("when selecting option: calls onChange with value", () => {
      const onChange = jest.fn();
      render(<TestStatusField {...defaultProps} onChange={onChange} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "ACTIVE" } });

      expect(onChange).toHaveBeenCalledWith("ACTIVE");
    });
  });

  describe("readonly mode", () => {
    test("given value: renders badge with label", () => {
      render(<TestStatusField {...defaultProps} value="ACTIVE" mode="readonly" />);

      expect(screen.getByText("進行中")).toBeInTheDocument();
    });

    test("given empty value: renders placeholder text", () => {
      render(<TestStatusField {...defaultProps} value="" mode="readonly" />);

      expect(screen.getByText("未選擇")).toBeInTheDocument();
    });

    test("given label: renders label", () => {
      render(
        <TestStatusField
          {...defaultProps}
          value="ACTIVE"
          mode="readonly"
          label="狀態"
        />
      );

      expect(screen.getByText("狀態")).toBeInTheDocument();
    });

    test("given value with color: renders badge with color class", () => {
      render(<TestStatusField {...defaultProps} value="ACTIVE" mode="readonly" />);

      const badge = screen.getByText("進行中");
      expect(badge).toHaveClass("bg-green-100");
    });
  });

  describe("compact mode", () => {
    test("given value: renders badge only", () => {
      render(<TestStatusField {...defaultProps} value="PENDING" mode="compact" />);

      expect(screen.getByText("待處理")).toBeInTheDocument();
    });

    test("given empty value: renders dash", () => {
      render(<TestStatusField {...defaultProps} value="" mode="compact" />);

      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });
});
