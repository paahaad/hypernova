import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../db';
import { pools } from '../db/schema';
import { eq } from 'drizzle-orm';

export function usePools() {
  return useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const result = await db.select().from(pools);
      return result;
    },
  });
}

export function usePool(address: string) {
  return useQuery({
    queryKey: ['pool', address],
    queryFn: async () => {
      const result = await db
        .select()
        .from(pools)
        .where(eq(pools.whirlpoolAddress, address));
      return result[0];
    },
  });
}

export function useCreatePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof pools.$inferInsert) => {
      const result = await db.insert(pools).values(data).returning();
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    },
  });
}

export function useUpdatePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<typeof pools.$inferInsert>;
    }) => {
      const result = await db
        .update(pools)
        .set(data)
        .where(eq(pools.id, id))
        .returning();
      return result[0];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      queryClient.invalidateQueries({ queryKey: ['pool', variables.id] });
    },
  });
}

export function useDeletePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await db
        .delete(pools)
        .where(eq(pools.id, id))
        .returning();
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    },
  });
} 