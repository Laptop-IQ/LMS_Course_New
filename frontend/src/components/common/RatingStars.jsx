import React, { memo, useMemo, useState, useCallback } from "react";
import { Star } from "lucide-react";

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const RatingStars = memo(function RatingStars({
  rating = 0,
  totalStars = 5,
  size = 18,
  interactive = false,
  onRate,
  allowHalf = false,
  className = "",
  activeColor = "text-yellow-400",
  inactiveColor = "text-gray-400",
}) {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue ?? rating;

  const stars = useMemo(
    () => Array.from({ length: totalStars }, (_, i) => i + 1),
    [totalStars]
  );

  const handleClick = useCallback(
    (value) => {
      if (!interactive || !onRate) return;
      onRate(value);
    },
    [interactive, onRate]
  );

  const handleKeyDown = (e, value) => {
    if (!interactive || !onRate) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRate(value);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars.map((star) => {
        const filled = displayValue >= star;
        const halfFilled =
          allowHalf && displayValue + 0.5 >= star && displayValue < star;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            aria-label={`Rate ${star} star`}
            className={`transition-transform duration-150 ${
              interactive ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`}
            onClick={() => handleClick(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            onMouseEnter={() => interactive && setHoverValue(star)}
            onMouseLeave={() => interactive && setHoverValue(null)}
          >
            <Star
              size={size}
              className={
                filled || halfFilled ? activeColor : inactiveColor
              }
              fill={filled ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
});

export default RatingStars;