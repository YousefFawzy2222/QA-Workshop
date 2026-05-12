import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Import;
import java.util.Collections;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class, DataSourceAutoConfiguration.class })
@ComponentScan(basePackages = {"controllers", "services", "models", "middleware", "routes"})
@Import({DatabaseConfig.class, WebConfig.class})
public class FoodiesApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(FoodiesApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", "3000"));
        app.run(args);
        System.out.println("\n🍔  Foodies server running at http://localhost:3000\n");
    }
}
