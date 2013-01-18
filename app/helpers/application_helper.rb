module ApplicationHelper

  def current_user
    user = User.new
    user.email = 'user@example.com'
    user
  end

end
