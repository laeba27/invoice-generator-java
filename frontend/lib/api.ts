const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const apiClient = {
  // Business APIs
  async createBusiness(data: any) {
    const response = await fetch(`${API_BASE_URL}/business`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create business');
    }

    return response.json();
  },

  async getBusiness() {
    const response = await fetch(`${API_BASE_URL}/business`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        return null;
      }
      throw new Error('Failed to fetch business');
    }

    return response.json();
  },

  async updateBusiness(data: any) {
    const response = await fetch(`${API_BASE_URL}/business`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update business');
    }

    return response.json();
  },

  // Customer APIs
  async createCustomer(data: any) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create customer');
    }

    return response.json();
  },

  async getAllCustomers() {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    return response.json();
  },

  // Alias for getAllCustomers
  async getCustomers() {
    return this.getAllCustomers();
  },

  async searchCustomers(query: string) {
    const response = await fetch(
      `${API_BASE_URL}/customers/search?query=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search customers');
    }

    return response.json();
  },

  // Invoice APIs
  async createInvoice(data: any) {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    return response.json();
  },

  async getInvoiceById(id: number) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return response.json();
  },

  async updateInvoice(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update invoice');
    }

    return response.json();
  },

  async getAllInvoices() {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  },

  async deleteInvoice(id: number) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  },

  async getCustomerById(id: number) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }

    return response.json();
  },

  async updateCustomer(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update customer');
    }

    return response.json();
  },

  // Payment APIs (Phase 2)
  async addPayment(data: any) {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add payment');
    }

    return response.json();
  },

  async getPaymentsByInvoice(invoiceId: number) {
    const response = await fetch(`${API_BASE_URL}/payments/invoice/${invoiceId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  },

  async deletePayment(paymentId: number) {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete payment');
    }
  },

  // Template APIs (Phase 2)
  async createTemplate(data: any) {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create template');
    }

    return response.json();
  },

  async getTemplatesByBusiness(businessId: number) {
    const response = await fetch(`${API_BASE_URL}/templates/business/${businessId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return response.json();
  },

  async getDefaultTemplate(businessId: number) {
    const response = await fetch(`${API_BASE_URL}/templates/business/${businessId}/default`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch default template');
    }

    return response.json();
  },

  async updateTemplate(templateId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update template');
    }

    return response.json();
  },

  async deleteTemplate(templateId: number) {
    const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete template');
    }
  },

  // System Template APIs
  async getSystemTemplates() {
    const response = await fetch(`${API_BASE_URL}/templates/system`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch system templates');
    return response.json();
  },

  async assignSystemTemplate(data: any) {
    const response = await fetch(`${API_BASE_URL}/templates/system/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to assign template');
    return response.json();
  },

  async getSystemTemplateSettings(businessId: number) {
    const response = await fetch(`${API_BASE_URL}/templates/system/settings/${businessId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    // If 404/Empty return null or default
    if (!response.ok) return null;
    return response.json();
  },
};
