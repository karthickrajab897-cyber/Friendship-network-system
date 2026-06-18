package com.sfn.service;

import com.sfn.model.FriendRequest;
import com.sfn.model.Friendship;
import com.sfn.model.User;
import com.sfn.repository.FriendRequestRepository;
import com.sfn.repository.FriendshipRepository;
import com.sfn.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FriendService {

    private final FriendRequestRepository requestRepo;
    private final FriendshipRepository friendshipRepo;
    private final UserRepository userRepo;

    public FriendService(FriendRequestRepository requestRepo,
                         FriendshipRepository friendshipRepo,
                         UserRepository userRepo) {
        this.requestRepo = requestRepo;
        this.friendshipRepo = friendshipRepo;
        this.userRepo = userRepo;
    }

    public FriendRequest sendRequest(Long senderId, Long receiverId) {
        // Check for existing request
        List<FriendRequest> existing = requestRepo.findBySenderIdAndReceiverId(senderId, receiverId);
        if (!existing.isEmpty()) {
            throw new RuntimeException("Friend request already sent");
        }

        // Check reverse direction too
        List<FriendRequest> reverse = requestRepo.findBySenderIdAndReceiverId(receiverId, senderId);
        if (!reverse.isEmpty()) {
            throw new RuntimeException("This user already sent you a friend request");
        }

        // Check if already friends
        List<Friendship> existingFriendship = friendshipRepo.findByUserPair(senderId, receiverId);
        if (!existingFriendship.isEmpty()) {
            throw new RuntimeException("Already friends");
        }

        FriendRequest request = new FriendRequest(senderId, receiverId, "PENDING");
        return requestRepo.save(request);
    }

    @Transactional
    public Friendship acceptRequest(Long requestId) {
        FriendRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));

        request.setStatus("ACCEPTED");
        requestRepo.save(request);

        Friendship friendship = new Friendship(request.getSenderId(), request.getReceiverId());
        return friendshipRepo.save(friendship);
    }

    @Transactional
    public void rejectRequest(Long requestId) {
        FriendRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));
        request.setStatus("REJECTED");
        requestRepo.save(request);
    }

    public List<FriendRequest> getPendingRequests(Long userId) {
        return requestRepo.findByReceiverIdAndStatus(userId, "PENDING");
    }

    public List<User> getFriends(Long userId) {
        Set<Long> friendIds = getFriendIds(userId);
        return userRepo.findAllById(friendIds);
    }

    public List<User> getMutualFriends(Long userId1, Long userId2) {
        Set<Long> friends1 = getFriendIds(userId1);
        Set<Long> friends2 = getFriendIds(userId2);
        friends1.retainAll(friends2);
        return userRepo.findAllById(friends1);
    }

    public Set<Long> getFriendIds(Long userId) {
        return friendshipRepo.findByUserId(userId).stream()
                .map(f -> f.getUserId1().equals(userId) ? f.getUserId2() : f.getUserId1())
                .collect(Collectors.toSet());
    }

    public long countFriendships() {
        return friendshipRepo.count();
    }
}
