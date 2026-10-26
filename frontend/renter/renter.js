// renter.js – Demo data and rendering for Renter Dashboard
// In a real app, replace the static data with API calls to your backend.

// Sample data
const users = [
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0123' },
  { name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-0456' },
  { name: 'Carol Lee', email: 'carol@example.com', phone: '+1-555-0789' },
];

const equipment = [
  { id: 'EQ-001', name: 'Toyota Prius', status: 'Available' },
  { id: 'EQ-002', name: 'Ford F-150', status: 'Rented' },
  { id: 'EQ-003', name: 'Tesla Model 3', status: 'In Maintenance' },
];

const rentals = [
  { renter: 'Alice Johnson', equipment: 'Toyota Prius', from: 'Owner A', deployedAt: '2026-09-15', dueReturn: '2026-10-05' },
  { renter: 'Bob Smith', equipment: 'Ford F-150', from: 'Owner B', deployedAt: '2026-09-20', dueReturn: '2026-10-10' },
];

const payments = [
  { date: '2026-09-01', amount: 120.0, reference: 'INV-1001' },
  { date: '2026-09-15', amount: 85.5, reference: 'INV-1002' },
  { date: '2026-09-30', amount: 200.0, reference: 'INV-1003' },
];

// Utility to format currency
function formatCurrency(val) {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderTableRows(data, columns) {
  return data
    .map(item => {
      const cells = columns.map(col => `<td>${item[col] ?? ''}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
}

function populateDashboard() {
  // Users table
  const usersTableBody = document.querySelector('#users-table tbody');
  usersTableBody.innerHTML = renderTableRows(users, ['name', 'email', 'phone']);

  // Equipment table
  const equipmentTableBody = document.querySelector('#equipment-table tbody');
  equipmentTableBody.innerHTML = renderTableRows(equipment, ['id', 'name', 'status']);

  // Rentals table – map keys to display names
  const rentalsTableBody = document.querySelector('#rentals-table tbody');
  rentalsTableBody.innerHTML = rentals
    .map(r => `<tr><td>${r.renter}</td><td>${r.equipment}</td><td>${r.from}</td><td>${r.deployedAt}</td><td>${r.dueReturn}</td></tr>`)
    .join('');

  // Payments table
  const paymentsTableBody = document.querySelector('#payments-table tbody');
  paymentsTableBody.innerHTML = payments
    .map(p => `<tr><td>${p.date}</td><td>$${formatCurrency(p.amount)}</td><td>${p.reference}</td></tr>`)
    .join('');

  // Total earnings – sum of payment amounts
  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  document.getElementById('total-earnings').textContent = formatCurrency(totalEarnings);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', populateDashboard);
