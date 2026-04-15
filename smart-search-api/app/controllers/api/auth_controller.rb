class Api::AuthController < ApplicationController
  skip_before_action :authenticate_user, only: [:login, :register]
  before_action :require_authentication, only: [:me]

  # POST /api/auth/login
  def login
    user = User.find_by(email: params[:email])
    
    if user&.authenticate(params[:password])
      token = user.generate_jwt
      render json: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  # POST /api/auth/register
  def register
    user = User.new(user_params)
    
    if user.save
      token = user.generate_jwt
      render json: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/auth/me
  def me
    render json: {
      user: {
        id: current_user.id,
        name: current_user.name,
        email: current_user.email
      }
    }
  end

  private

  def user_params
    params.permit(:name, :email, :password)
  end
end