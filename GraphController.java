package com.sfn.controller;

import com.sfn.model.User;
import com.sfn.service.GraphService;
import com.sfn.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final GraphService graphService;
    private final UserService userService;

    public GraphController(GraphService graphService, UserService userService) {
        this.graphService = graphService;
        this.userService = userService;
    }

    @GetMapping("/network")
    public ResponseEntity<Map<String, Object>> getNetworkData() {
        return ResponseEntity.ok(graphService.getNetworkData());
    }

    @GetMapping("/path/{id1}/{id2}")
    public ResponseEntity<Map<String, Object>> getShortestPath(@PathVariable Long id1, @PathVariable Long id2) {
        List<Long> path = graphService.findShortestPath(id1, id2);

        List<Map<String, Object>> pathUsers = path.stream().map(userId -> {
            User user = userService.getUserById(userId).orElse(null);
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", userId);
            info.put("name", user != null ? user.getName() : "Unknown");
            return info;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("path", pathUsers);
        result.put("distance", path.isEmpty() ? -1 : path.size() - 1);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/components")
    public ResponseEntity<Map<String, Object>> getConnectedComponents() {
        List<Set<Long>> components = graphService.findConnectedComponents();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("componentCount", components.size());
        result.put("components", components);
        result.put("largestComponent", components.stream()
                .max(Comparator.comparingInt(Set::size))
                .orElse(Collections.emptySet()).size());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/adjacency")
    public ResponseEntity<Map<Long, Set<Long>>> getAdjacencyList() {
        return ResponseEntity.ok(graphService.buildAdjacencyList());
    }
}
