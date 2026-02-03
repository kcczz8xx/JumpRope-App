import { render, screen, fireEvent } from "@testing-library/react";

import { PhoneField } from "../_shared/PhoneField";

describe("PhoneField", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("edit mode", () => {
    test("given empty value: renders input with placeholder", () => {
      render(<PhoneField {...defaultProps} placeholder="電話號碼" />);

      const input = screen.getByPlaceholderText("電話號碼");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("");
    });

    test("given value: renders input with value", () => {
      render(<PhoneField {...defaultProps} value="12345678" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("12345678");
    });

    test("given label: renders label", () => {
      render(<PhoneField {...defaultProps} label="電話號碼" />);

      expect(screen.getByText("電話號碼")).toBeInTheDocument();
    });

    test("given required: renders label with asterisk", () => {
      render(<PhoneField {...defaultProps} label="電話號碼" required />);

      const label = screen.getByText("電話號碼");
      expect(label).toHaveClass("after:content-['*']");
    });

    test("given error: renders error message", () => {
      render(<PhoneField {...defaultProps} error="請輸入有效的電話號碼" />);

      expect(screen.getByRole("alert")).toHaveTextContent(
        "請輸入有效的電話號碼"
      );
    });

    test("given disabled: renders disabled input", () => {
      render(<PhoneField {...defaultProps} disabled />);

      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    test("when typing: calls onChange with cleaned value", () => {
      const onChange = jest.fn();
      render(<PhoneField {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "1234-5678" } });

      expect(onChange).toHaveBeenCalledWith("1234-5678");
    });

    test("when typing non-numeric: filters invalid characters", () => {
      const onChange = jest.fn();
      render(<PhoneField {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "1234abcd5678" } });

      expect(onChange).toHaveBeenCalledWith("12345678");
    });

    test("given showCountryCode: renders country code prefix", () => {
      render(
        <PhoneField {...defaultProps} showCountryCode countryCode="+852" />
      );

      expect(screen.getByText("+852")).toBeInTheDocument();
    });
  });

  describe("readonly mode", () => {
    test("given value: renders formatted value", () => {
      render(<PhoneField {...defaultProps} value="12345678" mode="readonly" />);

      expect(screen.getByText("12345678")).toBeInTheDocument();
    });

    test("given empty value: renders placeholder text", () => {
      render(<PhoneField {...defaultProps} value="" mode="readonly" />);

      expect(screen.getByText("未填寫")).toBeInTheDocument();
    });

    test("given label: renders label", () => {
      render(
        <PhoneField
          {...defaultProps}
          value="12345678"
          mode="readonly"
          label="電話號碼"
        />
      );

      expect(screen.getByText("電話號碼")).toBeInTheDocument();
    });

    test("given showCountryCode: renders with country code", () => {
      render(
        <PhoneField
          {...defaultProps}
          value="12345678"
          mode="readonly"
          showCountryCode
          countryCode="+852"
        />
      );

      expect(screen.getByText("+852 12345678")).toBeInTheDocument();
    });
  });

  describe("compact mode", () => {
    test("given value: renders value only", () => {
      render(<PhoneField {...defaultProps} value="12345678" mode="compact" />);

      expect(screen.getByText("12345678")).toBeInTheDocument();
    });

    test("given empty value: renders dash", () => {
      render(<PhoneField {...defaultProps} value="" mode="compact" />);

      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });
});
