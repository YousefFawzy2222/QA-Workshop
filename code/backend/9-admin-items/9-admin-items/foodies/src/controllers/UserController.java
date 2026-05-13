package controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // Mock method to simulate JWT email extraction
    private String getUserEmail(Map<String, String> headers) {
        return headers.getOrDefault("x-user-email", "guest@example.com");
    }

    // GET /api/user/profile — Get full user profile
    @GetMapping("/profile")
    public ResponseEntity<UserService.ProfileResult> getProfileController(
            @RequestHeader Map<String, String> headers) {
        String email = getUserEmail(headers);
        UserService.ProfileResult result = userService.getUserProfile(email);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // PUT /api/user/profile — Update user name
    @PutMapping("/profile")
    public ResponseEntity<UserService.ProfileResult> updateProfileController(
            @RequestHeader Map<String, String> headers,
            @RequestBody Map<String, String> body) {
        String email = getUserEmail(headers);
        String newName = body.get("userName");
        UserService.ProfileResult result = userService.changeUserName(email, newName);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // GET /api/user/loyalty — Get loyalty points info
    @GetMapping("/loyalty")
    public ResponseEntity<UserService.LoyaltyResult> getLoyaltyController(
            @RequestHeader Map<String, String> headers) {
        String email = getUserEmail(headers);
        UserService.LoyaltyResult result = userService.getLoyaltyInfo(email);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
