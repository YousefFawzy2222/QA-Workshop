package services;

import models.ItemStore;
import models.Restaurant;
import models.RestaurantStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantStore restaurantStore;
    @Autowired
    private ItemStore itemStore;

    public static class RestaurantResult {
        public boolean success;
        public Restaurant restaurant;
        public List<Restaurant> restaurants;
        public String error;

        public RestaurantResult(boolean success, Restaurant restaurant, List<Restaurant> restaurants, String error) {
            this.success = success;
            this.restaurant = restaurant;
            this.restaurants = restaurants;
            this.error = error;
        }
    }

    private boolean validateTimeFormat(String time) {
        return time != null && time.matches("^\\d{2}:\\d{2}(:\\d{2})?$");
    }

    private int timeToMinutes(String time) {
        String[] parts = time.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    private String validateRestaurantFields(Restaurant data) {
        if (data.getRestName() == null || data.getRestName().trim().isEmpty()) return "Restaurant name is required";
        if (data.getRestLocation() == null || data.getRestLocation().trim().isEmpty()) return "Restaurant location is required";
        if (data.getRestDeliveryCost() < 0) return "Delivery price cannot be negative";
        if (data.getRestMaxDeliveryTime() <= 0) return "Delivery time must be greater than 0"; 
        if (!validateTimeFormat(data.getOpenTime())) return "Open time is required and must be in HH:MM format";
        if (!validateTimeFormat(data.getCloseTime())) return "Close time is required and must be in HH:MM format";
        if (timeToMinutes(data.getCloseTime()) <= timeToMinutes(data.getOpenTime())) return "Close time must be after open time";
        return null;
    }

    public RestaurantResult addRestaurant(Restaurant data) {
        String err = validateRestaurantFields(data);
        if (err != null) return new RestaurantResult(false, null, null, err);

        Restaurant existing = restaurantStore.findByName(data.getRestName());
        if (existing != null) return new RestaurantResult(false, null, null, "A restaurant with this name already exists");

        Restaurant created = restaurantStore.add(data);
        return new RestaurantResult(true, created, null, null);
    }

    public RestaurantResult updateRestaurant(int id, Restaurant data) {
        Restaurant existing = restaurantStore.findById(id);
        if (existing == null) return new RestaurantResult(false, null, null, "Restaurant not found");

        if (data.getRestName() != null) existing.setRestName(data.getRestName());
        if (data.getRestLocation() != null) existing.setRestLocation(data.getRestLocation());
        if (data.getRestDeliveryCost() >= 0) existing.setRestDeliveryCost(data.getRestDeliveryCost());
        if (data.getRestMinDeliveryTime() > 0) existing.setRestMinDeliveryTime(data.getRestMinDeliveryTime());
        if (data.getRestMaxDeliveryTime() > 0) existing.setRestMaxDeliveryTime(data.getRestMaxDeliveryTime());
        if (data.getOpenTime() != null) existing.setOpenTime(data.getOpenTime());
        if (data.getCloseTime() != null) existing.setCloseTime(data.getCloseTime());
        
        String err = validateRestaurantFields(existing);
        if (err != null) return new RestaurantResult(false, null, null, err);

        if (data.getRestName() != null) {
            Restaurant duplicate = restaurantStore.findByName(data.getRestName());
            if (duplicate != null && duplicate.getId() != id) return new RestaurantResult(false, null, null, "A restaurant with this name already exists");
        }

        restaurantStore.update(id, existing);
        return new RestaurantResult(true, existing, null, null);
    }

    public RestaurantResult deleteRestaurant(int id) {
        Restaurant existing = restaurantStore.findById(id);
        if (existing == null) return new RestaurantResult(false, null, null, "Restaurant not found");

        itemStore.removeByRestaurant(id);
        restaurantStore.remove(id);
        return new RestaurantResult(true, null, null, null);
    }

    public RestaurantResult setOperatingHours(int id, String openTime, String closeTime) {
        Restaurant restaurant = restaurantStore.findById(id);
        if (restaurant == null) return new RestaurantResult(false, null, null, "Restaurant not found");
        if (!validateTimeFormat(openTime) || !validateTimeFormat(closeTime)) return new RestaurantResult(false, null, null, "Times must be in HH:MM format");
        if (timeToMinutes(closeTime) <= timeToMinutes(openTime)) return new RestaurantResult(false, null, null, "Close time must be after open time");
        
        restaurant.setOpenTime(openTime);
        restaurant.setCloseTime(closeTime);
        restaurantStore.update(id, restaurant);
        return new RestaurantResult(true, restaurant, null, null);
    }

    public RestaurantResult getAllRestaurants() {
        return new RestaurantResult(true, null, restaurantStore.findAll(), null);
    }
}
