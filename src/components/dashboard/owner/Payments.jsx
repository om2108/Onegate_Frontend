// src/components/charts/PaymentsChart.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { month: "Jan", amount: 4500 },
  { month: "Feb", amount: 5200 },
  { month: "Mar", amount: 4800 },
  { month: "Apr", amount: 6100 },
  { month: "May", amount: 5600 },
  { month: "Jun", amount: 6300 },
  { month: "Jul", amount: 5900 },
  { month: "Aug", amount: 6800 },
  { month: "Sep", amount: 7200 },
  { month: "Oct", amount: 7500 },
  { month: "Nov", amount: 7000 },
  { month: "Dec", amount: 8000 },
];

export default function PaymentsChart() {
  const containerRef = useRef(null);
  const roRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setData(mockData), 200); // simulate load
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      const id = setTimeout(() => setReady(true), 300);
      return () => clearTimeout(id);
    }

    let retries = 0;
    const maxRetries = 8;
    const retryInterval = 150;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.round(el.clientWidth || rect.width || 0);
      const h = Math.round(el.clientHeight || rect.height || 0);
      return { w, h };
    };

    const check = () => {
      const { w, h } = measure();
      if (w > 0 && h > 0) {
        setReady(true);
        return true;
      }
      return false;
    };

    if (typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver(() => {
        if (check() && roRef.current) roRef.current.disconnect();
      });
      roRef.current.observe(el);
      if (check()) {
        if (roRef.current) roRef.current.disconnect();
        return;
      }
    }

    const id = setInterval(() => {
      retries += 1;
      if (check()) {
        clearInterval(id);
      } else if (retries >= maxRetries) {
        alert("Chart layout measurement took too long. Forcing render.");
        setReady(true);
        clearInterval(id);
      }
    }, retryInterval);

    return () => {
      if (roRef.current && typeof roRef.current.disconnect === "function")
        roRef.current.disconnect();
      clearInterval(id);
    };
  }, [containerRef]);

  if (!data.length) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        Loading chart data...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[220px]">
      {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Preparing chart…
        </div>
      )}
    </div>
  );
}
