class ApplicationController < ActionController::API
  before_action :authenticate_user

  private

  def authenticate_user
    token = request.headers['Authorization']&.split(' ')&.last
    
    if token
      @current_user = User.from_jwt(token)
    end
    # If no token or invalid token, @current_user remains nil
    # Search endpoints will work without authentication
  end

  def current_user
    @current_user
  end

  def require_authentication
    return if current_user
    
    render json: { error: 'Authentication required' }, status: :unauthorized
  end
end
