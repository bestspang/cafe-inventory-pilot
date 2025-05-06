
import * as z from 'zod';

// List of common timezones
export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland'
];

// Schema definition for branch form validation
export const branchFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Branch name must be at least 2 characters.',
  }),
  address: z.string().optional(),
  timezone: z.string()
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
