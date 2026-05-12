package services;

import models.AddressOfUser;
import models.AddressStore;
import models.User;
import models.UserStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserStore userStore;

    @Autowired
    private AddressStore addressStore;

    // Loyalty constants from class diagram
    private static final float EGP_PER_POINT = 0.01f;
    private static final int MIN_REDEEMABLE_POINTS = 1000;

    public static class ProfileResult {
        public boolean success;
        public String email;
        public String userName;
        public boolean isAdmin;
        public int loyaltyPoints;
        public float loyaltyEGP;
        public boolean isRedeemable;
        public List<AddressOfUser> addresses;
        public String error;

        public ProfileResult(boolean success, String error) {
            this.success = success;
            this.error = error;
        }
    }

    public static class LoyaltyResult {
        public boolean success;
        public int pointsBalance;
        public float egpValue;
        public boolean isRedeemable;
        public String error;

        public LoyaltyResult(boolean success, int pointsBalance, float egpValue, boolean isRedeemable, String error) {
            this.success = success;
            this.pointsBalance = pointsBalance;
            this.egpValue = egpValue;
            this.isRedeemable = isRedeemable;
            this.error = error;
        }
    }

    // From class diagram: Loyalty.getEGPValue(): float
    // Returns pointsBalance * egpPerPoint
    private float getEGPValue(int points) {
        return points * EGP_PER_POINT;
    }

    // From class diagram: Loyalty.isRedeemable(): boolean
    // Returns pointsBalance >= 1000
    private boolean isRedeemable(int points) {
        return points >= MIN_REDEEMABLE_POINTS;
    }

    // Get full user profile
    public ProfileResult getUserProfile(String email) {
        try {
            User user = userStore.findByEmail(email);
            if (user == null) {
                return new ProfileResult(false, "User not found");
            }

            ProfileResult result = new ProfileResult(true, null);
            result.email = user.getEmail();
            result.userName = user.getUserName();
            result.isAdmin = user.isAdmin();
            result.loyaltyPoints = user.getLoyaltyPoints();
            result.loyaltyEGP = getEGPValue(user.getLoyaltyPoints());
            result.isRedeemable = isRedeemable(user.getLoyaltyPoints());
            result.addresses = addressStore.findByUser(email);
            return result;

        } catch (Exception e) {
            return new ProfileResult(false, "Failed to get profile: " + e.getMessage());
        }
    }

    // From class diagram: User.changeName(String): void
    public ProfileResult changeUserName(String email, String newName) {
        try {
            if (newName == null || newName.trim().isEmpty()) {
                return new ProfileResult(false, "Name cannot be empty");
            }

            User user = userStore.findByEmail(email);
            if (user == null) {
                return new ProfileResult(false, "User not found");
            }

            userStore.updateName(email, newName.trim());

            // Return updated profile
            return getUserProfile(email);

        } catch (Exception e) {
            return new ProfileResult(false, "Failed to update name: " + e.getMessage());
        }
    }

    // Get loyalty info for a user
    // From class diagram: Loyalty.getPointsBalance(), getEGPValue(), isRedeemable()
    public LoyaltyResult getLoyaltyInfo(String email) {
        try {
            User user = userStore.findByEmail(email);
            if (user == null) {
                return new LoyaltyResult(false, 0, 0, false, "User not found");
            }

            int points = user.getLoyaltyPoints();
            return new LoyaltyResult(
                    true,
                    points,
                    getEGPValue(points),
                    isRedeemable(points),
                    null
            );

        } catch (Exception e) {
            return new LoyaltyResult(false, 0, 0, false, "Failed to get loyalty info: " + e.getMessage());
        }
    }
}
