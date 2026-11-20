import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS, type ProductStatus } from "../types";

interface ProductStatusSelectProps {
  value: ProductStatus;
  onChange: (status: ProductStatus) => void;
  disabled?: boolean;
}

export function ProductStatusSelect({ value, onChange, disabled }: ProductStatusSelectProps) {
  return (
    <label>
      Estado
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const status = PRODUCT_STATUSES.find((item) => item === event.currentTarget.value);
          if (status) onChange(status);
        }}
      >
        {PRODUCT_STATUSES.map((status) => (
          <option key={status} value={status}>{PRODUCT_STATUS_LABELS[status]}</option>
        ))}
      </select>
    </label>
  );
}
