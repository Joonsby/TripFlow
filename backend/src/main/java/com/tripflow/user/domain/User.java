package com.tripflow.user.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class User {

    private Integer userId;
    private String passwordHash;
    private String name;
    private String phoneNumber;
    private String email;

    public User(
            String passwordHash,
            String name,
            String phoneNumber,
            String email
    ) {
        this.passwordHash = passwordHash;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }
}