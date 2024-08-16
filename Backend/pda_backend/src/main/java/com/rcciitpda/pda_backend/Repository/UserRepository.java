package com.rcciitpda.pda_backend.Repository;

import com.rcciitpda.pda_backend.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<Users, Integer> {

    @Query("SELECT token FROM Users")
    List<UUID> getAllTokens();

    @Query("SELECT name FROM Users WHERE token = ?1")
    String getNameByToken(UUID token);

    @Modifying
    @Query("UPDATE Users SET token = null WHERE token = ?1")
    int updateTokenToNull(UUID token);

    @Query("SELECT password FROM Users")
    String getAllPasswords();

    @Modifying
    @Query("UPDATE Users SET token = ?1 WHERE password = ?2")
    int updateTokenByPassword(UUID token, String password);
}
