package com.sfn.service;

import com.sfn.model.Friendship;
import com.sfn.model.User;
import com.sfn.repository.FriendshipRepository;
import com.sfn.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GraphService {

    private final FriendshipRepository friendshipRepo;
    private final UserRepository userRepo;
    private final FriendService friendService;

    public GraphService(FriendshipRepository friendshipRepo,
                        UserRepository userRepo,
                        FriendService friendService) {
        this.friendshipRepo = friendshipRepo;
        this.userRepo = userRepo;
        this.friendService = friendService;
    }

    /**
     * Build adjacency list representation of the friendship graph.
     * Each user ID maps to a set of their friend IDs.
     */
    public Map<Long, Set<Long>> buildAdjacencyList() {
        Map<Long, Set<Long>> adjList = new HashMap<>();
        List<Friendship> friendships = friendshipRepo.findAll();

        for (Friendship f : friendships) {
            adjList.computeIfAbsent(f.getUserId1(), k -> new HashSet<>()).add(f.getUserId2());
            adjList.computeIfAbsent(f.getUserId2(), k -> new HashSet<>()).add(f.getUserId1());
        }

        // Ensure all users appear in the graph (even isolated nodes)
        userRepo.findAll().forEach(u -> adjList.computeIfAbsent(u.getId(), k -> new HashSet<>()));

        return adjList;
    }

    /**
     * BFS to find shortest connection path between two users.
     * Returns the list of user IDs forming the shortest path, or empty if no path exists.
     */
    public List<Long> findShortestPath(Long startId, Long endId) {
        if (startId.equals(endId)) {
            return Collections.singletonList(startId);
        }

        Map<Long, Set<Long>> adjList = buildAdjacencyList();

        if (!adjList.containsKey(startId) || !adjList.containsKey(endId)) {
            return Collections.emptyList();
        }

        Queue<Long> queue = new LinkedList<>();
        Map<Long, Long> parent = new HashMap<>();
        Set<Long> visited = new HashSet<>();

        queue.add(startId);
        visited.add(startId);
        parent.put(startId, null);

        while (!queue.isEmpty()) {
            Long current = queue.poll();

            if (current.equals(endId)) {
                List<Long> path = new ArrayList<>();
                Long node = endId;
                while (node != null) {
                    path.add(0, node);
                    node = parent.get(node);
                }
                return path;
            }

            for (Long neighbor : adjList.getOrDefault(current, Collections.emptySet())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    parent.put(neighbor, current);
                    queue.add(neighbor);
                }
            }
        }

        return Collections.emptyList();
    }

    /**
     * DFS to find all connected components in the friendship graph.
     */
    public List<Set<Long>> findConnectedComponents() {
        Map<Long, Set<Long>> adjList = buildAdjacencyList();
        Set<Long> visited = new HashSet<>();
        List<Set<Long>> components = new ArrayList<>();

        for (Long node : adjList.keySet()) {
            if (!visited.contains(node)) {
                Set<Long> component = new HashSet<>();
                dfs(node, adjList, visited, component);
                components.add(component);
            }
        }

        return components;
    }

    private void dfs(Long node, Map<Long, Set<Long>> adjList, Set<Long> visited, Set<Long> component) {
        visited.add(node);
        component.add(node);

        for (Long neighbor : adjList.getOrDefault(node, Collections.emptySet())) {
            if (!visited.contains(neighbor)) {
                dfs(neighbor, adjList, visited, component);
            }
        }
    }

    /**
     * Get friend suggestions for a user using 2-hop BFS (friends-of-friends)
     * and compatibility scoring based on common interests, skills, and mutual friends.
     */
    public List<Map<String, Object>> getSuggestions(Long userId) {
        Set<Long> directFriends = friendService.getFriendIds(userId);
        Map<Long, Set<Long>> adjList = buildAdjacencyList();
        User currentUser = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Map<Long, Integer> mutualFriendCount = new HashMap<>();
        Set<Long> candidates = new HashSet<>();

        // 2-hop BFS: find friends-of-friends
        for (Long friendId : directFriends) {
            for (Long fof : adjList.getOrDefault(friendId, Collections.emptySet())) {
                if (!fof.equals(userId) && !directFriends.contains(fof)) {
                    candidates.add(fof);
                    mutualFriendCount.merge(fof, 1, Integer::sum);
                }
            }
        }

        // Also include all non-friend users as potential suggestions
        for (User u : userRepo.findAll()) {
            if (!u.getId().equals(userId) && !directFriends.contains(u.getId())) {
                candidates.add(u.getId());
            }
        }

        List<Map<String, Object>> suggestions = new ArrayList<>();

        for (Long candidateId : candidates) {
            User candidate = userRepo.findById(candidateId).orElse(null);
            if (candidate == null) continue;

            // Calculate compatibility score
            int commonInterests = countCommon(currentUser.getInterests(), candidate.getInterests());
            int commonSkills = countCommon(currentUser.getSkills(), candidate.getSkills());
            int mutualFriends = mutualFriendCount.getOrDefault(candidateId, 0);

            double score = 0;
            int maxInterests = Math.max(countItems(currentUser.getInterests()), countItems(candidate.getInterests()));
            int maxSkills = Math.max(countItems(currentUser.getSkills()), countItems(candidate.getSkills()));

            if (maxInterests > 0) score += (double) commonInterests / maxInterests * 40;
            if (maxSkills > 0) score += (double) commonSkills / maxSkills * 30;
            score += Math.min(mutualFriends * 10, 30); // Cap mutual friends contribution at 30

            score = Math.min(score, 100);

            // Build reason strings
            List<String> reasons = new ArrayList<>();
            if (mutualFriends > 0) reasons.add(mutualFriends + " mutual friend" + (mutualFriends > 1 ? "s" : ""));
            if (commonInterests > 0) reasons.add(commonInterests + " common interest" + (commonInterests > 1 ? "s" : ""));
            if (commonSkills > 0) reasons.add(commonSkills + " common skill" + (commonSkills > 1 ? "s" : ""));

            Map<String, Object> suggestion = new LinkedHashMap<>();
            suggestion.put("user", candidate);
            suggestion.put("score", Math.round(score));
            suggestion.put("reasons", reasons);
            suggestion.put("mutualFriends", mutualFriends);
            suggestion.put("commonInterests", commonInterests);
            suggestion.put("commonSkills", commonSkills);

            suggestions.add(suggestion);
        }

        // Sort by compatibility score descending
        suggestions.sort((a, b) -> Long.compare((long) b.get("score"), (long) a.get("score")));

        return suggestions;
    }

    private int countCommon(String list1, String list2) {
        if (list1 == null || list2 == null || list1.isEmpty() || list2.isEmpty()) return 0;
        Set<String> set1 = Arrays.stream(list1.split(","))
                .map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
        Set<String> set2 = Arrays.stream(list2.split(","))
                .map(String::trim).map(String::toLowerCase).collect(Collectors.toSet());
        set1.retainAll(set2);
        return set1.size();
    }

    private int countItems(String list) {
        if (list == null || list.isEmpty()) return 0;
        return (int) Arrays.stream(list.split(",")).map(String::trim).filter(s -> !s.isEmpty()).count();
    }

    /**
     * Get full network data formatted for vis.js visualization.
     */
    public Map<String, Object> getNetworkData() {
        List<User> users = userRepo.findAll();
        List<Friendship> friendships = friendshipRepo.findAll();

        List<Map<String, Object>> nodes = users.stream().map(u -> {
            Map<String, Object> node = new LinkedHashMap<>();
            node.put("id", u.getId());
            node.put("label", u.getName());
            node.put("color", u.getAvatarColor());
            node.put("location", u.getLocation());
            node.put("interests", u.getInterests());
            node.put("skills", u.getSkills());
            return node;
        }).collect(Collectors.toList());

        List<Map<String, Object>> edges = friendships.stream().map(f -> {
            Map<String, Object> edge = new LinkedHashMap<>();
            edge.put("from", f.getUserId1());
            edge.put("to", f.getUserId2());
            return edge;
        }).collect(Collectors.toList());

        Map<String, Object> network = new LinkedHashMap<>();
        network.put("nodes", nodes);
        network.put("edges", edges);
        return network;
    }
}
