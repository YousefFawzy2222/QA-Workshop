import { getPool } from '../database';
import * as sql from 'mssql';
import { Restaurant } from './restaurant.model';

function rowToRestaurant(row: any): Restaurant {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    rating: row.rating,
    deliveryTime: row.delivery_time,
    deliveryPrice: row.delivery_price,
    openTime: row.open_time,
    closeTime: row.close_time,
  };
}

export const SearchStore = {
  async searchRestaurant(query: string): Promise<Restaurant[]> {
    const pool = await getPool();
    const sanitized = this.handleSyntaxError(query);
    const result = await pool
      .request()
      .input('query', sql.NVarChar, `%${sanitized}%`)
      .query('SELECT * FROM [Restaurant] WHERE LOWER(name) LIKE LOWER(@query)');
    return result.recordset.map(rowToRestaurant);
  },

  sortRestaurants(restaurants: Restaurant[], sortCondition: string): Restaurant[] {
    const sorted = [...restaurants];
    switch (sortCondition.toLowerCase()) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery_time':
        sorted.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case 'delivery_price':
        sorted.sort((a, b) => a.deliveryPrice - b.deliveryPrice);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return this.applyTieBreaking(sorted, sortCondition);
  },

  /** handleSyntaxError(String): Restaurant[]
   *  remove SQL-special chars */
  handleSyntaxError(query: string): string {
    if (!query) return '';
    // remove any special SQL characters that might cause issues
    return query.replace(/[%_\[\]]/g, '').trim();
  },

  /** applyTieBreaking(Restaurant[]): Restaurant[]
   *  primary sort values are equal -> break ties by name */
  applyTieBreaking(restaurants: Restaurant[], sortCondition: string): Restaurant[] {
    // tie-breaking sort — secondary sort by name
    if (sortCondition.toLowerCase() !== 'name') {
      const result = [...restaurants];
      result.sort((a, b) => {
        let primary = 0;
        switch (sortCondition.toLowerCase()) {
          case 'rating':
            primary = b.rating - a.rating;
            break;
          case 'delivery_time':
            primary = a.deliveryTime - b.deliveryTime;
            break;
          case 'delivery_price':
            primary = a.deliveryPrice - b.deliveryPrice;
            break;
        }
        if (primary === 0) return a.name.localeCompare(b.name);
        return primary;
      });
      return result;
    }
    return restaurants;
  },
};
