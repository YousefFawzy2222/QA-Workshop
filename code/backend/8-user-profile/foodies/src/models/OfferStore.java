package models;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class OfferStore {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Offer> offerRowMapper = new RowMapper<Offer>() {
        @Override
        public Offer mapRow(ResultSet rs, int rowNum) throws SQLException {
            Offer offer = new Offer();
            offer.setId(rs.getInt("id"));
            offer.setMenuItemId(rs.getInt("menu_item_id"));
            offer.setDiscountPercentage(rs.getFloat("discount_percentage"));
            offer.setOriginalPrice(rs.getFloat("original_price"));
            offer.setDiscountedPrice(rs.getFloat("discounted_price"));
            offer.setStartsAt(rs.getString("starts_at"));
            offer.setExpiresAt(rs.getString("expires_at"));
            return offer;
        }
    };

    public List<Offer> findAll() {
        String sql = "SELECT * FROM [Offers]";
        return jdbcTemplate.query(sql, offerRowMapper);
    }

    public Offer findById(int id) {
        String sql = "SELECT * FROM [Offers] WHERE id = ?";
        List<Offer> offers = jdbcTemplate.query(sql, offerRowMapper, id);
        return offers.isEmpty() ? null : offers.get(0);
    }

    public List<Offer> findByMenuItem(int menuItemId) {
        String sql = "SELECT * FROM [Offers] WHERE menu_item_id = ?";
        return jdbcTemplate.query(sql, offerRowMapper, menuItemId);
    }

    public List<Offer> findActiveOffers() {
        String sql = "SELECT * FROM [Offers] WHERE expires_at >= CONVERT(varchar, GETDATE(), 23)";
        return jdbcTemplate.query(sql, offerRowMapper);
    }

    public Offer add(Offer offer) {
        // Calculate discounted price before storing
        float calculatedPrice = offer.getOriginalPrice() * (1 - (offer.getDiscountPercentage() / 100));
        String sql = "INSERT INTO [Offers] (menu_item_id, discount_percentage, original_price, discounted_price, starts_at, expires_at) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?, ?)";
        Integer newId = jdbcTemplate.queryForObject(sql, Integer.class,
                offer.getMenuItemId(),
                offer.getDiscountPercentage(),
                offer.getOriginalPrice(),
                calculatedPrice,
                offer.getStartsAt(),
                offer.getExpiresAt()
        );
        return findById(newId);
    }

    public void update(int id, Offer offer) {
        float calculatedPrice = offer.getOriginalPrice() * (1 - (offer.getDiscountPercentage() / 100));
        String sql = "UPDATE [Offers] SET menu_item_id = ?, discount_percentage = ?, original_price = ?, discounted_price = ?, starts_at = ?, expires_at = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                offer.getMenuItemId(),
                offer.getDiscountPercentage(),
                offer.getOriginalPrice(),
                calculatedPrice,
                offer.getStartsAt(),
                offer.getExpiresAt(),
                id
        );
    }

    public boolean remove(int id) {
        String sql = "DELETE FROM [Offers] WHERE id = ?";
        int rows = jdbcTemplate.update(sql, id);
        return rows > 0;
    }
}
