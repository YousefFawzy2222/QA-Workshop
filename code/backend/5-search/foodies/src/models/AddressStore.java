package models;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class AddressStore {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<AddressOfUser> rowMapper = (rs, rowNum) -> {
        AddressOfUser address = new AddressOfUser();
        address.setId(rs.getInt("id"));
        // We will store userEmail outside of AddressOfUser or not map it in the base class depending on usage, 
        // but let's assume it maps directly to AddressOfUser fields plus we add user_email to DB insert.
        address.setPhoneNumber(rs.getString("phone_number"));
        address.setBuildingName(rs.getString("building_name"));
        address.setAptNumber(rs.getInt("apartment"));
        address.setFloorNumber(rs.getInt("floor_number"));
        address.setStreet(rs.getString("street"));
        address.setNearbyLandmark(rs.getString("nearby_landmark"));
        return address;
    };

    public AddressOfUser add(String userEmail, AddressOfUser address) {
        String sql = "INSERT INTO [Address] (user_email, phone_number, building_name, apartment, floor_number, street, nearby_landmark) VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, userEmail);
            ps.setString(2, address.getPhoneNumber());
            ps.setString(3, address.getBuildingName());
            ps.setInt(4, address.getAptNumber());
            ps.setInt(5, address.getFloorNumber());
            ps.setString(6, address.getStreet());
            ps.setString(7, address.getNearbyLandmark() == null ? "" : address.getNearbyLandmark());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            address.setId(keyHolder.getKey().intValue());
        }
        return address;
    }

    public List<AddressOfUser> findByUser(String userEmail) {
        String sql = "SELECT * FROM [Address] WHERE user_email = ?";
        return jdbcTemplate.query(sql, rowMapper, userEmail);
    }

    public AddressOfUser findById(int id) {
        String sql = "SELECT * FROM [Address] WHERE id = ?";
        List<AddressOfUser> results = jdbcTemplate.query(sql, rowMapper, id);
        return results.isEmpty() ? null : results.get(0);
    }
}
