package controllers;

import models.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.ItemService;

@RestController
@RequestMapping("/api/admin/restaurants/{restaurantId}/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping
    public ResponseEntity<ItemService.ItemResult> listItemsController(@PathVariable("restaurantId") int restaurantId) {
        ItemService.ItemResult result = itemService.getItemsByRestaurant(restaurantId);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    @PostMapping
    public ResponseEntity<ItemService.ItemResult> addItemController(
            @PathVariable("restaurantId") int restaurantId, @RequestBody Item data) {
        data.setRestaurantId(restaurantId);
        ItemService.ItemResult result = itemService.addItem(data);
        if (result.success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemService.ItemResult> updateItemController(
            @PathVariable("restaurantId") int restaurantId, 
            @PathVariable("id") int id, 
            @RequestBody Item data) {
        ItemService.ItemResult result = itemService.updateItem(id, data);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ItemService.ItemResult> deleteItemController(
            @PathVariable("restaurantId") int restaurantId, 
            @PathVariable("id") int id) {
        ItemService.ItemResult result = itemService.deleteItem(id);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }
}
