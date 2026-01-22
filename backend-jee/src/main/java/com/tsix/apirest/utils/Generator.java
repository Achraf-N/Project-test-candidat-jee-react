package com.tsix.apirest.utils;

import com.tsix.apirest.entity.enterprise.AdminAccount;
import com.tsix.apirest.entity.enterprise.Enterprise;

import java.security.SecureRandom;

public class Generator {

    public Generator(){}
    private static String normalize(String input){
         return input.toLowerCase()
                .replaceAll("\\s+", "")
                .replaceAll("[^a-z0-9]", "");
    }

    private static String usernameGenerator(String input){
        String normalized = normalize(input) ;
        String randomUUID = java.util.UUID.randomUUID().toString().substring(0 , 4);
        return normalized + "_" + randomUUID;
    }

    private static String passwordGenerator(){
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        SecureRandom secureRandom = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(characters.charAt(secureRandom.nextInt(characters.length())));
        }
        return sb.toString();
    }

    public static AdminAccount accountGenerator(Enterprise enterprise){
        return new AdminAccount(usernameGenerator(enterprise.getName())
                , passwordGenerator()
                , enterprise);
    }
}
