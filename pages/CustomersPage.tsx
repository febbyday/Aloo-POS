import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { CustomerParams } from '../services/customerService';

export function CustomersPage() {
  const [searchParams, setSearchParams] = useState<CustomerParams>({
    page: 1,
    pageSize: 10,
  });

  const {
    customers,
    loading,
    error,
    pagination,
    refetch,
    setParams,
  } = useCustomers(searchParams);

  const handleSearch = (searchTerm: string) => {
    const newParams = {
      ...searchParams,
      search: searchTerm,
      page: 1, // Reset to first page on new search
    };
    setSearchParams(newParams);
    setParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage,
    }));
    setParams({
      ...searchParams,
      page: newPage,
    });
  };

  if (loading) {
    return <div>Loading customers...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading customers</h2>
        <p>{error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <h1>Customers</h1>
      
      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search customers..."
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Membership</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{`${customer.firstName} ${customer.lastName}`}</td>
              <td>{customer.email}</td>
              <td>{customer.phone || 'N/A'}</td>
              <td>{customer.status}</td>
              <td>{customer.membershipLevel}</td>
              <td>
                <button onClick={() => {/* Handle view */}}>View</button>
                <button onClick={() => {/* Handle edit */}}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.page <= 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}