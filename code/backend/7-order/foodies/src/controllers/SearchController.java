package controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.SearchService;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchService.SearchResult> searchController(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "sort", required = false) String sortCondition) {
        SearchService.SearchResult result = searchService.searchRestaurant(query, sortCondition);
        if (result.success) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
}
