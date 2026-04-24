package controllers;

import models.AddressOfUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.AddressService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/address")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private AddressService addressService;

    // A mock method to simulate JWT email extraction.
    private String getUserEmail(Map<String, String> headers) {
        return headers.getOrDefault("user-email", "guest@example.com");
    }

    @GetMapping
    public ResponseEntity<List<AddressOfUser>> getAddresses(@RequestHeader Map<String, String> headers) {
        String email = getUserEmail(headers);
        return ResponseEntity.ok(addressService.getUserAddresses(email));
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@RequestHeader Map<String, String> headers, @RequestBody AddressOfUser req) {
        String email = getUserEmail(headers);
        try {
            AddressOfUser saved = addressService.addAddress(email, req);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
