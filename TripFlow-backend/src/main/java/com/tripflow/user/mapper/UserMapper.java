package com.tripflow.user.mapper;

import com.tripflow.user.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {

    boolean existsByEmail(@Param("email") String email);

    boolean existsByPhoneNumber(
            @Param("phoneNumber") String phoneNumber
    );

    int insertUser(User user);
}