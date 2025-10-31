import { Request, Response } from "express";
import catchAsync from "../global/middlewares/catchAsync";
import sendResponse from "../global/middlewares/sendResponse";
import httpStatus from "http-status";
import { ApiMessages } from "../Constants/Messages";
import {
  addCountryService,
  getAllCountriesService,
  getCountryByIDService,
  getCountryByCountryCodeService,
  updateCountryStatusService,
  deleteCountryService
} from "../services/country.service";

// Controller for managing countries
export const addCountry = catchAsync(async (req: Request, res: Response) => {
  const { name, code } = req.body;

  const country = await addCountryService(name, code);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: ApiMessages.COUNTRY_ADDED,
    data: country,
  });
});

// Controller for fetching all countries
export const getAllCountries = catchAsync(async (req: Request, res: Response) => {
  const countries = await getAllCountriesService();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.COUNTRIES_FETCHED,
    data: countries,
  });
});

// Controller for fetching a single country by ID
export const getCountryByID = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const country = await getCountryByIDService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.COUNTRY_FETCHED,
    data: country,
  });
});

export const getCountryByCountryCode = catchAsync(async (req: Request, res: Response) => {
  const { code, id } = req.query as { code?: string; id?: string };
  const country = await getCountryByCountryCodeService({ code, id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.COUNTRY_FETCHED,
    data: country,
  });
});

// Controller for updating the status of a country
export const updateCountryStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const updatedCountry = await updateCountryStatusService(id, isActive);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.COUNTRY_STATUS_UPDATED,
    data: updatedCountry,
  });
});

// Controller for deleting a country
export const deleteCountry = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const country = await deleteCountryService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.COUNTRY_DELETED,
    data: country,
  });
});