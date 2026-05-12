package models;

import java.time.LocalTime;

public class Restaurant {
    private int id; // Added for DB interaction
    private String restName;
    private float restRate;
    private float restMaxDeliveryTime;
    private float restMinDeliveryTime;
    private float restDeliveryCost;
    private String restLocation;
    private String openTime;
    private String closeTime;
    private boolean isOpen;

    public Restaurant() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getRestName() { return restName; }
    public void setRestName(String restName) { this.restName = restName; }

    public float getRestRate() { return restRate; }
    public void setRestRate(float restRate) { this.restRate = restRate; }

    public float getRestMaxDeliveryTime() { return restMaxDeliveryTime; }
    public void setRestMaxDeliveryTime(float restMaxDeliveryTime) { this.restMaxDeliveryTime = restMaxDeliveryTime; }

    public float getRestMinDeliveryTime() { return restMinDeliveryTime; }
    public void setRestMinDeliveryTime(float restMinDeliveryTime) { this.restMinDeliveryTime = restMinDeliveryTime; }

    public float getRestDeliveryCost() { return restDeliveryCost; }
    public void setRestDeliveryCost(float restDeliveryCost) { this.restDeliveryCost = restDeliveryCost; }

    public String getRestLocation() { return restLocation; }
    public void setRestLocation(String restLocation) { this.restLocation = restLocation; }

    public String getOpenTime() { return openTime; }
    public void setOpenTime(String openTime) { this.openTime = openTime; }

    public String getCloseTime() { return closeTime; }
    public void setCloseTime(String closeTime) { this.closeTime = closeTime; }

    public boolean getIsOpen() { return isOpen; }
    public void setIsOpen(boolean isOpen) { this.isOpen = isOpen; }

    // Follows the flowchart logic: FA-FC-Restaurant.drawio
    public boolean checkOperatingStatus() {
        if (this.openTime == null || this.closeTime == null || this.openTime.isEmpty() || this.closeTime.isEmpty()) {
            this.isOpen = false;
            return false;
        }
        
        try {
            LocalTime now = LocalTime.now();
            LocalTime open = LocalTime.parse(this.openTime);
            LocalTime close = LocalTime.parse(this.closeTime);

            if (!now.isBefore(open) && !now.isAfter(close)) {
                this.isOpen = true;
                return true;
            } else {
                this.isOpen = false;
                return false;
            }
        } catch (Exception e) {
            this.isOpen = false;
            return false;
        }
    }
}
