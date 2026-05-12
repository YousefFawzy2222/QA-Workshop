package models;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ItemStore {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Item> itemRowMapper = new RowMapper<Item>() {
        @Override
        public Item mapRow(ResultSet rs, int rowNum) throws SQLException {
            Item item = new Item();
            item.setId(rs.getInt("id"));
            item.setRestaurantId(rs.getInt("restaurant_id"));
            item.setItemName(rs.getString("name"));
            item.setItemCost(rs.getFloat("price"));
            item.setItemQuantity(rs.getInt("item_quantity"));
            item.setIsCombo(rs.getBoolean("is_combo"));
            item.setItemSize(rs.getString("item_size"));
            item.setIsOnDiscount(rs.getBoolean("is_on_discount"));
            item.setDiscountPercentage(rs.getFloat("discount_percentage"));
            item.setDescription(rs.getString("description"));
            return item;
        }
    };

    public List<Item> findByRestaurant(int restaurantId) {
        String sql = "SELECT * FROM [Menu_item] WHERE restaurant_id = ?";
        return jdbcTemplate.query(sql, itemRowMapper, restaurantId);
    }

    public Item findById(int id) {
        String sql = "SELECT * FROM [Menu_item] WHERE id = ?";
        List<Item> items = jdbcTemplate.query(sql, itemRowMapper, id);
        return items.isEmpty() ? null : items.get(0);
    }

    public Item findByNameInRestaurant(int restaurantId, String name) {
        String sql = "SELECT * FROM [Menu_item] WHERE restaurant_id = ? AND LOWER(name) = ?";
        List<Item> items = jdbcTemplate.query(sql, itemRowMapper, restaurantId, name.trim().toLowerCase());
        return items.isEmpty() ? null : items.get(0);
    }

    public Item add(Item data) {
        String sql = "INSERT INTO [Menu_item] (restaurant_id, name, price, item_quantity, is_combo, item_size, description, is_on_discount, discount_percentage) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Integer newId = jdbcTemplate.queryForObject(sql, Integer.class,
            data.getRestaurantId(),
            data.getItemName().trim(),
            data.getItemCost(),
            data.getItemQuantity(),
            data.getIsCombo() ? 1 : 0,
            data.getItemSize().trim(),
            data.getDescription().trim(),
            data.getIsOnDiscount() ? 1 : 0,
            data.getDiscountPercentage()
        );
        return findById(newId);
    }

    public void update(int id, Item data) {
        String sql = "UPDATE [Menu_item] SET name = ?, price = ?, item_quantity = ?, is_combo = ?, item_size = ?, description = ?, is_on_discount = ?, discount_percentage = ? WHERE id = ?";
        jdbcTemplate.update(sql,
            data.getItemName(),
            data.getItemCost(),
            data.getItemQuantity(),
            data.getIsCombo() ? 1 : 0,
            data.getItemSize(),
            data.getDescription(),
            data.getIsOnDiscount() ? 1 : 0,
            data.getDiscountPercentage(),
            id
        );
    }

    public boolean remove(int id) {
        String deleteOffersSql = "DELETE FROM [Offers] WHERE menu_item_id = ?";
        jdbcTemplate.update(deleteOffersSql, id);

        String sql = "DELETE FROM [Menu_item] WHERE id = ?";
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }

    public void removeByRestaurant(int restaurantId) {
        String deleteOffersSql = "DELETE FROM [Offers] WHERE menu_item_id IN (SELECT id FROM [Menu_item] WHERE restaurant_id = ?)";
        jdbcTemplate.update(deleteOffersSql, restaurantId);

        String deleteOrdersSql = "DELETE FROM [Order_item] WHERE menu_item_id IN (SELECT id FROM [Menu_item] WHERE restaurant_id = ?)";
        jdbcTemplate.update(deleteOrdersSql, restaurantId);

        String sql = "DELETE FROM [Menu_item] WHERE restaurant_id = ?";
        jdbcTemplate.update(sql, restaurantId);
    }
}
