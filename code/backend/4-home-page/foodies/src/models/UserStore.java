package models;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class UserStore {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<User> userRowMapper = new RowMapper<User>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new User(
                rs.getString("Email"),
                rs.getString("HashedPassword"),
                rs.getString("Name"),
                "admin".equals(rs.getString("Role")),
                rs.getInt("loyalty_points")
            );
        }
    };

    public User findByEmail(String email) {
        String sql = "SELECT * FROM [User] WHERE LOWER(Email) = ?";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, email.trim().toLowerCase());
        return users.isEmpty() ? null : users.get(0);
    }

    public void add(String email, String passwordHash, String userName, boolean isAdmin) {
        String sql = "INSERT INTO [User] (Email, HashedPassword, Name, Role, loyalty_points) VALUES (?, ?, ?, ?, ?)";
        String role = isAdmin ? "admin" : "user";
        jdbcTemplate.update(sql, email.trim().toLowerCase(), passwordHash, userName != null ? userName : "", role, 0);
    }

    public boolean emailExists(String email) {
        String sql = "SELECT COUNT(*) FROM [User] WHERE LOWER(Email) = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email.trim().toLowerCase());
        return count != null && count > 0;
    }

    public void updateName(String email, String newName) {
        String sql = "UPDATE [User] SET Name = ? WHERE LOWER(Email) = ?";
        jdbcTemplate.update(sql, newName, email.trim().toLowerCase());
    }

    public void updateLoyaltyPoints(String email, int points) {
        String sql = "UPDATE [User] SET loyalty_points = ? WHERE LOWER(Email) = ?";
        jdbcTemplate.update(sql, points, email.trim().toLowerCase());
    }

    public void addLoyaltyPoints(String email, int pointsToAdd) {
        String sql = "UPDATE [User] SET loyalty_points = loyalty_points + ? WHERE LOWER(Email) = ?";
        jdbcTemplate.update(sql, pointsToAdd, email.trim().toLowerCase());
    }

    public void deductLoyaltyPoints(String email, int pointsToDeduct) {
        String sql = "UPDATE [User] SET loyalty_points = loyalty_points - ? WHERE LOWER(Email) = ?";
        jdbcTemplate.update(sql, pointsToDeduct, email.trim().toLowerCase());
    }
}
