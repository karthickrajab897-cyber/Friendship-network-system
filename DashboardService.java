package com.sfn.service;

import com.sfn.model.User;
import com.sfn.repository.FriendRequestRepository;
import com.sfn.repository.FriendshipRepository;
import com.sfn.repository.UserRepository;
import com.sfn.service.GraphService;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Lazy;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepo;
    private final FriendshipRepository friendshipRepo;
    private final FriendRequestRepository requestRepo;
    private final GraphService graphService;

    public DashboardService(UserRepository userRepo,
                            FriendshipRepository friendshipRepo,
                            FriendRequestRepository requestRepo,
                            @Lazy GraphService graphService) {
        this.userRepo = userRepo;
        this.friendshipRepo = friendshipRepo;
        this.requestRepo = requestRepo;
        this.graphService = graphService;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalUsers = userRepo.count();
        long totalConnections = friendshipRepo.count();
        long pendingRequests = requestRepo.findAll().stream()
                .filter(r -> "PENDING".equals(r.getStatus())).count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalConnections", totalConnections);
        stats.put("pendingRequests", pendingRequests);

        // Most popular interests aggregation
        Map<String, Integer> interestCount = new LinkedHashMap<>();
        userRepo.findAll().forEach(user -> {
            if (user.getInterests() != null && !user.getInterests().isEmpty()) {
                Arrays.stream(user.getInterests().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(interest -> interestCount.merge(interest, 1, Integer::sum));
            }
        });

        List<Map<String, Object>> popularInterests = interestCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", e.getKey());
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        stats.put("popularInterests", popularInterests);

        // Most popular skills aggregation
        Map<String, Integer> skillCount = new LinkedHashMap<>();
        userRepo.findAll().forEach(user -> {
            if (user.getSkills() != null && !user.getSkills().isEmpty()) {
                Arrays.stream(user.getSkills().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(skill -> skillCount.merge(skill, 1, Integer::sum));
            }
        });

        List<Map<String, Object>> popularSkills = skillCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(8)
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", e.getKey());
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        stats.put("popularSkills", popularSkills);

        // Network growth data (simulated monthly buckets)
        stats.put("growthData", getGrowthData(totalUsers, totalConnections));

        return stats;
    }

    public Map<String, Object> getUserStats(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Map<String, Object> stats = new LinkedHashMap<>();
        
        // Basic personal stats
        long friendsCount = friendshipRepo.findByUserId(userId).size();
        long pendingRequests = requestRepo.findByReceiverIdAndStatus(userId, "PENDING").size();
        
        stats.put("userName", user.getName());
        stats.put("totalFriends", friendsCount);
        stats.put("pendingRequests", pendingRequests);
        
        // Likeminded Connectivity (Suggestions)
        List<Map<String, Object>> suggestions = graphService.getSuggestions(userId);
        stats.put("likemindedMatches", suggestions.stream().limit(5).collect(Collectors.toList()));
        
        // Common skills in the network for comparison
        stats.put("personalSkills", Arrays.asList(user.getSkills().split(",")).stream().map(String::trim).collect(Collectors.toList()));

        return stats;
    }

    private List<Map<String, Object>> getGrowthData(long totalUsers, long totalConnections) {
        List<Map<String, Object>> data = new ArrayList<>();
        String[] months = {"Oct", "Nov", "Dec", "Jan", "Feb", "Mar"};

        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("month", months[i]);
            point.put("users", Math.max(1, (totalUsers * (i + 1)) / months.length));
            point.put("connections", Math.max(0, (totalConnections * (i + 1)) / months.length));
            data.add(point);
        }

        return data;
    }
}
