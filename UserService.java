package com.sfn.service;

import com.sfn.model.User;
import com.sfn.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updated) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setName(updated.getName());
        user.setBio(updated.getBio());
        user.setLocation(updated.getLocation());
        user.setInterests(updated.getInterests());
        user.setSkills(updated.getSkills());
        if (updated.getAvatarColor() != null) {
            user.setAvatarColor(updated.getAvatarColor());
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public long count() {
        return userRepository.count();
    }
}
