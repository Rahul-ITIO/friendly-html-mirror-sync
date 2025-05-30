import CryptoJS from 'crypto-js';

class AES256Util {
    static SECRET_KEY = 'cejXt5sR1ZUSck6AjxRwPvhhZdXkwXcv'; // Replace with your secret key

    static encrypt(text) {
        try {
            const encrypted = CryptoJS.AES.encrypt(
                text,
                this.SECRET_KEY
            ).toString();
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    static decrypt(encrypted) {
        try {
            const decrypted = CryptoJS.AES.decrypt(
                encrypted,
                this.SECRET_KEY
            ).toString(CryptoJS.enc.Utf8);
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
}

export default AES256Util;
