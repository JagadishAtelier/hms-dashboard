import axios from 'axios';
import BASE_API from '../api/baseurl.js';
import authService from './authService.js';

const h = () => ({ Authorization: `Bearer ${authService.getToken()}` });

const whatsappService = {
    sendReceipt: ({ to, customerName, amount, transactionId, date, saleId }) =>
        axios.post(`${BASE_API}/whatsapp/send-receipt`, {
            to, customerName, amount, transactionId, date,
            receiptUrl: `receipt/${saleId}`,
        }, { headers: h() }),
};

export default whatsappService;
