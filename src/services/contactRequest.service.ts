import ContactRequest from "../models/contactRequest.model";
import ApiError from "../global/errors/ApiError";

interface FilterOptions {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export const addContactRequestService = async (name: string, email: string, phoneNumber: string, message: string) => {
    try {
        let contactRequest = await ContactRequest.findOne({ message });
        if (contactRequest) {
            throw new ApiError(400, 'A contact request with this message already exists.');
        }
        contactRequest = new ContactRequest({ name, email, phoneNumber, message });
        await contactRequest.save();
        contactRequest.isNewRequest = true;
        return contactRequest;
    } catch (error: any) {
        throw new ApiError(error.statusCode || 500, error.message || 'Error processing contact request');
    }
};

export const getContactRequestsService = async (options: FilterOptions = {}) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = options;
        const query: any = {};

        if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { ...query.createdAt, $lte: end };
        }
        const skip = (page - 1) * limit;

        const total = await ContactRequest.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const contactRequests = await ContactRequest.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            contactRequests,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    } catch (error: any) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Failed to fetch contact requests"
        );
    }
};

export const updateContactRequestStatusService = async (id: string, status: string) => {
    try {
        await ContactRequest.findByIdAndUpdate(id, { status });
    } catch (error: any) {
        throw new ApiError(error.statusCode, error.message);
    }
};
