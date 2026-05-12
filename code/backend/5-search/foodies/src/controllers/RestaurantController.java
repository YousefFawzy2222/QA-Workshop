package controllers;

import models.Restaurant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.RestaurantService;

@RestController
@RequestMapping("/api/admin/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<RestaurantService.RestaurantResult> listRestaurantsController() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @PostMapping
    public ResponseEntity<RestaurantService.RestaurantResult> addRestaurantController(@RequestBody Restaurant data) {
        RestaurantService.RestaurantResult result = restaurantService.addRestaurant(data);
        if (result.success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantService.RestaurantResult> updateRestaurantController(
            @PathVariable("id") int id, @RequestBody Restaurant data) {
        RestaurantService.RestaurantResult result = restaurantService.updateRestaurant(id, data);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<RestaurantService.RestaurantResult> deleteRestaurantController(@PathVariable("id") int id) {
        RestaurantService.RestaurantResult result = restaurantService.deleteRestaurant(id);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    public static class HoursRequest {
        public String openTime;
        public String closeTime;
    }

    @PatchMapping("/{id}/hours")
    public ResponseEntity<RestaurantService.RestaurantResult> setOperatingHoursController(
            @PathVariable("id") int id, @RequestBody HoursRequest req) {
        RestaurantService.RestaurantResult result = restaurantService.setOperatingHours(id, req.openTime, req.closeTime);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
