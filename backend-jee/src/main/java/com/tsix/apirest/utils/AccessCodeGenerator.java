package com.tsix.apirest.utils;
import java.security.SecureRandom;
public class AccessCodeGenerator {

    public static String generateAccessCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder accessCode = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            char letter = (char) ('A' + random.nextInt(26));
            accessCode.append(letter);
        }

        for (int i = 0; i < 2; i++) {
            char digit = (char) ('0' + random.nextInt(10));
            accessCode.append(digit);
        }

        return accessCode.toString();
    }
}
