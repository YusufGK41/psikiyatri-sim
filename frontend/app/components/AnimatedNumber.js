"use client";

import { useEffect, useRef, useState } from "react";

import { formatNumber } from "./component-helpers";

export default function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 900,
  className = "",
}) {
  const numericValue = Number(value);
  const displayRef = useRef(Number.isFinite(numericValue) ? numericValue : 0);
  const [displayValue, setDisplayValue] = useState(
    Number.isFinite(numericValue) ? numericValue : 0,
  );

  useEffect(() => {
    if (!Number.isFinite(numericValue)) {
      return undefined;
    }

    let frameId;
    let startTime;
    const initialValue = displayRef.current;
    const delta = numericValue - initialValue;

    const step = (timestamp) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextValue = initialValue + delta * easedProgress;
      displayRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        displayRef.current = numericValue;
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, numericValue]);

  if (!Number.isFinite(numericValue)) {
    return <span className={className}>{String(value ?? "-")}</span>;
  }

  return (
    <span className={className}>
      {prefix}
      {formatNumber(displayValue, decimals)}
      {suffix}
    </span>
  );
}
