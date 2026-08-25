package com.tripflow.host.mapper;

import com.tripflow.host.domain.Host;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HostMapper {

    boolean existsByUserId(@Param("userId") Integer userId);

    boolean existsByBusinessNumber(
            @Param("businessNumber") String businessNumber
    );

    boolean existsApprovedByUserId(@Param("userId") Integer userId);

    int insertHost(Host host);
}
