import asyncHandler from "express-async-handler";
import Settings from "../models/Settings.js";

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ key: "site" });
  if (!settings) {
    settings = await Settings.create({ key: "site" });
  }
  return settings;
}

// @route  GET /api/settings
// @access Public
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

// @route  PUT /api/settings
// @access Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  if (req.body.heroImage !== undefined) {
    settings.heroImage = req.body.heroImage;
  }
  if (req.body.instapayNumber !== undefined) {
    settings.instapayNumber = req.body.instapayNumber;
  }

  await settings.save();
  res.json(settings);
});
