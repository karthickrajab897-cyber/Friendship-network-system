package com.sfn.controller;

import com.sfn.model.FriendRequest;
import com.sfn.model.Friendship;
import com.sfn.model.User;
import com.sfn.service.FriendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Long> body) {
        try {
            FriendRequest request = friendService.sendRequest(body.get("senderId"), body.get("receiverId"));
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Friendship> acceptRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(friendService.acceptRequest(requestId));
    }

    @PostMapping("/reject/{requestId}")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long requestId) {
        friendService.rejectRequest(requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/requests/{userId}")
    public ResponseEntity<List<FriendRequest>> getPendingRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(friendService.getPendingRequests(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<User>> getFriends(@PathVariable Long userId) {
        return ResponseEntity.ok(friendService.getFriends(userId));
    }

    @GetMapping("/mutual/{id1}/{id2}")
    public ResponseEntity<List<User>> getMutualFriends(@PathVariable Long id1, @PathVariable Long id2) {
        return ResponseEntity.ok(friendService.getMutualFriends(id1, id2));
    }
}
