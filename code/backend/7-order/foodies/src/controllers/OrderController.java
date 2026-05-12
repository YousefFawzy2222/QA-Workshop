package controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.OrderService;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Mock method to simulate JWT email extraction
    private String getUserEmail(Map<String, String> headers) {
        return headers.getOrDefault("x-user-email", "guest@example.com");
    }

    // POST /api/orders — Place a new order (checkout flow)
    @PostMapping
    public ResponseEntity<OrderService.OrderResult> placeOrderController(
            @RequestHeader Map<String, String> headers,
            @RequestBody OrderService.PlaceOrderRequest request) {
        String email = getUserEmail(headers);
        OrderService.OrderResult result = orderService.placeOrder(email, request);
        if (result.success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // GET /api/orders — Get user's order history
    @GetMapping
    public ResponseEntity<OrderService.OrderResult> getOrdersController(
            @RequestHeader Map<String, String> headers) {
        String email = getUserEmail(headers);
        OrderService.OrderResult result = orderService.getUserOrders(email);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // GET /api/orders/{id} — Get specific order details
    @GetMapping("/{id}")
    public ResponseEntity<OrderService.OrderResult> getOrderByIdController(
            @RequestHeader Map<String, String> headers,
            @PathVariable("id") int id) {
        String email = getUserEmail(headers);
        OrderService.OrderResult result = orderService.getOrderById(id, email);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }
}
