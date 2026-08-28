package com.tripflow.auth.token;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RefreshTokenMapper {

    int insert(RefreshToken refreshToken);

    RefreshToken findByTokenHash(@Param("tokenHash") String tokenHash);

    int deleteByTokenHash(@Param("tokenHash") String tokenHash);

    int deleteAllByUserId(@Param("userId") Integer userId);

    int deleteExpiredTokens();
}
