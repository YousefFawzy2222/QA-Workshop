package controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.AuthService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    public static class AuthRequest {
        public String email;
        public String password;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerController(@RequestBody AuthRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.email == null || request.password == null) {
            response.put("success", false);
            response.put("error", "Invalid request body");
            return ResponseEntity.badRequest().body(response);
        }

        AuthService.AuthResult result = authService.register(request.email, request.password);

        if (result.success) {
            response.put("success", true);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            response.put("success", false);
            response.put("error", result.error);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginController(@RequestBody AuthRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (request.email == null || request.password == null) {
            response.put("success", false);
            response.put("error", "Invalid request body");
            return ResponseEntity.badRequest().body(response);
        }

        AuthService.AuthResult result = authService.login(request.email, request.password);

        if (result.success) {
            response.put("success", true);
            response.put("isAdmin", result.isAdmin);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", result.error);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
