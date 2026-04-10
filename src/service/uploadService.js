import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const uploadService = {
    uploadStaffDocument: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post(`${BASE_API}/upload/staff-document`, formData, {
            headers: { ...h(), 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default uploadService;
