package models;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class RestaurantStore {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Restaurant> restaurantRowMapper = new RowMapper<Restaurant>() {
        @Override
        public Restaurant mapRow(ResultSet rs, int rowNum) throws SQLException {
            Restaurant rest = new Restaurant();
            rest.setId(rs.getInt("id"));
            rest.setRestName(rs.getString("name"));
            rest.setRestRate(rs.getFloat("rating"));
            rest.setRestMinDeliveryTime(rs.getFloat("min_delivery_time"));
            rest.setRestMaxDeliveryTime(rs.getFloat("max_delivery_time"));
            rest.setRestDeliveryCost(rs.getFloat("delivery_price"));
            rest.setRestLocation(rs.getString("location"));
            rest.setOpenTime(rs.getString("open_time"));
            rest.setCloseTime(rs.getString("close_time"));
            rest.checkOperatingStatus(); // update isOpen based on current time
            return rest;
        }
    };

    public List<Restaurant> findAll() {
        String sql = "SELECT * FROM [Restaurant]";
        return jdbcTemplate.query(sql, restaurantRowMapper);
    }

    public Restaurant findById(int id) {
        String sql = "SELECT * FROM [Restaurant] WHERE id = ?";
        List<Restaurant> list = jdbcTemplate.query(sql, restaurantRowMapper, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public Restaurant findByName(String name) {
        String sql = "SELECT * FROM [Restaurant] WHERE LOWER(name) = ?";
        List<Restaurant> list = jdbcTemplate.query(sql, restaurantRowMapper, name.trim().toLowerCase());
        return list.isEmpty() ? null : list.get(0);
    }

    public Restaurant add(Restaurant data) {
        String sql = "INSERT INTO [Restaurant] (name, rating, delivery_time, min_delivery_time, max_delivery_time, delivery_price, location, open_time, close_time) OUTPUT INSERTED.id VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?)";
        Integer newId = jdbcTemplate.queryForObject(sql, Integer.class,
                data.getRestName().trim(),
                data.getRestMaxDeliveryTime(), // placeholder logic for delivery_time
                data.getRestMinDeliveryTime(),
                data.getRestMaxDeliveryTime(),
                data.getRestDeliveryCost(),
                data.getRestLocation().trim(),
                data.getOpenTime() != null ? data.getOpenTime() : "",
                data.getCloseTime() != null ? data.getCloseTime() : ""
        );
        return findById(newId);
    }

    public void update(int id, Restaurant data) {
        String sql = "UPDATE [Restaurant] SET name = ?, location = ?, delivery_price = ?, min_delivery_time = ?, max_delivery_time = ?, open_time = ?, close_time = ?, rating = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                data.getRestName(),
                data.getRestLocation(),
                data.getRestDeliveryCost(),
                data.getRestMinDeliveryTime(),
                data.getRestMaxDeliveryTime(),
                data.getOpenTime(),
                data.getCloseTime(),
                data.getRestRate(),
                id
        );
    }

    public boolean remove(int id) {
        String sql = "DELETE FROM [Restaurant] WHERE id = ?";
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }

    public List<Restaurant> findByNameFuzzy(String name) {
        String sql = "SELECT * FROM [Restaurant] WHERE LOWER(name) LIKE ?";
        return jdbcTemplate.query(sql, restaurantRowMapper, "%" + name + "%");
    }
}
