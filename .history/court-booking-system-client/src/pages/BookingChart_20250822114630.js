import React, { useEffect, useState } from "react";
import courtService from "../services/domain-services/CourtService";
import Footer from "../components/Footer";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "rgba(30,144,255,0.8)",   // Dodger Blue
  "rgba(50,205,50,0.8)",    // Lime Green
  "rgba(255,165,0,0.8)",    // Orange
  "rgba(255,69,0,0.8)",     // Orange Red
  "rgba(106,90,205,0.8)",   // Slate Blue
  "rgba(255,105,180,0.8)",  // Hot Pink
  "rgba(0,206,209,0.8)",    // Dark Turquoise
  "rgba(153,50,204,0.8)",   // Dark Orchid
];

const tooltipStyle = {
  backgroundColor: "#fff",
  borderRadius: 4,
  padding: "10px 14px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  fontSize: 14,
  color: "#333",
  fontWeight: 500,
};

const BookingChart = () => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState("pie");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await courtService.getCourtBookingStats();
        setData(stats);
      } catch (error) {
        console.error("[BookingChart] Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: 16,
          color: "#999",
          textAlign: "center",
          padding: 60,
          fontStyle: "italic",
          userSelect: "none",
          backgroundColor: "#f9f9f9",
          borderRadius: 8,
          maxWidth: 600,
          margin: "80px auto",
          border: "1px solid #ddd",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        No booking data available to display.
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          maxWidth: 900,
          margin: "60px auto",
          padding: 32,
          backgroundColor: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#222",
          userSelect: "none",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 24,
            fontWeight: "700",
            fontSize: "2.25rem",
            color: "#2c3e50",
            userSelect: "none",
          }}
        >
          Court Booking Distribution
        </h2>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button
            onClick={() =>
              setChartType((prev) => (prev === "pie" ? "bar" : "pie"))
            }
            style={{
              backgroundColor: "transparent",
              border: "2px solid #000000ff",
              color: "#000100ff",
              padding: "10px 28px",
              borderRadius: 24,
              cursor: "pointer",
              fontWeight: "600",
              fontSize: 16,
              transition: "all 0.25s ease",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#128151ff";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#25865bff";
            }}
          >
            Switch to {chartType === "pie" ? "Bar" : "Pie"} Chart
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* Chart */}
          <div
            style={{
              flex: "1 1 580px",
              height: 400,
              minWidth: 300,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="bookings"
                    nameKey="courtName"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    innerRadius={70}
                    paddingAngle={3}
                    label={({ courtName, bookings }) =>
                      `${courtName} (${bookings})`
                    }
                    labelLine={false}
                    fontSize={13}
                    fontWeight={600}
                    fill="#333"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Bookings"]}
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(52, 152, 219, 0.1)" }}
                  />
                </PieChart>
              ) : (
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="courtName"
                    tick={{ fill: "#34495e", fontWeight: 600, fontSize: 14 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#34495e", fontWeight: 600, fontSize: 14 }}
                    axisLine={false}
                    tickCount={6}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="bookings" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`bar-cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <aside
            style={{
              flex: "0 0 220px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              padding: "8px 0",
              userSelect: "none",
            }}
            aria-label="Court color legend"
          >
            <h3
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: "#34495e",
                marginBottom: 12,
                borderBottom: "2px solid #3498db",
                paddingBottom: 6,
                userSelect: "none",
              }}
            >
              Courts Legend
            </h3>
            {data.map((entry, index) => (
              <div
                key={`legend-item-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: COLORS[index % COLORS.length],
                    borderRadius: 4,
                    boxShadow: "0 0 6px rgba(0,0,0,0.1)",
                    flexShrink: 0,
                  }}
                />
                <span
                  title={entry.courtName}
                  style={{
                    fontWeight: 500,
                    fontSize: 15,
                    color: "#2c3e50",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entry.courtName}
                </span>
              </div>
            ))}
          </aside>
        </div>
      </div>


            {/* Booking Details List */}
<div
  style={{
    maxWidth: 900,
    margin: "20px auto 60px",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222",
    userSelect: "none",
  }}
>
  <h3
    style={{
      textAlign: "center",
      marginBottom: 16,
      fontWeight: 700,
      fontSize: 20,
      color: "#2c3e50",
    }}
  >
    Booking Details List
  </h3>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 14,
    }}
  >
    <thead>
      <tr style={{ backgroundColor: "#cc6e6eff", color: "#fff" }}>
        {/* Dynamically get keys from first data object */}
        {data.length > 0 &&
          Object.keys(data[0]).map((key) => (
            <th
              key={key}
              style={{
                padding: "10px 12px",
                textAlign: "left",
                borderBottom: "2px solid #cc4a4aff",
                borderTop: "1px solid #cc4a4aff",
                textTransform: "capitalize",
              }}
            >
              {key}
            </th>
          ))}
      </tr>
    </thead>
    <tbody>
      {data.map((item, idx) => (
        <tr
          key={idx}
          style={{
            borderBottom: "1px solid #ddd",
            backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
          }}
        >
          {Object.values(item).map((val, i) => (
            <td key={i} style={{ padding: "8px 12px" }}>
              {val?.toString()}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>




      {/* Footer */}
      <Footer />
    </>
  );
};

export default BookingChart;
