import { useRef } from "react";

const OTPInput = ({ value, onChange, length = 6 }) => {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, ""); // digits only
    if (!val) return;

    const otpArr = value.split("");
    otpArr[index] = val[val.length - 1]; // take last digit if pasted multiple
    const newOtp = otpArr.join("").slice(0, length);
    onChange(newOtp.padEnd(length, "").slice(0, length));

    // Move to next
    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const otpArr = value.split("");
      if (otpArr[index]) {
        otpArr[index] = "";
        onChange(otpArr.join(""));
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        const arr = value.split("");
        arr[index - 1] = "";
        onChange(arr.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl
                     focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200
                     bg-white text-gray-800 transition-all duration-200 shadow-sm"
        />
      ))}
    </div>
  );
};

export default OTPInput;
