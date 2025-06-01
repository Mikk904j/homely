
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

interface OptimisticUpdateConfig<TData, TVariables> {
  queryKey: readonly unknown[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  updateCache: (oldData: any, variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useOptimisticUpdate<TData, TVariables>({
  queryKey,
  mutationFn,
  updateCache,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: OptimisticUpdateConfig<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (oldData: any) => 
        updateCache(oldData, variables)
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error: Error, variables: TVariables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      if (errorMessage) {
        toast.error(errorMessage, {
          description: error.message,
        });
      }

      onError?.(error, variables);
    },
    onSuccess: (data: TData, variables: TVariables) => {
      if (successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// Specialized hooks for common patterns
export function useOptimisticCreate<TData, TVariables>({
  queryKey,
  mutationFn,
  successMessage = "Item created successfully",
  errorMessage = "Failed to create item",
  onSuccess,
  onError,
}: Omit<OptimisticUpdateConfig<TData, TVariables>, 'updateCache'>) {
  return useOptimisticUpdate({
    queryKey,
    mutationFn,
    updateCache: (oldData: TData[], newItem: TVariables) => {
      return [...(oldData || []), { ...newItem, id: `temp-${Date.now()}` }];
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

export function useOptimisticEdit<TData, TVariables>({
  queryKey,
  mutationFn,
  updateCache,
  idField = 'id',
  successMessage = "Item updated successfully",
  errorMessage = "Failed to update item",
  onSuccess,
  onError,
}: Omit<OptimisticUpdateConfig<TData, TVariables>, 'updateCache'> & {
  updateCache: (item: any, variables: TVariables) => any;
  idField?: string;
}) {
  return useOptimisticUpdate({
    queryKey,
    mutationFn,
    updateCache: (oldData: any[], variables: TVariables & { [key: string]: any }) => {
      if (!oldData) return oldData;
      
      return oldData.map(item => 
        item[idField] === variables[idField] 
          ? updateCache(item, variables)
          : item
      );
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

export function useOptimisticDelete<TVariables extends { id: string }>({
  queryKey,
  mutationFn,
  idField = 'id',
  successMessage = "Item deleted successfully",
  errorMessage = "Failed to delete item",
  onSuccess,
  onError,
}: Omit<OptimisticUpdateConfig<any, TVariables>, 'updateCache'> & {
  idField?: string;
}) {
  return useOptimisticUpdate({
    queryKey,
    mutationFn,
    updateCache: (oldData: any[], variables: TVariables) => {
      if (!oldData) return oldData;
      
      return oldData.filter(item => item[idField] !== variables.id);
    },
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  });
}

// Batch operations hook
export function useBatchMutation<TData, TVariables extends unknown[]>({
  mutationFn,
  queryKeys,
  successMessage = "Batch operation completed",
  errorMessage = "Batch operation failed",
  onSuccess,
  onError,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKeys: readonly unknown[][];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data: TData, variables: TVariables) => {
      // Invalidate all related queries
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(data, variables);
    },
    onError: (error: Error, variables: TVariables) => {
      if (errorMessage) {
        toast.error(errorMessage, {
          description: error.message,
        });
      }

      onError?.(error, variables);
    },
  });
}
