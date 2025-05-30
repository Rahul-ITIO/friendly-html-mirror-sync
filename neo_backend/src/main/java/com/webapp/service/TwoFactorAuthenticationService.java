/*The TwoFactorAuthenticationService class facilitates the generation and verification of TOTP-based 2FA, helping to enhance the security of user authentication in the application. It provides methods to generate secret keys, generate QR codes for easy setup, and verify OTP codes*/

package com.webapp.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Service
@Slf4j
public class TwoFactorAuthenticationService {

    // Generates a new secret key for 2FA
    public String generateNewSecret() {

        // @return the generated secret key
        return new DefaultSecretGenerator().generate();
    }

    // Generates a QR code image URI for the given secret
    public String generateQrCodeImageUri(String secret) {
        QrData data = new QrData.Builder()
                .label("Alibou Coding 2FA example")// The label to be displayed in the authenticator app
                .secret(secret)// The label to be displayed in the authenticator app
                .issuer("Alibou-Coding")// The issuer name
                .algorithm(HashingAlgorithm.SHA1)// Hashing algorithm to use (SHA1 is the default for TOTP)
                .digits(6)// Number of digits in the generated OTP
                .period(30)// The time period in seconds for which the OTP is valid
                .build();

        QrGenerator generator = new ZxingPngQrGenerator();
        byte[] imageData = new byte[0];
        try {
            imageData = generator.generate(data);// Generate the QR code image data
        } catch (QrGenerationException e) {
            e.printStackTrace();
            // log.error("Error while generating QR-CODE");
        }
        // @return the URI for the QR code image
        return getDataUriForImage(imageData, generator.getImageMimeType());
    }

    // Validates the given OTP code against the secret key
    public boolean isOtpValid(String secret, String code) {
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

        // @return true if the OTP code is valid, false otherwise
        return verifier.isValidCode(secret, code);
    }

    // Checks if the given OTP code is not valid
    public boolean isOtpNotValid(String secret, String code) {

        // @return true if the OTP code is not valid, false otherwise
        return !this.isOtpValid(secret, code);
    }
}