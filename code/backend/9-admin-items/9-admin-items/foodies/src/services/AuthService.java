package services;

import models.User;
import models.UserStore;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserStore userStore;

    public static class AuthResult {
        public boolean success;
        public String error;
        public boolean isAdmin;

        public AuthResult(boolean success, String error, boolean isAdmin) {
            this.success = success;
            this.error = error;
            this.isAdmin = isAdmin;
        }
    }

    public AuthResult register(String email, String password) {
        try {
            if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                return new AuthResult(false, "Invalid input", false);
            }
            if (!email.matches("^[\\w.+-]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                return new AuthResult(false, "Invalid email", false);
            }
            if (password.length() < 8) {
                return new AuthResult(false, "Invalid password", false);
            }

            if (userStore.emailExists(email)) {
                return new AuthResult(false, "Invalid email", false);
            }

            String hash = BCrypt.hashpw(password, BCrypt.gensalt(10));
            userStore.add(email, hash, "", false);

            return new AuthResult(true, null, false);
        } catch (Exception e) {
            System.err.println("Register Error: " + e.getMessage());
            return new AuthResult(false, "Internal server error", false);
        }
    }

    public AuthResult login(String email, String password) {
        try {
            if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                return new AuthResult(false, "Invalid email or password", false);
            }

            User user = userStore.findByEmail(email);
            if (user == null) {
                return new AuthResult(false, "Invalid email or password", false);
            }

            boolean isMatch = BCrypt.checkpw(password, user.getPasswordHash());
            if (!isMatch) {
                return new AuthResult(false, "Invalid email or password", false);
            }

            return new AuthResult(true, null, user.isAdmin());
        } catch (Exception e) {
            System.err.println("Login Error: " + e.getMessage());
            return new AuthResult(false, "Internal server error", false);
        }
    }
}
