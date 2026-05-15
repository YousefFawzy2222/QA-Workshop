package services;

import models.AddressOfUser;
import models.AddressStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressStore addressStore;

    public AddressOfUser addAddress(String userEmail, AddressOfUser address) {
        // Validate user info before adding
        if (!address.validateUserInfo() || !address.validatePhoneNumber()) {
            throw new IllegalArgumentException("Invalid address information");
        }
        return addressStore.add(userEmail, address);
    }

    public List<AddressOfUser> getUserAddresses(String userEmail) {
        return addressStore.findByUser(userEmail);
    }
}
