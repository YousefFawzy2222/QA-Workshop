const addressApi = {
  async getAddresses() {
    return apiClient.get('/address');
  },
  async addAddress(address) {
    return apiClient.post('/address', address);
  },
  async updateAddress(id, address) {
    return apiClient.put(`/address/${id}`, address);
  },
  async deleteAddress(id) {
    return apiClient.delete(`/address/${id}`);
  },

  renderAddresses(addresses) {
    // Basic rendering logic could be expanded
    // Currently UI (S14) just has a form for 1 address.
    // If we wanted to list them, we'd update a grid.
  },

  async load() {
    const res = await this.getAddresses();
    if (res.ok && res.data && res.data.length > 0) {
      const primary = res.data[0];
      
      // Populate S14 form if it exists
      const inputs = document.querySelectorAll('#s14 .field-input');
      if (inputs.length >= 6) {
        inputs[0].value = primary.phoneNumber || '';
        inputs[1].value = primary.buildingName || '';
        inputs[2].value = primary.aptNumber || '';
        inputs[3].value = primary.floorNumber || '';
        inputs[4].value = primary.street || '';
        inputs[5].value = primary.nearbyLandmark || '';
      }
    }
  },

  async saveFromUI() {
    const inputs = document.querySelectorAll('#s14 .field-input');
    if (inputs.length >= 6) {
      const address = {
        phoneNumber: inputs[0].value,
        buildingName: inputs[1].value,
        aptNumber: parseInt(inputs[2].value) || 0,
        floorNumber: parseInt(inputs[3].value) || 0,
        street: inputs[4].value,
        nearbyLandmark: inputs[5].value,
      };

      // Clear previous error state
      inputs[0].classList.remove('error');
      const errDiv = inputs[0].nextElementSibling;
      if (errDiv) errDiv.style.display = 'none';

      // Naive validation
      if (!/^\d{11}$/.test(address.phoneNumber)) {
        inputs[0].classList.add('error');
        if (errDiv) errDiv.style.display = 'block';
        return;
      }

      // Just add a new one for now
      const res = await this.addAddress(address);
      if (res.ok) {
        alert('Address saved!');
        go(13); // Back to profile
      } else {
        alert('Failed to save address: ' + res.data.error);
      }
    }
  }
};

// Bind to UI elements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // We'll hijack the button in S14 when it's rendered.
  // Since S14 is injected via screens.js, we might need to intercept the button click via event delegation.
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('#s14 .btn-primary')) {
      e.preventDefault();
      addressApi.saveFromUI();
    }
  });

  // Watch for navigation to load addresses
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.id === 's14' && m.target.classList.contains('active')) {
        addressApi.load();
      }
    }
  });
  
  // Try observing after a delay to ensure S14 is in DOM
  setTimeout(() => {
    const s14 = document.getElementById('s14');
    if (s14) {
      observer.observe(s14, { attributes: true, attributeFilter: ['class'] });
    }
  }, 1000);
});
