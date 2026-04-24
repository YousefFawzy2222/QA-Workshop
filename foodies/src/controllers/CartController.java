package controllers;

import models.CartStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.CartService;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    // A mock method to simulate JWT email extraction. In reality, you'd use a Filter/Interceptor to extract user from context.
    private String getUserEmail(Map<String, String> headers) {
        // Fallback for demo purposes
        return headers.getOrDefault("user-email", "guest@example.com");
    }

    @GetMapping
    public ResponseEntity<CartStore.CartResult> getCart(@RequestHeader Map<String, String> headers) {
        String email = getUserEmail(headers);
        return ResponseEntity.ok(cartService.getCart(email));
    }

    public static class AddCartRequest {
        public int menuItemId;
        public int quantity;
    }

    @PostMapping("/add")
    public ResponseEntity<CartStore.CartResult> addToCart(@RequestHeader Map<String, String> headers, @RequestBody AddCartRequest req) {
        String email = getUserEmail(headers);
        CartStore.CartResult result = cartService.addToCart(email, req.menuItemId, req.quantity);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    public static class UpdateCartRequest {
        public int quantity;
    }

    @PutMapping("/item/{itemId}")
    public ResponseEntity<CartStore.CartResult> updateQuantity(
            @RequestHeader Map<String, String> headers, 
            @PathVariable("itemId") int itemId, 
            @RequestBody UpdateCartRequest req) {
        String email = getUserEmail(headers);
        CartStore.CartResult result = cartService.updateCartQuantity(email, itemId, req.quantity);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<CartStore.CartResult> removeFromCart(
            @RequestHeader Map<String, String> headers, 
            @PathVariable("itemId") int itemId) {
        String email = getUserEmail(headers);
        CartStore.CartResult result = cartService.removeFromCart(email, itemId);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<CartStore.CartResult> clearCart(@RequestHeader Map<String, String> headers) {
        String email = getUserEmail(headers);
        return ResponseEntity.ok(cartService.clearCart(email));
    }
}
