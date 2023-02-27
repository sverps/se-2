import { BigNumber, ethers } from "ethers";
import { useCallback, useState } from "react";
import { InputBase } from "../Input/InputBase";

const NUMBER_REGEX = /^\.?\d+\.?\d*$/;

type Uint256InputProps = {
  value?: string | BigNumber;
  onChange: (newValue: string | BigNumber) => void;
  name?: string;
  placeholder?: string;
};

export const Uint256Input = ({ value, onChange, name, placeholder }: Uint256InputProps) => {
  const [inputError, setInputError] = useState(false);
  const convertEtherToUint = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(value instanceof BigNumber ? ethers.utils.formatEther(value) : ethers.utils.parseEther(value));
  }, [onChange, value]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={value => {
        if (value && !NUMBER_REGEX.test(value)) {
          setInputError(true);
        } else {
          setInputError(false);
        }
        onChange(value);
      }}
      suffix={
        !inputError && (
          <div
            className="self-center cursor-pointer text-l font-semibold px-4 text-accent"
            onClick={convertEtherToUint}
          >
            ∗
          </div>
        )
      }
    />
  );
};
