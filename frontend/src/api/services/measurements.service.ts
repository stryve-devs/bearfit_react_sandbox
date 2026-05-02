import api from '../client';

export const measurementsService = {
    async presignMeasurementPhoto(filename: string, contentType: string) {
        const res = await api.post('/uploads/measurement-photo', { filename, contentType });
        return res.data; // { uploadUrl, publicUrl, key }
    },

    async createMeasurement(payload: any) {
        const res = await api.post('/measurements', payload);
        return res.data;
    }
};

