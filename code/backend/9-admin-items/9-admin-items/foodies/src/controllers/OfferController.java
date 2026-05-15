package controllers;

import models.Offer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.OfferService;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "*")
public class OfferController {

    @Autowired
    private OfferService offerService;

    // GET /api/offers — list all offers (used by admin.js)
    @GetMapping
    public ResponseEntity<OfferService.OfferResult> listOffersController() {
        return ResponseEntity.ok(offerService.getAllOffers());
    }

    // GET /api/offers/active — public endpoint: active offers only
    @GetMapping("/active")
    public ResponseEntity<OfferService.OfferResult> getActiveOffersController() {
        return ResponseEntity.ok(offerService.getActiveOffers());
    }

    // POST /api/offers — create offer (used by admin.js)
    @PostMapping
    public ResponseEntity<OfferService.OfferResult> addOfferController(@RequestBody Offer data) {
        OfferService.OfferResult result = offerService.createOffer(data);
        if (result.success) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // PUT /api/offers/{id} — update offer (used by admin.js)
    @PutMapping("/{id}")
    public ResponseEntity<OfferService.OfferResult> updateOfferController(
            @PathVariable("id") int id, @RequestBody Offer data) {
        OfferService.OfferResult result = offerService.updateOffer(id, data);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // DELETE /api/offers/{id} — delete offer (used by admin.js)
    @DeleteMapping("/{id}")
    public ResponseEntity<OfferService.OfferResult> deleteOfferController(@PathVariable("id") int id) {
        OfferService.OfferResult result = offerService.deleteOffer(id);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }
}
