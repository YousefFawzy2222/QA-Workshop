package models;

public class User {
    private String email;
    private String passwordHash;
    private String userName;
    private boolean isAdmin;
    private int loyaltyPoints;

    public User(String email, String passwordHash, String userName, boolean isAdmin, int loyaltyPoints) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.userName = userName;
        this.isAdmin = isAdmin;
        this.loyaltyPoints = loyaltyPoints;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public boolean isAdmin() { return isAdmin; }
    public void setAdmin(boolean admin) { isAdmin = admin; }

    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
}
