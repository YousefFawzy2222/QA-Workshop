package models;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class OrderStore {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Order> orderRowMapper = new RowMapper<Order>() {
        @Override
        public Order mapRow(ResultSet rs, int rowNum) throws SQLException {
            Order order = new Order();
            order.setId(rs.getInt("id"));
            order.setUserEmail(rs.getString("user_email"));
            order.setRestaurantId(rs.getInt("restaurant_id"));
            int addressId = rs.getInt("address_id");
            order.setAddressId(rs.wasNull() ? null : addressId);
            order.setSubTotal(rs.getFloat("sub_total"));
            order.setDeliveryFee(rs.getFloat("delivery_price"));
            order.setTotalPrice(rs.getFloat("total_price"));
            order.setPointsRedeemed(rs.getInt("points_redeemed"));
            order.setStatus(rs.getString("order_status"));
            order.setCreatedAt(rs.getString("created_at"));
            return order;
        }
    };

    public Order add(Order order) {
        String sql = "INSERT INTO [Order] (user_email, restaurant_id, address_id, sub_total, delivery_price, total_price, points_redeemed, order_status, created_at) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Integer newId = jdbcTemplate.queryForObject(sql, Integer.class,
                order.getUserEmail(),
                order.getRestaurantId(),
                order.getAddressId(),
                order.getSubTotal(),
                order.getDeliveryFee(),
                order.getTotalPrice(),
                order.getPointsRedeemed(),
                order.getStatus() != null ? order.getStatus() : "placed",
                order.getCreatedAt()
        );
        return findById(newId);
    }

    public Order findById(int id) {
        String sql = "SELECT * FROM [Order] WHERE id = ?";
        List<Order> orders = jdbcTemplate.query(sql, orderRowMapper, id);
        return orders.isEmpty() ? null : orders.get(0);
    }

    public List<Order> findByUser(String userEmail) {
        String sql = "SELECT * FROM [Order] WHERE user_email = ? ORDER BY id DESC";
        return jdbcTemplate.query(sql, orderRowMapper, userEmail);
    }
}
