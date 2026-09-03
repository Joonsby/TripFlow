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
    private String nickname;
    private String phoneNumber;
    private String email;

    public User(String passwordHash, String name, String nickname, String phoneNumber, String email) {
        this.passwordHash = passwordHash;
        this.name = name;
        this.nickname = nickname;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }
}
