import { useQuery } from '@tanstack/react-query'
import { contactService } from '@/lib/services'
import type { ContactSearchParams, ContactDashboardData } from '@/lib/models'

export const useContactDashboard = (filters?: Partial<ContactSearchParams>) => {
  return useQuery<ContactDashboardData, Error>({
    queryKey: ['contact-dashboard', filters],
    queryFn: () => contactService.getContactDashboard(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaced cacheTime with gcTime)
  })
}