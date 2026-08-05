package com.tripflow.auth.refresh;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RefreshTokenMapper {

    int insert(RefreshToken refreshToken);

    RefreshToken findByTokenHash(
            @Param("tokenHash") String tokenHash
    );

    int deleteByTokenHash(
            @Param("tokenHash") String tokenHash
    );

    int deleteExpiredTokens();
}