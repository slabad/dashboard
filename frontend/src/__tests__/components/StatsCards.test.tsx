import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCards from '../../components/StatsCards';
import { DashboardStats } from '../../types';

describe('StatsCards', () => {
  const mockStats: DashboardStats = {
    totalRevenue: 15000,
    totalCustomers: 50,
    totalJobs: 120,
    completedJobs: 100,
    pendingJobs: 20,
    revenueGrowth: 15.5,
    customerGrowth: 8.2,
  };

  it('renders loading state correctly', () => {
    render(<StatsCards isLoading={true} />);
    
    // Should show 4 loading cards
    const loadingCards = screen.getAllByRole('generic');
    expect(loadingCards.length).toBeGreaterThanOrEqual(4);
  });

  it('renders stats data correctly', () => {
    render(<StatsCards stats={mockStats} isLoading={false} />);
    
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    
    expect(screen.getByText('Total Customers')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    
    expect(screen.getByText('Completed Jobs')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays growth percentages correctly', () => {
    render(<StatsCards stats={mockStats} isLoading={false} />);
    
    expect(screen.getByText('15.5%')).toBeInTheDocument();
    expect(screen.getByText('8.2%')).toBeInTheDocument();
    expect(screen.getAllByText('from last month')).toHaveLength(2);
  });

  it('handles zero values correctly', () => {
    const zeroStats: DashboardStats = {
      totalRevenue: 0,
      totalCustomers: 0,
      totalJobs: 0,
      completedJobs: 0,
      pendingJobs: 0,
      revenueGrowth: 0,
      customerGrowth: 0,
    };

    render(<StatsCards stats={zeroStats} isLoading={false} />);
    
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3); // customers, total jobs, completed jobs
  });

  it('handles undefined stats correctly', () => {
    render(<StatsCards isLoading={false} />);
    
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('shows trending icons correctly', () => {
    const positiveGrowthStats: DashboardStats = {
      ...mockStats,
      revenueGrowth: 10,
      customerGrowth: 5,
    };

    render(<StatsCards stats={positiveGrowthStats} isLoading={false} />);
    
    // Should show increase indicators
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('handles negative growth correctly', () => {
    const negativeGrowthStats: DashboardStats = {
      ...mockStats,
      revenueGrowth: -5.5,
      customerGrowth: -2.1,
    };

    render(<StatsCards stats={negativeGrowthStats} isLoading={false} />);
    
    expect(screen.getByText('5.5%')).toBeInTheDocument();
    expect(screen.getByText('2.1%')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<StatsCards stats={mockStats} isLoading={false} />);
    
    // Should have grid layout
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
  });
});