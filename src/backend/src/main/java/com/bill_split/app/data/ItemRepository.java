package com.bill_split.app.data;

import java.util.List;
import com.bill_split.app.data.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    @Query("SELECT s.items FROM Session s WHERE s.id = :sessionId")
    List<Item> findBySessionId(@Param("sessionId") Long sessionId);
}