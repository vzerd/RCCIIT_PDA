package com.rcciitpda.pda_backend.Repository;

import com.rcciitpda.pda_backend.Model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UserRepository extends JpaRepository<Users, Integer> {

    @Query("SELECT token FROM Users")
    List<String> getAllTokens();

    @Query("SELECT name FROM Users WHERE password = ?1")
    String getNameByPassword(String password);

    @Modifying
    @Query("UPDATE Users SET token = null WHERE token = ?1")
    int updateTokenToNull(String token);

    @Query("SELECT password FROM Users")
    String getAllPasswords();

    @Modifying
    @Query("UPDATE Users SET token = ?1 WHERE password = ?2")
    int updateTokenByPassword(String token, String password);
}
