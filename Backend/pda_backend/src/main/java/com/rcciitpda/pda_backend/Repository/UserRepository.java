package com.rcciitpda.pda_backend.Repository;

import com.rcciitpda.pda_backend.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UserRepository extends JpaRepository<Users, Integer> {

    @Query("SELECT token FROM Users")
    List<String> getAllTokens();

    @Modifying
    @Query("UPDATE Users SET token = null WHERE token = ?1")
    int updateTokenToNull(String token);

    @Modifying
    @Query("UPDATE Users SET token = ?1 WHERE name = ?2")
    int updateTokenByName(String token, String name);

    @Query("SELECT password FROM Users WHERE name = ?1")
    String getPasswordByName(String name);

    @Query("SELECT name FROM Users WHERE token = ?1")
    boolean existsByToken(String token);
}
