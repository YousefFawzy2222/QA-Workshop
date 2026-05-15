package models;

public class AddressOfUser {
    private int id; // DB
    private String phoneNumber;
    private String buildingName;
    private int aptNumber;
    private int floorNumber;
    private String street;
    private String nearbyLandmark;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

    public int getAptNumber() { return aptNumber; }
    public void setAptNumber(int aptNumber) { this.aptNumber = aptNumber; }

    public int getFloorNumber() { return floorNumber; }
    public void setFloorNumber(int floorNumber) { this.floorNumber = floorNumber; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getNearbyLandmark() { return nearbyLandmark; }
    public void setNearbyLandmark(String nearbyLandmark) { this.nearbyLandmark = nearbyLandmark; }

    public boolean validateUserInfo() {
        if (buildingName == null || buildingName.trim().isEmpty()) return false;
        if (street == null || street.trim().isEmpty()) return false;
        return true;
    }

    public void saveAddress() {
        // Implementation typically calls AddressStore
    }

    public boolean validatePhoneNumber() {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) return false;
        return phoneNumber.matches("^01[0-2,5]{1}[0-9]{8}$"); // Standard Egyptian mobile pattern or just digits
    }
}
