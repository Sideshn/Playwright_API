const BASE_URL = process.env.BASE_URL || 'https://automationexercise.com/api'; // Only this file should have the fallback value

const ENDPOINTS = {
    PRODUCTS: {
        LIST: '/productsList',
        SEARCH: '/searchProduct'
    },
    BRANDS: {
        LIST: '/brandsList'
    },
    AUTH: {
        VERIFY_LOGIN: '/verifyLogin',
        CREATE_ACCOUNT: '/createAccount',
        DELETE_ACCOUNT: '/deleteAccount'
    },
    USER: {
        GET_DETAILS: '/getUserDetailByEmail',
        UPDATE_ACCOUNT: '/updateAccount'
    }
};

module.exports = {
    BASE_URL,
    ENDPOINTS
};
