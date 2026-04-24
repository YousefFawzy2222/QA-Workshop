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
            @RequestParam(name = "q", required = false, defaultValue = "") String q,
            @RequestParam(name = "sort", required = false) String sort) {
        
        SearchService.SearchResult result = searchService.searchRestaurants(q, sort);
        return ResponseEntity.ok(result);
    }
}
