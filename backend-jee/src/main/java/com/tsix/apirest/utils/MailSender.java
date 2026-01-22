package com.tsix.apirest.utils;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class MailSender {
    private String mail ;
    private String password ;
    private String host ;

    public MailSender(){}

    public  void sendEmail(String subject , String body , String recipient){

    }


}
