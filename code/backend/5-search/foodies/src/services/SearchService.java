package services;

import models.Restaurant;
import models.RestaurantStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SearchService {

    @Autowired
    private RestaurantStore restaurantStore;

    public static class SearchResult {
        public boolean success;
        public List<Restaurant> restaurants;
        public String error;

        public SearchResult(boolean success, List<Restaurant> restaurants, String error) {
            this.success = success;
            this.restaurants = restaurants;
            this.error = error;
        }
    }

    // Follows FA-FC-Search flowchart: searchRestaurant(String): Restaurant[]
    public SearchResult searchRestaurant(String query, String sortCondition) {
        try {
            // Step 1: Is search string null?
            if (query == null || query.trim().isEmpty()) {
                // Yes -> Return all restaurants with no filter
                List<Restaurant> all = restaurantStore.findAll();
                return new SearchResult(true, all, null);
            }

            // Step 2: Call handleSyntaxError() to clean the search string
            List<Restaurant> results = handleSyntaxError(query);

            // Step 3: Any results found?
            if (results.isEmpty()) {
                // No -> Return empty array
                return new SearchResult(true, new ArrayList<>(), null);
            }

            // Step 4: Is a sortCondition selected?
            if (sortCondition != null && !sortCondition.trim().isEmpty()) {
                // Yes -> Sort result by selected sortCondition
                results = sortByCondition(results, sortCondition);
            } else {
                // No -> Use default sort order (by name alphabetically)
                results = sortByCondition(results, "name");
            }

            // Step 5: Call applyTieBreaking() on results
            results = applyTieBreaking(results, sortCondition);

            // Step 6: Return sorted Restaurant array
            return new SearchResult(true, results, null);
        } catch (Exception e) {
            System.err.println("Search Error: " + e.getMessage());
            return new SearchResult(false, null, "Search failed: " + e.getMessage());
        }
    }

    // Follows FA-FC-Search flowchart: handleSyntaxError(String): Restaurant[]
    // Receive raw search string -> convert to lowercase -> perform fuzzy matching -> return matched array
    public List<Restaurant> handleSyntaxError(String rawSearch) {
        String cleaned = rawSearch.trim().toLowerCase();
        return restaurantStore.findByNameFuzzy(cleaned);
    }

    // Follows FA-FC-Search flowchart: selectSortCondition(String): void
    // This sets the sort condition and applies it
    private List<Restaurant> sortByCondition(List<Restaurant> restaurants, String condition) {
        List<Restaurant> sorted = new ArrayList<>(restaurants);

        if (condition == null || condition.trim().isEmpty()) {
            condition = "name";
        }

        switch (condition.toLowerCase()) {
            case "rating":
                sorted.sort(Comparator.comparingDouble(Restaurant::getRestRate).reversed());
                break;
            case "delivery_time":
                sorted.sort(Comparator.comparingDouble(Restaurant::getRestMaxDeliveryTime));
                break;
            case "delivery_price":
                sorted.sort(Comparator.comparingDouble(Restaurant::getRestDeliveryCost));
                break;
            case "name":
            default:
                sorted.sort(Comparator.comparing(r -> r.getRestName().toLowerCase()));
                break;
        }

        return sorted;
    }

    // Follows FA-FC-Search flowchart: applyTieBreaking(Restaurant[]): Restaurant[]
    // Receive sorted array -> Are there tied restaurants with same sort value?
    // Yes -> Group tied restaurants -> Apply secondary sort by alphabetical order using restName
    // No -> Return array as is
    public List<Restaurant> applyTieBreaking(List<Restaurant> restaurants, String sortCondition) {
        if (restaurants == null || restaurants.size() <= 1) {
            return restaurants;
        }

        if (sortCondition == null || sortCondition.equalsIgnoreCase("name")) {
            // Already sorted by name, no tie-breaking needed
            return restaurants;
        }

        // Apply secondary sort by restName for tied values
        List<Restaurant> result = new ArrayList<>(restaurants);

        Comparator<Restaurant> comparator;
        switch (sortCondition.toLowerCase()) {
            case "rating":
                comparator = Comparator.comparingDouble(Restaurant::getRestRate).reversed()
                        .thenComparing(r -> r.getRestName().toLowerCase());
                break;
            case "delivery_time":
                comparator = Comparator.comparingDouble(Restaurant::getRestMaxDeliveryTime)
                        .thenComparing(r -> r.getRestName().toLowerCase());
                break;
            case "delivery_price":
                comparator = Comparator.comparingDouble(Restaurant::getRestDeliveryCost)
                        .thenComparing(r -> r.getRestName().toLowerCase());
                break;
            default:
                return result;
        }

        result.sort(comparator);
        return result;
    }
}
