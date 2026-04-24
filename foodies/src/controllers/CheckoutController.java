package controllers;

import models.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.CheckoutService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    @Autowired
    private CheckoutService checkoutService;

    // A mock method to simulate JWT email extraction.
    private String getUserEmail(Map<String, String> headers) {
        return headers.getOrDefault("user-email", "guest@example.com");
    }

    public static class PlaceOrderRequest {
        public Integer addressId;
        public boolean usePoints;
        public int pointsToRedeem;
    }

    @PostMapping
    public ResponseEntity<CheckoutService.CheckoutResult> placeOrder(
            @RequestHeader Map<String, String> headers, 
            @RequestBody PlaceOrderRequest req) {
        String email = getUserEmail(headers);
        CheckoutService.CheckoutResult result = checkoutService.placeOrder(email, req.addressId, req.usePoints, req.pointsToRedeem);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getUserOrders(@RequestHeader Map<String, String> headers) {
        String email = getUserEmail(headers);
        return ResponseEntity.ok(checkoutService.getUserOrders(email));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<CheckoutService.CheckoutResult> getOrderDetails(@PathVariable("orderId") int orderId) {
        CheckoutService.CheckoutResult result = checkoutService.getOrderDetails(orderId);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
