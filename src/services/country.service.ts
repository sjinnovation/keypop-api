import Country from "../models/country.model";
import ApiError from "../global/errors/ApiError";
import httpStatus from "http-status";

// Add a new country
export const addCountryService = async (name: string, code: string) => {
  try {
    const existingCountry = await Country.findOne({ code });
    if (existingCountry) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Country already exists.");
    }

    const country = new Country({ name, code });
    await country.save();

    return country;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error adding country");
  }
};

// Get all active countries
export const getAllCountriesService = async () => {
  try {
    const countries = await Country.find({ isActive: true });
    return countries;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching countries");
  }
};

// Get a specific country by ID
export const getCountryByIDService = async (id: string) => {
  try {
    const country = await Country.findById(id);
    if (!country) {
      throw new ApiError(httpStatus.NOT_FOUND, "Country not found");
    }
    return country;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching country details");
  }
};

// Get a specific country by country code
export const getCountryByCountryCodeService = async ({ code, id, }: { code?: string; id?: string; }) => {
  try {
    let country;

    if (code) {
      country = await Country.findOne({ code: code.toUpperCase() });
    }

    if (!country) {
      throw new ApiError(httpStatus.NOT_FOUND, "Country not found");
    }

    return country;
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Error fetching country details"
    );
  }
};

// Update a specific country by ID
export const updateCountryStatusService = async (id: string, isActive: boolean) => {
  try {
    const updatedCountry = await Country.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true });
    if (!updatedCountry) {
      throw new ApiError(httpStatus.NOT_FOUND, "Country not found");
    }
    return updatedCountry;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error updating country status");
  }
};

// Update a specific country by ID with new name and code
export const deleteCountryService = async (id: string) => {
  try {
    const country = await Country.findById(id);
    if (!country) {
      throw new ApiError(httpStatus.NOT_FOUND, "Country not found");
    }

    await country.deleteOne();
    return country;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error deleting country");
  }
};