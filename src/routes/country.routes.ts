import express from "express";
import { authMiddleware } from "../global/middlewares/userAuthMiddleware";
import { requireAdminRole } from "../global/middlewares/requireAdminRole";
import { addCountry, getCountryByID, getCountryByCountryCode, getAllCountries, updateCountryStatus, deleteCountry } from "../controllers/country.controller";

const router = express.Router();

router.post("/", authMiddleware, requireAdminRole, addCountry);
router.get("/all", getAllCountries);
router.get("/", getCountryByCountryCode);
router.get("/:id", authMiddleware, getCountryByID);
router.put("/update-status/:id", authMiddleware, requireAdminRole, updateCountryStatus);
router.delete("/:id", authMiddleware, requireAdminRole, deleteCountry);
export default router;