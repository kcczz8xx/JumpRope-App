import { render, screen, fireEvent } from "@testing-library/react";

import { ContactField, type ContactValue } from "../invoice/ContactField";

describe("ContactField", () => {
  const emptyValue: ContactValue = {
    name: "",
    phone: "",
    email: "",
  };

  const filledValue: ContactValue = {
    name: "張三",
    phone: "12345678",
    email: "test@example.com",
  };

  const defaultProps = {
    value: emptyValue,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("edit mode", () => {
    test("given empty value: renders all input fields", () => {
      render(<ContactField {...defaultProps} />);

      expect(screen.getByPlaceholderText("聯絡人姓名")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("電話號碼")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("電郵地址")).toBeInTheDocument();
    });

    test("given filled value: renders inputs with values", () => {
      render(<ContactField {...defaultProps} value={filledValue} />);

      expect(screen.getByDisplayValue("張三")).toBeInTheDocument();
      expect(screen.getByDisplayValue("12345678")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    });

    test("given label: renders label", () => {
      render(<ContactField {...defaultProps} label="聯絡人" />);

      expect(screen.getByText("聯絡人")).toBeInTheDocument();
    });

    test("given required: renders label with asterisk", () => {
      render(<ContactField {...defaultProps} label="聯絡人" required />);

      const label = screen.getByText("聯絡人");
      expect(label).toHaveClass("after:content-['*']");
    });

    test("given error: renders error message", () => {
      render(<ContactField {...defaultProps} error="請填寫聯絡人資料" />);

      expect(screen.getByRole("alert")).toHaveTextContent("請填寫聯絡人資料");
    });

    test("when typing name: calls onChange with updated value", () => {
      const onChange = jest.fn();
      render(<ContactField {...defaultProps} onChange={onChange} />);

      const nameInput = screen.getByPlaceholderText("聯絡人姓名");
      fireEvent.change(nameInput, { target: { value: "李四" } });

      expect(onChange).toHaveBeenCalledWith({
        name: "李四",
        phone: "",
        email: "",
      });
    });

    test("when typing phone: calls onChange with cleaned value", () => {
      const onChange = jest.fn();
      render(<ContactField {...defaultProps} onChange={onChange} />);

      const phoneInput = screen.getByPlaceholderText("電話號碼");
      fireEvent.change(phoneInput, { target: { value: "1234-5678" } });

      expect(onChange).toHaveBeenCalledWith({
        name: "",
        phone: "1234-5678",
        email: "",
      });
    });

    test("when typing email: calls onChange with value", () => {
      const onChange = jest.fn();
      render(<ContactField {...defaultProps} onChange={onChange} />);

      const emailInput = screen.getByPlaceholderText("電郵地址");
      fireEvent.change(emailInput, { target: { value: "new@test.com" } });

      expect(onChange).toHaveBeenCalledWith({
        name: "",
        phone: "",
        email: "new@test.com",
      });
    });
  });

  describe("readonly mode", () => {
    test("given filled value: renders formatted contact info", () => {
      render(<ContactField {...defaultProps} value={filledValue} mode="readonly" />);

      expect(screen.getByText("張三")).toBeInTheDocument();
      expect(screen.getByText(/12345678/)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    test("given empty value: renders placeholder text", () => {
      render(<ContactField {...defaultProps} value={emptyValue} mode="readonly" />);

      expect(screen.getByText("未填寫")).toBeInTheDocument();
    });

    test("given label: renders label", () => {
      render(
        <ContactField
          {...defaultProps}
          value={filledValue}
          mode="readonly"
          label="聯絡人"
        />
      );

      expect(screen.getByText("聯絡人")).toBeInTheDocument();
    });
  });

  describe("compact mode", () => {
    test("given filled value: renders name and phone", () => {
      render(<ContactField {...defaultProps} value={filledValue} mode="compact" />);

      expect(screen.getByText("張三 · 12345678")).toBeInTheDocument();
    });

    test("given empty value: renders dash", () => {
      render(<ContactField {...defaultProps} value={emptyValue} mode="compact" />);

      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });
});
