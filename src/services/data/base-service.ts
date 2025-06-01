
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

// Base error class for data service errors
export class DataServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DataServiceError';
  }
}

// Transform Supabase errors into our standardized format
export const transformSupabaseError = (error: PostgrestError | Error): DataServiceError => {
  if ('code' in error && 'details' in error) {
    // PostgrestError
    const postgrestError = error as PostgrestError;
    return new DataServiceError(
      postgrestError.message || 'Database operation failed',
      postgrestError.code,
      undefined,
      postgrestError
    );
  }
  
  // Generic Error
  return new DataServiceError(
    error.message || 'An unexpected error occurred',
    undefined,
    undefined,
    error
  );
};

// Base service class with common functionality
export abstract class BaseDataService {
  protected readonly tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  // Get current user ID with error handling
  protected async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new DataServiceError('User not authenticated', 'AUTH_ERROR');
    }
    
    return user.id;
  }
  
  // Execute query with standardized error handling
  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        throw transformSupabaseError(error);
      }
      
      if (data === null) {
        throw new DataServiceError('No data returned from query', 'NO_DATA');
      }
      
      return data;
    } catch (error) {
      if (error instanceof DataServiceError) {
        throw error;
      }
      
      throw transformSupabaseError(error as Error);
    }
  }
  
  // Execute mutation with standardized error handling
  protected async executeMutation<T>(
    mutationFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
  ): Promise<T> {
    try {
      const { data, error } = await mutationFn();
      
      if (error) {
        throw transformSupabaseError(error);
      }
      
      return data as T;
    } catch (error) {
      if (error instanceof DataServiceError) {
        throw error;
      }
      
      throw transformSupabaseError(error as Error);
    }
  }
  
  // Batch operations helper
  protected async executeBatch<T>(
    operations: Array<() => Promise<T>>
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: Error[] = [];
    
    await Promise.allSettled(
      operations.map(async (operation, index) => {
        try {
          const result = await operation();
          results[index] = result;
        } catch (error) {
          errors[index] = error as Error;
        }
      })
    );
    
    if (errors.length > 0) {
      const firstError = errors.find(Boolean);
      throw new DataServiceError(
        `Batch operation failed: ${firstError?.message}`,
        'BATCH_ERROR',
        undefined,
        errors
      );
    }
    
    return results;
  }
}

// Real-time subscription utilities
export class RealtimeManager {
  private subscriptions = new Map<string, any>();
  
  subscribe(
    channel: string,
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    if (this.subscriptions.has(channel)) {
      this.unsubscribe(channel);
    }
    
    const subscription = supabase
      .channel(channel)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter 
        },
        callback
      )
      .subscribe();
    
    this.subscriptions.set(channel, subscription);
    
    return () => this.unsubscribe(channel);
  }
  
  unsubscribe(channel: string) {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(channel);
    }
  }
  
  unsubscribeAll() {
    for (const channel of this.subscriptions.keys()) {
      this.unsubscribe(channel);
    }
  }
}

export const realtimeManager = new RealtimeManager();
