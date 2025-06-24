// Import Dependencies
import { PhoneIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { forwardRef } from "react";

// Local Imports
import { Input } from "components/ui";

// ----------------------------------------------------------------------

const PhoneInput = forwardRef(({ value, onChange, error, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      value={value}
      onChange={onChange}
      prefix={<PhoneIcon className="size-5" />}
      error={error}
      placeholder="Ej: 4441234567"
      {...props}
    />
  );
});

PhoneInput.displayName = "PhoneInput";

PhoneInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

export { PhoneInput };