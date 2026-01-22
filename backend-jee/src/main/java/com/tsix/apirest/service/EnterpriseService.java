package com.tsix.apirest.service;

import com.tsix.apirest.entity.enterprise.AdminAccount;
import com.tsix.apirest.entity.enterprise.Enterprise;
import com.tsix.apirest.dto.res.LoginAndResponse;
import com.tsix.apirest.exceptions.userExceptions.AlreadyExistException;
import com.tsix.apirest.exceptions.userExceptions.InvalidCredentialException;
import com.tsix.apirest.repository.AdminAccountRepo;
import com.tsix.apirest.repository.EnterpriseRepo;
import com.tsix.apirest.utils.Generator;
import com.tsix.apirest.security.JwtUtils;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Optional;

@Stateless
public class EnterpriseService {
    @Inject
    private EnterpriseRepo repo ;
    @Inject
    private AdminAccountRepo adminAccountRepo ;
    private static final String dummyPassword = "$2a$12$C6UzMDM.H6dfI/f/IKcEeOe4Gk6bZx1vKp2M9U1J0zQeC9Z9e" ;
    public EnterpriseService() {}

    public LoginAndResponse insertEnterprise(Enterprise enterprise){
            repo.findByName(enterprise.getName())
                    .ifPresent(e -> {throw new AlreadyExistException("Enterprise with name "
                    + e.getName() +
                    " already is already taken choose another name");});
            Enterprise enterpriseSaved = repo.save(enterprise);
            AdminAccount adminAccount = Generator.accountGenerator(enterpriseSaved);
            String plainPassword = adminAccount.getPassword();
            String hashedPwd = BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
            adminAccount.setPassword(hashedPwd);
            adminAccountRepo.save(adminAccount);
            return new LoginAndResponse(adminAccount.getUsername(), plainPassword) ;
    }

    public String authManager(LoginAndResponse loginAndResponse){
        Optional<AdminAccount> adminAccount = adminAccountRepo.findByUsername(loginAndResponse.username()) ;
        String hashToCheck = (adminAccount.isPresent())
                ? adminAccount.get().getPassword()
                : dummyPassword ;
        boolean passwordMatches = BCrypt.checkpw(loginAndResponse.password(), hashToCheck) ;

        if (adminAccount.isPresent() && passwordMatches) {
            return JwtUtils.generateToken(
                    adminAccount.get().getId() ,
                    adminAccount.get().getEnterprise().getId()
            ) ;
        }
        throw new InvalidCredentialException();
    }
}
