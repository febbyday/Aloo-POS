import { toast } from "@/components/ui/use-toast";

interface ApiError extends Error {
  status?: number;
  detail?: string;
}

/**
 * Base API service for handling API requests and responses
 */
export const apiService = {
  /**
   * Build request options for fetch
   */
  buildRequestOptions(method: string, body?: any): RequestInit {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  },

  /**
   * Handle API response and handle errors
   */
  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = new Error("API Error");
      error.status = response.status;

      try {
        const errorData = await response.json();
        error.detail = errorData.message || errorData.error || "An error occurred";
      } catch (e) {
        error.detail = response.statusText || "An error occurred";
      }

      // Handle specific error cases
      if (response.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = "/login?session=expired";
      }

      throw error;
    }

    // For 204 No Content, return null
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  },

  /**
   * Make a GET request
   */
  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, this.buildRequestOptions("GET"));
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error as ApiError);
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await fetch(
        url,
        this.buildRequestOptions("POST", data)
      );
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error as ApiError);
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await fetch(
        url,
        this.buildRequestOptions("PUT", data)
      );
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error as ApiError);
      throw error;
    }
  },

  /**
   * Make a PATCH request
   */
  async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await fetch(
        url,
        this.buildRequestOptions("PATCH", data)
      );
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error as ApiError);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  async delete(url: string): Promise<void> {
    try {
      const response = await fetch(
        url,
        this.buildRequestOptions("DELETE")
      );
      await this.handleResponse(response);
    } catch (error) {
      this.handleError(error as ApiError);
      throw error;
    }
  },

  /**
   * Handle API errors and show toast notifications
   */
  handleError(error: ApiError): void {
    console.error("API Error:", error);

    // Don't show toast for 401 errors as they're handled by redirection
    if (error.status === 401) return;

    toast({
      title: `Error ${error.status || ""}`,
      description: error.detail || "An unexpected error occurred",
      variant: "destructive",
    });
  }
}; 