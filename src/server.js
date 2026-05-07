const express = require("express");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// In-memory export store
const exportStore = [];

// Role check helper
function requireAdmin(req, res, next) {
  const role = req.headers["x-role"];
  if (role !== "ADMIN" && role !== "SU") {
    return res.status(403).json({ error: "Admin or SU role required" });
  }
  next();
}

// CSV generator helper
function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => r[h]).join(","))
  ];
  return lines.join("\n");
}

// Fake data generator for demo purposes
function generateData(type, filters) {
  if (type === "residents") {
    return [
      { id: 1, name: "Alice", phase: "1", block: "A" },
      { id: 2, name: "Bob", phase: "2", block: "B" }
    ];
  }
  if (type === "payments") {
    return [
      { id: 10, invoice: "INV-001", amount: 1200, status: "paid" },
      { id: 11, invoice: "INV-002", amount: 800, status: "pending" }
    ];
  }
  if (type === "invoices") {
    return [
      { id: 100, resident: "Alice", total: 1200, due: "2026-05-01" },
      { id: 101, resident: "Bob", total: 800, due: "2026-06-01" }
    ];
  }
  return [];
}

// ─────────────────────────────────────────────
// POST /exports/:type  (Admin/SU only)
// ─────────────────────────────────────────────
app.post("/exports/:type", requireAdmin, (req, res) => {
  const { type } = req.params;
  const filters = req.body ?? {};

  const id = crypto.randomUUID();
  const fileName = `${type}-export-${id}.csv`;

  const rows = generateData(type, filters);
  const csv = toCSV(rows);

  const job = {
    id,
    type,
    filters,
    status: "completed",
    createdAt: new Date().toISOString(),
    fileName,
    csv,
    downloadUrl: `/exports/${id}/download`
  };

  exportStore.push(job);

  return res.status(201).json(job);
});

// ─────────────────────────────────────────────
// GET /exports  (Admin/SU only)
// ─────────────────────────────────────────────
app.get("/exports", requireAdmin, (req, res) => {
  return res.json(exportStore);
});

// ─────────────────────────────────────────────
// GET /exports/:id/download  (Admin/SU only)
// ─────────────────────────────────────────────
app.get("/exports/:id/download", requireAdmin, (req, res) => {
  const job = exportStore.find((j) => j.id === req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Export job not found" });
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${job.fileName}"`);
  return res.send(job.csv);
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Exports API running on port ${port}`);
});
