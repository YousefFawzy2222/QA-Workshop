
import { SearchStore } from '../models/search.model';
import { RestaurantStore, Restaurant } from '../models/restaurant.model';

export interface SearchResult {
  success: boolean;
  restaurants?: Restaurant[];
  error?: string;
}

export async function searchRestaurants(query: string, sortCondition?: string): Promise<SearchResult> {
  let restaurants: Restaurant[];

  if (!query || query.trim().length === 0) {
    // if no search term — return all restaurants
    restaurants = await RestaurantStore.findAll();
  } else {
    restaurants = await SearchStore.searchRestaurant(query);
  }

  // apply sorting when it is there
  const sort = sortCondition || 'name';
  restaurants = SearchStore.sortRestaurants(restaurants, sort);

  return { success: true, restaurants };
}
