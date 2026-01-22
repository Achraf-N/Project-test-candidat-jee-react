package com.tsix.apirest.service;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

public class MailService {

    private static final String email = System.getenv("MAIL_USER");
    private static final Properties properties = new Properties();
    private static final Session session;

    static {
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.host", "smtp.gmail.com");
        properties.put("mail.smtp.port", "587");
        properties.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        properties.put("mail.debug", "true");

        session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                String password = System.getenv("MAIL_PWD");
                return new PasswordAuthentication(email, password);
            }
        });
    }

    public static String sendMail(String subject, String body, String recipient)
            throws MessagingException {

        if (recipient == null || recipient.trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient email address cannot be null or empty");
        }

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(email));
        message.setRecipients(
                Message.RecipientType.TO,
                InternetAddress.parse(recipient)
        );
        message.setSubject(subject);
        message.setText(body);

        Transport.send(message);
        return "Email sent successfully to " + recipient;
    }

}
