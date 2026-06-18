package com.sfn.repository;

import com.sfn.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f FROM Friendship f WHERE f.userId1 = ?1 OR f.userId2 = ?1")
    List<Friendship> findByUserId(Long userId);

    @Query("SELECT f FROM Friendship f WHERE (f.userId1 = ?1 AND f.userId2 = ?2) OR (f.userId1 = ?2 AND f.userId2 = ?1)")
    List<Friendship> findByUserPair(Long userId1, Long userId2);
}
