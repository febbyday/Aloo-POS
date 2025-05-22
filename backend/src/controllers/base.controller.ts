/**
 * Base Controller Class
 * 
 * Provides common functionality and response formatting for all API controllers.
 */
export class BaseController {
  /**
   * Send a success response
   */
  protected sendSuccess(res: any, data: any = null, status = 200, message = '') {
    return res.status(status).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send a paginated success response
   */
  protected sendPaginatedSuccess(
    res: any,
    data: any[],
    page: number,
    pageSize: number,
    total: number,
    message = ''
  ) {
    const totalPages = Math.ceil(total / pageSize);
    
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages
      }
    });
  }

  /**
   * Send an error response
   */
  protected sendError(res: any, message = 'An error occurred', status = 400, errors = null) {
    return res.status(status).json({
      success: false,
      message,
      errors
    });
  }

  /**
   * Helper method to get pagination parameters from request
   */
  protected getPaginationParams(req: any) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    return { page, pageSize };
  }
}
