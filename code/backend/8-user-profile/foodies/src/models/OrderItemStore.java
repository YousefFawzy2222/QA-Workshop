package models;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class OrderItemStore {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<OrderItem> orderItemRowMapper = new RowMapper<OrderItem>() {
        @Override
        public OrderItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            OrderItem item = new OrderItem();
            item.setId(rs.getInt("id"));
            item.setOrderId(rs.getInt("order_id"));
            item.setMenuItemId(rs.getInt("menu_item_id"));
            item.setQuantity(rs.getInt("quantity"));
            item.setUnitPrice(rs.getFloat("unit_price"));
            return item;
        }
    };

    public void addAll(int orderId, List<OrderItem> items) {
        String sql = "INSERT INTO [Order_item] (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)";
        for (OrderItem item : items) {
            jdbcTemplate.update(sql, orderId, item.getMenuItemId(), item.getQuantity(), item.getUnitPrice());
        }
    }

    public List<OrderItem> findByOrder(int orderId) {
        String sql = "SELECT * FROM [Order_item] WHERE order_id = ?";
        return jdbcTemplate.query(sql, orderItemRowMapper, orderId);
    }
}
