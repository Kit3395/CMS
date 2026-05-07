const express = require("express");
const dotenv = require("dotenv");
const {
  createAnnouncement,
  listAnnouncements,
  listAnnouncementsForResident,
  updateAnnouncement
} = require("./announcementsService");

dotenv.config();

const app = express();
app.use(express.json());

// Role check helper
function requireAdmin(req, res, next) {
  const role = req.headers["x-role"];
  if (role !== "ADMIN" && role !== "SU") {
    return res.status(403).json({ error: "Admin or SU role required" });
  }
  next();
}

// ─────────────────────────────────────────────
// POST /announcements  (Admin/SU only)
// ─────────────────────────────────────────────
app.post("/announcements", requireAdmin, (req, res) => {
  try {
    const announcement = createAnnouncement(req.body);
    return res.status(201).json(announcement);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /announcements  (Admin/SU sees all)
// ─────────────────────────────────────────────
app.get("/announcements", (req, res) => {
  const role = req.headers["x-role"];

  if (role === "ADMIN" || role === "SU") {
    return res.json(listAnnouncements());
  }

  // Resident view
  const phase = req.headers["x-phase"];
  const block = req.headers["x-block"];

  return res.json(
    listAnnouncementsForResident({
      phase,
      block
    })
  );
});

// ─────────────────────────────────────────────
// PATCH /announcements/:id  (Admin/SU only)
// ─────────────────────────────────────────────
app.patch("/announcements/:id", requireAdmin, (req, res) => {
  try {
    const updated = updateAnnouncement(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Announcements API running on port ${port}`);
});
